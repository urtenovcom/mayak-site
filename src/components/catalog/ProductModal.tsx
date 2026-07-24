"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { LeadForm } from "@/components/forms/LeadForm";
import { Check, Close } from "@/components/icons";
import type { Product } from "@/lib/catalog";
import { typo } from "@/lib/typo";

function Param({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-line bg-warm-soft/50 px-4 py-3">
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-soft/80">
        {label}
      </span>
      <span className="text-[15px] font-semibold text-ink">{value}</span>
    </div>
  );
}

export function ProductModal({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[min(960px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[24px] border border-line bg-warm-bg shadow-[0_40px_120px_-30px_rgba(26,18,22,0.5)] focus:outline-none sm:rounded-[28px]"
        >
          {/* Шапка */}
          <div className="flex items-start justify-between gap-4 border-b border-line bg-white/70 px-5 py-4 sm:px-8 sm:py-5">
            <div>
              <Dialog.Title className="text-balance text-[20px] font-extrabold tracking-[-0.02em] text-ink sm:text-[24px]">
                {typo(product.name)}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-pretty text-[14px] text-ink-soft">
                {typo(product.purpose)}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Закрыть"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:bg-warm hover:text-ink"
            >
              <Close className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Прокручиваемое тело */}
          <div className="grid flex-1 gap-8 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="flex flex-col gap-7">
              {/* Визуал */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-line bg-warm-soft">
                <Image
                  src={product.image}
                  alt={`3D-рендер: ${product.name}`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 520px"
                  className="object-cover"
                />
              </div>

              {/* Бейджи */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-warm px-3 py-1 text-[12px] font-semibold text-ink">
                  {product.type}
                </span>
                {product.individual && (
                  <span className="rounded-full bg-burgundy/10 px-3 py-1 text-[12px] font-semibold text-burgundy">
                    Индивидуальное изготовление
                  </span>
                )}
              </div>

              {/* Описание */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-burgundy/70">
                  Описание
                </h3>
                <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink-soft">
                  {typo(product.description)}
                </p>
              </div>

              {/* Параметры */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-burgundy/70">
                  Параметры
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <Param label="Габариты" value={product.size} />
                  <Param label="Параметры" value={product.exploitation} />
                  <Param label="Тип" value={product.type} />
                  <Param
                    label="Назначение"
                    value={product.tags.join(", ")}
                  />
                </div>
              </div>

              {/* Опции */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-burgundy/70">
                  Опции
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.options.map((opt) => (
                    <span
                      key={opt}
                      className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Комплектация */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-burgundy/70">
                  Комплектация
                </h3>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {product.complectation.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[15px] leading-snug text-ink-soft"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {typo(item)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Сайдбар: заявка + конструктор */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-0 lg:self-start">
              <div>
                <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">
                  Оставьте заявку
                </h3>
                <p className="mt-1 text-pretty text-[14px] text-ink-soft">
                  {typo(
                    `Рассчитаем стоимость «${product.name}» под вашу комплектацию.`,
                  )}
                </p>
              </div>
              <LeadForm source={`Заявка из каталога: ${product.name}`} compact />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
