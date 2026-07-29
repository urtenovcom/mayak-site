"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/admin/api";
import { CONTENT_TAGS, revalidateContent } from "@/lib/admin/revalidate";
import { withToken } from "@/lib/admin/run";
import type { ActionResult, AdminMedia } from "@/lib/admin/types";
import { MAX_ALT_LENGTH } from "@/lib/media";

/**
 * Описание файла в медиатеке.
 *
 * Это ЗНАЧЕНИЕ ПО УМОЛЧАНИЮ: при добавлении файла в товар описание
 * копируется к фотографии товара и дальше живёт отдельно. Правка здесь не
 * меняет уже расставленные описания, и наоборот.
 *
 * Лежит отдельно от экшенов раздела «Медиатека», потому что вызывается ещё и
 * из диалога выбора файла — а он живёт в общих компонентах панели.
 */
export async function updateMediaAltAction(
  id: string,
  alt: string,
): Promise<ActionResult<AdminMedia>> {
  const result = await withToken((token) =>
    apiFetch<AdminMedia>(`/api/media/${id}`, {
      method: "PUT",
      token,
      // Пустое описание — легальное значение: так помечают декоративную
      // картинку. API превращает пустую строку в null.
      body: { alt: alt.trim().slice(0, MAX_ALT_LENGTH) },
    }),
  );

  if (result.ok) revalidatePath("/admin/media");
  return result;
}

/**
 * Имя файла в медиатеке.
 *
 * Меняется именно имя на диске: оно попадает в адрес картинки, а адрес видят
 * и люди, и поисковики — «IMG_3421» там не нужен. API заодно переписывает
 * ссылки на файл в товарах, статьях и направлениях, поэтому после
 * переименования сбрасываем кэш всего контента, а не только медиатеки.
 *
 * Расширение задавать не нужно: тип файла определяется его содержимым, API
 * оставляет прежнее. Кириллица транслитерируется.
 */
export async function renameMediaAction(
  id: string,
  filename: string,
): Promise<ActionResult<AdminMedia>> {
  const result = await withToken((token) =>
    apiFetch<AdminMedia>(`/api/media/${id}`, {
      method: "PUT",
      token,
      body: { filename: filename.trim() },
    }),
  );

  if (result.ok) {
    revalidatePath("/admin/media");
    revalidateContent(CONTENT_TAGS.products, CONTENT_TAGS.articles, CONTENT_TAGS.solutions);
  }
  return result;
}
