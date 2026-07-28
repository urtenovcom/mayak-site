"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { FormFooter } from "@/components/admin/FormFooter";
import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  Checkbox,
  Field,
  Panel,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/admin/ui";
import { ICON_NAMES } from "@/components/icons";
import { LINES_HINT, NEWLINE_HINT, arrayToLines } from "@/lib/admin/format";
import type { AdminSolution } from "@/lib/admin/types";
import {
  saveSolutionAction,
  type SolutionFormValues,
  type SolutionProductValues,
} from "./actions";

function newProduct(): SolutionProductValues {
  return { key: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: "", image: "" };
}

const EMPTY: SolutionFormValues = {
  key: "",
  icon: ICON_NAMES[0],
  label: "",
  kicker: "",
  title: "",
  description: "",
  bullets: "",
  published: true,
  sortOrder: "",
  products: [],
};

function toValues(solution: AdminSolution): SolutionFormValues {
  return {
    key: solution.key,
    icon: solution.icon,
    label: solution.label,
    kicker: solution.kicker,
    title: solution.title,
    description: solution.description,
    bullets: arrayToLines(solution.bullets),
    published: solution.published,
    sortOrder: String(solution.sortOrder),
    products: (solution.products ?? []).map((item) => ({
      key: item.id,
      name: item.name,
      image: item.image,
    })),
  };
}

export function SolutionForm({ solution }: { solution?: AdminSolution }) {
  const router = useRouter();
  const [values, setValues] = useState<SolutionFormValues>(
    solution ? toValues(solution) : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Товаров-примеров несколько, поэтому id их полей уникализируем номером:
  // без id подпись <label> не связана с полем и скринридер его не назовёт.
  const uid = useId();
  const productFieldId = (index: number, name: string) => `${uid}-product-${index}-${name}`;

  function set<K extends keyof SolutionFormValues>(key: K, value: SolutionFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateProduct(index: number, patch: Partial<SolutionProductValues>) {
    set(
      "products",
      values.products.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function moveProduct(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= values.products.length) return;
    const next = [...values.products];
    [next[index], next[target]] = [next[target], next[index]];
    set("products", next);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveSolutionAction(solution?.id ?? null, values);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (solution) {
        setValues(toValues(result.data));
        setSuccess("Сохранено.");
        router.refresh();
      } else {
        router.push(`/admin/solutions/${result.data.id}`);
      }
    });
  }

  // Если в базе оказалось имя иконки вне реестра — не теряем его в списке.
  const iconOptions: string[] =
    values.icon && !(ICON_NAMES as string[]).includes(values.icon)
      ? [values.icon, ...ICON_NAMES]
      : [...ICON_NAMES];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Panel title="Направление">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field
            label="Метка вкладки"
            htmlFor="label"
            required
            hint={`Короткая подпись в переключателе на сайте. ${NEWLINE_HINT}`}
          >
            <TextArea
              id="label"
              rows={2}
              value={values.label}
              onChange={(event) => set("label", event.target.value)}
              disabled={pending}
            />
          </Field>

          <Field label="Иконка" htmlFor="icon" required>
            <SelectInput
              id="icon"
              value={values.icon}
              onChange={(event) => set("icon", event.target.value)}
              disabled={pending}
            >
              {iconOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Надзаголовок" htmlFor="kicker" required>
            <TextInput
              id="kicker"
              value={values.kicker}
              onChange={(event) => set("kicker", event.target.value)}
              disabled={pending}
            />
          </Field>

          <Field label="Ключ" htmlFor="key" hint="Часть адреса и якорь. Пусто — соберётся сам.">
            <TextInput
              id="key"
              value={values.key}
              onChange={(event) => set("key", event.target.value)}
              disabled={pending}
            />
          </Field>

          <Field
            label="Заголовок"
            htmlFor="title"
            required
            className="lg:col-span-2"
            hint={NEWLINE_HINT}
          >
            <TextArea
              id="title"
              rows={2}
              value={values.title}
              onChange={(event) => set("title", event.target.value)}
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

          <Field label="Буллиты" htmlFor="bullets" hint={LINES_HINT} className="lg:col-span-2">
            <TextArea
              id="bullets"
              rows={5}
              value={values.bullets}
              onChange={(event) => set("bullets", event.target.value)}
              disabled={pending}
            />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Товары-примеры"
        description="Имя и изображение. Имена внутри направления не должны повторяться."
      >
        <div className="flex flex-col gap-3">
          {values.products.length === 0 && (
            <p className="rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-4 py-6 text-center text-[13px] text-ink-soft">
              Пока пусто — добавьте первый пример.
            </p>
          )}

          {values.products.map((product, index) => (
            <fieldset
              key={product.key}
              className="rounded-brand-sm border border-line bg-warm-bg/40 p-3.5"
              disabled={pending}
            >
              <legend className="sr-only">Товар {index + 1}</legend>

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  Товар {index + 1}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-[12px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy disabled:opacity-40"
                    onClick={() => moveProduct(index, -1)}
                    disabled={index === 0}
                  >
                    ↑ Выше
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-[12px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy disabled:opacity-40"
                    onClick={() => moveProduct(index, 1)}
                    disabled={index === values.products.length - 1}
                  >
                    ↓ Ниже
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center rounded-full border border-burgundy/25 bg-white px-3 text-[12px] font-bold text-burgundy transition hover:bg-burgundy hover:text-white"
                    onClick={() =>
                      set(
                        "products",
                        values.products.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <Field label="Название" htmlFor={productFieldId(index, "name")} required>
                  <TextInput
                    id={productFieldId(index, "name")}
                    value={product.name}
                    onChange={(event) => updateProduct(index, { name: event.target.value })}
                  />
                </Field>
                <Field label="Изображение" htmlFor={productFieldId(index, "image")} required>
                  <ImagePicker
                    id={productFieldId(index, "image")}
                    value={product.image}
                    onChange={(value) => updateProduct(index, { image: value })}
                  />
                </Field>
              </div>
            </fieldset>
          ))}

          <div>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-full border border-burgundy/35 bg-white px-4 text-[13px] font-bold text-burgundy transition hover:bg-warm disabled:opacity-40"
              onClick={() => set("products", [...values.products, newProduct()])}
              disabled={pending}
            >
              + Добавить товар
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="Публикация">
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
              label="Опубликовано"
              checked={values.published}
              onChange={(event) => set("published", event.target.checked)}
              disabled={pending}
            />
          </div>
        </div>
      </Panel>

      <FormFooter
        pending={pending}
        error={error}
        success={success}
        cancelHref="/admin/solutions"
        submitLabel={solution ? "Сохранить" : "Создать направление"}
      />
    </form>
  );
}
