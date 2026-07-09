import type { Metadata } from "next";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeadForm } from "@/components/forms/LeadForm";
import { Check, Icon, MapPin, type IconName } from "@/components/icons";
import { CONTACTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Доставка модульных зданий — ООО «Маяк»",
  description:
    "Доставляем модульные и металлические конструкции от производства в Раменском районе (деревня Рыбаки) в радиусе до 300 км. Дальние направления — по индивидуальному согласованию.",
};

const factors: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "cube",
    title: "Габариты и вес модуля",
    text: "Стандартная бытовка едет на одной машине, крупные блок-модули и ангары — отдельным негабаритным транспортом или в разобранном виде.",
  },
  {
    icon: "target",
    title: "Удалённость объекта",
    text: "Стоимость считается от точки производства в деревне Рыбаки до вашего адреса. До 300 км — по прайсу, дальше — по согласованию.",
  },
  {
    icon: "warehouse",
    title: "Подъездные пути",
    text: "Учитываем ширину проезда, состояние дороги и возможность подъезда длинномера вплотную к месту установки.",
  },
  {
    icon: "crane",
    title: "Необходимость крана",
    text: "Если модуль нужно снять с машины и установить на основание — закладываем работу манипулятора или автокрана нужной грузоподъёмности.",
  },
  {
    icon: "home",
    title: "Монтаж на месте",
    text: "Установка на опоры, сборка секций ангара, подключение к подготовленным коммуникациям — объём работ влияет на итоговую смету.",
  },
  {
    icon: "briefcase",
    title: "Сроки и логистика",
    text: "Срочная доставка в выходные или в неудобное окно, ожидание разгрузки на объекте — оговариваем заранее, чтобы не было сюрпризов.",
  },
];

export default function DostavkaPage() {
  return (
    <>
      <PageHeader
        label="Доставка и монтаж"
        title="Доставим конструкцию на объект и установим под ключ"
        description="Возим собственным и привлечённым транспортом от производства в Раменском районе. Радиус доставки — до 300 км; дальние направления согласуем индивидуально."
      />

      <section className="border-b border-line bg-warm-soft/40">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="engineering-grid relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[28px] border border-line p-7">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-white/70" />
            <div className="relative">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-burgundy text-white shadow-[0_10px_28px_-14px_rgba(66,30,42,0.7)]">
                <MapPin className="h-6 w-6" />
              </span>
              <p className="mt-4 text-[13px] font-bold uppercase tracking-[0.18em] text-burgundy/70">
                Точка производства
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink">
                {CONTACTS.address}
              </p>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
                Радиус доставки — до 300 км от производства. Покрываем Москву,
                область и соседние регионы.
              </p>
            </div>
          </div>

          <div>
            <SectionLabel>Зона доставки</SectionLabel>
            <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
              До 300 км по прайсу, дальше — по согласованию
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
              В пределах 300 км стоимость доставки рассчитывается по понятному
              тарифу и зависит от типа модуля и адреса. На дальние направления
              мы тоже возим — маршрут, транспорт и стоимость согласуем
              индивидуально под ваш объект.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                "Доставка от производства в деревне Рыбаки",
                "Подбор подходящего транспорта под габариты",
                "Установка модуля краном-манипулятором",
                "Расчёт стоимости до выезда — без скрытых доплат",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] text-ink"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                    <Check className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16 sm:py-20">
          <SectionLabel>Из чего складывается стоимость</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
            Что влияет на цену доставки и монтажа
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-ink-soft">
            Считаем стоимость прозрачно — по факторам, которые реально влияют на
            логистику и установку именно вашей конструкции.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {factors.map((f) => (
              <div
                key={f.title}
                className="rounded-[22px] border border-line bg-white p-6 shadow-[0_14px_40px_-30px_rgba(0,12,15,0.4)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-soft text-burgundy">
                  <Icon name={f.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-[17px] font-bold tracking-[-0.01em] text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-warm-soft/40">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel>Расчёт доставки</SectionLabel>
            <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
              Получите расчёт доставки на ваш адрес
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-soft">
              Оставьте заявку — уточним габариты, адрес объекта и условия
              разгрузки, после чего пришлём точную стоимость доставки и монтажа.
            </p>
          </div>
          <LeadForm source="Заявка на доставку" />
        </Container>
      </section>
    </>
  );
}
