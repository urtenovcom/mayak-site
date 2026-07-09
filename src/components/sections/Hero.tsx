import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ContactRows } from "@/components/ContactCard";
import { Diamond, Phone } from "@/components/icons";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="engineering-grid absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/70" />

      <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_1.15fr] lg:gap-6 lg:py-20">
        {/* левая колонка */}
        <div className="animate-rise">
          <span className="inline-flex items-center rounded-full border border-line bg-white/80 px-4 py-2 text-[13px] font-semibold tracking-tight text-ink/70 backdrop-blur">
            Производство · Доставка · Монтаж
          </span>

          <h1 className="mt-6 text-balance text-[40px] font-extrabold leading-[1.06] tracking-[-0.02em] text-ink sm:text-[52px] lg:text-[58px]">
            Модульные<br className="hidden sm:block" /> и металлические
            конструкции{" "}
            <span className="text-burgundy">под ваши задачи</span>
          </h1>

          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Изготавливаем конструкции нужных размеров и комплектаций с учётом
            условий эксплуатации.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <ButtonLink href="/constructor" size="lg" withArrow>
              Подобрать решение
            </ButtonLink>
            <span className="flex items-center gap-3 text-sm text-ink-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-burgundy">
                <Diamond className="h-[18px] w-[18px]" />
              </span>
              Индивидуальный подход
              <br className="hidden sm:block" /> к каждому проекту
            </span>
          </div>
        </div>

        {/* правая колонка — рендер + панель контактов */}
        <div className="relative animate-rise [animation-delay:120ms]">
          <div className="overflow-hidden rounded-[28px] border border-line bg-white/40 shadow-[0_40px_80px_-40px_rgba(0,12,15,0.35)]">
            <Image
              src="/renders/hero-module-dark.webp"
              alt="3D-визуализация остеклённого модульного здания на инженерной сетке"
              width={1344}
              height={768}
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="h-auto w-full"
            />
          </div>

          {/* плавающая контактная карточка (как на эталоне) */}
          <div className="absolute right-3 top-3 hidden w-[268px] flex-col gap-2 sm:flex">
            <div className="flex items-center justify-center gap-2.5 rounded-2xl bg-burgundy px-5 py-3.5 font-semibold text-white shadow-[0_20px_40px_-18px_rgba(66,30,42,0.8)]">
              <Phone className="h-[18px] w-[18px]" />
              Получить расчёт
            </div>
            <div className="rounded-3xl border border-line bg-white p-2.5 shadow-[0_30px_60px_-28px_rgba(0,12,15,0.4)]">
              <ContactRows />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
