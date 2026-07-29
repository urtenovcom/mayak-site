// Общие правила для картинок сайта: форма «путь + описание», проверка пути и
// разбор произвольных данных из базы.
//
// Модуль нарочно пустой на зависимости: его импортируют и серверные модули, и
// клиентские компоненты панели, и статические данные каталога (последние
// читает Node напрямую при пересборке снимка сида).

/**
 * Картинка с описанием.
 *
 * Одна и та же форма у фотографий товара и у блока «Галерея» в статье:
 * описание живёт рядом с путём, потому что одна и та же картинка в разных
 * местах требует разных слов.
 */
export type GalleryImage = { src: string; alt: string };

/** Предел длины описания — столько же принимает API. */
export const MAX_ALT_LENGTH = 300;

/**
 * Можно ли отдать путь в `next/image`.
 *
 * `next/image` бросает исключение на внешнем адресе, у которого нет хоста в
 * `images.remotePatterns`, и это исключение валит ВСЮ страницу. Поэтому
 * картинкой считается только путь внутри сайта: начинается с одного «/»
 * (не с «//» — это протокол-относительный внешний адрес) и не содержит схемы.
 */
export function isLocalImagePath(value: string): boolean {
  const path = value.trim();
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

/** Описание картинки: обрезано по длине, пустое — легальное значение. */
export function normalizeAlt(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_ALT_LENGTH) : "";
}

/**
 * Произвольные данные из jsonb/API → список картинок с описаниями.
 *
 * Принимает и новый формат (`[{ src, alt }]`), и старый (`["/путь"]`) —
 * товары, сохранённые до появления описаний, читаются без миграции. Порядок
 * сохраняется, дубликаты по `src` схлопываются, внешние адреса выбрасываются.
 *
 * @param fallbackAlt описание для записей, у которых его нет (обычно название
 *   товара) — лучше, чем пустая строка, но заменить осмысленный текст оно не
 *   может.
 */
export function toGalleryImages(value: unknown, fallbackAlt = ""): GalleryImage[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const images: GalleryImage[] = [];

  for (const item of value) {
    const raw =
      typeof item === "string"
        ? { src: item, alt: undefined }
        : item && typeof item === "object" && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : null;
    if (!raw) continue;

    const src = typeof raw.src === "string" ? raw.src.trim() : "";
    if (!isLocalImagePath(src) || seen.has(src)) continue;

    seen.add(src);
    // Запасное описание подставляется, только если поля НЕТ вовсе (старый
    // формат из голых строк). Пустая строка — осознанный выбор редактора:
    // так помечают декоративную картинку, и затирать его нельзя.
    images.push({
      src,
      alt: typeof raw.alt === "string" ? normalizeAlt(raw.alt) : fallbackAlt,
    });
  }

  return images;
}

/** Описание обложки: берётся у её же записи в галерее. */
export function coverAlt(images: readonly GalleryImage[], cover: string, fallback = ""): string {
  const found = images.find((image) => image.src === cover);
  return found ? found.alt : fallback;
}
