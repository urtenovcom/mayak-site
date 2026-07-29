"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Alert, Field, Panel, TextArea, TextInput } from "@/components/admin/ui";
import type { AdminFaqItem } from "@/lib/admin/types";
import { deleteFaqAction, saveFaqAction, type FaqFormValues } from "./actions";

const saveButton =
  "inline-flex h-9 items-center rounded-full border border-burgundy bg-burgundy px-4 text-[13px] font-bold text-white transition hover:bg-burgundy-800 disabled:opacity-50";

function emptyValues(sortOrder: number): FaqFormValues {
  return {
    question: "",
    answer: "",
    published: true,
    showOnHome: true,
    sortOrder: String(sortOrder),
  };
}

function toValues(item: AdminFaqItem): FaqFormValues {
  return {
    question: item.question,
    answer: item.answer,
    published: item.published,
    // Поле появилось позже остальных: у записей, сохранённых до него, значения
    // может не быть. Считаем такие вопросы показываемыми на главной — иначе
    // галочка выглядела бы снятой, а вопрос на главной при этом был бы.
    showOnHome: item.showOnHome !== false,
    sortOrder: String(item.sortOrder),
  };
}

export function FaqEditor({ items }: { items: AdminFaqItem[] }) {
  return (
    <Panel
      title="Вопросы и ответы"
      description="Вопросы показываются в двух местах: блоком на главной странице (предпоследним, перед призывом к действию) и на отдельной странице /faq. «Показывать на сайте» управляет обоими сразу — снятый вопрос исчезает отовсюду, включая структурированные данные для поисковиков. «Показывать на главной» убирает вопрос только из блока на главной, на странице всех вопросов он остаётся. Порядок задаётся числом."
    >
      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-4 py-6 text-center text-[13px] text-ink-soft">
            Вопросов пока нет.
          </p>
        )}

        {items.map((item) => (
          <FaqRow key={item.id} item={item} />
        ))}

        <FaqRow sortOrder={items.length} />
      </div>
    </Panel>
  );
}

function FaqRow({ item, sortOrder = 0 }: { item?: AdminFaqItem; sortOrder?: number }) {
  const router = useRouter();
  // Строк несколько — id должны быть уникальны, иначе подпись сошлётся на
  // поле чужой строки.
  const uid = useId();
  const [values, setValues] = useState<FaqFormValues>(
    item ? toValues(item) : emptyValues(sortOrder),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof FaqFormValues>(key: K, value: FaqFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function save() {
    setError(null);

    if (!values.question.trim()) {
      setError("Не заполнен вопрос.");
      return;
    }
    if (!values.answer.trim()) {
      setError("Не заполнен ответ.");
      return;
    }

    startTransition(async () => {
      const result = await saveFaqAction(item?.id ?? null, values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!item) setValues(emptyValues(sortOrder + 1));
      router.refresh();
    });
  }

  return (
    <div className="rounded-brand-sm border border-line bg-warm-bg/40 p-3.5">
      <div className="grid gap-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_110px_170px_170px]">
          <Field label="Вопрос" htmlFor={`${uid}-question`} required>
            <TextInput
              id={`${uid}-question`}
              value={values.question}
              onChange={(event) => set("question", event.target.value)}
              disabled={pending}
              placeholder="Нужен ли фундамент под модуль?"
            />
          </Field>

          <Field label="Порядок" htmlFor={`${uid}-sortOrder`}>
            <TextInput
              id={`${uid}-sortOrder`}
              inputMode="numeric"
              value={values.sortOrder}
              onChange={(event) => set("sortOrder", event.target.value)}
              disabled={pending}
            />
          </Field>

          <Field label="Публикация" htmlFor={`${uid}-published`}>
            <label
              className="flex h-10 cursor-pointer items-center gap-2 text-[13px] text-ink-soft"
              htmlFor={`${uid}-published`}
            >
              <input
                id={`${uid}-published`}
                type="checkbox"
                className="h-4 w-4 accent-burgundy"
                checked={values.published}
                onChange={(event) => set("published", event.target.checked)}
                disabled={pending}
              />
              Показывать на сайте
            </label>
          </Field>

          <Field label="Главная" htmlFor={`${uid}-showOnHome`}>
            <label
              className={`flex h-10 items-center gap-2 text-[13px] ${
                values.published ? "cursor-pointer text-ink-soft" : "cursor-not-allowed text-ink-soft/50"
              }`}
              htmlFor={`${uid}-showOnHome`}
              title={
                values.published
                  ? undefined
                  : "Вопрос снят с сайта целиком, поэтому на главной его нет независимо от этой галочки."
              }
            >
              <input
                id={`${uid}-showOnHome`}
                type="checkbox"
                className="h-4 w-4 accent-burgundy"
                checked={values.showOnHome}
                onChange={(event) => set("showOnHome", event.target.checked)}
                disabled={pending || !values.published}
              />
              Показывать на главной
            </label>
          </Field>
        </div>

        <Field
          label="Ответ"
          htmlFor={`${uid}-answer`}
          required
          hint="Ответ должен быть самодостаточным: его читают и цитируют в отрыве от вопроса — и люди, и поисковые системы."
        >
          <TextArea
            id={`${uid}-answer`}
            rows={5}
            value={values.answer}
            onChange={(event) => set("answer", event.target.value)}
            disabled={pending}
          />
        </Field>
      </div>

      {error && (
        <Alert tone="error" className="mt-3">
          {error}
        </Alert>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={saveButton} onClick={save} disabled={pending}>
          {pending ? "Сохраняем…" : item ? "Сохранить" : "Добавить вопрос"}
        </button>
        {item && (
          <ConfirmDelete
            title="Удалить вопрос?"
            description={`«${item.question}» исчезнет с главной страницы и со страницы вопросов.`}
            onConfirm={async () => {
              const result = await deleteFaqAction(item.id);
              if (result.ok) router.refresh();
              return result;
            }}
          />
        )}
      </div>
    </div>
  );
}
