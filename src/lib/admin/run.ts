// Обёртка для server actions админки: подтверждает права и превращает любую
// ошибку API в значение { ok: false, error } с русским текстом.
//
// Это НЕ файл с "use server" — здесь обычные серверные утилиты.

import { toUserMessage } from "./api";
import type { FieldLabels } from "./errors";
import { getVerifiedToken } from "./session";
import type { ActionResult } from "./types";

export async function withToken<T>(
  fn: (token: string) => Promise<T>,
  /** Названия полей раздела — чтобы ошибки валидации были на русском. */
  labels: FieldLabels = {},
): Promise<ActionResult<T>> {
  // Проверка прав дублирует proxy и layout: server action может быть вызван
  // напрямую, минуя рендер страницы, поэтому здесь подтверждаем и роль.
  const verified = await getVerifiedToken();

  if (verified.status === "unavailable") {
    // Не «войдите заново»: вход тут ни при чём, до API просто не достучались.
    return { ok: false, error: verified.message };
  }

  if (verified.status === "forbidden") {
    return { ok: false, error: "Недостаточно прав: операция доступна только администратору." };
  }

  if (verified.status !== "ok") {
    return {
      ok: false,
      error: "Сессия истекла. Войдите в админку заново.",
    };
  }

  try {
    return { ok: true, data: await fn(verified.token) };
  } catch (error) {
    return { ok: false, error: toUserMessage(error, labels) };
  }
}
