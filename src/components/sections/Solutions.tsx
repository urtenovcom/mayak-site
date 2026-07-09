"use client";

import { useState } from "react";
import Image from "next/image";
import { Container, SectionLabel } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, Check, ChevronLeft, ChevronRight } from "@/components/icons";
import { SOLUTIONS } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Solutions() {
  const [active, setActive] = useState(0);
  const current = SOLUTIONS[active];

  return (
    <section className="py-20 sm:py-24">
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
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-line bg-white">
                <Image
                  src="/renders/module-white-container.webp"
                  alt="3D-рендер белого модульного блок-контейнера"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              {/* мини-галерея примеров */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-[13px] font-semibold text-ink-soft">
                  Примеры решений
                </span>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="h-10 w-12 rounded-lg border border-line bg-warm"
                    />
                  ))}
                  <span className="flex h-10 items-center rounded-lg border border-line bg-white px-3 text-[13px] font-semibold text-burgundy">
                    +8
                  </span>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    aria-label="Назад"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Вперёд"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-white"
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
