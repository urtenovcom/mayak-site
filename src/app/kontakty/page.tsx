import type { Metadata } from "next";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeadForm } from "@/components/forms/LeadForm";
import { ContactRows } from "@/components/ContactCard";
import { MapPin } from "@/components/icons";
import { CONTACTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты — ООО «Маяк»",
  description:
    "Свяжитесь с производителем модульных и металлических конструкций ООО «Маяк». Телефоны, почта, Telegram и адрес производства в Раменском районе (деревня Рыбаки).",
};

export default function KontaktyPage() {
  return (
    <>
      <PageHeader
        label="Контакты"
        title="Свяжитесь с нами удобным способом"
        description="Ответим на вопросы по конструкциям, комплектации, доставке и срокам. Оставьте заявку или позвоните напрямую."
      />

      <section>
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionLabel>Связь</SectionLabel>
            <h2 className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[30px]">
              Контакты ООО «Маяк»
            </h2>
            <ContactRows className="mt-5 max-w-md" />

            <div className="mt-8 rounded-[22px] border border-line bg-white p-6 shadow-[0_14px_40px_-30px_rgba(0,12,15,0.4)]">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warm-soft text-burgundy">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-burgundy/70">
                    Производство
                  </p>
                  <p className="mt-1 text-[17px] font-bold text-ink">
                    {CONTACTS.address}
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                    Приём и отгрузка по предварительному согласованию. Доставка —
                    в радиусе до 300 км, дальние направления индивидуально.
                  </p>
                </div>
              </div>
            </div>

            <div className="engineering-grid relative mt-6 flex min-h-[240px] items-end overflow-hidden rounded-[28px] border border-line p-6">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-white/70" />
              <p className="relative text-[14px] font-medium text-ink-soft">
                {CONTACTS.address}, Московская область
              </p>
            </div>
          </div>

          <div className="lg:pt-9">
            <LeadForm source="Заявка с сайта" />
          </div>
        </Container>
      </section>
    </>
  );
}
