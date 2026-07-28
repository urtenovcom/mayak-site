"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormBar } from "@/components/admin/FormBar";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import {
  Checkbox,
  CheckboxGroup,
  Field,
  Panel,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/admin/ui";
import { LINES_HINT, arrayToLines } from "@/lib/admin/format";
import type { AdminProduct } from "@/lib/admin/types";
import { EXPLOITATIONS, PRODUCT_OPTIONS, PRODUCT_TYPES, PURPOSE_TAGS } from "@/lib/catalog";
import { toGalleryImages, type GalleryImage } from "@/lib/media";
import { saveProductAction, type ProductFormValues } from "./actions";
import { DeleteProduct } from "./DeleteProduct";

/** Кнопка сохранения живёт в шапке, вне `<form>`, и связана с ней через `form`. */
const FORM_ID = "product-form";

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  image: "",
  images: [],
  purpose: "",
  type: PRODUCT_TYPES[0],
  exploitation: EXPLOITATIONS[0],
  size: "",
  description: "",
  tags: [],
  options: [],
  complectation: "",
  individual: false,
  published: true,
  sortOrder: "",
};

function toValues(product: AdminProduct): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    image: product.image,
    // Разбираем оба формата: `{ src, alt }` и голые строки у товаров,
    // сохранённых до появления описаний. Пустая галерея (товар заведён до
    // её появления) превращается в одну обложку.
    images: product.images?.length
      ? toGalleryImages(product.images, product.name)
      : product.image
        ? [{ src: product.image, alt: product.name }]
        : [],
    purpose: product.purpose,
    type: product.type,
    exploitation: product.exploitation,
    size: product.size,
    description: product.description,
    tags: [...product.tags],
    options: [...product.options],
    complectation: arrayToLines(product.complectation),
    individual: product.individual,
    published: product.published,
    sortOrder: String(product.sortOrder),
  };
}

/** Проверка галереи перед отправкой. `null` — всё в порядке. */
function validateGallery(images: readonly GalleryImage[], cover: string): string | null {
  if (images.length === 0) {
    return "Добавьте хотя бы одну фотографию товара: она же станет обложкой для карточки каталога.";
  }
  if (!cover.trim()) {
    return "Отметьте одну из фотографий обложкой — её показывают в карточке каталога.";
  }
  if (!images.some((image) => image.src === cover)) {
    return "Обложка должна быть одной из фотографий товара. Отметьте обложку заново.";
  }
  return null;
}

/** Список значений справочника + текущее значение, если его в справочнике нет. */
function withCurrent(list: readonly string[], current: string) {
  return current && !list.includes(current) ? [current, ...list] : [...list];
}

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    product ? toValues(product) : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Те же требования, что у API: галерея непустая и обложка внутри неё.
    // Ловим на клиенте, чтобы человек увидел понятный текст, а не 400.
    const invalid = validateGallery(values.images, values.image);
    if (invalid) {
      setError(invalid);
      return;
    }

    startTransition(async () => {
      const result = await saveProductAction(product?.id ?? null, values);

      if (!result.ok) {
        // Введённые данные остаются в state — форма не перерисовывается заново.
        setError(result.error);
        return;
      }

      if (product) {
        setValues(toValues(result.data));
        setSuccess("Сохранено.");
        router.refresh();
      } else {
        router.push(`/admin/catalog/${result.data.id}`);
      }
    });
  }

  return (
    <>
      <FormBar
        formId={FORM_ID}
        backHref="/admin/catalog"
        title={values.name.trim() || (product ? product.name : "Новый товар")}
        subtitle={product ? `/catalog/${product.slug}` : "Новая запись каталога"}
        published={values.published}
        publishedLabel="Опубликован"
        onPublishedChange={(next) => set("published", next)}
        submitLabel={product ? "Сохранить" : "Создать товар"}
        pending={pending}
        error={error}
        success={success}
        actions={
          product && (
            <DeleteProduct id={product.id} name={product.name} redirectTo="/admin/catalog" />
          )
        }
      />

      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Panel
          title="Основное"
          description={
            product
              ? undefined
              : "Обязательные поля отмечены звёздочкой. Slug соберётся из названия автоматически."
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Название" htmlFor="name" required className="lg:col-span-2">
              <TextInput
                id="name"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="slug"
              hint="Адрес страницы товара: /catalog/<slug>. Оставьте пустым — соберётся из названия."
            >
              <TextInput
                id="slug"
                value={values.slug}
                onChange={(event) => set("slug", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field label="Габариты" htmlFor="size" required hint="Например: 6,0 × 2,4 × 2,5 м">
              <TextInput
                id="size"
                value={values.size}
                onChange={(event) => set("size", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field label="Тип" htmlFor="type" required>
              <SelectInput
                id="type"
                value={values.type}
                onChange={(event) => set("type", event.target.value)}
                disabled={pending}
              >
                {withCurrent(PRODUCT_TYPES, values.type).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Эксплуатация" htmlFor="exploitation" required>
              <SelectInput
                id="exploitation"
                value={values.exploitation}
                onChange={(event) => set("exploitation", event.target.value)}
                disabled={pending}
              >
                {withCurrent(EXPLOITATIONS, values.exploitation).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field
              label="Назначение"
              htmlFor="purpose"
              required
              className="lg:col-span-2"
              hint="Короткая строка под названием в карточке каталога."
            >
              <TextInput
                id="purpose"
                value={values.purpose}
                onChange={(event) => set("purpose", event.target.value)}
                disabled={pending}
              />
            </Field>

            <Field label="Описание" htmlFor="description" required className="lg:col-span-2">
              <TextArea
                id="description"
                rows={4}
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                disabled={pending}
              />
            </Field>
          </div>
        </Panel>

        <Panel
          title="Фотографии"
          description="Первая загруженная становится обложкой. Обложку показывают карточка каталога и ссылка при пересылке, остальные фотографии — галерея на странице товара."
        >
          <GalleryEditor
            images={values.images}
            cover={values.image}
            disabled={pending}
            onChange={({ images, cover }) =>
              setValues((current) => ({ ...current, images, image: cover }))
            }
          />
        </Panel>

        <Panel
          title="Фильтры каталога"
          description="Теги и опции выбираются из справочника: по ним работают фильтры на /catalog. Новое значение появляется только вместе с правкой справочника в src/lib/catalog.ts."
        >
          <div className="flex flex-col gap-5">
            <CheckboxGroup
              label="Теги назначения"
              options={PURPOSE_TAGS}
              selected={values.tags}
              onChange={(next) => set("tags", next)}
              disabled={pending}
              hint="Задачи, под которые подходит товар. Фильтр «Задача» в каталоге."
            />

            <CheckboxGroup
              label="Опции"
              options={PRODUCT_OPTIONS}
              selected={values.options}
              onChange={(next) => set("options", next)}
              disabled={pending}
              hint="Что входит или доступно. Фильтр «Опции» в каталоге."
            />
          </div>
        </Panel>

        <Panel title="Комплектация">
          <Field
            label="Комплектация"
            htmlFor="complectation"
            hint={`Произвольный текст, справочником не ограничен. ${LINES_HINT}`}
          >
            <TextArea
              id="complectation"
              rows={6}
              value={values.complectation}
              onChange={(event) => set("complectation", event.target.value)}
              disabled={pending}
            />
          </Field>
        </Panel>

        {/* Публикация переехала в закреплённую шапку формы — здесь остальное. */}
        <Panel title="Порядок и параметры">
          <div className="flex flex-wrap items-end gap-6">
            <Field label="Порядок" htmlFor="sortOrder" hint="Меньше — выше в списке.">
              <TextInput
                id="sortOrder"
                inputMode="numeric"
                className="w-32"
                value={values.sortOrder}
                onChange={(event) => set("sortOrder", event.target.value)}
                disabled={pending}
              />
            </Field>

            <div className="pb-2">
              <Checkbox
                label="Индивидуальный размер"
                checked={values.individual}
                onChange={(event) => set("individual", event.target.checked)}
                disabled={pending}
              />
            </div>
          </div>
        </Panel>
      </form>
    </>
  );
}
