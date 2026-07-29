"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Alert, Field, Panel, SelectInput, TextArea, TextInput } from "@/components/admin/ui";
import { ICON_NAMES } from "@/components/icons";
import { NEWLINE_HINT } from "@/lib/admin/format";
import type { AdminStat } from "@/lib/admin/types";
import {
  deleteStatAction,
  saveStatAction,
  type StatFormValues,
} from "./actions";

const saveButton =
  "inline-flex h-9 items-center rounded-full border border-burgundy bg-burgundy px-4 text-[13px] font-bold text-white transition hover:bg-burgundy-800 disabled:opacity-50";

function emptyValues(sortOrder: number): StatFormValues {
  return { value: "", label: "", icon: ICON_NAMES[0], sortOrder: String(sortOrder) };
}

function toValues(stat: AdminStat): StatFormValues {
  return {
    value: stat.value,
    label: stat.label,
    icon: stat.icon,
    sortOrder: String(stat.sortOrder),
  };
}

export function StatsEditor({ stats }: { stats: AdminStat[] }) {
  return (
    <Panel
      title="Цифры доверия"
      description="Блок с показателями на главной. Порядок задаётся числом."
    >
      <div className="flex flex-col gap-3">
        {stats.length === 0 && (
          <p className="rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-4 py-6 text-center text-[13px] text-ink-soft">
            Показателей пока нет.
          </p>
        )}

        {stats.map((stat) => (
          <StatRow key={stat.id} stat={stat} />
        ))}

        <StatRow sortOrder={stats.length} />
      </div>
    </Panel>
  );
}

function StatRow({ stat, sortOrder = 0 }: { stat?: AdminStat; sortOrder?: number }) {
  const router = useRouter();
  // Строк на странице несколько — id полей должны быть уникальны, иначе
  // подпись <label for> указала бы на поле чужой строки.
  const uid = useId();
  const [values, setValues] = useState<StatFormValues>(
    stat ? toValues(stat) : emptyValues(sortOrder),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof StatFormValues>(key: K, value: StatFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveStatAction(stat?.id ?? null, values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!stat) setValues(emptyValues(sortOrder + 1));
      router.refresh();
    });
  }

  const iconOptions: string[] = (ICON_NAMES as string[]).includes(values.icon)
    ? [...ICON_NAMES]
    : [values.icon, ...ICON_NAMES];

  return (
    <div className="rounded-brand-sm border border-line bg-warm-bg/40 p-3.5">
      <div className="grid gap-3 lg:grid-cols-[160px_1fr_170px_100px]">
        <Field label="Значение" htmlFor={`${uid}-value`} required>
          <TextInput
            id={`${uid}-value`}
            value={values.value}
            onChange={(event) => set("value", event.target.value)}
            disabled={pending}
            placeholder="500+"
          />
        </Field>

        <Field label="Подпись" htmlFor={`${uid}-label`} required hint={NEWLINE_HINT}>
          <TextArea
            id={`${uid}-label`}
            rows={2}
            value={values.label}
            onChange={(event) => set("label", event.target.value)}
            disabled={pending}
          />
        </Field>

        <Field label="Иконка" htmlFor={`${uid}-icon`} required>
          <SelectInput
            id={`${uid}-icon`}
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
          {pending ? "Сохраняем…" : stat ? "Сохранить" : "Добавить показатель"}
        </button>
        {stat && (
          <ConfirmDelete
            title="Удалить показатель?"
            description={`«${stat.value}» будет удалён с главной страницы.`}
            onConfirm={async () => {
              const result = await deleteStatAction(stat.id);
              if (result.ok) router.refresh();
              return result;
            }}
          />
        )}
      </div>
    </div>
  );
}
