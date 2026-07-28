import type { Metadata } from "next";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/JsonLd";
import { FaqList } from "@/components/sections/Faq";
import { buildFaqJsonLd } from "@/lib/faq";
import { getFaqItems } from "@/lib/content";
import { typo } from "@/lib/typo";
import { OG_BASE, SITE_URL } from "@/lib/site";

// `alternates` и `openGraph` сливаются поверхностно: без своих значений
// страница унаследовала бы canonical и og:title главной.
export const metadata: Metadata = {
  // Суффикс «— ООО «Маяк»» подставляет title.template корневого layout.
  title: "Вопросы и ответы",
  description:
    "Ответы на частые вопросы о модульных и металлических конструкциях ООО «Маяк»: зимняя эксплуатация, фундамент, сроки производства, нестандартные размеры, перевозка, монтаж, гарантия и работа с юрлицами.",
  alternates: { canonical: "/faq" },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: "Вопросы и ответы о модульных конструкциях",
    description:
      "Зимняя эксплуатация, фундамент, сроки производства, нестандартные размеры, перевозка, монтаж и гарантия.",
  },
};


export default async function FaqPage() {
  const items = await getFaqItems();

  return (
    <>
      <JsonLd data={buildFaqJsonLd(`${SITE_URL}/faq`, items)} />
      <PageHeader
        label="Вопросы и ответы"
        title="Отвечаем на частые вопросы о модульных конструкциях"
        description="Собрали то, что чаще всего спрашивают перед заказом: про эксплуатацию, основание, сроки, монтаж и гарантию. Не нашли ответ — напишите нам."
      />

      <section>
        <Container className="py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
            <FaqList items={items} />

            <aside className="lg:sticky lg:top-28">
              <div className="rounded-[28px] border border-line bg-warm-soft/50 p-7">
                <SectionLabel>Не нашли ответ?</SectionLabel>
                <h2 className="mt-3 text-balance text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
                  {typo("Расскажите о задаче — подскажем решение")}
                </h2>
                <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink-soft">
                  {typo(
                    "Поможем подобрать тип модуля, комплектацию и рассчитать стоимость с доставкой на ваш объект.",
                  )}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <ButtonLink href="/kontakty" size="lg" withArrow>
                    Связаться с нами
                  </ButtonLink>
                  <ButtonLink href="/constructor" size="lg" variant="secondary">
                    Перейти в конструктор
                  </ButtonLink>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
