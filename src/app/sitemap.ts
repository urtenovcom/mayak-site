import type { MetadataRoute } from "next";
import { getArticles, getProducts } from "@/lib/content";
import { productPath } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

// Статические страницы сайта.
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/catalog", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/constructor", priority: 0.8, changeFrequency: "monthly" },
  { path: "/dostavka", priority: 0.8, changeFrequency: "monthly" },
  { path: "/o-kompanii", priority: 0.7, changeFrequency: "monthly" },
  { path: "/kontakty", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/personal-data-consent", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Статьи и товары берём из базы админки: новая позиция должна попадать в
  // карту сайта без пересборки. Оба списка — только опубликованные.
  const [articles, products] = await Promise.all([getArticles(), getProducts()]);
  const lastModified = new Date();

  return [
    ...PAGES.map(({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}${productPath(product.id)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
