import type { Metadata } from "next";
import Image from "next/image";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Check, Icon, type IconName } from "@/components/icons";
import { CertificationBlock } from "@/components/CertificationBlock";
import { typo } from "@/lib/typo";
import { getContacts } from "@/lib/content";
import { telHref } from "@/lib/phone";
import { OG_BASE, SITE } from "@/lib/site";

// `alternates` и `openGraph` сливаются поверхностно: без своих значений
// страница унаследовала бы canonical и og:title главной.
export const metadata: Metadata = {
  // Суффикс «— ООО «Маяк»» подставляет title.template корневого layout.
  title: "О компании",
  description:
    "ООО «Маяк» — производитель модульных и металлических конструкций: бытовки, блок-модули, санитарные блоки и ангары. Собственное производство, контроль качества и индивидуальный подход к каждой задаче.",
  alternates: { canonical: "/o-kompanii" },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: "О компании ООО «Маяк»",
    description:
      "Производство модульных и металлических конструкций: собственный цех, контроль качества и решения под задачу заказчика.",
  },
};

const stats: { value: string; label: string; icon: IconName }[] = [
  { value: "500+", label: "выполненных работ", icon: "cube" },
  { value: "30+ лет", label: "опыт команды в строительной сфере", icon: "user" },
  { value: "100%", label: "индивидуальный подход к задаче", icon: "target" },
  {
    value: "1 точка",
    label: "ответственности: производство, доставка и монтаж",
    icon: "home",
  },
];

const advantages: { title: string; text: string }[] = [
  {
    title: "Собственное производство",
    text: "Контролируем качество изготовления и комплектацию без зависимости от посредников. Можем быстро вносить правки, менять исполнение и адаптировать конструкцию под задачу заказчика.",
  },
  {
    title: "Контроль на каждом этапе",
    text: "Проверяем основные элементы конструкции в процессе изготовления: каркас, сварные соединения, утепление, отделку, электрику и дополнительное оснащение.",
  },
  {
    title: "Опытная команда",
    text: "Используем практический опыт команды в строительной сфере, чтобы учитывать особенности объекта, условия эксплуатации, доставку и монтаж при подборе конструкции.",
  },
  {
    title: "Индивидуальное изготовление",
    text: "Изготавливаем конструкции под задачу заказчика: с нужными размерами, планировкой, отделкой, оснащением и условиями эксплуатации.",
  },
];

export default async function OKompaniiPage() {
  const contacts = await getContacts();

  return (
    <>
      <PageHeader
        label="О компании"
        image="/about-hero-final-4k.webp"
        imageClassName="object-[72%_center] sm:object-center"
        contentClassName="flex min-h-[440px] flex-col justify-center sm:min-h-[520px]"
        title="О компании ООО «Маяк»"
        description="ООО «Маяк» изготавливает модульные и металлические конструкции для частных и коммерческих объектов. Мы подбираем решения под конкретную задачу: от формата и размеров до комплектации, отделки и условий эксплуатации."
      />

      <section className="border-b border-line">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <SectionLabel>Кто мы</SectionLabel>
            <h2 className="mt-3 text-balance text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
              {typo("Производитель модульных и металлических конструкций")}
            </h2>
            <div className="mt-5 flex flex-col gap-4 text-pretty text-[16px] leading-relaxed text-ink-soft">
              <p>
                {typo(
                  "ООО «Маяк» изготавливает бытовки, блок-контейнеры, модульные здания, хозблоки, санитарные решения и металлические конструкции. Производство находится в Раменском городском округе, деревня Рыбаки.",
                )}
              </p>
              <p>
                {typo(
                  "Компания берёт на себя основные этапы работы: изготовление, доставку и монтаж. При подготовке заказа учитываются назначение конструкции, размеры, планировка, комплектация, отделка и условия эксплуатации.",
                )}
              </p>
              <p>
                {typo(
                  "Мы работаем с частными заказчиками, строительными организациями, производственными объектами и коммерческими компаниями.",
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-[22px] border border-line bg-white p-5 shadow-[0_14px_40px_-30px_rgba(0,12,15,0.4)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-warm-soft text-burgundy">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <p className="mt-4 text-[26px] font-extrabold tracking-[-0.02em] text-ink">
                  {typo(s.value)}
                </p>
                <p className="mt-1 text-pretty text-[13px] leading-snug text-ink-soft">
                  {typo(s.label)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-warm-soft/40">
        <Container className="py-16 sm:py-20">
          <SectionLabel>Подход к работе</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-balance text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
            {typo("Производство, контроль и индивидуальное исполнение")}
          </h2>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
            <div className="grid gap-5">
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
                      <h3 className="text-balance text-[18px] font-bold tracking-[-0.01em] text-ink">
                        {typo(a.title)}
                      </h3>
                      <p className="mt-2 text-pretty text-[15px] leading-relaxed text-ink-soft">
                        {typo(a.text)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative min-h-[520px] overflow-hidden rounded-[24px] border border-line shadow-[0_20px_50px_-34px_rgba(0,12,15,0.45)] lg:min-h-0">
              <Image
                src="/about-production-process-v2.webp"
                alt="Производство модульных конструкций ООО «Маяк»"
                fill
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </Container>
      </section>

      <CertificationBlock />

      <section className="border-b border-line bg-warm-soft/45">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-14">
            <div>
              <span className="inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-burgundy/70">
                Гарантия качества
              </span>
              <div className="mt-5 flex items-end gap-4">
                <span className="text-[72px] font-extrabold leading-none tracking-[-0.06em] text-burgundy sm:text-[92px]">
                  12
                </span>
                <span className="pb-2 text-[20px] font-bold text-ink-soft sm:text-[24px]">
                  месяцев
                </span>
              </div>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
                С даты передачи изделия покупателю по акту приёма-передачи. На отдельные узлы и инженерное оборудование действует гарантия их производителей.
              </p>
            </div>
            <div>
              <span className="inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-burgundy/70">
                Ответственность производителя
              </span>
              <h2 className="mt-5 max-w-2xl text-balance text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[40px]">
                Отвечаем за качество изготовленных конструкций
              </h2>
              <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
                {SITE.legalName} устраняет подтверждённые производственные недостатки в согласованный срок при соблюдении правил транспортировки, монтажа и эксплуатации.
              </p>
            </div>
          </div>

          <div className="mt-12 grid overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_20px_55px_-42px_rgba(0,12,15,0.35)] lg:grid-cols-2">
            <div className="border-b border-line p-7 sm:p-9 lg:border-b-0 lg:border-r">
              <h3 className="text-[22px] font-bold tracking-[-0.02em] text-ink">Что покрывает гарантия</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Целостность и геометрию несущего металлокаркаса",
                  "Качество сварных и болтовых соединений",
                  "Заводское лакокрасочное и защитное покрытие",
                  "Соответствие согласованному проекту и комплектации",
                  "Работоспособность установленных нами окон, дверей и фурнитуры",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-soft">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-7 sm:p-9">
              <h3 className="text-[22px] font-bold tracking-[-0.02em] text-ink">Гарантийные исключения</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                Гарантия не распространяется на повреждения, возникшие не по вине изготовителя:
              </p>
              <ul className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-soft">
                {[
                  "Нарушение правил перевозки, погрузки, разгрузки или монтажа силами покупателя и третьих лиц",
                  "Неправильная эксплуатация, перегрузка, самостоятельная перепланировка или переделка",
                  "Естественный износ, выцветание покрытия и коррозия в местах механических повреждений",
                  "Стихийные бедствия, пожар, действия третьих лиц и обстоятельства непреодолимой силы",
                  "Расходные материалы и элементы с ограниченным ресурсом, включая уплотнители и лампы",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-5 rounded-[24px] border border-line bg-white p-7 text-ink shadow-[0_20px_55px_-44px_rgba(0,12,15,0.3)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-3xl">
              <h3 className="text-[21px] font-bold tracking-[-0.02em]">Как обратиться по гарантии</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Направьте описание дефекта, номер и дату договора, а также фотографии. Мы рассмотрим обращение и свяжемся с вами для согласования дальнейших действий.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <a href={`mailto:${contacts.email}`} className="font-bold text-burgundy hover:underline">
                {contacts.email}
              </a>
              {contacts.phones.map((phone) => (
                <a key={phone} href={telHref(phone)} className="font-bold text-burgundy hover:underline">
                  {phone}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-20">
          <div className="engineering-grid relative overflow-hidden rounded-[28px] border border-line">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-white/80" />
            <div className="relative flex flex-col items-start gap-6 p-8 sm:p-12">
              <h2 className="max-w-2xl text-balance text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
                {typo("Соберите конструкцию под свою задачу прямо сейчас")}
              </h2>
              <p className="max-w-xl text-pretty text-[16px] leading-relaxed text-ink-soft">
                {typo(
                  "Выберите тип модуля, размеры и комплектацию в конструкторе — мы подготовим расчёт и предложим оптимальное решение.",
                )}
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
