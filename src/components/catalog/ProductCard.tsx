"use client";

import { useState, type ComponentType } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ProductModal } from "@/components/catalog/ProductModal";
import {
  Sun,
  Snowflake,
  Calendar,
  Crane,
  Home,
  Briefcase,
  Tree,
  Warehouse,
  Wc,
  Box,
  User,
  Sparkle,
} from "@/components/icons";
import type { Product } from "@/lib/catalog";
import { typo } from "@/lib/typo";

type Ico = ComponentType<{ className?: string }>;

const SEASON_ICON: Record<string, Ico> = {
  Летняя: Sun,
  Зимняя: Snowflake,
  Круглогодичная: Calendar,
};

const TAG_ICON: Record<string, Ico> = {
  Стройплощадка: Crane,
  Проживание: Home,
  Офис: Briefcase,
  "Дача и участок": Tree,
  Склад: Warehouse,
  Санитария: Wc,
  Производство: Box,
  Вахта: User,
};

function InfoIcon({ label, Icon }: { label: string; Icon: Ico }) {
  return (
    <span className="group/tip relative">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-warm-soft text-burgundy">
        <Icon className="h-[17px] w-[17px]" />
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100">
        {label}
      </span>
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const Season = SEASON_ICON[product.exploitation] ?? Calendar;

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_18px_50px_-30px_rgba(26,18,22,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/30 hover:shadow-[0_28px_60px_-28px_rgba(26,18,22,0.5)] sm:flex-row">
        {/* Визуал */}
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden border-b border-line bg-warm-soft sm:aspect-auto sm:w-[42%] sm:border-b-0 sm:border-r">
          <Image
            src={product.image}
            alt={`3D-рендер: ${product.name}`}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {product.individual && (
            <span className="absolute left-3 top-3 rounded-full bg-burgundy px-3 py-1 text-[11px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(66,30,42,0.8)]">
              Индивидуально
            </span>
          )}
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink backdrop-blur-sm">
            {product.size}
          </span>
        </div>

        {/* Контент */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <span className="w-fit rounded-full bg-warm-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-burgundy/80">
            {product.type}
          </span>

          <h3 className="text-balance text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
            {typo(product.name)}
          </h3>
          <p className="text-pretty text-[14px] leading-snug text-ink-soft">{typo(product.purpose)}</p>

          {/* Сезонность + сценарии — иконками с подсказкой */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <InfoIcon label={`Параметры: ${product.exploitation}`} Icon={Season} />
            <span className="mx-0.5 h-5 w-px bg-line" />
            {product.tags.map((tag) => (
              <InfoIcon key={tag} label={tag} Icon={TAG_ICON[tag] ?? Sparkle} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-auto pt-4">
            <Button
              type="button"
              variant="primary"
              size="md"
              withArrow
              className="w-full sm:w-auto"
              onClick={() => setOpen(true)}
            >
              Подробнее
            </Button>
          </div>
        </div>
      </article>

      <ProductModal product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}
