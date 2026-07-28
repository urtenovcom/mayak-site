import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import "@flaticon/flaticon-uicons/css/regular/rounded.css";

// Отдельный корневой layout группы (admin): у админки нет ни шапки сайта,
// ни футера, ни карты производства, ни плавающей кнопки.
export const metadata: Metadata = {
  title: {
    default: "Админка — ООО «Маяк»",
    template: "%s — админка «Маяк»",
  },
  // Раздел закрыт от индексации (дополнительно — в src/app/robots.ts).
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full bg-warm-bg text-foreground">{children}</body>
    </html>
  );
}
