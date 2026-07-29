import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getArticle, getArticles } from "@/lib/content";
import { OG_BASE, SITE, SITE_URL } from "@/lib/site";

/**
 * Адреса статей для пререндера на сборке.
 *
 * Список берётся из базы (с фолбэком на статические статьи, если API на
 * момент сборки недоступен). `dynamicParams` остаётся значением по умолчанию
 * (true), поэтому статья, созданная в админке уже ПОСЛЕ сборки, отрисуется по
 * первому запросу и попадёт в кэш; несуществующий slug по-прежнему даёт 404 —
 * ниже за это отвечает notFound().
 */
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map(({ slug }) => ({ slug }));
}

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params; const article = await getArticle(slug); if (!article) return {};
  // Суффикс «— ООО «Маяк»» в <title> подставляет шаблон корневого layout,
  // в openGraph бренд даёт `siteName` из OG_BASE.
  return { title: article.title, description: article.description, keywords: article.keywords, alternates: { canonical: `/blog/${article.slug}` }, openGraph: { ...OG_BASE, type: "article", title: article.title, description: article.description, publishedTime: article.publishedAt, modifiedTime: article.updatedAt, images: [{ url: article.image, alt: article.imageAlt }] } };
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params; const article = await getArticle(slug); if (!article) notFound();
  const url = `${SITE_URL}/blog/${article.slug}`;
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, image: [`${SITE_URL}${article.image}`], datePublished: article.publishedAt, dateModified: article.updatedAt, author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name }, mainEntityOfPage: url };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "Блог", item: `${SITE_URL}/blog` }, { "@type": "ListItem", position: 3, name: article.title, item: url }] };
  return <article><JsonLd data={jsonLd} /><JsonLd data={crumbs} /><header className="bg-warm-soft pt-12 sm:pt-16"><Container><div className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.14em] text-burgundy/70"><time dateTime={article.publishedAt}>{new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.publishedAt))}</time><span>•</span><span>{article.readingTime}</span></div><h1 className="mt-5 max-w-5xl text-balance text-[38px] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[56px]">{article.title}</h1><p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-ink-soft">{article.description}</p><div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-t-[32px]"><Image src={article.image} alt={article.imageAlt} fill priority sizes="(max-width: 1240px) 100vw, 1240px" className="object-cover" /></div></Container></header><Breadcrumbs /><ArticleBody article={article} /></article>;
}
