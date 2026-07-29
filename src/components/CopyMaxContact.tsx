"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { useContacts } from "@/components/ContactsProvider";

export function CopyMaxContact({
  children,
  className,
  label,
  tooltipText = "Скопировать номер MAX",
  showTooltip = true,
  tooltipAbove = false,
  tooltipLight = false,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  tooltipText?: string;
  showTooltip?: boolean;
  /** Показать подсказку над кнопкой (для футера — иначе уходит за край). */
  tooltipAbove?: boolean;
  /** Белая плашка подсказки (для футера — как у иконки Telegram). */
  tooltipLight?: boolean;
}) {
  // Номер берём из контекста, а не из статических данных: он редактируется
  // в админке. Значение по умолчанию для label считается здесь же — в
  // параметрах функции хук вызвать нельзя.
  const { max } = useContacts();
  const accessibleLabel = label ?? `MAX: ${max}`;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(max);
    } catch {
      const input = document.createElement("textarea");
      input.value = max;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  }

  return (
    <>
      <button
        type="button"
        onClick={copyNumber}
        aria-label={`${accessibleLabel}. Скопировать номер`}
        className={`group/max relative ${className ?? ""}`}
      >
        {children}
        {showTooltip && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-1/2 z-50 hidden w-max max-w-56 -translate-x-1/2 translate-y-1 rounded-xl px-3 py-2 text-center text-[12px] font-semibold leading-snug opacity-0 shadow-xl transition-all duration-150 before:absolute before:left-1/2 before:-translate-x-1/2 before:border-[5px] before:border-transparent sm:block group-hover/max:translate-y-0 group-hover/max:opacity-100 group-focus-visible/max:translate-y-0 group-focus-visible/max:opacity-100 ${
              tooltipLight ? "bg-white text-carbon" : "bg-carbon text-white"
            } ${
              tooltipAbove
                ? tooltipLight
                  ? "bottom-[calc(100%+10px)] before:top-full before:border-t-white"
                  : "bottom-[calc(100%+10px)] before:top-full before:border-t-carbon"
                : tooltipLight
                  ? "top-[calc(100%+10px)] before:bottom-full before:border-b-white"
                  : "top-[calc(100%+10px)] before:bottom-full before:border-b-carbon"
            }`}
          >
            {tooltipText}
          </span>
        )}
      </button>
      <span
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-carbon px-5 py-3 text-[14px] font-semibold text-white shadow-xl transition-all duration-200 ${
          copied ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        Номер скопирован
      </span>
    </>
  );
}
