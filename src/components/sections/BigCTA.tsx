import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export function BigCTA() {
  return (
    <section className="py-8">
      <Container>
        <div className="relative overflow-hidden rounded-[28px] bg-burgundy px-7 py-12 text-white sm:px-12 sm:py-16">
          {/* декоративный каркас-бокс */}
          <svg
            className="pointer-events-none absolute -right-6 top-1/2 hidden h-[260px] -translate-y-1/2 opacity-50 lg:block"
            viewBox="0 0 320 240"
            fill="none"
            aria-hidden
          >
            <g stroke="#e7dad4" strokeOpacity="0.5" strokeWidth="1.4">
              <path d="M60 90l100-40 140 56-100 40z" />
              <path d="M60 90v90l100 40v-90" />
              <path d="M160 146l140-56v90l-140 56z" />
              <path d="M60 180l100 40 140-56" />
              <path d="M110 70v90M210 86v90" />
            </g>
          </svg>

          <div className="relative max-w-2xl">
            <span className="text-[14px] font-semibold text-warm/80">
              Не нашли подходящее решение?
            </span>
            <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[44px]">
              Создадим конструкцию
              <br />
              под вашу задачу
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/70">
              Разработаем индивидуальное решение под ваши требования.
            </p>
            <ButtonLink href="/constructor" variant="light" size="lg" withArrow className="mt-8">
              Открыть конструктор
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
