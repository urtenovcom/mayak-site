// Блочная модель тела статьи блога.
//
// Тело статьи — последовательность блоков, у каждого свой `type`. Раньше это
// была секция жёсткой формы («заголовок + абзацы + список + таблица»); теперь
// блок добавляется выбором типа из меню, а порядок задаёт сам редактор.
//
// ВАЖНО ПРО ИМЯ ПОЛЯ. На проводе и в базе список блоков по-прежнему называется
// `sections` (колонка jsonb, тексты ошибок API — `sections[N] (type "…")`).
// Переименовывать его не стали: это сломало бы снимок сида и миграции ради
// косметики. Поэтому `BlogArticle.sections` — это массив ArticleBlock.
//
// Файл отделён от blog.ts намеренно: конвертер нужен и клиентскому редактору
// админки, а blog.ts тянет за собой ~30 КБ текста трёх эталонных статей.
//
// Схема блоков совпадает с валидацией бэкенда
// (react-project-admin-back/app/article/article-blocks.js) — правки нужно
// вносить в обе стороны одновременно.

import { isLocalImagePath, type GalleryImage } from "./media";

// Картинка блока «Галерея» — та же форма, что у фотографии товара, поэтому
// тип и проверка пути общие (src/lib/media.ts). Реэкспорт оставлен, чтобы
// вёрстка статьи и редактор блоков обходились одним импортом.
export { isLocalImagePath } from "./media";
export type { GalleryImage } from "./media";

/** Все типы блоков в порядке, в котором их показывает меню «+ Добавить блок». */
export const ARTICLE_BLOCK_TYPES = [
  "heading",
  "text",
  "list",
  "table",
  "quote",
  "image",
  "gallery",
  "video",
  "file",
  "accordion",
] as const;

export type ArticleBlockType = (typeof ARTICLE_BLOCK_TYPES)[number];

/**
 * Русские названия типов. Один источник на всю панель: их показывает и меню
 * «+ Добавить блок», и перевод сообщений об ошибках API
 * (src/lib/admin/errors.ts).
 */
export const ARTICLE_BLOCK_LABELS: Record<ArticleBlockType, string> = {
  heading: "Заголовок",
  text: "Текст",
  list: "Список",
  table: "Таблица",
  quote: "Цитата",
  image: "Изображение",
  gallery: "Галерея",
  video: "Видео",
  file: "Файл",
  accordion: "Аккордеон",
};

export type AccordionItem = { question: string; answer: string };

/** Заголовок раздела. Его `id` — якорь и пункт оглавления статьи. */
/**
 * Уровень заголовка внутри статьи.
 *
 * H1 на странице ровно один — это заголовок самой статьи, поэтому тело статьи
 * начинается с H2. Раздел — H2, подзаголовок внутри раздела — H3; глубже не
 * ходим. Отсутствие уровня означает H2 — так же трактуют его и API, и старые
 * секции, у которых поля уровня не было вовсе.
 */
export type HeadingLevel = 2 | 3;

export type HeadingBlock = {
  id: string;
  type: "heading";
  text: string;
  level?: HeadingLevel;
};

/** Уровень заголовка с подстановкой значения по умолчанию. */
export function headingLevel(block: HeadingBlock): HeadingLevel {
  return block.level === 3 ? 3 : 2;
}
/** Текст: по абзацу на элемент массива. */
export type TextBlock = { id: string; type: "text"; paragraphs: string[] };
/** Список: маркированный, либо нумерованный при `ordered`. */
export type ListBlock = { id: string; type: "list"; items: string[]; ordered?: boolean };
/** Таблица. Ячейки позиционные: `rows[i].length === headers.length`. */
export type TableBlock = {
  id: string;
  type: "table";
  headers: string[];
  rows: string[][];
  caption?: string;
};
export type QuoteBlock = { id: string; type: "quote"; text: string; author?: string };
export type ImageBlock = { id: string; type: "image"; src: string; alt: string; caption?: string };
export type GalleryBlock = { id: string; type: "gallery"; images: GalleryImage[] };
export type VideoBlock = { id: string; type: "video"; src: string; poster?: string; caption?: string };
export type FileBlock = { id: string; type: "file"; url: string; title: string };
export type AccordionBlock = { id: string; type: "accordion"; items: AccordionItem[] };

export type ArticleBlock =
  | HeadingBlock
  | TextBlock
  | ListBlock
  | TableBlock
  | QuoteBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | FileBlock
  | AccordionBlock;

/**
 * Секция статьи в старом формате.
 *
 * В базе такие секции лежат у статей, созданных до перехода на блоки, поэтому
 * читающий код обязан уметь их разворачивать (см. `toArticleBlocks`).
 */
export type LegacyArticleSection = {
  id?: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
};

// ---------------------------------------------------------------------------
// Якоря заголовков
// ---------------------------------------------------------------------------

// Транслитерация повторяет CYRILLIC_MAP бэкенда
// (react-project-admin-back/app/utils/http.utils.js): якорь, собранный в
// панели, должен совпадать с тем, что собрал бы API из того же заголовка.
const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** Допустимый якорь: строчная латиница, цифры и дефис. */
export const ANCHOR_PATTERN = /^[a-z0-9-]+$/;

/**
 * Заголовок → якорь раздела.
 *
 * Якорь становится публичным адресом (`/blog/slug#якорь`), поэтому кириллицу
 * и пробелы в нём держать нельзя: браузер их процентно кодирует, а ссылка
 * получается нечитаемой и ломкой.
 */
export function slugifyAnchor(value: string, fallback = "razdel"): string {
  const slug = value
    .split("")
    .map((char) => {
      const lower = char.toLowerCase();
      return CYRILLIC[lower] ?? lower;
    })
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

// ---------------------------------------------------------------------------
// Разбор «чего угодно» из jsonb
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Список строк: пустые выбрасываются (в отличие от ячеек таблицы). */
function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item !== "");
}

/**
 * Ячейки строки/шапки таблицы. Пустые значения СОХРАНЯЮТСЯ: позиция ячейки
 * привязана к номеру столбца, и пустая ячейка в середине строки — легальные
 * данные. Выбрасывание пустых значений здесь молча съезжало бы столбцы под
 * чужие заголовки.
 */
function cells(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : ""));
}

/** Убирает только хвостовые пустые ячейки — артефакт лишнего столбца. */
function dropTrailingEmpty(list: string[]): string[] {
  const next = [...list];
  while (next.length > 0 && next[next.length - 1] === "") next.pop();
  return next;
}

/** Приводит строку таблицы к числу столбцов: лишнее режем, недостающее добиваем. */
function fitRow(row: string[], columns: number): string[] {
  const next = row.slice(0, columns);
  while (next.length < columns) next.push("");
  return next;
}

/** Нормализованная таблица: строки выровнены по заголовкам, пустые строки убраны. */
function normalizeTable(source: unknown): { headers: string[]; rows: string[][] } {
  if (!isRecord(source)) return { headers: [], rows: [] };

  const headers = dropTrailingEmpty(cells(source.headers));
  const rawRows = Array.isArray(source.rows) ? source.rows : [];

  const rows = rawRows
    .map((row) => {
      const list = dropTrailingEmpty(cells(row));
      return headers.length > 0 ? fitRow(list, headers.length) : list;
    })
    .filter((row) => row.some((cell) => cell !== ""));

  return { headers, rows };
}

function objects(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

/**
 * Один блок из сырого объекта. `null` — блок некорректен и его нужно
 * пропустить: на чтении мы прощаем мусор, а не роняем страницу (проверку с
 * понятной ошибкой делает API при сохранении).
 */
function toBlock(raw: Record<string, unknown>, id: string): ArticleBlock | null {
  const type = text(raw.type);

  switch (type) {
    case "heading": {
      const value = text(raw.text);
      if (!value) return null;
      // Уровень необязателен: у старых секций его нет, и это H2.
      // Любое значение, кроме 3, трактуем как H2 — мусор из jsonb не должен
      // порождать h4 и дырки в иерархии заголовков.
      return raw.level === 3 || raw.level === "3"
        ? { id, type, text: value, level: 3 }
        : { id, type, text: value };
    }
    case "text": {
      const paragraphs = strings(raw.paragraphs);
      return paragraphs.length > 0 ? { id, type, paragraphs } : null;
    }
    case "list": {
      const items = strings(raw.items);
      if (items.length === 0) return null;
      return raw.ordered === true ? { id, type, items, ordered: true } : { id, type, items };
    }
    case "table": {
      const { headers, rows } = normalizeTable(raw);
      if (headers.length === 0) return null;
      const block: TableBlock = { id, type, headers, rows };
      const caption = text(raw.caption);
      if (caption) block.caption = caption;
      return block;
    }
    case "quote": {
      const value = text(raw.text);
      if (!value) return null;
      const block: QuoteBlock = { id, type, text: value };
      const author = text(raw.author);
      if (author) block.author = author;
      return block;
    }
    case "image": {
      const src = text(raw.src);
      const alt = text(raw.alt);
      // Внешний адрес до next/image доходить не должен — см. isLocalImagePath.
      if (!src || !alt || !isLocalImagePath(src)) return null;
      const block: ImageBlock = { id, type, src, alt };
      const caption = text(raw.caption);
      if (caption) block.caption = caption;
      return block;
    }
    case "gallery": {
      const images = objects(raw.images)
        .map((image) => ({ src: text(image.src), alt: text(image.alt) }))
        .filter((image) => isLocalImagePath(image.src) && image.alt !== "");
      return images.length > 0 ? { id, type, images } : null;
    }
    case "video": {
      const src = text(raw.src);
      if (!src) return null;
      const block: VideoBlock = { id, type, src };
      // Постер уходит в атрибут <video poster>, а не в next/image: внешний
      // адрес там просто работает и уронить страницу не может, поэтому здесь
      // он не фильтруется. Панель всё равно требует файл из медиатеки —
      // чтобы картинки статьи лежали на своём домене.
      const poster = text(raw.poster);
      if (poster) block.poster = poster;
      const caption = text(raw.caption);
      if (caption) block.caption = caption;
      return block;
    }
    case "file": {
      const url = text(raw.url);
      const title = text(raw.title);
      return url && title ? { id, type, url, title } : null;
    }
    case "accordion": {
      const items = objects(raw.items)
        .map((item) => ({ question: text(item.question), answer: text(item.answer) }))
        .filter((item) => item.question !== "" && item.answer !== "");
      return items.length > 0 ? { id, type, items } : null;
    }
    default:
      return null;
  }
}

/**
 * Старая секция → последовательность блоков.
 *
 * `id` секции достаётся заголовку: он и был якорем, поэтому ссылки на разделы
 * статьи и оглавление продолжают работать. Остальные блоки получают
 * производные идентификаторы. Блок появляется только для заполненного поля.
 */
function expandLegacySection(raw: Record<string, unknown>, index: number): ArticleBlock[] {
  const title = text(raw.title);
  if (!title) return [];

  const baseId = text(raw.id) || `section-${index + 1}`;
  const blocks: ArticleBlock[] = [{ id: baseId, type: "heading", text: title }];

  const paragraphs = strings(raw.paragraphs);
  if (paragraphs.length > 0) blocks.push({ id: `${baseId}-text`, type: "text", paragraphs });

  const items = strings(raw.bullets);
  if (items.length > 0) blocks.push({ id: `${baseId}-list`, type: "list", items });

  if (isRecord(raw.table)) {
    const { headers, rows } = normalizeTable(raw.table);
    if (headers.length > 0) {
      blocks.push({ id: `${baseId}-table`, type: "table", headers, rows });
    }
  }

  return blocks;
}

/**
 * Приводит содержимое поля `sections` к массиву блоков.
 *
 * Принимает оба формата и их смесь: блочный узнаём по `type`, старый — по
 * отсутствию `type` при наличии `title`. Конвертер вызывается при КАЖДОМ
 * чтении (публичный сайт и форма админки), поэтому статьи, лежащие в базе в
 * старом формате, не ломаются и не требуют миграции данных.
 *
 * Идентификаторы блоков уникальны: дубликат получает числовой суффикс, чтобы
 * якоря и ключи React не конфликтовали.
 */
export function toArticleBlocks(value: unknown): ArticleBlock[] {
  if (!Array.isArray(value)) return [];

  const blocks: ArticleBlock[] = [];

  value.forEach((raw, index) => {
    if (!isRecord(raw)) return;

    // Старый формат: типа нет, но есть заголовок секции.
    if (raw.type === undefined && text(raw.title)) {
      blocks.push(...expandLegacySection(raw, index));
      return;
    }

    const block = toBlock(raw, text(raw.id) || `block-${index + 1}`);
    if (block) blocks.push(block);
  });

  const seen = new Set<string>();
  return blocks.map((block) => {
    if (!seen.has(block.id)) {
      seen.add(block.id);
      return block;
    }
    let suffix = 2;
    while (seen.has(`${block.id}-${suffix}`)) suffix += 1;
    const id = `${block.id}-${suffix}`;
    seen.add(id);
    return { ...block, id };
  });
}

/** Раздел статьи в оглавлении: заголовок H2 и вложенные в него H3. */
export type OutlineSection = { heading: HeadingBlock; children: HeadingBlock[] };

/**
 * Оглавление статьи — разделы с вложенными подзаголовками.
 *
 * Плоский список H2 и H3 вперемешку читался бы как равнозначные разделы,
 * поэтому подзаголовки уходят внутрь своего раздела. Подзаголовок, попавшийся
 * раньше первого H2 (данные из базы бывают какими угодно), становится
 * разделом сам — иначе он потерялся бы для читателя.
 */
export function articleOutline(blocks: readonly ArticleBlock[]): OutlineSection[] {
  const sections: OutlineSection[] = [];

  for (const block of blocks) {
    if (block.type !== "heading") continue;

    const parent = sections[sections.length - 1];
    if (headingLevel(block) === 3 && parent) parent.children.push(block);
    else sections.push({ heading: block, children: [] });
  }

  return sections;
}
