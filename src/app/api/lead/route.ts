import { NextResponse } from "next/server";
import { z } from "zod";

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

  const payload = {
    ...lead,
    receivedAt: new Date().toISOString(),
  };

  // TODO: подключить SMTP / Telegram-уведомление, когда будут креды.
  // Сейчас — структурированный лог заявки (видно в логах хостинга).
  console.info("[LEAD]", JSON.stringify(payload));

  // Пример отправки на email (раскомментировать после установки nodemailer и настройки env):
  // await sendMail({
  //   to: "companymayak@mail.ru",
  //   subject: `Новая заявка — ${lead.source ?? "сайт"}`,
  //   text: JSON.stringify(payload, null, 2),
  // });

  return NextResponse.json({ ok: true });
}
