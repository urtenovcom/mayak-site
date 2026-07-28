import { after, NextResponse } from "next/server";
import { z } from "zod";
import { getLeadDelivery } from "@/lib/content";
import { notifyLead, saveLead } from "@/lib/lead-delivery";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  comment: z.string().optional(),
  source: z.string().optional(),
  page: z.string().optional(),
  utm: z.string().optional(),
  // honeypot
  company: z.string().optional(),
});

// Примитивный лимит: не более 5 заявок с одного IP за 10 минут.
// Память процесса — этого достаточно против скриптового спама на одном инстансе.
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(
    (time) => now - time < RATE_LIMIT.windowMs,
  );
  recent.push(now);
  hits.set(ip, recent);

  // Чтобы Map не рос бесконечно на долгоживущем процессе.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((time) => now - time >= RATE_LIMIT.windowMs)) {
        hits.delete(key);
      }
    }
  }

  return recent.length > RATE_LIMIT.max;
}

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 422 });
  }

  const lead = parsed.data;

  // honeypot: скрытое поле должно быть пустым
  if (lead.company) {
    return NextResponse.json({ ok: true });
  }

  if (isRateLimited(clientIp(req))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  // Поле-ловушку `company` в доставку не передаём.
  const { name, phone, comment, source, page, utm } = lead;

  const received = {
    name,
    phone,
    comment,
    source,
    page,
    utm,
    receivedAt: new Date().toISOString(),
  };

  // ДО ОТВЕТА — только запись заявки: база админки, JSONL-журнал и строка
  // `[LEAD]` в логе процесса. Каналы локальные и быстрые, зато после ответа
  // «ок» заявка гарантированно где-то лежит. Отвечать раньше, чем она
  // сохранена, нельзя: пользователь увидел бы «Заявка отправлена» на пустом
  // месте и второй раз её не отправил.
  await saveLead(received);

  // ПОСЛЕ ОТВЕТА — уведомления наружу. `after` из next/server выполняет
  // колбэк, когда ответ уже ушёл клиенту (см.
  // node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md),
  // поэтому зависший SMTP или недоступный api.telegram.org больше не держат
  // крутилку в форме: раньше их таймауты по 8 с посетитель ждал вживую.
  //
  // Чтение настроек тоже здесь: адреса нужны только уведомлениям, а поход в
  // API админки (пусть кэшированный и с фолбэком) — ещё одна внешняя
  // зависимость на пути ответа. Токен бота сюда не приходит — он только в
  // .env; в панели задаются одни адреса.
  //
  // Наружу из отложенной части не должно всплывать ничего: ответ уже отдан,
  // и исключение здесь стало бы необработанным отказом промиса. notifyLead
  // своё ловит сам, try/catch закрывает остальное — чтение настроек.
  after(async () => {
    try {
      const targets = await getLeadDelivery();

      await notifyLead(received, {
        telegramChats: targets.telegramChats,
        telegramChatId: targets.telegramChatId,
        email: targets.email,
      });
    } catch (error) {
      console.error("[LEAD] отложенные уведомления не выполнены:", error);
    }
  });

  return NextResponse.json({ ok: true });
}
