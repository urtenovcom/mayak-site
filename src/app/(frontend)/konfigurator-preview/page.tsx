import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { VisualPreview } from "@/components/constructor/VisualPreview";

export const metadata: Metadata = {
  title: "Визуальный конструктор — превью — ООО «Маяк»",
  robots: { index: false, follow: false },
};

export default function KonfiguratorPreviewPage() {
  return (
    <>
      <PageHeader
        label="Конструктор · превью"
        title="Выберите обшивку и цвет — здание меняется наглядно"
        description="Демонстрация визуального шага на примере бытовки: профлист или вагонка, четыре цвета. Каждый вариант — отдельный рендер, без перекраски."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <VisualPreview />
        </Container>
      </section>
    </>
  );
}
