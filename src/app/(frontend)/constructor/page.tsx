import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { BytovkaConfigurator } from "@/components/constructor/BytovkaConfigurator";
import { OG_BASE } from "@/lib/site";

// `alternates` и `openGraph` сливаются поверхностно: без своих значений
// страница унаследовала бы canonical и og:title главной.
export const metadata: Metadata = {
  // Суффикс «— ООО «Маяк»» подставляет title.template корневого layout.
  title: "Конструктор модульного здания",
  description:
    "Подберите модульное здание под свою задачу за несколько шагов: назначение, тип, размеры, комплектация и условия. Менеджер свяжется и подготовит индивидуальное предложение.",
  alternates: { canonical: "/constructor" },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: "Конструктор модульного здания",
    description:
      "Назначение, тип, размеры и комплектация за несколько шагов — в конце индивидуальное предложение.",
  },
};

export default function ConstructorPage() {
  return (
    <>
      <PageHeader
        label="Конструктор"
        title="Подберите модульное здание под свою задачу"
        description="Ответьте на несколько вопросов — мы уточним параметры и подготовим индивидуальное предложение. Стоимость рассчитывается индивидуально после уточнения параметров."
      />

      {/* Тот же конструктор, что и на главной: раньше здесь стоял отдельный
          старый вариант, и две формы жили своей жизнью. Боковая колонка убрана —
          конструктору нужна вся ширина, как на главной. */}
      <section className="py-12 sm:py-16">
        <Container>
          <BytovkaConfigurator />
        </Container>
      </section>

    </>
  );
}
