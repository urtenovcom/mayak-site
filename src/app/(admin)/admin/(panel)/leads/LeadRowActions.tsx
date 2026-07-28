"use client";

import { useState, useTransition } from "react";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { SelectInput } from "@/components/admin/ui";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/admin/types";
import { deleteLeadAction, updateLeadStatusAction } from "./actions";

export function LeadStatusSelect({ id, status }: { id: string; status: LeadStatus }) {
  const [value, setValue] = useState<LeadStatus>(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: LeadStatus) {
    const previous = value;
    setValue(next);
    setError(null);

    startTransition(async () => {
      const result = await updateLeadStatusAction(id, next);
      if (!result.ok) {
        // Откатываем селект, чтобы он не врал о состоянии на сервере.
        setValue(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex min-w-[132px] flex-col gap-1">
      <SelectInput
        aria-label="Статус заявки"
        className="h-9 text-[13px]"
        value={value}
        disabled={pending}
        onChange={(event) => change(event.target.value as LeadStatus)}
      >
        {LEAD_STATUSES.map((item) => (
          <option key={item} value={item}>
            {LEAD_STATUS_LABELS[item]}
          </option>
        ))}
      </SelectInput>
      {pending && <span className="text-[11px] text-ink-soft">Сохраняем…</span>}
      {error && <span className="text-[11px] font-bold text-burgundy">{error}</span>}
    </div>
  );
}

export function LeadDelete({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmDelete
      title="Удалить заявку?"
      description={`Заявка «${name}» будет удалена без возможности восстановления.`}
      triggerLabel="Удалить"
      triggerClassName="h-8 px-3 text-[12px]"
      onConfirm={() => deleteLeadAction(id)}
    />
  );
}
