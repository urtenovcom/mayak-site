import { Container, SectionLabel } from "@/components/ui/Container";
import { Home } from "@/components/icons";
import { PROCESS } from "@/lib/site";

export function Process() {
  return (
    <section className="border-y border-line bg-warm-soft/40 py-20 sm:py-24">
      <Container>
        <SectionLabel>От задачи — до результата</SectionLabel>
        <h2 className="mt-4 text-[34px] font-extrabold tracking-[-0.02em] text-ink sm:text-[42px]">
          Как мы работаем
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS.map((step) => (
            <div
              key={step.n}
              className="group relative rounded-[22px] border border-line bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_-26px_rgba(66,30,42,0.3)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-sm font-bold text-white">
                  {step.n}
                </span>
                <Home className="h-5 w-5 text-burgundy/35" />
              </div>
              <h3 className="mt-5 whitespace-pre-line text-[18px] font-bold leading-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
