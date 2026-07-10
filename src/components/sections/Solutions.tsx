"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Container, SectionLabel } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, Check, ChevronLeft, ChevronRight } from "@/components/icons";
import { SOLUTIONS, SOLUTION_PRODUCTS } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Solutions() {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const current = SOLUTIONS[active];
  const products = SOLUTION_PRODUCTS[current.id] ?? [];

  // при смене направления — на первый пример
  useEffect(() => setSlide(0), [active]);

  const count = products.length;
  const currentProduct = products[slide];
  const go = (dir: number) => setSlide((s) => (s + dir + count) % count);

  return (
    <section id="reshenia" className="scroll-mt-6 py-20 sm:py-24">
      <Container>
        <SectionLabel>Решения по задачам</SectionLabel>
        <h2 className="mt-4 text-[34px] font-extrabold tracking-[-0.02em] text-ink sm:text-[42px]">
          Подберите направление
        </h2>
        <p className="mt-3 max-w-xl text-[17px] text-ink-soft">
          Выберите свою задачу — покажем подходящие решения.
        </p>

        {/* табы-направления */}
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {SOLUTIONS.map((s, i) => {
            const isActive = i === active;
            return (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={cn(
                  "group flex flex-col items-center gap-3 rounded-[20px] border px-3 py-5 text-center transition-all duration-200",
                  isActive
                    ? "border-burgundy/40 bg-white shadow-[0_18px_40px_-22px_rgba(66,30,42,0.4)]"
                    : "border-line bg-warm-soft/60 hover:bg-white hover:shadow-[0_14px_30px_-20px_rgba(66,30,42,0.3)]",
                )}
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                    isActive
                      ? "bg-burgundy text-white"
                      : "bg-white text-burgundy",
                  )}
                >
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <span className="whitespace-pre-line text-[13px] font-semibold leading-tight text-ink/80">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* контент активного направления */}
        <div className="mt-6 overflow-hidden rounded-[28px] border border-line bg-warm-soft/50">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionLabel>{current.kicker}</SectionLabel>
              <h3 className="mt-4 whitespace-pre-line text-[28px] font-extrabold leading-tight tracking-[-0.01em] text-ink sm:text-[34px]">
                {current.title}
              </h3>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-soft">
                {current.description}
              </p>
              <ul className="mt-7 flex flex-col gap-3.5">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                      <Check className="h-[14px] w-[14px]" />
                    </span>
                    <span className="text-[15px] font-medium text-ink/85">{b}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/catalog" className="mt-9" withArrow>
                Посмотреть решения
              </ButtonLink>
            </div>

            <div>
              {/* большое фото текущего примера */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-line bg-white">
                {currentProduct && (
                  <Image
                    key={currentProduct.image}
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="animate-rise object-cover"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10">
                  <span className="text-[16px] font-semibold text-white">
                    {currentProduct?.name}
                  </span>
                </div>
              </div>

              {/* миниатюры + стрелки */}
              <div className="mt-5 flex items-center gap-3">
                <span className="hidden text-[13px] font-semibold text-ink-soft sm:inline">
                  Примеры решений
                </span>
                <div className="flex items-center gap-2">
                  {products.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => setSlide(i)}
                      aria-label={p.name}
                      className={cn(
                        "relative h-12 w-12 overflow-hidden rounded-full border transition-all",
                        i === slide
                          ? "border-burgundy ring-2 ring-burgundy/25"
                          : "border-line opacity-70 hover:opacity-100",
                      )}
                    >
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => go(-1)}
                    aria-label="Назад"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:bg-white hover:text-ink"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => go(1)}
                    aria-label="Вперёд"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:bg-white hover:text-ink"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
