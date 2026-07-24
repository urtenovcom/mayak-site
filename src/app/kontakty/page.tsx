import type { Metadata } from "next";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeadForm } from "@/components/forms/LeadForm";
import { ContactRows } from "@/components/ContactCard";
import { Requisites } from "@/components/Requisites";

export const metadata: Metadata = {
  title: "Контакты — ООО «Маяк»",
  description:
    "Свяжитесь с производителем модульных и металлических конструкций ООО «Маяк». Телефоны, почта, Telegram и адрес производства в Раменском городском округе (деревня Рыбаки).",
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
          </div>

          <div className="lg:pt-9">
            <LeadForm source="Заявка с сайта" />
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-warm-soft/40">
        <Container className="py-16 sm:py-20">
          <SectionLabel>Реквизиты</SectionLabel>
          <h2 className="mt-3 text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[30px]">
            Реквизиты компании
          </h2>
          <Requisites className="mt-6 max-w-2xl" />
        </Container>
      </section>
    </>
  );
}
