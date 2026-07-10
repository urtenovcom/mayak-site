"use client";

/* ============================================================
   Визуальный шаг конструктора: превью здания подменяется
   на готовый рендер при выборе обшивки и цвета (без перекраски).
   Демонстрация на бытовке.
   ============================================================ */

import { useState } from "react";
import Image from "next/image";
import {
  CLADDINGS,
  COLORS,
  bytovkaRender,
  type CladdingId,
  type ColorId,
} from "@/lib/configurator-assets";
import { cn } from "@/lib/cn";
import { Check } from "@/components/icons";

export function VisualPreview() {
  const [cladding, setCladding] = useState<CladdingId>("proflist");
  const [color, setColor] = useState<ColorId>("white");

  const active = COLORS.find((c) => c.id === color)!;
  const activeCladding = CLADDINGS.find((c) => c.id === cladding)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      {/* Превью */}
      <div className="overflow-hidden rounded-[28px] border border-line bg-warm-soft/40">
        <div className="relative aspect-[4/3] w-full">
          {/* Все рендеры смонтированы, показывается активный — мгновенная подмена без мигания */}
          {CLADDINGS.map((cl) =>
            COLORS.map((co) => {
              const isActive = cl.id === cladding && co.id === color;
              return (
                <Image
                  key={`${cl.id}-${co.id}`}
                  src={bytovkaRender(cl.id, co.id)}
                  alt={`Бытовка, ${cl.label.toLowerCase()}, ${co.label.toLowerCase()}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  loading="eager"
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
              );
            }),
          )}
        </div>
        <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
          <span className="text-[14px] font-semibold text-ink">
            Бытовка · {activeCladding.label}
          </span>
          <span className="text-[13px] text-ink-soft">
            {active.label} · {active.ral}
          </span>
        </div>
      </div>

      {/* Управление */}
      <div className="rounded-[28px] border border-line bg-white p-5 sm:p-6">
        {/* Обшивка */}
        <div>
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-burgundy/70">
            Обшивка
          </span>
          <div className="mt-3 grid gap-2.5">
            {CLADDINGS.map((cl) => (
              <button
                key={cl.id}
                type="button"
                onClick={() => setCladding(cl.id)}
                aria-pressed={cladding === cl.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                  cladding === cl.id
                    ? "border-burgundy/40 bg-warm-soft/50"
                    : "border-line hover:border-burgundy/25 hover:bg-warm-soft/40",
                )}
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line">
                  <Image
                    src={bytovkaRender(cl.id, color)}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <span className="block font-semibold tracking-tight text-ink">
                    {cl.label}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-soft">
                    {cl.hint}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                    cladding === cl.id
                      ? "border-burgundy bg-burgundy text-white"
                      : "border-line bg-white text-transparent",
                  )}
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Цвет */}
        <div className="mt-6 border-t border-line pt-5">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-burgundy/70">
            Цвет стен
          </span>
          <div className="mt-3 grid grid-cols-4 gap-2.5">
            {COLORS.map((co) => (
              <button
                key={co.id}
                type="button"
                onClick={() => setColor(co.id)}
                aria-pressed={color === co.id}
                title={`${co.label} · ${co.ral}`}
                aria-label={`${co.label} ${co.ral}`}
                className={cn(
                  "relative aspect-square rounded-full border transition-transform",
                  color === co.id
                    ? "scale-110 border-burgundy ring-2 ring-burgundy/25"
                    : "border-line hover:scale-105",
                )}
                style={{ background: co.swatch }}
              >
                {color === co.id && (
                  <Check
                    className={cn(
                      "absolute inset-0 m-auto h-4 w-4",
                      co.id === "white" ? "text-ink" : "text-white",
                    )}
                    strokeWidth={2.5}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 text-[14px]">
            <span className="font-semibold text-ink">{active.label}</span>
            <span className="text-ink-soft"> · {active.ral}</span>
          </div>
        </div>

        <p className="mt-6 rounded-2xl border border-line bg-warm-soft/50 px-4 py-3 text-[12.5px] leading-snug text-ink-soft">
          Так конструктор будет показывать выбор наглядно. Стоимость
          рассчитывается индивидуально после уточнения параметров.
        </p>
      </div>
    </div>
  );
}
