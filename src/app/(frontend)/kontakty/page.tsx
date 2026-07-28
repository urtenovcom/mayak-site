import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeadForm } from "@/components/forms/LeadForm";
import { Requisites } from "@/components/Requisites";
import { Mail, MapPin, Max, Phone, Telegram } from "@/components/icons";
import { getContacts } from "@/lib/content";
import { telHref, telegramHref } from "@/lib/phone";
import { cn } from "@/lib/cn";
import { CopyMaxContact } from "@/components/CopyMaxContact";
import { OG_BASE } from "@/lib/site";

// `alternates` и `openGraph` сливаются поверхностно: без своих значений
// страница унаследовала бы canonical и og:title главной.
export const metadata: Metadata = {
  // Суффикс «— ООО «Маяк»» подставляет title.template корневого layout.
  title: "Контакты",
  description:
    "Контакты производителя модульных зданий и металлоконструкций ООО «Маяк»: телефоны, почта, мессенджеры, адрес производства и реквизиты.",
  alternates: { canonical: "/kontakty" },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: "Контакты ООО «Маяк»",
    description:
      "Телефоны, почта, мессенджеры, адрес производства и реквизиты компании.",
  },
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type ContactCardData = {
  key: string;
  icon: IconComponent;
  eyebrow: string;
  value: string;
  note: string;
  href?: string;
  /** Карточка не ссылка, а кнопка «скопировать номер» (так работает MAX). */
  copy?: boolean;
};

/**
 * Подпись телефона зависит от того, сколько их всего.
 *
 * Телефоны редактируются в админке, и их может быть один, два или пять —
 * поэтому здесь не должно быть ни обращения по индексу, ни предположения
 * «первый основной, второй дополнительный».
 */
function phoneEyebrow(index: number, total: number): string {
  if (total === 1) return "Телефон";
  if (index === 0) return "Основной телефон";
  if (total === 2) return "Дополнительный телефон";
  return `Дополнительный телефон ${index}`;
}

/**
 * Число колонок в ряду карточек.
 *
 * Классы перечислены литералами: Tailwind собирает стили сканированием
 * исходников и динамически склеенное имя (`xl:grid-cols-${n}`) не увидит.
 * Для нетипично длинного списка — четыре колонки в несколько рядов.
 */
const COLUMNS: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
};

function ContactCard({
  icon: Icon,
  eyebrow,
  value,
  note,
  href,
  copy,
}: {
  icon: IconComponent;
  eyebrow: string;
  value: string;
  note: string;
  href?: string;
  copy?: boolean;
}) {
  const content = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-burgundy/8 text-burgundy transition-colors group-hover:bg-burgundy group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>
      <span className="self-end text-[11px] font-semibold uppercase leading-snug tracking-[0.14em] text-ink-soft">
        {eyebrow}
      </span>
      <span
        className={`self-center whitespace-nowrap font-bold tracking-[-0.025em] text-ink ${
          value.length > 18 ? "text-[14px]" : "text-[18px] xl:text-[17px]"
        }`}
      >
        {value}
      </span>
      <span className="self-start text-[13px] leading-relaxed text-ink-soft">
        {note}
      </span>
    </>
  );

  const className = "group grid min-h-60 grid-rows-[44px_48px_36px_1fr] border-b border-line p-6 text-left transition-colors hover:bg-warm-soft/60 sm:p-6 xl:border-b-0 xl:border-r last:border-b-0 last:xl:border-r-0";

  // Отсутствие href больше не означает «это MAX»: карточка мессенджера без
  // разбираемого контакта должна остаться текстом, а не превратиться в кнопку
  // копирования чужого номера.
  if (copy) {
    return (
      <CopyMaxContact className={className} showTooltip={false}>{content}</CopyMaxContact>
    );
  }

  return href ? (
    <a href={href} className={className}>{content}</a>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default async function KontaktyPage() {
  const contacts = await getContacts();
  // Адрес чата собирается из контакта — правка номера в админке меняет и
  // подпись, и ссылку (раньше здесь стоял константный номер).
  const telegram = telegramHref(contacts.telegram);

  // Карточки собираются из данных, а не выписываются по одной: сколько
  // телефонов в админке, столько и карточек. `getContacts()` гарантирует
  // непустой список, но проверка ниже страхует и от нуля.
  const cards: ContactCardData[] = [
    ...contacts.phones.map((phone, index) => ({
      key: `phone-${index}`,
      icon: Phone,
      eyebrow: phoneEyebrow(index, contacts.phones.length),
      value: phone,
      note: index === 0 ? "Подбор, расчёт и вопросы по заказу" : "Производство, доставка и монтаж",
      href: telHref(phone),
    })),
    {
      key: "telegram",
      icon: Telegram,
      eyebrow: "Telegram",
      value: contacts.telegram,
      note: "Быстрый вопрос в мессенджере",
      href: telegram ?? undefined,
    },
    {
      key: "max",
      icon: Max,
      eyebrow: "MAX",
      value: contacts.max,
      note: "Сообщения и файлы в мессенджере",
      copy: true,
    },
    {
      key: "email",
      icon: Mail,
      eyebrow: "Электронная почта",
      value: contacts.email,
      note: "Документы, планы и технические задания",
      href: `mailto:${contacts.email}`,
    },
  ];

  const [primaryPhone] = contacts.phones;

  return (
    <>
      <PageHeader
        label="Контакты"
        title="Контакты и реквизиты ООО «Маяк»"
        description="Обсудим задачу, подготовим расчёт и ответим на вопросы по производству, комплектации, доставке и монтажу."
      />

      <section className="border-b border-line">
        <Container className="py-16 sm:py-20">
          <div className="max-w-3xl">
            <SectionLabel>Прямая связь</SectionLabel>
            <h2 className="mt-3 text-[30px] font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-[40px]">
              Выберите удобный способ связи
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
              Позвоните или напишите — обращение сразу попадёт специалисту, который поможет с вашим вопросом.
            </p>
          </div>

          <div
            className={cn(
              "mt-9 overflow-hidden rounded-3xl border border-line bg-white md:grid md:grid-cols-2",
              COLUMNS[cards.length] ?? "xl:grid-cols-4",
            )}
          >
            {cards.map((card) => (
              <ContactCard
                key={card.key}
                icon={card.icon}
                eyebrow={card.eyebrow}
                value={card.value}
                note={card.note}
                href={card.href}
                copy={card.copy}
              />
            ))}
          </div>
        </Container>
      </section>

      <section id="contact-form" className="scroll-mt-24 border-b border-line bg-warm-soft/45">
        <Container className="grid gap-8 py-16 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
          <div className="flex flex-col rounded-3xl bg-burgundy p-7 text-white sm:p-10">
            <span className="inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-white/60">
              Офис и производство
            </span>
            <h2 className="mt-3 text-[30px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[38px]">
              Приезжайте к нам на производство
            </h2>
            <div className="mt-8 flex items-start gap-4 border-t border-white/15 pt-7">
              <MapPin className="mt-0.5 h-6 w-6 shrink-0" />
              <div>
                <p className="text-[17px] font-semibold leading-relaxed">{contacts.address}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/65">
                  Перед визитом свяжитесь с нами — согласуем время и подготовим специалиста по вашему вопросу.
                </p>
              </div>
            </div>
            <div className="mt-auto grid auto-cols-fr grid-flow-col gap-2 pt-10">
              {primaryPhone && (
                <a
                  href={telHref(primaryPhone)}
                  className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-full bg-white px-2 text-[13px] font-bold text-burgundy transition-transform hover:-translate-y-0.5"
                >
                  <Phone className="h-4 w-4" />
                  Позвонить
                </a>
              )}
              {telegram && (
                <a
                  href={telegram}
                  className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-full border border-white/25 px-2 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
                >
                  <Telegram className="h-4 w-4" />
                  Telegram
                </a>
              )}
              <CopyMaxContact className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-full border border-white/25 px-2 text-[13px] font-bold text-white transition-colors hover:bg-white/10">
                <Max className="h-4 w-4" />
                MAX
              </CopyMaxContact>
            </div>
          </div>

          <div>
            <SectionLabel>Обратная связь</SectionLabel>
            <h2 className="mt-3 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[38px]">
              Опишите вашу задачу
            </h2>
            <p className="mb-7 mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Оставьте контакты — уточним детали и предложим подходящее решение.
            </p>
            <LeadForm source="Заявка со страницы контактов" />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16">
            <div>
              <SectionLabel>Документы</SectionLabel>
              <h2 className="mt-3 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[38px]">
                Реквизиты компании
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                Нажмите на нужное значение, чтобы быстро скопировать его.
              </p>
            </div>
            <Requisites />
          </div>
        </Container>
      </section>
    </>
  );
}
