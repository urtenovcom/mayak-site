// Общие преобразования данных админки. Импортируется и клиентом, и сервером —
// поэтому здесь не должно быть ни cookies(), ни обращений к API.

/**
 * Многострочное поле → массив пунктов.
 *
 * Разделитель — ТОЛЬКО перевод строки: в комплектации и буллитах сплошь
 * встречаются запятые («Электрика: автомат, розетки, свет»), и разбиение
 * по запятой рвало бы пункт на части. То же правило действует на бэке
 * (`toStringArray` в app/utils/http.utils.js).
 */
export function linesToArray(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Массив пунктов → многострочное поле. */
export function arrayToLines(value: readonly string[] | null | undefined): string {
  return (value ?? []).join("\n");
}

/** Подпись к многострочным полям — один текст на всю админку. */
export const LINES_HINT = "По одному пункту на строку. Запятые внутри пункта сохраняются.";

/**
 * Подпись к полям, где перенос строки — часть вёрстки.
 *
 * В данных сайта такие переносы есть (например, «Для\nстроительства»): они
 * задают разбивку заголовка на строки в карточке. Держать такое поле в
 * однострочном <input> нельзя — браузер переносы не показывает, и первая же
 * правка их затирает.
 */
export const NEWLINE_HINT =
  "Перенос строки значим: он задаёт разбивку текста на строки в карточке на сайте.";

/**
 * Путь к картинке для показа в админке.
 *
 * `/uploads/...` отдаёт API на другом порту — ходим туда через собственный
 * прокси-роут, чтобы браузер оставался на своём домене. Остальные пути
 * (`/renders/...`, `/blog/...`) лежат в public самого сайта.
 */
export function mediaSrc(url: string): string {
  const value = url.trim();
  if (!value) return "";
  if (value.startsWith("/uploads/")) return `/admin${value}`;
  return value;
}

const DATE_TIME = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : DATE_TIME.format(date);
}

/** ISO-дата → значение для <input type="date">. */
export function toDateInputValue(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatBytes(value: string | number): string {
  const size = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(size)) return "—";
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} КБ`;
  return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
}
