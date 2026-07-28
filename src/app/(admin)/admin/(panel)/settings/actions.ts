"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/admin/api";
import { linesToArray } from "@/lib/admin/format";
import { CONTENT_TAGS, revalidateContent } from "@/lib/admin/revalidate";
import { withToken } from "@/lib/admin/run";
import { getVerifiedToken } from "@/lib/admin/session";
import type { ActionResult, AdminSiteSettings } from "@/lib/admin/types";
import { MAX_DISALLOW_LENGTH, MAX_DISALLOW_PATHS } from "@/lib/robots-rules";
import {
  isValidChatId,
  MAX_CHAT_LABEL_LENGTH,
  MAX_TELEGRAM_CHATS,
  type TelegramChat,
} from "@/lib/telegram-chats";

const PATH = "/admin/settings";

// Цифры доверия и этапы работы переехали в раздел «Главная»: это блоки главной
// страницы сайта, а не контактные данные. Их экшены — в
// src/app/(admin)/admin/(panel)/solutions/actions.ts. Эндпоинт и тег кэша у
// всех настроек по-прежнему общие (`/api/settings`, тег `settings`).

// ---------------------------------------------------------------------------
// Контакты
// ---------------------------------------------------------------------------

export type ContactsFormValues = {
  /** многострочное поле: по телефону на строку */
  phones: string;
  telegram: string;
  max: string;
  email: string;
  address: string;
};

export async function saveContactsAction(
  values: ContactsFormValues,
): Promise<ActionResult<AdminSiteSettings>> {
  const result = await withToken((token) =>
    apiFetch<AdminSiteSettings>("/api/settings", {
      method: "PUT",
      token,
      body: {
        phones: linesToArray(values.phones),
        telegram: values.telegram.trim(),
        max: values.max.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
      },
    }),
  );

  if (result.ok) {
    revalidatePath(PATH);
    // Контакты, цифры и этапы приходят одним эндпоинтом — тег у них общий.
    revalidateContent(CONTENT_TAGS.settings);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Счётчики аналитики
// ---------------------------------------------------------------------------
//
// Оба поля необязательные: пустая строка уходит в API как null, и счётчик на
// сайте просто не подключается. Формат проверяется и здесь, и в форме —
// значение попадает во ВСТРОЕННЫЙ скрипт на публичной странице, поэтому в нём
// не должно быть ничего, кроме разрешённых символов.

export type AnalyticsFormValues = {
  yandexMetrikaId: string;
  googleAnalyticsId: string;
};

// Шаблоны повторяют проверку API (react-project-admin-back/app/setting/
// setting.controller.js, VALIDATED_FIELDS): расходиться им нельзя, иначе
// панель либо пропустит то, что API отвергнет, либо запретит допустимое.
const METRIKA_ID = /^\d{1,12}$/;
const GA4_ID = /^G-[A-Z0-9]{4,18}$/;

export async function saveAnalyticsAction(
  values: AnalyticsFormValues,
): Promise<ActionResult<AdminSiteSettings>> {
  const metrika = values.yandexMetrikaId.trim();
  const ga = values.googleAnalyticsId.trim().toUpperCase();

  if (metrika && !METRIKA_ID.test(metrika)) {
    return { ok: false, error: "Номер счётчика Яндекс.Метрики — только цифры, например 98765432." };
  }
  if (ga && !GA4_ID.test(ga)) {
    return {
      ok: false,
      error: "Идентификатор Google Analytics 4 выглядит как G-XXXXXXXXXX (буквы и цифры).",
    };
  }

  const result = await withToken((token) =>
    apiFetch<AdminSiteSettings>("/api/settings", {
      method: "PUT",
      token,
      body: { yandexMetrikaId: metrika, googleAnalyticsId: ga },
    }),
  );

  if (result.ok) {
    revalidatePath(PATH);
    revalidateContent(CONTENT_TAGS.settings);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Доставка заявок
// ---------------------------------------------------------------------------
//
// Здесь настраивается только КУДА слать. Токен Telegram-бота в панели
// сознательно отсутствует и появиться не должен: база уезжает в резервные
// копии, а токен даёт полный доступ к боту. Он живёт в .env сайта
// (TELEGRAM_BOT_TOKEN).

export type LeadDeliveryFormValues = {
  /** Получатели в Telegram по порядку. Пустой список — законное состояние. */
  leadTelegramChats: TelegramChat[];
  leadEmail: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function saveLeadDeliveryAction(
  values: LeadDeliveryFormValues,
): Promise<ActionResult<AdminSiteSettings>> {
  const email = values.leadEmail.trim();

  // Проверяем ВСЕ строки списка, а не падаем на первой: человек, который
  // добавил четырёх получателей и ошибся в двух, должен узнать про обе сразу.
  const problems: string[] = [];
  const chats: TelegramChat[] = [];
  const seen = new Set<string>();

  values.leadTelegramChats.forEach((chat, index) => {
    const chatId = chat.chatId.trim();
    const label = chat.label.trim();
    const where = `Получатель ${index + 1}${label ? ` «${label}»` : ""}`;

    if (!chatId) {
      problems.push(`${where}: не заполнен chat_id.`);
      return;
    }
    if (!isValidChatId(chatId)) {
      problems.push(
        `${where}: chat_id должен быть числом (у групп начинается с «-») или @username канала.`,
      );
      return;
    }
    if (label.length > MAX_CHAT_LABEL_LENGTH) {
      problems.push(`${where}: подпись длиннее ${MAX_CHAT_LABEL_LENGTH} символов.`);
      return;
    }
    if (seen.has(chatId)) {
      problems.push(`${where}: этот chat_id уже есть в списке выше.`);
      return;
    }

    seen.add(chatId);
    chats.push({ chatId, label });
  });

  if (chats.length > MAX_TELEGRAM_CHATS) {
    problems.push(`Получателей больше ${MAX_TELEGRAM_CHATS} — столько API не примет.`);
  }
  if (email && !EMAIL.test(email)) {
    problems.push("Проверьте адрес почты.");
  }

  if (problems.length > 0) return { ok: false, error: problems.join("\n") };

  const result = await withToken((token) =>
    apiFetch<AdminSiteSettings>("/api/settings", {
      method: "PUT",
      token,
      // Устаревшее `leadTelegramChatId` не трогаем вовсе: оно осталось
      // запасным вариантом на время рассинхрона выкатки, и затирать его
      // отсюда — значит уронить уведомления, если фронт откатят.
      body: { leadTelegramChats: chats, leadEmail: email },
    }),
  );

  if (result.ok) {
    revalidatePath(PATH);
    revalidateContent(CONTENT_TAGS.settings);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Индексация (robots.txt)
// ---------------------------------------------------------------------------
//
// Здесь только два поля: разрешена ли индексация вообще и какие пути закрыть
// дополнительно. Служебные запреты (`/api/`, `/admin`) в
// панель не выносятся — они зашиты в `src/lib/robots-rules.ts`, чтобы не
// зависеть от содержимого базы: недоступные настройки не должны открывать
// панель для обхода.

export type RobotsFormValues = {
  robotsIndexing: boolean;
  /** Дополнительные запрещённые пути по порядку. Пустой список — норма. */
  robotsDisallow: string[];
};

export async function saveRobotsAction(
  values: RobotsFormValues,
): Promise<ActionResult<AdminSiteSettings>> {
  // Как и у получателей Telegram: проверяем ВСЕ строки, а не падаем на первой.
  const problems: string[] = [];
  const paths: string[] = [];
  const seen = new Set<string>();

  values.robotsDisallow.forEach((raw, index) => {
    const path = raw.trim();
    const where = `Путь ${index + 1}`;

    if (!path) {
      problems.push(`${where}: не заполнен.`);
      return;
    }
    if (!path.startsWith("/")) {
      problems.push(`${where} «${path}»: должен начинаться с «/», например /lp-test.`);
      return;
    }
    if (/\s/.test(path)) {
      // Пробел в robots.txt обрывает строку: «/старая страница» превратилось
      // бы в запрет «/старая» — то есть закрыло бы лишнее и молча.
      problems.push(`${where} «${path}»: в пути не должно быть пробелов.`);
      return;
    }
    if (path.length > MAX_DISALLOW_LENGTH) {
      problems.push(`${where}: длиннее ${MAX_DISALLOW_LENGTH} символов.`);
      return;
    }
    if (seen.has(path)) {
      problems.push(`${where} «${path}»: этот путь уже есть в списке выше.`);
      return;
    }

    seen.add(path);
    paths.push(path);
  });

  if (paths.length > MAX_DISALLOW_PATHS) {
    problems.push(`Путей больше ${MAX_DISALLOW_PATHS} — столько API не примет.`);
  }

  if (problems.length > 0) return { ok: false, error: problems.join("\n") };

  const result = await withToken((token) =>
    apiFetch<AdminSiteSettings>("/api/settings", {
      method: "PUT",
      token,
      body: { robotsIndexing: values.robotsIndexing, robotsDisallow: paths },
    }),
  );

  if (result.ok) {
    // Тот же тег `settings`, что у контактов и счётчиков: под ним кэшированы
    // и `/robots.txt`, и метаданные страниц (см. getRobots), поэтому файл и
    // разметка меняются с первого же открытия, а не через пять минут.
    revalidatePath(PATH);
    revalidateContent(CONTENT_TAGS.settings);
  }

  // Поля появились позже остальных: пока API их не принимает, сохранение
  // проходит «успешно», но значения не меняются. Молчать об этом нельзя —
  // человек решит, что закрыл сайт от поисковиков.
  if (result.ok && !applied(result.data, values.robotsIndexing, paths)) {
    return {
      ok: false,
      error:
        "API настроек принял запрос, но не сохранил параметры индексации — похоже, " +
        "на сервере ещё старая версия API. Обновите её и повторите: пока этого не " +
        "произошло, robots.txt остаётся прежним.",
    };
  }

  return result;
}

/** Проверка, что API действительно записал то, что мы прислали. */
function applied(saved: AdminSiteSettings, indexing: boolean, paths: string[]) {
  if (saved.robotsIndexing !== indexing) return false;

  const savedPaths = Array.isArray(saved.robotsDisallow) ? saved.robotsDisallow : null;
  if (!savedPaths || savedPaths.length !== paths.length) return false;

  return savedPaths.every((path, index) => path === paths[index]);
}

// ---------------------------------------------------------------------------
// Помощник «узнать chat_id»
// ---------------------------------------------------------------------------
//
// Самое неудобное место для человека: собственный chat_id в интерфейсе
// Telegram нигде не показан, а у группы его вообще неоткуда взять без бота.
// Поэтому спрашиваем сам Telegram: getUpdates отдаёт последние события бота, а
// в каждом событии есть чат, из которого оно пришло.
//
// Токен читается ТОЛЬКО здесь, на сервере, и в браузер не уходит — наружу
// отдаём лишь список чатов.

export type DiscoveredChat = {
  chatId: string;
  /** «личный чат» / «группа» / «канал» — что показать человеку. */
  kind: string;
  title: string;
};

const TELEGRAM_TIMEOUT_MS = 8000;

const CHAT_KINDS: Record<string, string> = {
  private: "личный чат",
  group: "группа",
  supergroup: "группа",
  channel: "канал",
};

type TelegramChatInfo = {
  id?: number | string;
  type?: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

function chatTitle(chat: TelegramChatInfo): string {
  const name = [chat.first_name, chat.last_name].filter(Boolean).join(" ").trim();
  return (
    chat.title?.trim() ||
    name ||
    (chat.username ? `@${chat.username}` : "") ||
    "без названия"
  );
}

/** Все чаты, встреченные в ответе getUpdates, без повторов и в порядке свежести. */
function collectChats(updates: unknown): DiscoveredChat[] {
  if (!Array.isArray(updates)) return [];

  const seen = new Set<string>();
  const chats: DiscoveredChat[] = [];

  // Свежие события — в конце списка, а показать их надо первыми.
  for (const update of [...updates].reverse()) {
    if (!update || typeof update !== "object") continue;

    for (const event of Object.values(update as Record<string, unknown>)) {
      if (!event || typeof event !== "object") continue;

      const chat = (event as Record<string, unknown>).chat as TelegramChatInfo | undefined;
      if (!chat || chat.id === undefined || chat.id === null) continue;

      const chatId = String(chat.id);
      if (seen.has(chatId)) continue;

      seen.add(chatId);
      chats.push({
        chatId,
        kind: CHAT_KINDS[chat.type ?? ""] ?? chat.type ?? "чат",
        title: chatTitle(chat),
      });
    }
  }

  return chats;
}

export async function discoverTelegramChatsAction(): Promise<ActionResult<DiscoveredChat[]>> {
  // Серверный экшен — это публичная точка входа: его можно вызвать POST-запросом
  // с заголовком Next-Action, минуя и middleware, и рендер страницы. Без этой
  // проверки любой желающий получал бы chat_id и имена людей, писавших боту.
  const verified = await getVerifiedToken();
  if (verified.status !== "ok") {
    return {
      ok: false,
      error:
        verified.status === "unavailable"
          ? verified.message
          : "Недостаточно прав: список чатов доступен только администратору.",
    };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!token) {
    return {
      ok: false,
      error:
        "Бот не подключён: в настройках сервера не задан токен (TELEGRAM_BOT_TOKEN). " +
        "Пока его нет, спросить у Telegram список чатов не у кого, а уведомления не уходят.",
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });

    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      result?: unknown;
      description?: string;
    } | null;

    if (!response.ok || !data?.ok) {
      const description = data?.description ?? "";

      // Вебхук и getUpdates взаимно исключают друг друга — Telegram отвечает
      // 409. Без объяснения это выглядит как поломка панели.
      if (response.status === 409 || /webhook/i.test(description)) {
        return {
          ok: false,
          error:
            "Telegram не отдаёт список чатов, потому что у бота настроен вебхук: " +
            "вебхук и этот способ опроса взаимно исключают друг друга. " +
            "chat_id придётся ввести вручную.",
        };
      }
      if (response.status === 401) {
        return {
          ok: false,
          error: "Telegram не принял токен бота. Проверьте TELEGRAM_BOT_TOKEN в настройках сервера.",
        };
      }

      return {
        ok: false,
        error: `Telegram ответил ошибкой${description ? `: ${description}` : ` ${response.status}`}.`,
      };
    }

    return { ok: true, data: collectChats(data.result) };
  } catch (error) {
    console.error("[admin] getUpdates недоступен:", error);
    return {
      ok: false,
      error: "Не удалось связаться с Telegram. Проверьте доступ в интернет с сервера и повторите.",
    };
  }
}
