// Доставка заявок: база админки + Telegram + письмо + JSONL-журнал.
// Каналы независимы: сбой или отсутствие настроек у одного не мешает
// остальным, поэтому заявка не теряется.
//
// КАНАЛЫ РАЗДЕЛЕНЫ НА ДВЕ ГРУППЫ — по тому, теряется ли заявка при сбое:
//
//   saveLead()   — ЗАПИСЬ заявки: база админки, JSONL-журнал и строка в логе
//                  процесса. Все три быстрые и локальные (API админки — сосед
//                  по машине, файл — диск). Их зовут ДО ответа пользователю:
//                  пока они не отработали, заявки нигде нет, и отвечать
//                  «Заявка отправлена» не за что.
//   notifyLead() — УВЕДОМЛЕНИЯ: Telegram и письмо. Это копия уже сохранённой
//                  заявки, отправленная наружу, к чужим серверам с таймаутом
//                  8 с у каждого. Их зовут ПОСЛЕ ответа — через `after()` в
//                  роуте (см. src/app/(frontend)/api/lead/route.ts), чтобы
//                  посетитель не ждал ни SMTP, ни api.telegram.org.
//
// Заявка не может потеряться незаметно: строка `[LEAD]` в логе процесса
// печатается в saveLead, то есть до ответа и без всякой зависимости от сети.
// Даже если процесс умрёт сразу после ответа и уведомления не уйдут, полная
// заявка уже лежит в логе (а обычно и в базе, и в журнале). Результат
// уведомлений печатается второй строкой — она может отстать на секунды, но
// её отсутствие означает лишь «не уведомили», а не «потеряли».
//
// ГДЕ ЧТО НАСТРАИВАЕТСЯ — один и тот же принцип у обоих внешних каналов:
// АДРЕС получателя правится в панели (Настройки → Настройка заявок), ДОСТУП
// к сервису живёт в переменных окружения и в панель не выносится, потому что
// база уезжает в резервные копии, а секрет из копии уже не отозвать.
//
// | Канал    | Адрес (панель)       | Запасной адрес   | Доступ (только .env)        |
// |----------|----------------------|------------------|-----------------------------|
// | Telegram | `telegramChats` (список) | устаревшее `telegramChatId`, затем TELEGRAM_CHAT_ID | TELEGRAM_BOT_TOKEN |
// | Почта    | `email`              | LEAD_EMAIL       | SMTP_HOST/PORT/USER/PASSWORD|
//
// В Telegram получателей МНОГО: уведомление уходит каждому из списка, они
// независимы, отправки идут параллельно (см. sendToTelegram).
//
// Нет доступа — канал молча пропускается (в логе написано, чего не хватает),
// как и раньше пропускался Telegram без токена.

import { appendFile } from "node:fs/promises";
import nodemailer from "nodemailer";
import {
  describeChat,
  isValidChatId,
  toTelegramChats,
  type TelegramChat,
} from "./telegram-chats";

export type Lead = {
  name: string;
  phone: string;
  comment?: string;
  source?: string;
  page?: string;
  utm?: string;
  receivedAt: string;
};

/** Адреса доставки из настроек панели. Всё необязательное. */
export type LeadDeliveryTargets = {
  /**
   * Получатели в Telegram из панели — уведомление уходит КАЖДОМУ.
   * Приходит «как есть» из jsonb, разбирается `toTelegramChats`.
   */
  telegramChats?: unknown;
  /**
   * УСТАРЕЛО: одиночный chat_id. Используется, только когда список пуст —
   * страховка на время рассинхрона выкатки фронта и бэкенда.
   */
  telegramChatId?: string | null;
  /** Адрес получателя письма из панели. Приоритетнее LEAD_EMAIL. */
  email?: string | null;
};

const TELEGRAM_TIMEOUT_MS = 8000;
const ADMIN_API_TIMEOUT_MS = 8000;
const SMTP_TIMEOUT_MS = 8000;

/** Экранирование под parse_mode=HTML в Telegram. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatMessage(lead: Lead) {
  const lines = [
    `<b>Новая заявка — ${escapeHtml(lead.source ?? "сайт")}</b>`,
    "",
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Телефон:</b> ${escapeHtml(lead.phone)}`,
  ];

  if (lead.comment?.trim()) {
    lines.push("", escapeHtml(lead.comment.trim()));
  }

  const meta = [
    lead.page ? `страница: ${lead.page}` : null,
    lead.utm?.replace(/^\?/, "") ? `utm: ${lead.utm}` : null,
  ].filter(Boolean);

  if (meta.length) {
    lines.push("", `<i>${escapeHtml(meta.join(" · "))}</i>`);
  }

  return lines.join("\n");
}

/**
 * Дописывает заявку в JSONL-журнал, если задан LEAD_LOG_FILE.
 *
 * Экспортируется, потому что это САМЫЙ БЫСТРЫЙ надёжный канал: запись в файл
 * на своей же машине занимает миллисекунды и не зависит ни от сети, ни от
 * чужого процесса. Роут заявки пишет журнал ДО ответа и на этом основании
 * отвечает «принято», а базу и уведомления оставляет на потом.
 */
export async function appendToLogFile(lead: Lead) {
  const file = process.env.LEAD_LOG_FILE;
  if (!file) return { channel: "file" as const, ok: false, skipped: true };

  try {
    await appendFile(file, `${JSON.stringify(lead)}\n`, "utf8");
    return { channel: "file" as const, ok: true, skipped: false };
  } catch (error) {
    console.error("[LEAD] не удалось записать журнал:", error);
    return { channel: "file" as const, ok: false, skipped: false };
  }
}

/**
 * Кому слать в Telegram и откуда взят список.
 *
 * Порядок: список получателей из панели → устаревшее одиночное поле →
 * переменная окружения. Источник попадает в лог: без него по строке
 * «не настроен» нельзя понять, панель не заполнена или токена нет.
 */
function resolveChats(targets: LeadDeliveryTargets) {
  const chats = toTelegramChats(targets.telegramChats);
  if (chats.length > 0) return { chats, source: "список в панели" as const };

  // Устаревшее одиночное поле — страховка на время рассинхрона выкатки: если
  // фронт откатят, уведомления не должны прекратиться.
  const legacy = targets.telegramChatId?.trim();
  if (legacy && isValidChatId(legacy)) {
    return {
      chats: [{ chatId: legacy, label: "" }],
      source: "устаревшее одиночное поле" as const,
    };
  }

  const env = process.env.TELEGRAM_CHAT_ID?.trim();
  if (env && isValidChatId(env)) {
    return { chats: [{ chatId: env, label: "" }], source: "переменная окружения" as const };
  }

  return { chats: [] as TelegramChat[], source: "не задан" as const };
}

/** Одна отправка. Никогда не бросает: результат нужен по каждому получателю. */
async function sendToOneChat(lead: Lead, chat: TelegramChat, token: string) {
  const who = describeChat(chat);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat.chatId,
        text: formatMessage(lead),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });

    if (!response.ok) {
      // Причину отказа Telegram пишет в теле (`description`), и она обычно
      // объясняет всё: «bot was blocked by the user», «chat not found».
      // Без неё владелец не поймёт, что делать с «ошибкой».
      const body = (await response.json().catch(() => null)) as { description?: string } | null;
      const reason = body?.description ?? `HTTP ${response.status}`;
      console.error(`[LEAD] Telegram не принял сообщение для ${who}:`, response.status, reason);
      return { who, ok: false, reason };
    }

    return { who, ok: true, reason: "" };
  } catch (error) {
    console.error(`[LEAD] Telegram недоступен для ${who}:`, error);
    return { who, ok: false, reason: error instanceof Error ? error.message : "сбой сети" };
  }
}

/**
 * Рассылает уведомление ВСЕМ получателям из настроек.
 *
 * Два свойства, которые нельзя потерять:
 *
 * 1. ПОЛУЧАТЕЛИ НЕЗАВИСИМЫ. Один заблокировал бота (403), у другого неверный
 *    id (400) — остальные всё равно получают заявку. Поэтому у каждого свой
 *    try/catch, и наверх идёт отчёт по каждому, а не одно общее «ошибка».
 * 2. ОБЩЕЕ ВРЕМЯ НЕ РАСТЁТ С ЧИСЛОМ ПОЛУЧАТЕЛЕЙ. Отправки идут параллельно,
 *    поэтому таймаут остаётся 8 с на всех, а не 8 с на каждого: иначе десять
 *    получателей превращали бы приём заявки в полутораминутное ожидание.
 */
async function sendToTelegram(lead: Lead, targets: LeadDeliveryTargets) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const { chats, source } = resolveChats(targets);

  if (!token || chats.length === 0) {
    const missing = !token ? "нет токена бота в окружении" : "список получателей пуст";
    return {
      channel: "telegram" as const,
      ok: false,
      skipped: true,
      detail: `${missing}; получатели: ${chats.length} (${source})`,
    };
  }

  const results = await Promise.all(chats.map((chat) => sendToOneChat(lead, chat, token)));
  const delivered = results.filter((result) => result.ok).length;

  const report = results
    .map((result) => `${result.who} — ${result.ok ? "ок" : `ошибка: ${result.reason}`}`)
    .join("; ");

  return {
    channel: "telegram" as const,
    // «ок» только когда дошло до всех: частичная доставка — это повод
    // заглянуть в настройки, а не нормальное состояние.
    ok: delivered === results.length,
    skipped: false,
    detail: `${delivered} из ${results.length} (${source}): ${report}`,
  };
}

/**
 * Кладёт заявку в базу админки (POST /api/leads по ключу x-api-key).
 * Канал включается парой ADMIN_API_URL + ADMIN_SITE_API_KEY; без ключа
 * запрос не делается вовсе.
 */
async function sendToAdminApi(lead: Lead) {
  const apiKey = process.env.ADMIN_SITE_API_KEY;
  if (!apiKey) return { channel: "admin" as const, ok: false, skipped: true };

  const baseUrl = (process.env.ADMIN_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

  try {
    const response = await fetch(`${baseUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        comment: lead.comment,
        source: lead.source,
        page: lead.page,
        utm: lead.utm,
      }),
      signal: AbortSignal.timeout(ADMIN_API_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(
        "[LEAD] API админки ответил ошибкой:",
        response.status,
        await response.text().catch(() => ""),
      );
      return { channel: "admin" as const, ok: false, skipped: false };
    }

    return { channel: "admin" as const, ok: true, skipped: false };
  } catch (error) {
    console.error("[LEAD] API админки недоступен:", error);
    return { channel: "admin" as const, ok: false, skipped: false };
  }
}

// ---------------------------------------------------------------------------
// Письмо о заявке
// ---------------------------------------------------------------------------

/**
 * Куда слать письмо. Как и у Telegram: панель важнее окружения.
 */
function resolveEmail(fromSettings?: string | null) {
  const settings = fromSettings?.trim();
  if (settings) return { to: settings, source: "настройки панели" as const };

  const env = process.env.LEAD_EMAIL?.trim();
  if (env) return { to: env, source: "переменная окружения" as const };

  return { to: "", source: "не задан" as const };
}

/**
 * Тема и тело письма.
 *
 * Письмо ТЕКСТОВОЕ, без HTML-части — сознательно:
 *
 * 1. Главное содержимое — комментарий, а в нём лежит спецификация из
 *    конструктора: многострочная, с дефисами, двоеточиями и знаком «×». В
 *    тексте она уходит ровно так, как её собрал конструктор. В HTML пришлось
 *    бы экранировать её и превращать переносы в <br>, то есть заводить ещё
 *    один формат, который можно испортить, — ради письма, которое читают
 *    один раз и глазами.
 * 2. Никакого экранирования не нужно вовсе: текстовое тело не интерпретирует
 *    ни `<`, ни `&`. Целый класс ошибок просто не возникает.
 * 3. Почтовые клиенты (в том числе веб-интерфейс mail.ru) показывают
 *    text/plain нормально, а спам-фильтры относятся к нему лучше, чем к
 *    письму с одной только HTML-частью.
 *
 * Кодировку и заголовки берёт на себя nodemailer: тело уходит в UTF-8, а
 * кириллица в теме кодируется по RFC 2047 — руками этого делать не надо.
 */
function formatEmail(lead: Lead) {
  const source = lead.source?.trim() || "сайт";

  const lines = [
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Получена: ${lead.receivedAt}`,
  ];

  if (lead.comment?.trim()) {
    // Перенос строки в комментарии значим: конструктор кладёт туда
    // спецификацию по строке на параметр. Сохраняем как есть.
    lines.push("", "Комментарий:", lead.comment.trim());
  }

  const meta = [
    lead.page ? `Страница: ${lead.page}` : null,
    lead.utm?.replace(/^\?/, "") ? `UTM: ${lead.utm}` : null,
  ].filter(Boolean);

  if (meta.length) lines.push("", ...(meta as string[]));

  return {
    subject: `Новая заявка с сайта — ${source}`,
    text: `${lines.join("\n")}\n`,
  };
}

/**
 * Отправляет письмо о заявке через SMTP.
 *
 * Канал включается доступом к ящику в окружении (SMTP_HOST + SMTP_USER +
 * SMTP_PASSWORD) и наличием получателя. Пароля нет — канал пропускается, и
 * это не ошибка: заявка всё равно ушла в базу, в Telegram и в журнал.
 *
 * Транспорт создаётся на каждую отправку, а не хранится в модуле: заявки
 * приходят редко, пул держал бы TCP-соединение с почтовым сервером часами и
 * всё равно протухал бы. Стоимость установки соединения здесь несущественна.
 */
async function sendToEmail(lead: Lead, targets: LeadDeliveryTargets) {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const { to, source } = resolveEmail(targets.email);

  const detail = `получатель: ${to || "—"} (${source})`;

  if (!host || !user || !password || !to) {
    const missing = !host
      ? "не задан SMTP_HOST"
      : !user
        ? "не задан SMTP_USER"
        : !password
          ? "не задан SMTP_PASSWORD (пароль внешнего приложения)"
          : "не задан адрес получателя";
    return { channel: "email" as const, ok: false, skipped: true, detail: `${missing}; ${detail}` };
  }

  // 465 — SMTP поверх TLS с первого байта (mail.ru рекомендует именно его),
  // остальные порты (587, 1025 у локальных приёмников) — STARTTLS.
  const port = Number(process.env.SMTP_PORT ?? 465) || 465;

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
      // Зависший почтовый сервер не должен держать ответ пользователю:
      // ограничиваем все три фазы, а не только соединение.
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
    });

    const { subject, text } = formatEmail(lead);

    await transport.sendMail({
      // Отправитель по умолчанию — сам ящик: почти все провайдеры (mail.ru
      // в их числе) отвергают письмо, если From не совпадает с логином.
      from: process.env.SMTP_FROM?.trim() || user,
      to,
      // Ответить клиенту прямо из письма нельзя — у заявки нет адреса, только
      // телефон. Поэтому Reply-To не ставим, чтобы не обещать лишнего.
      subject,
      text,
    });

    transport.close();

    return { channel: "email" as const, ok: true, skipped: false, detail };
  } catch (error) {
    console.error("[LEAD] не удалось отправить письмо:", error);
    return { channel: "email" as const, ok: false, skipped: false, detail };
  }
}

// ---------------------------------------------------------------------------
// Две фазы доставки
// ---------------------------------------------------------------------------

type ChannelResult = {
  channel: string;
  ok: boolean;
  skipped: boolean;
  detail?: string;
};

/**
 * Сводка по каналам для лога.
 *
 * У Telegram и почты рядом со статусом пишется выбранный адрес и его
 * источник: без этого «не настроен» не отличить от «настроен не туда», а
 * приоритет панели над переменной окружения нечем подтвердить.
 */
function summarize(results: ChannelResult[]) {
  return Object.fromEntries(
    results.map((result) => {
      const status = result.skipped ? "не настроен" : result.ok ? "ок" : "ошибка";
      return [result.channel, result.detail ? `${status} — ${result.detail}` : status];
    }),
  );
}

/**
 * ЗАПИСЬ заявки: база админки + JSONL-журнал + строка в логе процесса.
 *
 * Зовётся ДО ответа пользователю. Оба канала локальные (API админки — сосед
 * по машине, журнал — файл на диске), поэтому ответ они задерживают на
 * миллисекунды, зато после успешного ответа заявка гарантированно где-то
 * лежит.
 *
 * Строка `[LEAD] {…}` — последний рубеж: она есть в pm2/логах хостинга и
 * печатается здесь же, без всякой зависимости от сети. Заявка не теряется,
 * даже когда недоступны и база, и файл.
 *
 * `Promise.all` здесь безопасен только потому, что ни один канал НЕ бросает
 * исключение — каждый ловит своё и возвращает результат значением. Если
 * когда-нибудь какой-то начнёт бросать, Promise.all отклонится целиком, и
 * пользователь получит ошибку при уже принятой заявке.
 */
export async function saveLead(lead: Lead) {
  const results = await Promise.all([sendToAdminApi(lead), appendToLogFile(lead)]);

  console.info("[LEAD]", JSON.stringify({ ...lead, delivery: summarize(results) }));

  return results;
}

/**
 * ЗАПИСЬ В БАЗУ ПОСЛЕ ОТВЕТА: то же, что делает saveLead, но без журнала —
 * его роут уже записал до ответа — и без права бросить исключение.
 *
 * Отдельная функция, а не флаг у saveLead: у них разные обязательства.
 * saveLead выполняется на пути ответа, и его результат решает, что увидит
 * посетитель. Этот код выполняется, когда ответ уже ушёл: бросать ему нельзя
 * (необработанный отказ промиса), а единственный доступный способ сообщить о
 * беде — строка в логе.
 */
export async function storeLeadAfterResponse(lead: Lead, journal: ChannelResult) {
  try {
    const admin = await sendToAdminApi(lead);

    console.info(
      "[LEAD]",
      JSON.stringify({ ...lead, delivery: summarize([admin, journal]) }),
    );

    return admin;
  } catch (error) {
    console.error("[LEAD] запись в базу не выполнена:", error);
    return { channel: "admin" as const, ok: false, skipped: false };
  }
}

/**
 * УВЕДОМЛЕНИЯ: Telegram + письмо.
 *
 * Зовётся ПОСЛЕ ответа пользователю (`after()` в роуте). Оба канала ходят к
 * чужим серверам с таймаутом 8 с — держать на них ответ формы незачем: заявка
 * к этому моменту уже сохранена в saveLead.
 *
 * НИКОГДА НЕ БРОСАЕТ. Отложенный код выполняется вне запроса, и исключение из
 * него всплыло бы необработанным отказом промиса — то есть шумом в логе, а на
 * строгих настройках Node и падением процесса. Сами каналы своё уже ловят,
 * внешний try/catch — страховка на случай, если однажды перестанут: молча
 * ронять процесс из-за неотправленного письма недопустимо.
 *
 * Результат печатается ОТДЕЛЬНОЙ строкой `[LEAD] уведомления {…}`: каналы
 * завершаются позже ответа и позже строки о сохранении, поэтому одной общей
 * строкой их не собрать, не задержав главную запись в логе на те же 8 с.
 * Строки связываются по `receivedAt` (ISO с миллисекундами) и телефону.
 */
export async function notifyLead(lead: Lead, targets: LeadDeliveryTargets = {}) {
  try {
    const results = await Promise.all([
      sendToTelegram(lead, targets),
      sendToEmail(lead, targets),
    ]);

    console.info(
      "[LEAD] уведомления",
      JSON.stringify({
        receivedAt: lead.receivedAt,
        phone: lead.phone,
        delivery: summarize(results),
      }),
    );

    return results;
  } catch (error) {
    console.error("[LEAD] уведомления не отправлены:", error);
    return [];
  }
}
