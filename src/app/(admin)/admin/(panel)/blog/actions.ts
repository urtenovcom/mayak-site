"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/admin/api";
import { linesToArray } from "@/lib/admin/format";
import type { FieldLabels } from "@/lib/admin/errors";
import { CONTENT_TAGS, revalidateContent } from "@/lib/admin/revalidate";
import { withToken } from "@/lib/admin/run";
import type { ActionResult, AdminArticle } from "@/lib/admin/types";

/** Названия полей формы статьи — для русских сообщений об ошибках API. */
const LABELS: FieldLabels = {
  title: "Заголовок",
  description: "Описание (SEO)",
  excerpt: "Краткий анонс",
  image: "Обложка",
  imageAlt: "Alt изображения",
  readingTime: "Время чтения",
};

// ---------------------------------------------------------------------------
// Значения блоков в форме
// ---------------------------------------------------------------------------
//
// Тело статьи — последовательность блоков (см. src/lib/blog-blocks.ts). В
// форме у каждого типа свой набор полей, поэтому значения описаны union'ом с
// дискриминатором `type`: редактор конкретного блока получает ровно свои поля
// и не проверяет наличие чужих.
//
// Списки хранятся многострочным текстом (по пункту на строку) — так же, как в
// остальных формах панели; запятые внутри пункта сохраняются. Ячейки таблицы,
// картинки галереи и пункты аккордеона — структурами, потому что там значима
// позиция или это пары полей.

type BaseBlockValues = {
  /** ключ React, на сервер не уходит */
  key: string;
  /** идентификатор блока; у заголовка он же якорь раздела */
  id: string;
};

export type HeadingBlockValues = BaseBlockValues & {
  type: "heading";
  text: string;
  /** 2 — раздел статьи, 3 — подзаголовок внутри раздела. */
  level: 2 | 3;
  /**
   * Якорь ещё не «зафиксирован» и пересобирается из текста заголовка.
   *
   * Сбрасывается в false, как только пользователь правит якорь руками или как
   * только блок приезжает из базы: у сохранённого заголовка адрес раздела
   * меняться сам не должен — иначе побьются внешние ссылки. На сервер поле не
   * уходит, это состояние формы.
   */
  autoId: boolean;
};
export type TextBlockValues = BaseBlockValues & { type: "text"; paragraphs: string };
export type ListBlockValues = BaseBlockValues & { type: "list"; items: string; ordered: boolean };
export type TableBlockValues = BaseBlockValues & {
  type: "table";
  /** по заголовку на столбец */
  headers: string[];
  /** строки таблицы; вложенный массив — ячейки строки */
  rows: string[][];
  caption: string;
};
export type QuoteBlockValues = BaseBlockValues & { type: "quote"; text: string; author: string };
export type ImageBlockValues = BaseBlockValues & {
  type: "image";
  src: string;
  alt: string;
  caption: string;
};
export type GalleryImageValues = { key: string; src: string; alt: string };
export type GalleryBlockValues = BaseBlockValues & {
  type: "gallery";
  images: GalleryImageValues[];
};
export type VideoBlockValues = BaseBlockValues & {
  type: "video";
  src: string;
  poster: string;
  caption: string;
};
export type FileBlockValues = BaseBlockValues & { type: "file"; url: string; title: string };
export type AccordionItemValues = { key: string; question: string; answer: string };
export type AccordionBlockValues = BaseBlockValues & {
  type: "accordion";
  items: AccordionItemValues[];
};

export type ArticleBlockValues =
  | HeadingBlockValues
  | TextBlockValues
  | ListBlockValues
  | TableBlockValues
  | QuoteBlockValues
  | ImageBlockValues
  | GalleryBlockValues
  | VideoBlockValues
  | FileBlockValues
  | AccordionBlockValues;

export type ArticleFormValues = {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  readingTime: string;
  publishedAt: string;
  updatedAt: string;
  keywords: string;
  intro: string;
  published: boolean;
  sortOrder: string;
  /** Тело статьи. На проводе поле называется `sections` — так же, как в базе. */
  blocks: ArticleBlockValues[];
};

/**
 * Таблица блока.
 *
 * Ячейки уезжают массивом, а не склеенной через «|» строкой: разделитель
 * невозможно было ввести в текст ячейки, а пустая ячейка при разборе просто
 * исчезала — столбцы съезжали под чужие заголовки. Пустые ячейки здесь
 * сознательно сохраняются, и длина каждой строки выравнивается по числу
 * заголовков.
 */
function toTable(block: TableBlockValues) {
  const headers = block.headers.map((header) => header.trim());

  // Хвостовые пустые столбцы — это «добавил и передумал», их отбрасываем.
  while (headers.length > 0 && headers[headers.length - 1] === "") headers.pop();

  const width = headers.length;

  const rows = block.rows
    .map((row) => {
      const cells = row.map((cell) => cell.trim());
      if (width > 0) {
        cells.length = width; // обрезаем лишнее и добиваем пустыми
        for (let i = 0; i < width; i += 1) cells[i] = cells[i] ?? "";
      }
      return cells;
    })
    // Полностью пустая строка таблице не нужна.
    .filter((cells) => cells.some((cell) => cell !== ""));

  return { headers, rows };
}

/** Необязательное поле: пустое не отправляем, чтобы не плодить "" в jsonb. */
function optional(target: Record<string, unknown>, field: string, value: string) {
  const text = value.trim();
  if (text) target[field] = text;
}

/** Значения блока из формы → объект блока для API. */
function toBlock(block: ArticleBlockValues): Record<string, unknown> {
  const payload: Record<string, unknown> = { id: block.id.trim(), type: block.type };

  switch (block.type) {
    case "heading":
      payload.text = block.text.trim();
      // Уровень 2 — значение по умолчанию, его не отправляем: и API, и
      // конвертер трактуют отсутствие поля как H2, а лишний ключ только
      // засорял бы jsonb (и появился бы у всех старых заголовков).
      if (block.level === 3) payload.level = 3;
      break;

    case "text":
      payload.paragraphs = linesToArray(block.paragraphs);
      break;

    case "list":
      payload.items = linesToArray(block.items);
      payload.ordered = block.ordered;
      break;

    case "table": {
      const { headers, rows } = toTable(block);
      payload.headers = headers;
      payload.rows = rows;
      optional(payload, "caption", block.caption);
      break;
    }

    case "quote":
      payload.text = block.text.trim();
      optional(payload, "author", block.author);
      break;

    case "image":
      payload.src = block.src.trim();
      payload.alt = block.alt.trim();
      optional(payload, "caption", block.caption);
      break;

    case "gallery":
      payload.images = block.images.map((image) => ({
        src: image.src.trim(),
        alt: image.alt.trim(),
      }));
      break;

    case "video":
      payload.src = block.src.trim();
      optional(payload, "poster", block.poster);
      optional(payload, "caption", block.caption);
      break;

    case "file":
      payload.url = block.url.trim();
      payload.title = block.title.trim();
      break;

    case "accordion":
      payload.items = block.items.map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }));
      break;
  }

  return payload;
}

function toBody(values: ArticleFormValues) {
  const body: Record<string, unknown> = {
    title: values.title.trim(),
    description: values.description.trim(),
    excerpt: values.excerpt.trim(),
    image: values.image.trim(),
    imageAlt: values.imageAlt.trim(),
    readingTime: values.readingTime.trim(),
    keywords: linesToArray(values.keywords),
    intro: linesToArray(values.intro),
    // Историческое имя поля: в базе это колонка `sections`, и сообщения об
    // ошибках API адресуют блоки как `sections[N]`.
    sections: values.blocks.map(toBlock),
    published: values.published,
  };

  if (values.slug.trim()) body.slug = values.slug.trim();
  if (values.publishedAt.trim()) body.publishedAt = values.publishedAt.trim();
  if (values.updatedAt.trim()) body.updatedAt = values.updatedAt.trim();

  const sortOrder = values.sortOrder.trim();
  if (sortOrder) body.sortOrder = sortOrder;

  return body;
}

export async function saveArticleAction(
  id: string | null,
  values: ArticleFormValues,
): Promise<ActionResult<AdminArticle>> {
  const result = await withToken(
    (token) =>
      id
        ? apiFetch<AdminArticle>(`/api/articles/${id}`, {
            method: "PUT",
            token,
            body: toBody(values),
          })
        : apiFetch<AdminArticle>("/api/articles", { method: "POST", token, body: toBody(values) }),
    LABELS,
  );

  if (result.ok) {
    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${result.data.id}`);
    // Список блога и страница статьи на сайте обновляются сразу.
    revalidateContent(CONTENT_TAGS.articles);
  }

  return result;
}

export async function deleteArticleAction(id: string): Promise<ActionResult<unknown>> {
  const result = await withToken((token) =>
    apiFetch<unknown>(`/api/articles/${id}`, { method: "DELETE", token }),
  );

  if (result.ok) {
    revalidatePath("/admin/blog");
    revalidateContent(CONTENT_TAGS.articles);
  }
  return result;
}
