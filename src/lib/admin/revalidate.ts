// Сброс кэша публичных страниц после правок в админке.
//
// Панель и сайт — одно Next-приложение, поэтому серверный экшен админки может
// сбросить тег кэша сразу после успешного сохранения: публичная страница
// покажет новое значение с первого же открытия, ждать ревалидации не нужно.
//
// Это НЕ файл с "use server" — здесь обычные серверные утилиты.

import { updateTag } from "next/cache";
import { CONTENT_TAGS, type ContentTag } from "../content";

/**
 * `updateTag`, а не `revalidateTag(tag, "max")`.
 *
 * revalidateTag с профилем даёт stale-while-revalidate: сразу после
 * сохранения посетитель (и сам редактор) ещё раз увидел бы старое значение,
 * а новое подтянулось бы фоном. updateTag помечает тег просроченным
 * немедленно, и следующий рендер ждёт свежие данные — то самое
 * «read-your-own-writes», которое обещает надпись под формой.
 * См. node_modules/next/dist/docs/01-app/03-api-reference/04-functions/updateTag.md
 *
 * Вызывать только из server action (в route handler updateTag бросает
 * исключение — там нужен revalidateTag).
 */
export function revalidateContent(...tags: ContentTag[]): void {
  for (const tag of tags) updateTag(tag);
}

export { CONTENT_TAGS };
