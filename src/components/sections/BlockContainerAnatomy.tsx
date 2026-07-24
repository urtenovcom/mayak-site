"use client";

/* ============================================================
   Full-bleed кинематографичная «анатомия» блок-контейнера.
   Тёмный фон, контейнер-вырез по центру, тумблер Снаружи/Внутри
   (в стиле reposit), плавный переход (кроссфейд + блюр + зум)
   на framer-motion, хотспоты с плавным появлением.
   Рендеры выровнены (общий силуэт) → переход = «стена тает».
   ============================================================ */

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { typo } from "@/lib/typo";

type Hotspot = { x: number; y: number; title: string; desc: string };

const OUTSIDE: Hotspot[] = [
  { x: 0.5, y: 0.25, title: "Оцинкованная кровля", desc: "Односкатная кровля с уклоном и герметичными стыками — вода уходит, протечек нет даже в снегопад." },
  { x: 0.85, y: 0.42, title: "Окна под комплектацию", desc: "Энергосберегающие окна ПВХ со стеклопакетом — сохраняют тепло и снижают затраты на обогрев." },
  { x: 0.6, y: 0.55, title: "Защита обшивки", desc: "Наружная обшивка профлистом по ГОСТ с полимерным покрытием — не ржавеет годами." },
  { x: 0.34, y: 0.52, title: "Износостойкие двери", desc: "Утеплённые металлические двери с надёжным замком, при необходимости — противопожарные." },
  { x: 0.3, y: 0.74, title: "Прочный каркас", desc: "Цельносварной каркас из гнутого профиля — выдерживает перевозку, штабелирование и установку в два этажа." },
];

const INSIDE: Hotspot[] = [
  { x: 0.7, y: 0.42, title: "Профессиональный утеплитель", desc: "Негорючая минеральная вата 100 мм с пароизоляцией — тепло зимой, прохлада летом." },
  { x: 0.45, y: 0.35, title: "Безопасная электропроводка", desc: "Кабель по ГОСТ в гофре, автоматы и УЗО — электрика смонтирована по нормам." },
  { x: 0.48, y: 0.52, title: "Любая отделка", desc: "Стены и потолок на выбор: ПВХ-панели, МДФ или вагонка." },
  { x: 0.45, y: 0.72, title: "Износостойкий линолеум", desc: "Коммерческий линолеум высокого класса износостойкости — не боится нагрузки и влаги." },
  { x: 0.3, y: 0.75, title: "Пол выдерживает 400 кг/м²", desc: "Многослойный пол: усиленные лаги и влагостойкая фанера под покрытием — под тяжёлую технику." },
];

const TABS = [
  { key: "out", label: "Снаружи", sub: "Защита и каркас" },
  { key: "in", label: "Внутри", sub: "Начинка и отделка" },
] as const;

function Pin({
  spot,
  active,
  onActivate,
  onDeactivate,
}: {
  spot: Hotspot;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const below = spot.y < 0.4;
  const align =
    spot.x < 0.33 ? "left-0" : spot.x > 0.66 ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <div
      className="relative -translate-x-1/2 -translate-y-1/2"
      onPointerEnter={onActivate}
      onPointerLeave={onDeactivate}
    >
        <button
          type="button"
          onFocus={onActivate}
          onBlur={onDeactivate}
          onClick={onActivate}
          aria-expanded={active}
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors duration-200",
            active
              ? "bg-burgundy text-white ring-2 ring-burgundy/40"
              : "border border-burgundy/20 bg-white/90 text-burgundy hover:bg-white",
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[15px] leading-none transition-transform duration-200",
              active ? "rotate-45 bg-white/25 text-white" : "bg-white text-burgundy",
            )}
          >
            +
          </span>
          {typo(spot.title)}
        </button>

        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: below ? -8 : 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: below ? -8 : 8, scale: 0.96 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-none absolute z-50 w-64 rounded-2xl bg-[#241a1e]/95 p-3.5 text-left shadow-[0_24px_60px_-18px_rgba(0,0,0,0.85)] backdrop-blur-md",
                align,
                below ? "top-full mt-2.5" : "bottom-full mb-2.5",
              )}
            >
              <p className="text-[14px] font-bold text-white">{typo(spot.title)}</p>
              <p className="mt-1 text-pretty text-[13px] leading-snug text-white/70">{typo(spot.desc)}</p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

export function BlockContainerAnatomy() {
  const [side, setSide] = useState<"out" | "in">("out");
  const [active, setActive] = useState<number | null>(null);

  const spots = side === "out" ? OUTSIDE : INSIDE;

  const switchSide = (s: "out" | "in") => {
    if (s === side) return;
    setSide(s);
    setActive(null);
  };

  return (
    <section className="relative overflow-hidden bg-[#1a1013] py-20 sm:py-28">
      {/* Фон: реальная территория + градиент/свечения */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/renders/anatomy/bg.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1013]/85 via-[#1a1013]/45 to-[#1a1013]/90" />
        <div className="absolute left-1/2 top-1/2 h-[80%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(120,40,60,0.35),transparent_70%)] blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.5),transparent_60%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5">
        {/* Заголовок */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#d29aa8]">
            Конструкция в деталях
          </span>
          <h2 className="mt-4 text-balance text-[34px] font-extrabold tracking-[-0.02em] text-white sm:text-[44px]">
            {typo("Блок-контейнер изнутри и снаружи")}
          </h2>
          <p className="mt-4 text-pretty text-[16px] leading-relaxed text-white/60">
            {typo("Основные элементы конструкции")}
          </p>
        </div>

        {/* Сцена */}
        <div className="relative mt-10 sm:mt-14">
          <div className="relative aspect-[16/9]">
            {/* Слои изображений (кроссфейд + блюр + зум) */}
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: side === "out" ? 1 : 0,
                scale: side === "out" ? 1 : 1.03,
                filter: side === "out" ? "blur(0px)" : "blur(10px)",
              }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/renders/anatomy/exterior-v2.webp"
                alt="Блок-контейнер снаружи"
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-contain"
              />
            </motion.div>
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: side === "in" ? 1 : 0,
                scale: side === "in" ? 1 : 1.03,
                filter: side === "in" ? "blur(0px)" : "blur(10px)",
              }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/renders/anatomy/interior-v2.webp"
                alt="Блок-контейнер внутри, разрез"
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-contain"
              />
            </motion.div>

            {/* Хотспоты (стаггер-появление) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={side}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                variants={{
                  show: { transition: { staggerChildren: 0.035, delayChildren: 0.12 } },
                }}
                className="absolute inset-0"
              >
                {spots.map((spot, i) => (
                  <motion.div
                    key={i}
                    style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
                    variants={{
                      hidden: { scale: 0 },
                      show: { scale: 1 },
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 24 }}
                    className={cn("absolute", active === i ? "z-30" : "z-10")}
                  >
                    <Pin
                      spot={spot}
                      active={active === i}
                      onActivate={() => setActive(i)}
                      onDeactivate={() => setActive(null)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Тумблер Снаружи / Внутри */}
          <div className="mt-4 flex justify-center sm:mt-2">
            <div className="inline-flex gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-md">
              {TABS.map((t) => {
                const isActive = side === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => switchSide(t.key)}
                    className="relative rounded-full px-6 py-2 text-center transition-colors sm:px-8"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="anatomy-toggle"
                        className="absolute inset-0 rounded-full bg-burgundy shadow-[0_8px_24px_-8px_rgba(66,30,42,0.9)]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative block">
                      <span
                        className={cn(
                          "block text-[15px] font-bold transition-colors",
                          isActive ? "text-white" : "text-white/80",
                        )}
                      >
                        {t.label}
                      </span>
                      <span
                        className={cn(
                          "block text-[11px] transition-colors",
                          isActive ? "text-white/70" : "text-white/40",
                        )}
                      >
                        {typo(t.sub)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
