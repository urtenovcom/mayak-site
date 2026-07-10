import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { BytovkaConfigurator } from "@/components/constructor/BytovkaConfigurator";

export const metadata: Metadata = {
  title: "Конструктор бытовки — ООО «Маяк»",
  description:
    "Соберите бытовку под свою задачу: размер, обшивка и цвет, утепление, окна, отделка и инженерия. Здание меняется наглядно, в конце — заявка на индивидуальный расчёт.",
  robots: { index: false, follow: false },
};

export default function KonfiguratorPage() {
  return (
    <>
      <PageHeader
        label="Конструктор бытовки"
        title="Соберите бытовку под свою задачу"
        description="Пройдите несколько шагов — здание меняется наглядно. В конце оставите заявку, и менеджер подготовит индивидуальное предложение."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <BytovkaConfigurator />
        </Container>
      </section>
    </>
  );
}
