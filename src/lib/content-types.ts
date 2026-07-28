// Формы данных, которые слой чтения контента (src/lib/content.ts) отдаёт
// страницам. Вынесены отдельно, потому что их импортируют и клиентские
// компоненты: content.ts — серверный модуль (next/cache, адрес API), и
// втягивать его в клиентский бандл ради одного типа нельзя.
//
// Товары и статьи здесь не описаны намеренно: у них уже есть публичные типы
// `Product` (catalog.ts) и `BlogArticle` (blog.ts) — к ним и приводятся
// ответы API, чтобы компоненты остались нетронутыми.

export type SiteContacts = {
  phones: string[];
  telegram: string;
  max: string;
  email: string;
  address: string;
};

export type SolutionExample = { name: string; image: string };

/**
 * Направление блока «Решения по задачам» вместе с товарами-примерами.
 *
 * В статических данных это две структуры (`SOLUTIONS` + `SOLUTION_PRODUCTS`),
 * в базе — одна запись с вложенными товарами. Наружу отдаётся единый вид:
 * компоненту не нужно знать, откуда пришли данные.
 *
 * ВНИМАНИЕ: в `label` и `title` переносы строк значимы — они верстают
 * карточку (`whitespace-pre-line`). Не склеивать и не нормализовать.
 */
export type SiteSolution = {
  id: string;
  icon: string;
  label: string;
  kicker: string;
  title: string;
  description: string;
  bullets: string[];
  products: SolutionExample[];
};

/** Цифра доверия. Перенос строки в `label` значим. */
export type SiteStat = { value: string; label: string; icon: string };

/** Этап работы. Перенос строки в `title` значим. */
export type SiteProcessStep = { n: string; title: string };
