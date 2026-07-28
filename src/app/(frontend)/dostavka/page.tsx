import type { Metadata } from "next";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeadForm } from "@/components/forms/LeadForm";
import { Check, Icon, MapPin, type IconName } from "@/components/icons";
import { getContacts } from "@/lib/content";
import { typo } from "@/lib/typo";
import { OG_BASE } from "@/lib/site";

// `alternates` и `openGraph` сливаются поверхностно: без своих значений
// страница унаследовала бы canonical и og:title главной.
export const metadata: Metadata = {
  // Суффикс «— ООО «Маяк»» подставляет title.template корневого layout.
  title: "Доставка модульных зданий",
  description:
    "Доставляем модульные и металлические конструкции от производства в Раменском городском округе (деревня Рыбаки) в радиусе до 300 км. Дальние направления — по индивидуальному согласованию.",
  alternates: { canonical: "/dostavka" },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: "Доставка и монтаж модульных зданий",
    description:
      "Доставка от производства в Раменском городском округе, основная зона — до 300 км. Монтаж на подготовленное основание.",
  },
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
    text: "Стоимость считается от точки производства в деревне Рыбаки до вашего адреса. До 300 км — основная зона доставки, дальше — по индивидуальному согласованию.",
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

export default async function DostavkaPage() {
  const contacts = await getContacts();

  return (
    <>
      <PageHeader
        image="/delivery-hero-4k.webp"
        contentClassName="flex min-h-[440px] flex-col justify-center sm:min-h-[520px]"
        label="Доставка и монтаж"
        title="Доставка и монтаж модульных конструкций"
        description="Возим собственным и привлечённым транспортом от производства в Раменском городском округе. Радиус доставки — до 300 км; дальние направления согласуем индивидуально."
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
                {contacts.address}
              </p>
              <p className="mt-2 max-w-md text-pretty text-[15px] leading-relaxed text-ink-soft">
                {typo(
                  "Радиус доставки — до 300 км от производства. Покрываем Москву, область и соседние регионы.",
                )}
              </p>
            </div>
          </div>

          <div>
            <SectionLabel>Зона доставки</SectionLabel>
            <h2 className="mt-3 text-balance text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
              {typo("Основная зона доставки и монтажа")}
            </h2>
            <p className="mt-4 text-pretty text-[16px] leading-relaxed text-ink-soft">
              {typo(
                "До 300 км от производства. Более дальние направления обсуждаются индивидуально.",
              )}
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
                  {typo(item)}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16 sm:py-20">
          <SectionLabel>Из чего складывается стоимость</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-balance text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
            {typo("Что влияет на цену доставки и монтажа")}
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-[16px] leading-relaxed text-ink-soft">
            {typo(
              "Стоимость доставки и монтажа согласовывается индивидуально с менеджером. При расчёте учитываются адрес объекта, расстояние от производства, тип конструкции, условия подъезда, необходимость разгрузки, монтажа и привлечения спецтехники.",
            )}
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
                <h3 className="mt-4 text-balance text-[17px] font-bold tracking-[-0.01em] text-ink">
                  {typo(f.title)}
                </h3>
                <p className="mt-2 text-pretty text-[14px] leading-relaxed text-ink-soft">
                  {typo(f.text)}
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
            <h2 className="mt-3 text-balance text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
              {typo("Получите расчёт доставки на ваш адрес")}
            </h2>
            <p className="mt-4 max-w-md text-pretty text-[16px] leading-relaxed text-ink-soft">
              {typo(
                "Оставьте заявку — уточним габариты, адрес объекта и условия разгрузки, после чего пришлём точную стоимость доставки и монтажа.",
              )}
            </p>
          </div>
          <LeadForm source="Заявка на доставку" />
        </Container>
      </section>
    </>
  );
}
