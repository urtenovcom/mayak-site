import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeadForm } from "@/components/forms/LeadForm";
import { Requisites } from "@/components/Requisites";
import { Mail, MapPin, Max, Phone, Telegram } from "@/components/icons";
import { CONTACTS } from "@/lib/site";
import { CopyMaxContact } from "@/components/CopyMaxContact";

export const metadata: Metadata = {
  title: "Контакты — ООО «Маяк»",
  description:
    "Контакты производителя модульных зданий и металлоконструкций ООО «Маяк»: телефоны, почта, мессенджеры, адрес производства и реквизиты.",
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function ContactCard({
  icon: Icon,
  eyebrow,
  value,
  note,
  href,
}: {
  icon: IconComponent;
  eyebrow: string;
  value: string;
  note: string;
  href?: string;
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

  return href ? (
    <a href={href} className={className}>{content}</a>
  ) : (
    <CopyMaxContact className={className} showTooltip={false}>{content}</CopyMaxContact>
  );
}

export default function KontaktyPage() {
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

          <div className="mt-9 overflow-hidden rounded-3xl border border-line bg-white md:grid md:grid-cols-2 xl:grid-cols-5">
            <ContactCard
              icon={Phone}
              eyebrow="Основной телефон"
              value={CONTACTS.phones[0]}
              note="Подбор, расчёт и вопросы по заказу"
              href={telHref(CONTACTS.phones[0])}
            />
            <ContactCard
              icon={Phone}
              eyebrow="Дополнительный телефон"
              value={CONTACTS.phones[1]}
              note="Производство, доставка и монтаж"
              href={telHref(CONTACTS.phones[1])}
            />
            <ContactCard
              icon={Telegram}
              eyebrow="Telegram"
              value={CONTACTS.telegram}
              note="Быстрый вопрос в мессенджере"
              href="https://t.me/+79669795566"
            />
            <ContactCard
              icon={Max}
              eyebrow="MAX"
              value={CONTACTS.max}
              note="Сообщения и файлы в мессенджере"
            />
            <ContactCard
              icon={Mail}
              eyebrow="Электронная почта"
              value={CONTACTS.email}
              note="Документы, планы и технические задания"
              href={`mailto:${CONTACTS.email}`}
            />
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
                <p className="text-[17px] font-semibold leading-relaxed">{CONTACTS.address}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/65">
                  Перед визитом свяжитесь с нами — согласуем время и подготовим специалиста по вашему вопросу.
                </p>
              </div>
            </div>
            <div className="mt-auto grid grid-cols-3 gap-2 pt-10">
              <a
                href={telHref(CONTACTS.phones[0])}
                className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-full bg-white px-2 text-[13px] font-bold text-burgundy transition-transform hover:-translate-y-0.5"
              >
                <Phone className="h-4 w-4" />
                Позвонить
              </a>
              <a
                href="https://t.me/+79669795566"
                className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-full border border-white/25 px-2 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
              >
                <Telegram className="h-4 w-4" />
                Telegram
              </a>
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
