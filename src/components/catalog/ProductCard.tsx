"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProductModal } from "@/components/catalog/ProductModal";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_18px_50px_-30px_rgba(26,18,22,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/30 hover:shadow-[0_28px_60px_-28px_rgba(26,18,22,0.5)]">
        {/* Визуал */}
        <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-warm-soft">
          <Image
            src={product.image}
            alt={`3D-рендер: ${product.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {product.individual && (
            <span className="absolute left-3 top-3 rounded-full bg-burgundy px-3 py-1 text-[11px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(66,30,42,0.8)]">
              Индивидуальное изготовление
            </span>
          )}
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink backdrop-blur-sm">
            {product.size}
          </span>
        </div>

        {/* Контент */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-warm-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-burgundy/80">
              {product.type}
            </span>
            <span className="text-[12px] text-ink-soft">{product.exploitation}</span>
          </div>

          <h3 className="text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
            {product.name}
          </h3>
          <p className="text-[14px] leading-snug text-ink-soft">{product.purpose}</p>

          {/* Теги-сценарии */}
          <div className="mt-1 flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-warm px-2.5 py-1 text-[11px] font-medium text-ink"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-auto flex flex-col gap-2 pt-4">
            <Button
              type="button"
              variant="primary"
              size="md"
              withArrow
              className="w-full"
              onClick={() => setOpen(true)}
            >
              Подробнее
            </Button>
            <ButtonLink
              href="/constructor"
              variant="secondary"
              size="md"
              className="w-full"
            >
              В конструктор
            </ButtonLink>
          </div>
        </div>
      </article>

      <ProductModal product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}
