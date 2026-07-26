import Image from "next/image";
import Link from "next/link";
import type { BlogArticle } from "@/lib/blog";

export function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/blog/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image src={article.image} alt={article.imageAlt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.025]" />
        </div>
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.14em] text-burgundy/70">
            <time dateTime={article.publishedAt}>{new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.publishedAt))}</time>
            <span aria-hidden="true">•</span><span>{article.readingTime}</span>
          </div>
          <h2 className="mt-4 text-[23px] font-extrabold leading-tight tracking-[-0.02em] text-ink">{article.title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{article.excerpt}</p>
          <span className="mt-6 inline-flex font-bold text-burgundy">Читать статью <span aria-hidden="true" className="ml-2">→</span></span>
        </div>
      </Link>
    </article>
  );
}
