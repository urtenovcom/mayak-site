"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { coverAlt } from "@/lib/media";
import {
  ArrowRight,
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
import { productPath, type Product } from "@/lib/catalog";
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

/**
 * Карточка каталога. Название — ссылка на страницу товара, её растянутый
 * псевдоэлемент делает кликабельной всю карточку: ссылка на карточке ровно
 * одна, и ведёт она на адрес, который можно скопировать и отправить.
 */
export function ProductCard({ product }: { product: Product }) {
  const Season = SEASON_ICON[product.exploitation] ?? Calendar;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_18px_50px_-30px_rgba(26,18,22,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/30 hover:shadow-[0_28px_60px_-28px_rgba(26,18,22,0.5)] sm:flex-row">
      {/* Визуал */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden border-b border-line bg-warm-soft sm:aspect-auto sm:w-[42%] sm:border-b-0 sm:border-r">
        <Image
          src={product.image}
          // Описание обложки лежит у её же записи в галерее; название
          // товара — запасной вариант для старых данных без описаний.
          alt={coverAlt(product.images ?? [], product.image, product.name)}
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
          <Link
            href={productPath(product.id)}
            className="before:absolute before:inset-0 before:content-[''] hover:text-burgundy"
          >
            {typo(product.name)}
          </Link>
        </h3>
        <p className="text-pretty text-[14px] leading-snug text-ink-soft">{typo(product.purpose)}</p>

        {/* Сезонность + сценарии — иконками с подсказкой. Слой выше
            растянутой ссылки, иначе подсказки не поймают наведение. */}
        <div className="relative z-10 mt-1 flex w-fit flex-wrap items-center gap-1.5">
          <InfoIcon label={`Параметры: ${product.exploitation}`} Icon={Season} />
          <span className="mx-0.5 h-5 w-px bg-line" />
          {product.tags.map((tag) => (
            <InfoIcon key={tag} label={tag} Icon={TAG_ICON[tag] ?? Sparkle} />
          ))}
        </div>

        {/* CTA. Не кнопка и не вторая ссылка: клик уже ловит растянутый
            псевдоэлемент ссылки на названии, а <a> внутри <a> недопустим. */}
        <div className="mt-auto pt-4">
          <span className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-burgundy bg-burgundy px-5 text-[15px] font-semibold tracking-tight text-white shadow-[0_10px_28px_-14px_rgba(66,30,42,0.7)] transition-colors duration-200 group-hover:bg-burgundy-800 sm:w-auto">
            Подробнее
            <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
