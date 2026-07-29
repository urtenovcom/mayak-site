"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/admin/api";
import { withToken } from "@/lib/admin/run";
import { getVerifiedToken } from "@/lib/admin/session";
import type { ActionResult } from "@/lib/admin/types";

export async function deleteMediaAction(id: string): Promise<ActionResult<unknown>> {
  const result = await withToken((token) =>
    apiFetch<unknown>(`/api/media/${id}`, { method: "DELETE", token }),
  );

  if (result.ok) revalidatePath("/admin/media");
  return result;
}

/**
 * После загрузки через route handler список нужно перечитать.
 *
 * Проверка прав нужна и здесь: серверный экшен вызывается прямым POST-запросом
 * с заголовком Next-Action, минуя и middleware, и рендер страницы. Сам по себе
 * сброс кэша безобиден, но незакрытых точек входа в панель быть не должно.
 */
export async function revalidateMediaAction(): Promise<void> {
  const verified = await getVerifiedToken();
  if (verified.status !== "ok") return;
  revalidatePath("/admin/media");
}
