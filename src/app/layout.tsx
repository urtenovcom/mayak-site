import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/FloatingContact";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = "https://mayak-modul.ru";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Модульные и металлические конструкции под ваши задачи — ООО «Маяк»",
    template: "%s — ООО «Маяк»",
  },
  description:
    "Изготавливаем модульные и металлические конструкции нужных размеров и комплектаций с учётом условий эксплуатации. Производство, доставка и монтаж по всей России.",
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
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
