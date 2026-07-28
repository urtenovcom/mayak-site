"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "@/components/icons";
import { Container } from "@/components/ui/Container";

const ROUTE_LABELS: Record<string, string> = {
  catalog: "Каталог",
  blog: "Блог",
  "kak-vybrat-blok-konteyner": "Как выбрать блок-контейнер",
  "modulnoe-zdanie-pod-klyuch": "Модульное здание под задачу",
  "dostavka-i-montazh-modulnyh-zdaniy": "Доставка и монтаж",
  constructor: "Конструктор",
  dostavka: "Доставка",
  faq: "Вопросы и ответы",
  kontakty: "Контакты",
  "o-kompanii": "О компании",
  "personal-data-consent": "Согласие на обработку персональных данных",
  "privacy-policy": "Политика конфиденциальности",
};

function getLabel(segment: string) {
  const decoded = decodeURIComponent(segment);
  return (
    ROUTE_LABELS[decoded] ??
    decoded
      .replaceAll("-", " ")
      .replace(/^./, (letter) => letter.toUpperCase())
  );
}

/**
 * @param current подпись последнего сегмента. Нужна там, где человеческое
 *   название знает только страница: у товара каталога это имя из базы, и
 *   держать его в словаре выше нельзя — товары заводят в панели.
 */
export function Breadcrumbs({ current }: { current?: string } = {}) {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Хлебные крошки" className="border-b border-line bg-white">
      <Container>
        <ol className="flex min-h-12 items-center gap-2 overflow-x-auto py-3 text-[13px] whitespace-nowrap">
          <li>
            <Link
              href="/"
              className="font-medium text-ink-soft transition-colors hover:text-burgundy"
            >
              Главная
            </Link>
          </li>

          {segments.map((segment, index) => {
            const href = `/${segments.slice(0, index + 1).join("/")}`;
            const isCurrent = index === segments.length - 1;

            return (
              <li key={href} className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-soft/45" />
                {isCurrent ? (
                  <span aria-current="page" className="font-semibold text-ink">
                    {current ?? getLabel(segment)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="font-medium text-ink-soft transition-colors hover:text-burgundy"
                  >
                    {getLabel(segment)}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
