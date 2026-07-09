import type { Metadata } from "next";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Check, Icon, type IconName } from "@/components/icons";

export const metadata: Metadata = {
  title: "О компании — ООО «Маяк»",
  description:
    "ООО «Маяк» — производитель модульных и металлических конструкций: бытовки, блок-модули, санитарные блоки и ангары. Собственное производство, контроль качества и индивидуальный подход к каждой задаче.",
};

const stats: { value: string; label: string; icon: IconName }[] = [
  { value: "500+", label: "реализованных объектов", icon: "cube" },
  { value: "100%", label: "индивидуальный подход к задаче", icon: "target" },
  { value: "до 300 км", label: "радиус доставки и монтажа", icon: "warehouse" },
  { value: "1 точка", label: "ответственности: производство и монтаж", icon: "home" },
];

const advantages: { title: string; text: string }[] = [
  {
    title: "Собственное производство",
    text: "Изготавливаем конструкции на своей площадке в Раменском районе — от каркаса до отделки. Это позволяет держать качество и сроки под контролем, а не зависеть от посредников.",
  },
  {
    title: "Контроль на каждом этапе",
    text: "Проверяем металл, сварные швы, утепление и сборку до отгрузки. Модуль уезжает на объект готовым к эксплуатации, а не «в полуготовности».",
  },
  {
    title: "Опытная команда",
    text: "Конструкторы и монтажники работают в индустрии с 1990-х. Знают, как поведёт себя модуль зимой, как поставить ангар на слабый грунт и где обычно возникают ошибки.",
  },
  {
    title: "Индивидуальный подход",
    text: "Нет типового решения под задачу — спроектируем и изготовим под ваши размеры, комплектацию и условия эксплуатации. От хозблока для дачи до санитарного блока для производства.",
  },
];

export default function OKompaniiPage() {
  return (
    <>
      <PageHeader
        label="О компании"
        title="Производим модульные и металлические конструкции под задачу"
        description="ООО «Маяк» — производитель бытовок, блок-модулей, санитарных блоков и ангаров. Берём задачу целиком: проект, изготовление, доставка и монтаж."
      />

      <section className="border-b border-line">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <SectionLabel>Кто мы</SectionLabel>
            <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
              Делаем конструкции, которые служат, а не разваливаются за сезон
            </h2>
            <div className="mt-5 flex flex-col gap-4 text-[16px] leading-relaxed text-ink-soft">
              <p>
                Мы производим модульные и металлические конструкции для
                строительных площадок, временных офисов, проживания вахтовых
                бригад, дачных участков и санитарных нужд. В работе — типовые
                бытовки и блок-модули, а также проекты, собранные под конкретные
                требования заказчика.
              </p>
              <p>
                Производство сосредоточено на одной площадке в Раменском районе,
                деревня Рыбаки. Благодаря этому мы отвечаем за весь цикл — от
                выбора металла и утеплителя до доставки и установки на объекте.
                Заказчику не нужно искать отдельного перевозчика или монтажную
                бригаду: всё закрываем сами.
              </p>
              <p>
                К каждому обращению относимся как к отдельной задаче. Уточняем,
                где и как будет стоять модуль, в каких условиях эксплуатироваться,
                и предлагаем решение, а не просто продаём коробку.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-[22px] border border-line bg-white p-5 shadow-[0_14px_40px_-30px_rgba(0,12,15,0.4)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-warm-soft text-burgundy">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <p className="mt-4 text-[26px] font-extrabold tracking-[-0.02em] text-ink">
                  {s.value}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-ink-soft">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-warm-soft/40">
        <Container className="py-16 sm:py-20">
          <SectionLabel>Почему с нами удобно</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
            Что вы получаете, работая с производителем напрямую
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {advantages.map((a) => (
              <div
                key={a.title}
                className="rounded-[22px] border border-line bg-white p-6 shadow-[0_14px_40px_-30px_rgba(0,12,15,0.4)]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-[18px] font-bold tracking-[-0.01em] text-ink">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                      {a.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-20">
          <div className="engineering-grid relative overflow-hidden rounded-[28px] border border-line">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-white/80" />
            <div className="relative flex flex-col items-start gap-6 p-8 sm:p-12">
              <h2 className="max-w-2xl text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
                Соберите конструкцию под свою задачу прямо сейчас
              </h2>
              <p className="max-w-xl text-[16px] leading-relaxed text-ink-soft">
                Выберите тип модуля, размеры и комплектацию в конструкторе — мы
                подготовим расчёт и предложим оптимальное решение.
              </p>
              <ButtonLink href="/constructor" size="lg" withArrow>
                Перейти в конструктор
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
