"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Alert, Field, Panel, TextArea, TextInput } from "@/components/admin/ui";
import { NEWLINE_HINT } from "@/lib/admin/format";
import type { AdminProcessStep } from "@/lib/admin/types";
import {
  deleteProcessAction,
  saveProcessAction,
  type ProcessFormValues,
} from "./actions";

const saveButton =
  "inline-flex h-9 items-center rounded-full border border-burgundy bg-burgundy px-4 text-[13px] font-bold text-white transition hover:bg-burgundy-800 disabled:opacity-50";

function emptyValues(sortOrder: number): ProcessFormValues {
  return { n: "", title: "", sortOrder: String(sortOrder) };
}

export function ProcessEditor({ steps }: { steps: AdminProcessStep[] }) {
  return (
    <Panel
      title="Этапы работы"
      description="Блок «От задачи — до результата». Номер этапа и его название."
    >
      <div className="flex flex-col gap-3">
        {steps.length === 0 && (
          <p className="rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-4 py-6 text-center text-[13px] text-ink-soft">
            Этапов пока нет.
          </p>
        )}

        {steps.map((step) => (
          <ProcessRow key={step.id} step={step} />
        ))}

        <ProcessRow sortOrder={steps.length} />
      </div>
    </Panel>
  );
}

function ProcessRow({ step, sortOrder = 0 }: { step?: AdminProcessStep; sortOrder?: number }) {
  const router = useRouter();
  // Строк на странице несколько — id полей должны быть уникальны, иначе
  // подпись <label for> указала бы на поле чужой строки.
  const uid = useId();
  const [values, setValues] = useState<ProcessFormValues>(
    step
      ? { n: step.n, title: step.title, sortOrder: String(step.sortOrder) }
      : emptyValues(sortOrder),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ProcessFormValues>(key: K, value: ProcessFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveProcessAction(step?.id ?? null, values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!step) setValues(emptyValues(sortOrder + 1));
      router.refresh();
    });
  }

  return (
    <div className="rounded-brand-sm border border-line bg-warm-bg/40 p-3.5">
      <div className="grid gap-3 lg:grid-cols-[100px_1fr_100px]">
        <Field label="Номер" htmlFor={`${uid}-n`} required>
          <TextInput
            id={`${uid}-n`}
            value={values.n}
            onChange={(event) => set("n", event.target.value)}
            disabled={pending}
            placeholder="01"
          />
        </Field>

        <Field label="Название этапа" htmlFor={`${uid}-title`} required hint={NEWLINE_HINT}>
          <TextArea
            id={`${uid}-title`}
            rows={2}
            value={values.title}
            onChange={(event) => set("title", event.target.value)}
            disabled={pending}
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
      </div>

      {error && (
        <Alert tone="error" className="mt-3">
          {error}
        </Alert>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={saveButton} onClick={save} disabled={pending}>
          {pending ? "Сохраняем…" : step ? "Сохранить" : "Добавить этап"}
        </button>
        {step && (
          <ConfirmDelete
            title="Удалить этап?"
            description={`«${step.title}» исчезнет из блока этапов.`}
            onConfirm={async () => {
              const result = await deleteProcessAction(step.id);
              if (result.ok) router.refresh();
              return result;
            }}
          />
        )}
      </div>
    </div>
  );
}
