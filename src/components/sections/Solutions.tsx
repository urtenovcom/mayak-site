"use client";

import { useState } from "react";
import Image from "next/image";
import { Container, SectionLabel } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName, Check, ChevronLeft, ChevronRight } from "@/components/icons";
import type { SiteSolution } from "@/lib/content-types";
import { cn } from "@/lib/cn";
import { typo } from "@/lib/typo";

/**
 * Блок «Решения по задачам». Направления вместе с товарами-примерами приходят
 * пропом со страницы (база админки + фолбэк на статические данные).
 *
 * В `label` и `title` переносы строк значимы — вёрстка карточек держится на
 * `whitespace-pre-line`, поэтому текст выводится как есть.
 */
export function Solutions({ solutions }: { solutions: SiteSolution[] }) {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  // Список приходит извне и может стать короче (направление сняли с
  // публикации), поэтому индекс подстраховываем.
  const current = solutions[active] ?? solutions[0];
  const products = current?.products ?? [];

  const count = products.length;
  const currentProduct = count > 0 ? products[slide % count] : undefined;
  const go = (dir: number) => setSlide((s) => (count > 0 ? (s + dir + count) % count : 0));

  if (!current) return null;

  return (
    <section id="reshenia" className="scroll-mt-6 py-20 sm:py-24">
      <Container>
        <SectionLabel>Решения по задачам</SectionLabel>
        <h2 className="mt-4 text-[34px] font-extrabold tracking-[-0.02em] text-ink sm:text-[42px]">
          Подберите направление
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-[17px] text-ink-soft">
          {typo("Выберите свою задачу — покажем подходящие решения.")}
        </p>

        {/* табы-направления */}
        <div className="sticky top-[72px] z-30 -mx-5 mt-6 flex gap-2 overflow-x-auto border-y border-line bg-background/95 px-5 py-3 backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:static sm:mx-0 sm:mt-9 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none lg:grid-cols-7">
          {solutions.map((s, i) => {
            const isActive = i === active;
            return (
              <button
                key={s.id}
                onClick={(event) => {
                  setActive(i);
                  setSlide(0);
                  event.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                  });
                }}
                className={cn(
                  "group flex min-h-14 min-w-[168px] shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition-all duration-200 sm:min-h-0 sm:min-w-0 sm:flex-col sm:gap-3 sm:rounded-[20px] sm:px-3 sm:py-5 sm:text-center",
                  isActive
                    ? "border-burgundy/40 bg-white shadow-[0_18px_40px_-22px_rgba(66,30,42,0.4)]"
                    : "border-line bg-warm-soft/60 hover:bg-white hover:shadow-[0_14px_30px_-20px_rgba(66,30,42,0.3)]",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-12 sm:w-12 sm:rounded-2xl",
                    isActive
                      ? "bg-burgundy text-white"
                      : "bg-white text-burgundy",
                  )}
                >
                  <Icon name={s.icon as IconName} className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span className="text-[12px] font-semibold leading-tight text-ink/80 sm:whitespace-pre-line sm:text-[13px]">
                  {typo(s.label)}
                </span>
              </button>
            );
          })}
        </div>

        {/* контент активного направления */}
        <div className="mt-6 overflow-hidden rounded-[28px] border border-line bg-warm-soft/50">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionLabel>{typo(current.kicker)}</SectionLabel>
              <h3 className="mt-4 whitespace-pre-line text-[28px] font-extrabold leading-tight tracking-[-0.01em] text-ink sm:text-[34px]">
                {typo(current.title)}
              </h3>
              <p className="mt-4 max-w-md text-pretty text-[16px] leading-relaxed text-ink-soft">
                {typo(current.description)}
              </p>
              <ul className="mt-7 flex flex-col gap-3.5">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                      <Check className="h-[14px] w-[14px]" />
                    </span>
                    <span className="text-[15px] font-medium text-ink/85">{typo(b)}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/catalog" className="mt-9" withArrow>
                Посмотреть решения
              </ButtonLink>
            </div>

            {/*
              Товаров-примеров может не быть вовсе: в админке направление
              сохраняется и с пустым списком. Тогда вместо пустой белой
              карточки 4:3 с пустой подписью и нерабочими стрелками показываем
              осмысленную заглушку.
            */}
            {currentProduct ? (
              <div>
                {/* большое фото текущего примера */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-line bg-white">
                  <Image
                    key={currentProduct.image}
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="animate-rise object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10">
                    <span className="text-[16px] font-semibold text-white">
                      {currentProduct.name}
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
                  {/* Перелистывать нечего, пока пример один — стрелок нет. */}
                  {count > 1 && (
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
                  )}
                </div>
              </div>
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-line bg-white/60 px-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-burgundy/8 text-burgundy">
                  <Icon name={current.icon as IconName} className="h-6 w-6" />
                </span>
                <p className="text-[16px] font-semibold text-ink">
                  {typo("Примеры для этого направления пока не добавлены")}
                </p>
                <p className="max-w-xs text-pretty text-[14px] leading-relaxed text-ink-soft">
                  {typo(
                    "Опишите задачу — подберём конструкцию и покажем подходящие варианты из каталога.",
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
