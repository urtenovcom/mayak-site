import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Constructor } from "@/components/constructor/Constructor";

export const metadata: Metadata = {
  title: "Конструктор модульного здания — ООО «Маяк»",
  description:
    "Подберите модульное здание под свою задачу за несколько шагов: назначение, тип, размеры, комплектация и условия. Менеджер свяжется и подготовит индивидуальное предложение.",
};

export default function ConstructorPage() {
  return (
    <>
      <PageHeader
        label="Конструктор"
        title="Подберите модульное здание под свою задачу"
        description="Ответьте на несколько вопросов — мы уточним параметры и подготовим индивидуальное предложение. Стоимость рассчитывается индивидуально после уточнения параметров."
      />

      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <Constructor />

            <aside className="hidden lg:block lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[28px] border border-line bg-warm-soft/50 p-6">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-line bg-white">
                  <Image
                    src="/renders/module-white-container.webp"
                    alt="3D-рендер белого модульного блок-контейнера"
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-5 text-lg font-extrabold tracking-[-0.02em] text-ink">
                  Соберём под ваши задачи
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  Производим блок-контейнеры и модульные здания с нужной
                  комплектацией: окна, двери, электрика, утепление, санузел и
                  перегородки.
                </p>
                <ul className="mt-4 space-y-2 text-[14px] text-ink-soft">
                  <li>• Быстрый монтаж и доставка</li>
                  <li>• Комплектация под назначение</li>
                  <li>• Индивидуальный расчёт стоимости</li>
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
