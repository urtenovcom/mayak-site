import type { ReactNode } from "react";
import { Container, SectionLabel } from "@/components/ui/Container";

export function PageHeader({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="engineering-grid absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-white/80" />
      <Container className="relative py-16 sm:py-20">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="mt-4 max-w-3xl text-balance text-[36px] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[48px]">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
