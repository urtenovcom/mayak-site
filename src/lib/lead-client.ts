// Клиентская отправка заявки на /api/lead.
//
// Эндпоинт отвечает не только 200: 429 — превышен лимит заявок с адреса,
// 400/422 — некорректное тело. Формы обязаны показывать экран «успешно»
// ТОЛЬКО при ok-ответе, поэтому отправка вынесена сюда: один разбор ответа
// и один набор текстов ошибок на все формы сайта.

import { CONTACTS } from "@/lib/site";
import { typo } from "@/lib/typo";

export type LeadError = "rate_limited" | "failed";

export type LeadPayload = {
  name: string;
  phone: string;
  comment?: string;
  source: string;
  /** honeypot: у человека всегда пустой */
  company?: string;
};

export const LEAD_ERROR_TEXT: Record<LeadError, string> = {
  rate_limited: typo(
    `Слишком много заявок с вашего адреса. Попробуйте позже или позвоните нам: ${CONTACTS.phones[0]}.`,
  ),
  failed: typo(
    `Не удалось отправить заявку. Попробуйте ещё раз или позвоните: ${CONTACTS.phones[0]}.`,
  ),
};

/** Отправляет заявку. Возвращает null при успехе или код ошибки. */
export async function sendLead(payload: LeadPayload): Promise<LeadError | null> {
  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        page: typeof window !== "undefined" ? window.location.pathname : "",
        utm: typeof window !== "undefined" ? window.location.search : "",
      }),
    });

    if (response.ok) return null;
    return response.status === 429 ? "rate_limited" : "failed";
  } catch {
    // Сеть недоступна / запрос заблокирован.
    return "failed";
  }
}
