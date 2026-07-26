import type { ReactNode } from "react";
import Image from "next/image";
import { Container, SectionLabel } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { typo } from "@/lib/typo";
import { cn } from "@/lib/cn";

export function PageHeader({
  label,
  title,
  description,
  image,
  imageClassName,
  contentClassName,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  /** Фоновое фото — включает тёмный вариант шапки с белым текстом. */
  image?: string;
  /** Позиционирование фонового фото для конкретной страницы. */
  imageClassName?: string;
  contentClassName?: string;
  children?: ReactNode;
}) {
  const dark = Boolean(image);

  return (
    <>
    <section className="relative overflow-hidden border-b border-line">
      {dark ? (
        <>
          <Image
            src={image!}
            alt=""
            fill
            priority
            sizes="100vw"
            className={cn("object-cover object-center", imageClassName)}
          />
          {/* затемнение для читаемости текста */}
          <div className="pointer-events-none absolute inset-0 bg-black/45 sm:bg-transparent" />
        </>
      ) : (
        <>
          <div className="engineering-grid absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-white/80" />
        </>
      )}

      <Container className={`relative py-16 sm:py-24 ${contentClassName ?? ""}`}>
        <span
          className={
            dark
              ? "text-[13px] font-bold uppercase tracking-[0.18em] text-[#d29aa8]"
              : ""
          }
        >
          {dark ? label : <SectionLabel>{label}</SectionLabel>}
        </span>
        <h1
          className={`mt-4 max-w-3xl text-balance text-[36px] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-[48px] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {typo(title)}
        </h1>
        {description && (
          <p
            className={`mt-5 max-w-xl text-pretty text-[17px] leading-relaxed ${
              dark ? "text-white/75" : "text-ink-soft"
            }`}
          >
            {typo(description)}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
    <Breadcrumbs />
    </>
  );
}
