import { Hero } from "@/components/sections/Hero";
import { Solutions } from "@/components/sections/Solutions";
import { Process } from "@/components/sections/Process";
import { Stats } from "@/components/sections/Stats";
import { BigCTA } from "@/components/sections/BigCTA";
import { Container, SectionLabel } from "@/components/ui/Container";
import { BlockContainerAnatomy } from "@/components/sections/BlockContainerAnatomy";
import { BytovkaConfigurator } from "@/components/constructor/BytovkaConfigurator";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { BLOG_ARTICLES } from "@/lib/blog";
import { ButtonLink } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Solutions />
      <Process />
      <BlockContainerAnatomy />
      <section id="konfigurator" className="border-t border-line py-20 sm:py-24">
        <Container>
          <BytovkaConfigurator />
        </Container>
      </section>
      <section className="border-t border-line bg-warm-soft/45 py-20 sm:py-24">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>Блог</SectionLabel>
              <h2 className="mt-4 max-w-3xl text-balance text-[34px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[42px]">
                Полезное о модульном строительстве
              </h2>
              <p className="mt-4 max-w-2xl text-pretty text-[16px] leading-relaxed text-ink-soft">
                Практические материалы о выборе конструкции, подготовке проекта, доставке и монтаже.
              </p>
            </div>
            <ButtonLink href="/blog" variant="secondary" withArrow className="shrink-0">
              Все статьи
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {BLOG_ARTICLES.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      </section>
      <BigCTA />
    </>
  );
}
