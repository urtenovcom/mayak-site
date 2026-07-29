import { Container, SectionLabel } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons";
import type { FaqItem } from "@/lib/faq";
import { typo } from "@/lib/typo";

/**
 * Список вопросов на нативных `<details>`: раскрывается без JavaScript, и текст
 * ответов попадает в разметку целиком — именно из-за этого блок читают
 * поисковые и ИИ-краулеры, которые скрипты не исполняют.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-[22px] border border-line bg-white px-6 py-1 shadow-[0_14px_40px_-30px_rgba(0,12,15,0.4)] open:bg-warm-soft/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-balance text-[17px] font-bold tracking-[-0.01em] text-ink [&::-webkit-details-marker]:hidden">
            {typo(item.q)}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm-soft text-burgundy transition-transform duration-200 group-open:rotate-90">
              <ChevronRight className="h-4 w-4" />
            </span>
          </summary>
          <p className="pb-5 text-pretty text-[15px] leading-relaxed text-ink-soft">
            {typo(item.a)}
          </p>
        </details>
      ))}
    </div>
  );
}

/** Блок «Вопросы и ответы» на главной. */
export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-line py-20 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionLabel>Вопросы и ответы</SectionLabel>
            <h2 className="mt-4 text-balance text-[34px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[42px]">
              {typo("Отвечаем на то, что спрашивают перед заказом")}
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-[16px] leading-relaxed text-ink-soft">
              {typo(
                "Эксплуатация зимой, основание под модуль, сроки производства, монтаж и гарантия. Не нашли свой вопрос — задайте его напрямую.",
              )}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/faq" variant="secondary" withArrow className="shrink-0">
                Все вопросы
              </ButtonLink>
            </div>
          </div>

          <FaqList items={items} />
        </div>
      </Container>
    </section>
  );
}
