"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Alert } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

/**
 * Закреплённая шапка формы записи.
 *
 * Форма товара — четыре экрана, форма статьи с двумя десятками блоков — восемь.
 * Кнопка сохранения внизу такой формы означает «доскроллить до конца, чтобы
 * сохранить», поэтому управление вынесено в полосу, которая едет вместе с
 * прокруткой: слева «Назад» и название записи, справа переключатель публикации,
 * удаление и сохранение.
 *
 * Полоса живёт **рядом** с `<form>`, а не внутри неё: так она может тянуться во
 * всю ширину `<main>` и не зависеть от вёрстки формы. Кнопка сохранения связана
 * с формой атрибутом `form` — обычная отправка, никакого JS-моста.
 *
 * Отрицательные поля (`-mx-4 -mt-6 …`) гасят отступы `<main>` из
 * `(panel)/layout.tsx` — полоса обязана быть **первым** элементом страницы.
 * Место в потоке она занимает своё, поэтому содержимое не перекрывает и при
 * закреплении не «прыгает».
 */
export function FormBar({
  formId,
  backHref,
  title,
  subtitle,
  published,
  publishedLabel,
  onPublishedChange,
  submitLabel,
  pending,
  error,
  success,
  actions,
}: {
  /** id элемента `<form>`, который отправляет кнопка сохранения. */
  formId: string;
  backHref: string;
  title: string;
  subtitle?: ReactNode;
  published: boolean;
  /** «Опубликован» для товара, «Опубликована» для статьи. */
  publishedLabel: string;
  onPublishedChange: (next: boolean) => void;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  success: string | null;
  /** Кнопки записи — например удаление. Стоят перед сохранением. */
  actions?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-30 -mx-4 -mt-6 mb-4 border-b border-line bg-white sm:-mx-6 lg:-mx-8",
        "shadow-[0_1px_2px_rgba(66,30,42,0.06)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-[13px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy"
        >
          <span aria-hidden>←</span>
          Назад
        </Link>

        <div className="min-w-0 flex-1 basis-40">
          <h1 className="truncate text-[15px] font-extrabold leading-tight tracking-tight text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-[12px] leading-tight text-ink-soft">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <PublishSwitch
            label={publishedLabel}
            checked={published}
            disabled={pending}
            onChange={onPublishedChange}
          />
          {actions}
          <button
            type="submit"
            form={formId}
            disabled={pending}
            className="inline-flex h-9 items-center justify-center rounded-full border border-burgundy bg-burgundy px-4 text-[13px] font-bold text-white transition hover:bg-burgundy-800 hover:border-burgundy-800 disabled:opacity-40"
          >
            {pending ? "Сохраняем…" : submitLabel}
          </button>
        </div>
      </div>

      {/* Сводка результата остаётся в закреплённой полосе: иначе после отправки
          из шапки ошибка оказалась бы за экраном — ровно та беда, ради которой
          шапку и делали. Длинный список проблем прокручивается внутри себя. */}
      {(error || success) && (
        <div className="max-h-[38vh] overflow-y-auto border-t border-line px-4 py-2.5 sm:px-6 lg:px-8">
          {error && (
            <Alert tone="error" title="Не удалось сохранить">
              {error}
            </Alert>
          )}
          {success && <Alert tone="success">{success}</Alert>}
        </div>
      )}
    </div>
  );
}

/**
 * Переключатель публикации.
 *
 * `role="switch"` на обычной кнопке: подпись — содержимое кнопки, поэтому
 * читалка объявляет «Опубликован, переключатель, включён», а не безымянный
 * контрол. Одна остановка Tab, пробел и Enter работают сами.
 */
function PublishSwitch({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-line bg-white pl-1.5 pr-3 text-[13px] font-bold transition",
        "hover:border-burgundy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30",
        checked ? "text-ink" : "text-ink-soft",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-burgundy" : "bg-warm",
        )}
      >
        <span
          className={cn(
            "h-[15px] w-[15px] rounded-full bg-white shadow-[0_1px_2px_rgba(66,30,42,0.35)] transition-transform",
            checked ? "translate-x-[19px]" : "translate-x-[3px]",
          )}
        />
      </span>
      {label}
    </button>
  );
}
