import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { JsonLd } from "@/components/JsonLd";
import { getProducts } from "@/lib/content";
import { productPath, type Product } from "@/lib/catalog";
import { OG_BASE, SITE, SITE_URL } from "@/lib/site";

// Название компании в <title> добавляет шаблон корневого layout
// (`%s — ООО «Маяк»`), поэтому здесь его писать не нужно — иначе оно
// удвоится. В openGraph шаблон не действует, но бренд там даёт `siteName`.
export const metadata: Metadata = {
  title: "Каталог модульных зданий и конструкций",
  description:
    "Каталог решений ООО «Маяк»: бытовки, блок-контейнеры, модульные здания, санитарные модули, хозблоки и металлоконструкции. Фильтр по назначению, типу и эксплуатации. Индивидуальное изготовление под задачу.",
  alternates: { canonical: "/catalog" },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: "Каталог модульных зданий и конструкций",
    description:
      "Готовые и индивидуальные модульные решения: бытовки, блок-контейнеры, офисные и санитарные модули, ангары и металлоконструкции.",
  },
};

// У каждой позиции есть собственная страница, поэтому в списке проставлены
// `url` и `@id`: они ведут на /catalog/<slug>, и тот же `@id` объявляет там
// подробная разметка Product — две записи об одном товаре склеиваются в одну.
// Цены индивидуальные, offers остаётся на странице товара.
const buildCatalogJsonLd = (products: Product[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Каталог модульных зданий и конструкций",
  url: `${SITE_URL}/catalog`,
  numberOfItems: products.length,
  itemListElement: products.map((product, index) => {
    const url = `${SITE_URL}${productPath(product.id)}`;
    return {
      "@type": "ListItem",
      position: index + 1,
      url,
      item: {
        "@type": "Product",
        "@id": `${url}#product`,
        url,
        name: product.name,
        description: product.description,
        image: `${SITE_URL}${product.image}`,
        category: product.type,
        brand: { "@type": "Brand", name: SITE.name },
        manufacturer: { "@type": "Organization", name: SITE.name },
      },
    };
  }),
});

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <>
      <JsonLd data={buildCatalogJsonLd(products)} />
      <CatalogView products={products} />
    </>
  );
}
