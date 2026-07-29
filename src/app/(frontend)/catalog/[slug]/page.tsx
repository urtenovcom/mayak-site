import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { LeadForm } from "@/components/forms/LeadForm";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRight, Check } from "@/components/icons";
import { getProduct, getProducts } from "@/lib/content";
import { productPath, type Product } from "@/lib/catalog";
import { coverAlt, type GalleryImage } from "@/lib/media";
import { OG_BASE, SITE, SITE_URL } from "@/lib/site";
import { typo } from "@/lib/typo";

/**
 * Адреса товаров для пререндера на сборке.
 *
 * Как и у статей блога: список берётся из базы (с фолбэком на статические
 * товары, если API на момент сборки недоступен), `dynamicParams` остаётся
 * значением по умолчанию (true) — товар, заведённый в панели уже ПОСЛЕ
 * сборки, отрисуется по первому запросу. Несуществующий и снятый с публикации
 * slug даёт 404: за это отвечает notFound() ниже.
 */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(({ id }) => ({ slug: id }));
}

type ProductPageProps = { params: Promise<{ slug: string }> };

/** Галерея товара. У заведённых до её появления в наборе одна обложка. */
function gallery(product: Product): GalleryImage[] {
  return product.images?.length
    ? product.images
    : [{ src: product.image, alt: product.name }];
}

/**
 * Габариты числами — только у товаров с точным размером вида «6×2.4 м».
 *
 * «от 12×6 м» и «по проекту» намеренно не разбираются: это не габариты
 * изделия, а нижняя граница и отсутствие размера. Врать в разметке нельзя,
 * поэтому такие значения остаются только текстовым свойством «Габариты».
 */
function parseSizeMeters(size: string): { width: number; depth: number } | null {
  const match = /^(\d+(?:[.,]\d+)?)\s*[×xх*]\s*(\d+(?:[.,]\d+)?)\s*м$/i.exec(size.trim());
  if (!match) return null;
  const width = Number(match[1].replace(",", "."));
  const depth = Number(match[2].replace(",", "."));
  return Number.isFinite(width) && Number.isFinite(depth) ? { width, depth } : null;
}

/**
 * Смежные товары — чтобы страница не была тупиковой.
 *
 * Сначала тот же тип, затем совпадение по сценариям применения, затем всё
 * остальное: у единственного товара своего типа блок всё равно не пустеет.
 */
function relatedProducts(all: Product[], current: Product, limit = 4): Product[] {
  const rest = all.filter((product) => product.id !== current.id);
  const rank = (product: Product) => {
    if (product.type === current.type) return 0;
    if (product.tags.some((tag) => current.tags.includes(tag))) return 1;
    return 2;
  };
  return rest
    .map((product, index) => ({ product, index, rank: rank(product) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.product);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const images = gallery(product);
  // Суффикс «— ООО «Маяк»» в <title> подставляет шаблон корневого layout,
  // в openGraph бренд даёт `siteName` из OG_BASE (без подмеси Next заменил бы
  // родительский объект целиком и og:site_name пропал бы).
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: productPath(product.id) },
    openGraph: {
      ...OG_BASE,
      type: "website",
      title: product.name,
      description: product.description,
      url: `${SITE_URL}${productPath(product.id)}`,
      images: [{ url: product.image, alt: coverAlt(images, product.image, product.name) }],
    },
  };
}

function Param({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-line bg-white px-4 py-3">
      <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-soft/80">
        {label}
      </dt>
      <dd className="text-[15px] font-semibold text-ink">{typo(value)}</dd>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.id === slug);
  if (!product) notFound();

  const images = gallery(product);
  const related = relatedProducts(products, product);
  const url = `${SITE_URL}${productPath(product.id)}`;
  const dimensions = parseSizeMeters(product.size);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name: product.name,
    description: product.description,
    // Артикула у индивидуального производства нет — за него отвечает slug:
    // он уникален и стабилен, то есть ровно то, что от sku и требуется.
    sku: product.id,
    image: images.map((image) => `${SITE_URL}${image.src}`),
    category: product.type,
    brand: { "@type": "Brand", name: SITE.name },
    manufacturer: { "@type": "Organization", name: SITE.name, url: SITE_URL },
    ...(dimensions
      ? {
          width: { "@type": "QuantitativeValue", value: dimensions.width, unitCode: "MTR" },
          depth: { "@type": "QuantitativeValue", value: dimensions.depth, unitCode: "MTR" },
        }
      : {}),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Габариты", value: product.size },
      { "@type": "PropertyValue", name: "Режим эксплуатации", value: product.exploitation },
      ...(product.tags.length > 0
        ? [{ "@type": "PropertyValue", name: "Назначение", value: product.tags.join(", ") }]
        : []),
      {
        "@type": "PropertyValue",
        name: "Изготовление",
        value: product.individual ? "Индивидуальное, по проекту" : "Типовое решение",
      },
      ...product.options.map((option) => ({
        "@type": "PropertyValue",
        name: "Опция",
        value: option,
      })),
      ...product.complectation.map((item) => ({
        "@type": "PropertyValue",
        name: "Комплектация",
        value: item,
      })),
    ],
    // Цену выдумывать нельзя: она считается под комплектацию и объём заказа.
    // Предложение без числа всё равно полезно — оно связывает товар с
    // продавцом, валютой расчёта и говорит, что позицию можно заказать.
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "RUB",
      availability: product.individual
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.name, url: SITE_URL },
    },
  };

  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Каталог", item: `${SITE_URL}/catalog` },
      { "@type": "ListItem", position: 3, name: product.name, item: url },
    ],
  };

  return (
    <article>
      <JsonLd data={productJsonLd} />
      <JsonLd data={crumbs} />

      <Breadcrumbs current={product.name} />

      {/* Шапка товара: фотографии и главные параметры */}
      <section className="bg-warm-bg py-10 sm:py-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
            <ProductGallery images={images} name={product.name} />

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-warm px-3 py-1 text-[12px] font-semibold text-ink">
                  {product.type}
                </span>
                {product.individual && (
                  <span className="rounded-full bg-burgundy/10 px-3 py-1 text-[12px] font-semibold text-burgundy">
                    Индивидуальное изготовление
                  </span>
                )}
              </div>

              <h1 className="text-balance text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[40px]">
                {typo(product.name)}
              </h1>
              <p className="text-pretty text-[17px] leading-relaxed text-ink-soft">
                {typo(product.purpose)}
              </p>

              <dl className="grid grid-cols-2 gap-2.5">
                <Param label="Габариты" value={product.size} />
                <Param label="Режим эксплуатации" value={product.exploitation} />
                <Param label="Тип" value={product.type} />
                {product.tags.length > 0 && (
                  <Param label="Назначение" value={product.tags.join(", ")} />
                )}
              </dl>

              {product.options.length > 0 && (
                <div>
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-burgundy/70">
                    Опции
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {product.options.map((option) => (
                      <li
                        key={option}
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink"
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-3">
                <ButtonLink href="#zayavka" variant="primary" size="lg" withArrow>
                  Получить расчёт
                </ButtonLink>
                <ButtonLink href="/constructor" variant="secondary" size="lg">
                  Собрать под себя
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Описание и комплектация — в разметке, а не в модалке */}
      <section className="border-t border-line bg-white py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink sm:text-[28px]">
                Описание
              </h2>
              <p className="mt-5 text-pretty text-[16px] leading-relaxed text-ink-soft">
                {typo(product.description)}
              </p>
            </div>

            <div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink sm:text-[28px]">
                Комплектация
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {product.complectation.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[16px] leading-snug text-ink-soft"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {typo(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Заявка */}
      <section id="zayavka" className="scroll-mt-24 bg-warm-bg py-12 sm:py-16">
        <Container>
          <div className="grid gap-8 rounded-[28px] border border-line bg-white p-6 sm:p-10 lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-12">
            <div>
              <h2 className="text-balance text-[26px] font-extrabold tracking-[-0.02em] text-ink sm:text-[32px]">
                {typo(`Рассчитать «${product.name}»`)}
              </h2>
              <p className="mt-4 max-w-lg text-pretty text-[16px] leading-relaxed text-ink-soft">
                {typo(
                  "Уточним габариты, комплектацию и условия эксплуатации, подготовим смету и сроки. Доставка и монтаж — до 300 км от производства в Раменском городском округе.",
                )}
              </p>
            </div>
            <LeadForm source={`Заявка из каталога: ${product.name}`} compact />
          </div>
        </Container>
      </section>

      {/* Смежные товары */}
      {related.length > 0 && (
        <section className="border-t border-line bg-white py-12 sm:py-16">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink sm:text-[28px]">
                {typo("Похожие решения")}
              </h2>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-burgundy hover:underline"
              >
                Весь каталог
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={productPath(item.id)}
                    className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/30 hover:shadow-[0_24px_50px_-30px_rgba(26,18,22,0.5)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-warm-soft">
                      <Image
                        src={item.image}
                        alt={coverAlt(item.images ?? [], item.image, item.name)}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-burgundy/80">
                        {item.type}
                      </span>
                      <h3 className="text-balance text-[16px] font-bold leading-tight tracking-[-0.02em] text-ink">
                        {typo(item.name)}
                      </h3>
                      <p className="mt-auto pt-2 text-[13px] font-medium text-ink-soft">
                        {item.size}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </article>
  );
}
