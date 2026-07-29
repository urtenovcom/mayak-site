// Получатели уведомлений о заявке в Telegram: форма записи, проверка и разбор
// произвольных данных из jsonb.
//
// Модуль нарочно без зависимостей: его импортируют и серверная доставка
// (lead-delivery.ts), и серверные экшены панели, и клиентская форма настроек.
//
// Правила согласованы с API (react-project-admin-back, поле
// `leadTelegramChats`) — расходиться им нельзя, иначе панель либо пропустит
// то, что API отвергнет, либо запретит допустимое.

/**
 * Один получатель уведомления.
 *
 * `chatId` ИМЕННО строка: у групп id отрицательный и длинный, у каналов
 * начинается с «-100» — в число такое не влезает и теряет точность.
 * `label` — подпись «кто это» для панели; на доставку не влияет, но без неё
 * список из четырёх голых чисел невозможно обслуживать.
 */
export type TelegramChat = { chatId: string; label: string };

/** Потолок получателей. Столько же принимает API. */
export const MAX_TELEGRAM_CHATS = 20;

/** Предел длины подписи. Столько же принимает API. */
export const MAX_CHAT_LABEL_LENGTH = 80;

/** Число (у групп со знаком «минус») либо @username канала. */
const CHAT_ID_PATTERN = /^(-?\d{1,32}|@[A-Za-z0-9_]{4,32})$/;

export function isValidChatId(value: string): boolean {
  return CHAT_ID_PATTERN.test(value.trim());
}

export function normalizeChatLabel(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_CHAT_LABEL_LENGTH) : "";
}

/**
 * Произвольные данные из jsonb/API → список получателей.
 *
 * Терпим к мусору по тем же соображениям, что и разбор галереи товара: в
 * колонке jsonb может лежать что угодно (правка напрямую в базе, данные от
 * старой версии), и это не должно ронять ни панель, ни приём заявки. Битая
 * запись просто пропускается.
 *
 * Порядок сохраняется — это порядок показа в панели. Дубликаты по `chatId`
 * схлопываются (побеждает первое вхождение, у него же остаётся подпись), число
 * получателей ограничено сверху.
 */
export function toTelegramChats(value: unknown): TelegramChat[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const chats: TelegramChat[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;

    const raw = item as Record<string, unknown>;
    const chatId = typeof raw.chatId === "string" ? raw.chatId.trim() : "";

    if (!isValidChatId(chatId) || seen.has(chatId)) continue;

    seen.add(chatId);
    chats.push({ chatId, label: normalizeChatLabel(raw.label) });

    if (chats.length >= MAX_TELEGRAM_CHATS) break;
  }

  return chats;
}

/** Человеческое имя получателя для лога и интерфейса. */
export function describeChat(chat: TelegramChat): string {
  return chat.label ? `${chat.chatId} (${chat.label})` : chat.chatId;
}
