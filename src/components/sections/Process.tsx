import { Container, SectionLabel } from "@/components/ui/Container";
import type { SiteProcessStep } from "@/lib/content-types";
import { typo } from "@/lib/typo";

/** Этапы работы. Данные приходят пропом из страницы (база админки + фолбэк). */
export function Process({ steps }: { steps: SiteProcessStep[] }) {
  return (
    <section className="border-y border-line bg-warm-soft/40 py-20 sm:py-24">
      <Container>
        <SectionLabel>Как мы работаем</SectionLabel>
        <h2 className="mt-4 text-balance text-[34px] font-extrabold tracking-[-0.02em] text-ink sm:text-[42px]">
          {typo("От задачи — до результата")}
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-[16px] leading-relaxed text-ink-soft">
          {typo(
            "Мы подбираем конструкцию под задачу, размеры, комплектацию и условия эксплуатации. После уточнения требований запускаем изготовление, организуем доставку и при необходимости выполняем монтаж на объекте.",
          )}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.n}
              className="group relative rounded-[22px] border border-line bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_-26px_rgba(66,30,42,0.3)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-sm font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-5 whitespace-pre-line text-balance text-[18px] font-bold leading-tight text-ink">
                {typo(step.title)}
              </h3>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
