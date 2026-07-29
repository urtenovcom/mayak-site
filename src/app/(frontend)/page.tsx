import { Hero } from "@/components/sections/Hero";
import { Solutions } from "@/components/sections/Solutions";
import { Process } from "@/components/sections/Process";
import { Stats } from "@/components/sections/Stats";
import { BigCTA } from "@/components/sections/BigCTA";
import { Faq } from "@/components/sections/Faq";
import { Container, SectionLabel } from "@/components/ui/Container";
import { BlockContainerAnatomy } from "@/components/sections/BlockContainerAnatomy";
import { BytovkaConfigurator } from "@/components/constructor/BytovkaConfigurator";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { getArticles, getFaqItems, getProcessSteps, getSolutions, getStats } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";

export default async function HomePage() {
  // Четыре блока главной читают контент из базы админки. Запросы независимы,
  // поэтому идут параллельно; фолбэк на статические данные — внутри getters.
  const [stats, solutions, process, articles, faq] = await Promise.all([
    getStats(),
    getSolutions(),
    getProcessSteps(),
    getArticles(),
    getFaqItems(),
  ]);

  return (
    <>
      <Hero />
      <Stats stats={stats} />
      <Solutions solutions={solutions} />
      <Process steps={process} />
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
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      </section>
      {/* На главной — только вопросы, отмеченные для неё в панели;
          на /faq остаются все опубликованные. */}
      <Faq items={faq.filter((item) => item.showOnHome !== false)} />
      <BigCTA />
    </>
  );
}
