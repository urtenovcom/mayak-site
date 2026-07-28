"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useTransition } from "react";
import { Alert } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

/**
 * Удаление только после подтверждения. Ошибку API показываем прямо в диалоге,
 * дословно — там же, где пользователь нажал кнопку.
 */
export function ConfirmDelete({
  title,
  description,
  confirmLabel = "Удалить",
  triggerLabel = "Удалить",
  triggerClassName,
  onConfirm,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  onConfirm: () => Promise<ActionResult<unknown>>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) {
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <Dialog.Trigger
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-full border border-burgundy/25 bg-white px-3.5 text-[13px] font-bold text-burgundy transition hover:bg-burgundy hover:text-white",
          triggerClassName,
        )}
      >
        {triggerLabel}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-carbon/40 backdrop-blur-[2px]" />
        <Dialog.Content className="anim-modal fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-brand-sm border border-line bg-white p-5 shadow-float">
          <Dialog.Title className="text-[17px] font-extrabold tracking-tight text-ink">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            {description ?? "Действие необратимо."}
          </Dialog.Description>

          {error && (
            <Alert tone="error" className="mt-3">
              {error}
            </Alert>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close
              disabled={pending}
              className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-[13px] font-bold text-ink transition hover:bg-warm-soft disabled:opacity-50"
            >
              Отмена
            </Dialog.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className="inline-flex h-10 items-center rounded-full border border-burgundy bg-burgundy px-4 text-[13px] font-bold text-white transition hover:bg-burgundy-800 disabled:opacity-50"
            >
              {pending ? "Удаляем…" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
