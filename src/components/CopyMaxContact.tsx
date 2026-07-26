"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { CONTACTS } from "@/lib/site";

export function CopyMaxContact({
  children,
  className,
  label = `MAX: ${CONTACTS.max}`,
  tooltipText = "Скопировать номер MAX",
  showTooltip = true,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  tooltipText?: string;
  showTooltip?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(CONTACTS.max);
    } catch {
      const input = document.createElement("textarea");
      input.value = CONTACTS.max;
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
        aria-label={`${label}. Скопировать номер`}
        className={`group/max relative ${className ?? ""}`}
      >
        {children}
        {showTooltip && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-50 hidden w-max max-w-56 -translate-x-1/2 translate-y-1 rounded-xl bg-carbon px-3 py-2 text-center text-[12px] font-semibold leading-snug text-white opacity-0 shadow-xl transition-all duration-150 before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[5px] before:border-transparent before:border-b-carbon sm:block group-hover/max:translate-y-0 group-hover/max:opacity-100 group-focus-visible/max:translate-y-0 group-focus-visible/max:opacity-100"
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
