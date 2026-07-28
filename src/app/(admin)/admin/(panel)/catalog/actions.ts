"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/admin/api";
import { linesToArray } from "@/lib/admin/format";
import { CONTENT_TAGS, revalidateContent } from "@/lib/admin/revalidate";
import { withToken } from "@/lib/admin/run";
import type { ActionResult, AdminProduct } from "@/lib/admin/types";
import { MAX_ALT_LENGTH, type GalleryImage } from "@/lib/media";

export type ProductFormValues = {
  name: string;
  slug: string;
  /** Обложка: карточка каталога, JSON-LD, метаданные ссылки. Всегда входит в `images`. */
  image: string;
  /** Все фотографии товара в порядке показа, включая обложку, с описаниями. */
  images: GalleryImage[];
  purpose: string;
  type: string;
  exploitation: string;
  size: string;
  description: string;
  /**
   * Теги назначения и опции — только значения справочников каталога
   * (`PURPOSE_TAGS` / `PRODUCT_OPTIONS` в src/lib/catalog.ts). Выбираются
   * флажками, поэтому здесь уже готовый массив, а не многострочный текст:
   * свободный ввод молча выкидывал товар из фильтров.
   */
  tags: string[];
  options: string[];
  /** Многострочное поле: по пункту на строку. Произвольный текст. */
  complectation: string;
  individual: boolean;
  published: boolean;
  sortOrder: string;
};

/**
 * Галерея для API: без пустых и дублей по `src`, с обложкой внутри.
 * Порядок — тот, что задан в панели, обложка не выносится вперёд.
 * Пустое описание отправляется как есть: у декоративной картинки оно
 * законно пустое, и API это принимает.
 */
function withCover(images: readonly GalleryImage[], cover: string): GalleryImage[] {
  const seen = new Set<string>();
  const list: GalleryImage[] = [];

  for (const image of images) {
    const src = image.src.trim();
    if (!src || seen.has(src)) continue;
    seen.add(src);
    list.push({ src, alt: image.alt.trim().slice(0, MAX_ALT_LENGTH) });
  }

  const path = cover.trim();
  if (path && !seen.has(path)) list.unshift({ src: path, alt: "" });

  return list;
}

/** Убирает пустые значения и дубликаты, сохраняя порядок выбора. */
function cleanList(values: readonly string[]): string[] {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
}

function toBody(values: ProductFormValues) {
  const body: Record<string, unknown> = {
    name: values.name.trim(),
    image: values.image.trim(),
    // Обложка обязана входить в галерею — иначе API вернёт 400. Форма это
    // и так гарантирует, но подстраховываемся на случай пустого набора.
    images: withCover(values.images, values.image),
    purpose: values.purpose.trim(),
    type: values.type.trim(),
    exploitation: values.exploitation.trim(),
    size: values.size.trim(),
    description: values.description.trim(),
    tags: cleanList(values.tags),
    options: cleanList(values.options),
    complectation: linesToArray(values.complectation),
    individual: values.individual,
    published: values.published,
  };

  // Пустой slug не отправляем: API сам соберёт его из названия.
  if (values.slug.trim()) body.slug = values.slug.trim();

  const sortOrder = values.sortOrder.trim();
  if (sortOrder) body.sortOrder = sortOrder;

  return body;
}

export async function saveProductAction(
  id: string | null,
  values: ProductFormValues,
): Promise<ActionResult<AdminProduct>> {
  const result = await withToken((token) =>
    id
      ? apiFetch<AdminProduct>(`/api/products/${id}`, { method: "PUT", token, body: toBody(values) })
      : apiFetch<AdminProduct>("/api/products", { method: "POST", token, body: toBody(values) }),
  );

  if (result.ok) {
    revalidatePath("/admin/catalog");
    revalidatePath(`/admin/catalog/${result.data.id}`);
    // Каталог на сайте должен показать правку сразу, а не по таймеру.
    revalidateContent(CONTENT_TAGS.products);
  }

  return result;
}

export async function deleteProductAction(id: string): Promise<ActionResult<unknown>> {
  const result = await withToken((token) =>
    apiFetch<unknown>(`/api/products/${id}`, { method: "DELETE", token }),
  );

  if (result.ok) {
    revalidatePath("/admin/catalog");
    revalidateContent(CONTENT_TAGS.products);
  }
  return result;
}
