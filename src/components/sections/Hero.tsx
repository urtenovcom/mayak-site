"use client";

/* ============================================================
   Кинематографичный герой с фоновым видео.
   Видео играет один раз (без loop), замирает на последнем кадре.
   Примерно на середине (~3с) плавно всплывают заголовки и кнопка.
   Навигация — общий глобальный Header (одинаковый на всех страницах).
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SolutionModal } from "@/components/SolutionModal";

const REVEAL_AT = 3; // секунда появления контента

const SERVICES = ["Модульные здания", "Блок-контейнеры", "Металлоконструкции"];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);
  // когда видео замерло на последнем кадре — включаем медленное «живое» движение
  const [frozen, setFrozen] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    const v = videoRef.current;
    // единый момент появления — контент героя и шапка проявляются вместе
    const reveal = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      setRevealed(true);
      const w = window as typeof window & { __heroRevealed?: boolean };
      w.__heroRevealed = true;
      window.dispatchEvent(new Event("hero-revealed"));
    };
    const onTime = () => {
      if (v && v.currentTime >= REVEAL_AT) reveal();
    };
    const onEnded = () => setFrozen(true);
    v?.addEventListener("timeupdate", onTime);
    v?.addEventListener("ended", onEnded);
    const fallback = setTimeout(reveal, REVEAL_AT * 1000 + 800);
    // страховка: если событие ended не пришло — включаем движение по таймеру
    const freezeFallback = setTimeout(() => setFrozen(true), 7000);
    return () => {
      v?.removeEventListener("timeupdate", onTime);
      v?.removeEventListener("ended", onEnded);
      clearTimeout(fallback);
      clearTimeout(freezeFallback);
    };
  }, []);

  return (
    <section className="relative min-h-svh overflow-hidden bg-[#0d0b0c] text-white">
      {/* Фон-видео */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-[center_92%]"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/video/hero-poster.webp"
      >
        <source src="/video/hero.webm" type="video/webm" />
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      {/* Стоп-кадр как изображение — плавно «оживает» без шиммера видео */}
      {frozen && (
        <Image
          src="/video/hero-lastframe.webp"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="hero-kenburns object-cover object-[center_92%]"
        />
      )}

      {/* Затемнения */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      </div>

      {/* ——— Контент ——— */}
      <motion.div
        variants={container}
        initial="hidden"
        animate={revealed ? "show" : "hidden"}
        className="relative z-10 mx-auto flex min-h-svh max-w-[1360px] flex-col px-5 pt-24 sm:px-8 sm:pt-28"
      >
        {/* Услуги (сверху слева) */}
        <motion.ul variants={item} className="space-y-1.5">
          {SERVICES.map((s) => (
            <li
              key={s}
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70"
            >
              <span className="text-[#d29aa8]">/</span> {s}
            </li>
          ))}
        </motion.ul>

        <div className="flex-1" />

        {/* Нижний блок */}
        <div className="pb-16 sm:pb-20">
          <motion.span
            variants={item}
            className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm"
          >
            Производство · Доставка · Монтаж
          </motion.span>
          <motion.h1
            variants={item}
            className="mt-5 text-[38px] font-extrabold leading-[1.03] tracking-[-0.02em] sm:text-[58px] lg:text-[78px]"
          >
            Модульные и металлические
            <br />
            конструкции <span className="text-[#d29aa8]">под ваши задачи</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-5 max-w-md text-[16px] leading-relaxed text-white/70"
          >
            Изготавливаем конструкции нужных размеров и комплектаций с учётом
            условий эксплуатации.
          </motion.p>
          <motion.div variants={item} className="mt-7">
            <SolutionModal
              trigger={
                <Button size="lg" variant="light" withArrow>
                  Подобрать решение
                </Button>
              }
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
