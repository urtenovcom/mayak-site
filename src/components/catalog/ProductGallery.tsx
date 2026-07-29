"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { GalleryImage } from "@/lib/media";

/**
 * Фотографии товара на его странице: крупный кадр и переключение между остальными.
 *
 * Единственная фотография рисуется просто картинкой — без стрелок, счётчика и
 * ленты миниатюр, чтобы не выглядеть сломанным слайдером.
 *
 * Переключатели — обычные кнопки, поэтому Tab и Enter работают сами. Плюс
 * стрелки клавиатуры, когда фокус внутри галереи: привычно для просмотра фото
 * и ничему на странице не мешает.
 */
export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [index, setIndex] = useState(0);

  const total = images.length;
  const current = images[Math.min(index, total - 1)] ?? images[0];

  function go(delta: number) {
    setIndex((value) => (value + delta + total) % total);
  }

  const frame = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-line bg-warm-soft">
      <Image
        src={current.src}
        // Описание берётся из данных. Пустое — это alt="", а не отсутствующий
        // атрибут: так помечают декоративную картинку, и скринридер её
        // пропускает вместо того, чтобы читать имя файла.
        alt={current.alt}
        fill
        sizes="(max-width: 1024px) 90vw, 520px"
        className="object-cover"
      />
    </div>
  );

  if (total <= 1) return frame;

  return (
    <div
      role="group"
      aria-label={`Фотографии: ${name}`}
      className="flex flex-col gap-3"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }}
    >
      <div className="relative">
        {frame}

        <button
          type="button"
          aria-label="Предыдущая фотография"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="Следующая фотография"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <span
          aria-hidden
          className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-[12px] font-semibold text-white"
        >
          {index + 1} / {total}
        </span>
      </div>

      {/* Лента миниатюр: на узком экране прокручивается вбок внутри себя и не
          раздувает ширину страницы. */}
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {images.map((image, i) => (
          <li key={image.src} className="shrink-0">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Показать фото ${i + 1} из ${total}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative block h-16 w-20 overflow-hidden rounded-xl border transition",
                i === index
                  ? "border-burgundy ring-2 ring-burgundy/25"
                  : "border-line opacity-75 hover:opacity-100",
              )}
            >
              {/* Миниатюра дублирует крупный кадр — для скринридера это
                  декорация, подпись несёт кнопка (aria-label). */}
              <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
