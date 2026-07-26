import type { Metadata } from "next";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { BLOG_ARTICLES } from "@/lib/blog";

export const metadata: Metadata = { title: "Блог о модульных зданиях и блок-контейнерах", description: "Практические статьи ООО «Маяк» о выборе, проектировании, доставке и монтаже модульных зданий и блок-контейнеров.", alternates: { canonical: "/blog" }, openGraph: { title: "Блог ООО «Маяк»", description: "Полезные материалы о модульном строительстве для заказчиков.", type: "website" } };

export default function BlogPage() {
  return <><PageHeader label="Блог" title="Разбираемся в модульном строительстве" description="Практические руководства, которые помогут сформировать требования, сравнить решения и подготовить объект." /><section className="border-b border-line bg-warm-soft py-14 sm:py-20"><Container><div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">{BLOG_ARTICLES.map((a) => <ArticleCard key={a.slug} article={a} />)}</div></Container></section></>;
}
