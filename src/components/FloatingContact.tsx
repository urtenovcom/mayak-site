"use client";

import { useState } from "react";
import { ContactRows } from "@/components/ContactCard";
import { Phone, Close } from "@/components/icons";
import { cn } from "@/lib/cn";

/** Плавающая панель «Получить расчёт» — доступна на всех страницах (PRD §6). */
export function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      <div
        className={cn(
          "w-[280px] origin-bottom-right rounded-3xl border border-line bg-white p-2.5 shadow-[0_30px_60px_-24px_rgba(0,12,15,0.4)] transition-all duration-300",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center justify-between px-3 pb-1 pt-2">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-burgundy/70">
            Связь с нами
          </span>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-warm-soft"
          >
            <Close className="h-4 w-4" />
          </button>
        </div>
        <ContactRows />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2.5 rounded-full bg-burgundy px-5 py-4 font-semibold text-white shadow-[0_20px_45px_-18px_rgba(66,30,42,0.85)] transition-all duration-200 hover:bg-burgundy-800"
      >
        <Phone className="h-5 w-5" />
        <span className="hidden sm:inline">Получить расчёт</span>
      </button>
    </div>
  );
}
