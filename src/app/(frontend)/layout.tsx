import type { Metadata } from "next";
import "../globals.css";
import "@flaticon/flaticon-uicons/css/regular/rounded.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductionMap } from "@/components/sections/ProductionMap";
import { FloatingContact } from "@/components/FloatingContact";
import { JsonLd } from "@/components/JsonLd";
import { DevSegmentExplorerGuard } from "@/components/dev/DevSegmentExplorerGuard";
import { ContactsProvider } from "@/components/ContactsProvider";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { getAnalytics, getContacts, getRobots, type SiteContacts } from "@/lib/content";
import { toE164 } from "@/lib/phone";
import { PRODUCTION, SITE, SITE_URL } from "@/lib/site";

/**
 * Метаданные собираются функцией, а не константой, из-за одного поля —
 * `robots`.
 *
 * `robots.txt` управляет ОБХОДОМ, а не выдачей: страницу, на которую ведут
 * внешние ссылки, поисковик может показать в результатах, даже не заглянув на
 * неё. Поэтому выключатель индексации в панели обязан гасить оба сигнала —
 * иначе владелец будет уверен, что закрыл сайт, а страницы продолжат
 * появляться в поиске. Отсюда `noindex, nofollow` в разметке рядом с
 * `Disallow: /` в файле.
 *
 * Динамическим маршрут от этого не становится: `getRobots` кэширован тегом
 * `settings` (как и `getContacts`, который layout и так вызывает), а панель
 * сбрасывает тег при сохранении.
 *
 * Страницы со своим `robots` в метаданных это не
 * ломает: их значение перекрывает layout и остаётся закрывающим в обоих
 * состояниях выключателя.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { indexing } = await getRobots();

  return {
    ...baseMetadata,
    robots: indexing ? { index: true, follow: true } : { index: false, follow: false },
  };
}

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Модульные и металлические конструкции под ваши задачи — ООО «Маяк»",
    template: "%s — ООО «Маяк»",
  },
  description:
    "Изготавливаем модульные и металлические конструкции нужных размеров и комплектаций с учётом условий эксплуатации. Производство в Раменском городском округе, доставка и монтаж в радиусе до 300 км.",
  keywords: [
    "модульные здания",
    "бытовки",
    "блок-контейнеры",
    "металлические конструкции",
    "санитарные модули",
    "ангары",
    "производство модульных зданий",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "ООО «Маяк»",
    title: "Модульные и металлические конструкции под ваши задачи",
    description:
      "Подберём решение под вашу задачу: производство, доставка и монтаж модульных конструкций.",
  },
  // `robots` здесь НЕ задаётся: его подставляет generateMetadata по
  // выключателю индексации из панели.
  alternates: { canonical: "/" },
};

/**
 * Зона работ в машинном виде: круг радиусом 300 км вокруг производства.
 *
 * Раньше здесь стояло `areaServed: "RU"` — это противоречило самому сайту,
 * который везде пишет «до 300 км от производства». Для модели противоречие
 * внутри одного документа — повод не доверять источнику, а география тут
 * ключевая: запросы вида «блок-контейнеры в Подмосковье» самые ценные.
 */
const SERVICE_AREA = {
  "@type": "GeoCircle",
  geoMidpoint: {
    "@type": "GeoCoordinates",
    latitude: PRODUCTION.point[0],
    longitude: PRODUCTION.point[1],
  },
  geoRadius: String(PRODUCTION.serviceRadiusMeters),
  description:
    "Основная зона доставки и монтажа — до 300 км от производства в Раменском городском округе. Более дальние направления обсуждаются индивидуально.",
};

/** Структурированные данные организации собираются из живых контактов. */
const buildOrganizationJsonLd = (contacts: SiteContacts) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-02.svg`,
  description:
    "Производство модульных и металлических конструкций: бытовки, блок-контейнеры, модульные здания, санитарные модули, ангары и металлоконструкции.",
  email: contacts.email,
  telephone: contacts.phones.map(toE164),
  address: {
    "@type": "PostalAddress",
    addressCountry: "RU",
    addressRegion: "Московская область",
    addressLocality: contacts.address,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: PRODUCTION.point[0],
    longitude: PRODUCTION.point[1],
  },
  areaServed: SERVICE_AREA,
  contactPoint: contacts.phones.map((phone) => ({
    "@type": "ContactPoint",
    telephone: toE164(phone),
    contactType: "sales",
    areaServed: SERVICE_AREA,
    availableLanguage: "Russian",
  })),
});

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE_URL,
  inLanguage: "ru-RU",
  publisher: { "@type": "Organization", name: SITE.name },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Клиентские компоненты (шапка, кнопка «скопировать MAX») берут контакты из
  // контекста, серверные (футер, страницы) вызывают getContacts() сами. Это не
  // лишние обращения: геттер обёрнут в React.cache, поэтому в пределах одного
  // рендера API опрашивается ровно один раз — в том числе когда API не
  // отвечает и каждый вызов стоил бы отдельного таймаута.
  // Счётчики читаются из тех же настроек и тем же кэшированным запросом
  // (см. getAnalytics), так что второго обращения к API это не стоит.
  // Номера задаются в панели; пусто или API недоступен — счётчиков не будет.
  const [contacts, analytics] = await Promise.all([getContacts(), getAnalytics()]);

  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <DevSegmentExplorerGuard />
        <JsonLd data={buildOrganizationJsonLd(contacts)} />
        <JsonLd data={websiteJsonLd} />
        <ContactsProvider value={contacts}>
          <Header />
          <main className="flex-1">{children}</main>
          <ProductionMap />
          <Footer />
          <FloatingContact />
        </ContactsProvider>
        {/* Счётчики — только здесь: у админки свой корневой layout. */}
        <SiteAnalytics
          yandexMetrikaId={analytics.yandexMetrikaId}
          googleAnalyticsId={analytics.googleAnalyticsId}
        />
      </body>
    </html>
  );
}
