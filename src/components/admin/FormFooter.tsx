"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Alert } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";

/**
 * Низ любой формы админки: ошибка API (дословно), сообщение об успехе,
 * кнопки «Сохранить» и «Отмена».
 */
export function FormFooter({
  pending,
  error,
  success,
  submitLabel = "Сохранить",
  cancelHref,
  extra,
}: {
  pending: boolean;
  error: string | null;
  success: string | null;
  submitLabel?: string;
  cancelHref: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert tone="error" title="Не удалось сохранить">
          {error}
        </Alert>
      )}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={pending} className="h-10 px-5 text-[14px]">
          {pending ? "Сохраняем…" : submitLabel}
        </Button>
        <Link
          href={cancelHref}
          className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-[13px] font-bold text-ink transition hover:bg-warm-soft"
        >
          Отмена
        </Link>
        {extra}
      </div>
    </div>
  );
}
