// Слой чтения контента для ПУБЛИЧНЫХ страниц.
//
// Единственная точка, через которую страницы сайта получают товары, статьи,
// направления, контакты, цифры доверия и этапы работы. Модуль серверный:
// он ходит в REST API админки, и переменная ADMIN_API_URL в браузер не
// попадает. Клиентским компонентам данные передаются пропсами (или через
// ContactsProvider), импортировать этот файл из "use client" нельзя.
//
// Три правила, на которых всё держится.
//
// 1. ФОЛБЭК ОБЯЗАТЕЛЕН. Прод сейчас работает вообще без API, поэтому любая
//    ошибка — сеть, 4xx/5xx, таймаут, пустой список — не должна ронять
//    страницу и не должна оставлять пустой блок. В этом случае возвращаются
//    статические данные из src/lib/{site,catalog,blog}.ts, а факт фолбэка
//    пишется в серверный лог.
//
// 2. ТИПЫ ПУБЛИЧНЫЕ. Ответы API приводятся к тем же типам, которыми уже
//    типизированы компоненты (`Product` из catalog.ts, `BlogArticle` из
//    blog.ts), чтобы вёрстку не переписывать. Переносы строк в подписях
//    направлений, цифр и этапов значимы — они не нормализуются.
//
// 3. КЭШ С ТЕГАМИ. Каждый ресурс читается через unstable_cache с тегом и
//    ревалидацией, а серверные экшены админки сбрасывают тег после успешного
//    сохранения (см. src/lib/admin/revalidate.ts). Cache Components
//    ("use cache" + cacheComponents: true) здесь сознательно НЕ включаются:
//    флаг переводит всё приложение на dynamic-by-default и требует Suspense
//    вокруг каждого динамического куска — это отдельная миграция всего сайта.
//    Модель «unstable_cache + revalidateTag/updateTag» описана в
//    node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md
//    и работает с текущей конфигурацией без изменений в рендеринге.

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { ApiError, apiFetch } from "./admin/api";
import type {
  AdminArticle,
  AdminFaqItem,
  AdminProduct,
  AdminSolution,
  Paginated,
  SettingsResponse,
} from "./admin/types";
import { BLOG_ARTICLES, type BlogArticle } from "./blog";
import { FAQ_ITEMS, type FaqItem } from "./faq";
import { toArticleBlocks } from "./blog-blocks";
import { isLocalImagePath, toGalleryImages, type GalleryImage } from "./media";
import { DEFAULT_ROBOTS, toDisallowPaths, type RobotsSettings } from "./robots-rules";
import {
  PRODUCTS,
  type Exploitation,
  type Product,
  type ProductOption,
  type ProductType,
} from "./catalog";
import type {
  SiteContacts,
  SiteProcessStep,
  SiteSolution,
  SiteStat,
} from "./content-types";
import { CONTACTS, PROCESS, SOLUTIONS, SOLUTION_PRODUCTS, STATS } from "./site";

// Формы данных живут в content-types.ts (их импортируют и клиентские
// компоненты); отсюда — реэкспорт, чтобы страницам хватало одного импорта.
export type {
  SiteContacts,
  SiteProcessStep,
  SiteSolution,
  SiteStat,
  SolutionExample,
} from "./content-types";

// ---------------------------------------------------------------------------
// Теги кэша и время жизни
// ---------------------------------------------------------------------------

/**
 * Теги кэша контента.
 *
 * Их же сбрасывают серверные экшены админки, поэтому список должен быть
 * ровно один на всё приложение — отсюда и импортируется в обе стороны.
 */
export const CONTENT_TAGS = {
  products: "products",
  articles: "articles",
  solutions: "solutions",
  settings: "settings",
  faq: "faq",
} as const;

export type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS];

/**
 * Фоновая ревалидация — 5 минут.
 *
 * Точечные правки прилетают мгновенно через сброс тега из админки, поэтому
 * таймер нужен только как страховка: он подхватывает изменения, сделанные в
 * обход панели (сид, прямая правка в базе) и поднимает страницы, отрисованные
 * на фолбэке, когда API снова заработал. unstable_cache пробрасывает это
 * значение в revalidate самой страницы, так что маршруты становятся ISR.
 */
const REVALIDATE_SECONDS = 300;

/** Зависший API не должен держать рендер страницы. */
const API_TIMEOUT_MS = 4000;

/**
 * Укороченное ожидание, пока API считается лежачим.
 *
 * Ресурсы независимы: страница может успеть спросить контакты, направления и
 * статьи, и на молчащем сервере каждый промах кэша стоил бы полного таймаута.
 * После первого сетевого сбоя остальные обращения ждут заметно меньше —
 * живой сервер отвечает за десятки миллисекунд, так что порога хватает
 * с запасом, а зависший отваливается почти сразу.
 */
const API_RETRY_TIMEOUT_MS = 800;

/**
 * Пауза после неудачного обращения к API.
 *
 * Отрицательный результат нигде не кэшируется (и правильно — иначе фолбэк
 * «залипал» бы), но и ходить в лежачий API на каждый рендер незачем: при
 * зависшем сервере это ровно +4 с к каждой странице. Поэтому ресурс, который
 * только что не ответил, короткое время отдаётся сразу со статики.
 *
 * Пауза взводится ТОЛЬКО когда unstable_cache реально вызвал загрузчик, то
 * есть при промахе кэша: на устаревшей записи Next сам возвращает прошлое
 * значение и до нашего catch дело не доходит. Значит, пропуск обращения не
 * может «съесть» живые данные из кэша — их там в этот момент нет. По той же
 * причине пауза именно поресурсная: общий на весь API «выключатель» отменял бы
 * и те чтения, которые обслужил бы кэш, ничего не спрашивая у сервера.
 *
 * Обратная сторона: после того как API подняли, сайт замечает это не мгновенно,
 * а в пределах этого окна. Состояние живёт в памяти процесса.
 */
const FAILURE_COOLDOWN_MS = 10_000;

/** Каталог и блог заведомо меньше; 200 — с запасом (потолок API — 500). */
const PAGE_LIMIT = 200;

/** До какого момента API считается недоступным (общее состояние процесса). */
let apiDownUntil = 0;

/**
 * Сколько ждать ответа сейчас.
 *
 * Значение читается в момент вызова, а не запекается в замыкание, поэтому
 * ключ кэша `unstable_cache` (он считается по исходнику функции) не меняется.
 */
function currentTimeoutMs(): number {
  return Date.now() < apiDownUntil ? API_RETRY_TIMEOUT_MS : API_TIMEOUT_MS;
}

// ---------------------------------------------------------------------------
// Фолбэк
// ---------------------------------------------------------------------------

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.isNetworkError ? "API недоступен" : `API ответил ошибкой ${error.status}`;
  }
  if (error instanceof Error) return error.message;
  return "неизвестная ошибка";
}

/**
 * Возврат к статическим данным. Пишем в серверный лог: молчаливый фолбэк —
 * это сайт, который «работает», но месяцами показывает данные из сборки.
 */
function fallback<T>(resource: string, reason: string, value: T): T {
  console.warn(`[content] ${resource}: показываем статические данные — ${reason}`);
  return value;
}

// ---------------------------------------------------------------------------
// Приведение к публичным типам
// ---------------------------------------------------------------------------

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/**
 * Галерея товара из ответа API.
 *
 * Порядок из базы сохраняется — это порядок показа, заданный в панели.
 * Разбор терпим к обоим форматам: и к новому (`[{ src, alt }]`), и к старому
 * (`["/путь"]`) у товаров, сохранённых до появления описаний. Обложка обязана
 * быть в наборе (это гарантирует API), но у товаров, созданных до появления
 * галереи, поля может не быть вовсе — тогда галерея собирается из одной
 * обложки. Внешние адреса отбрасываются: `next/image` на чужом хосте бросает
 * исключение и роняет страницу целиком.
 */
function toGallery(value: unknown, cover: string, name: string): GalleryImage[] {
  const images = toGalleryImages(value, name);

  // Обложку показывают карточка каталога и метаданные страницы товара,
  // поэтому в галерее она быть обязана: если её там нет — ставим первой.
  const path = cover.trim();
  if (isLocalImagePath(path) && !images.some((image) => image.src === path)) {
    images.unshift({ src: path, alt: name });
  }

  return images;
}

/** Товар админки → `Product` каталога. */
function toProduct(item: AdminProduct): Product {
  return {
    // В статических данных id — человекочитаемый ключ; в базе он лежит в slug.
    id: item.slug || item.id,
    name: item.name,
    image: item.image,
    // Галерея: только локальные пути (внешний адрес роняет next/image), с
    // обложкой в наборе. У товаров, созданных до появления галереи, поля
    // может не быть вовсе — тогда галерея это одна обложка.
    images: toGallery(item.images, item.image, item.name),
    purpose: item.purpose,
    // В базе тип, режим эксплуатации и опции — свободные строки, а справочники
    // фильтров остаются в catalog.ts. Незнакомое значение просто не совпадёт
    // ни с одним фильтром, но товар из каталога не пропадёт.
    type: item.type as ProductType,
    tags: strings(item.tags),
    exploitation: item.exploitation as Exploitation,
    options: strings(item.options) as ProductOption[],
    size: item.size,
    individual: Boolean(item.individual),
    description: item.description,
    complectation: strings(item.complectation),
  };
}

/** ISO-дата из базы → «ГГГГ-ММ-ДД», как в статических статьях. */
function toDateOnly(value: string): string {
  if (!value) return "";
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value);
  return match ? match[0] : value;
}

function toArticle(item: AdminArticle): BlogArticle {
  return {
    slug: item.slug,
    title: item.title,
    description: item.description,
    excerpt: item.excerpt,
    image: item.image,
    imageAlt: item.imageAlt,
    publishedAt: toDateOnly(item.publishedAt),
    updatedAt: toDateOnly(item.updatedAt),
    readingTime: item.readingTime,
    keywords: strings(item.keywords),
    intro: strings(item.intro),
    // `sections` лежит в jsonb, то есть формально это «что угодно»: там может
    // быть и блочный формат, и старые секции статей, созданных до перехода на
    // блоки. Конвертер разбирает оба и отбрасывает мусор.
    sections: toArticleBlocks(item.sections),
  };
}

// ---------------------------------------------------------------------------
// Направления, контакты, цифры, этапы
// ---------------------------------------------------------------------------

const STATIC_SOLUTIONS: SiteSolution[] = SOLUTIONS.map((solution) => ({
  id: solution.id,
  icon: solution.icon,
  label: solution.label,
  kicker: solution.kicker,
  title: solution.title,
  description: solution.description,
  bullets: [...solution.bullets],
  products: (SOLUTION_PRODUCTS[solution.id] ?? []).map((product) => ({
    name: product.name,
    image: product.image,
  })),
}));

const STATIC_CONTACTS: SiteContacts = {
  phones: [...CONTACTS.phones],
  telegram: CONTACTS.telegram,
  max: CONTACTS.max,
  email: CONTACTS.email,
  address: CONTACTS.address,
};

const STATIC_STATS: SiteStat[] = STATS.map((stat) => ({ ...stat }));
const STATIC_PROCESS: SiteProcessStep[] = PROCESS.map((step) => ({ ...step }));

/** Счётчики аналитики: номера существуют только в базе, эталона в коде нет. */
export type SiteAnalyticsSettings = {
  yandexMetrikaId: string | null;
  googleAnalyticsId: string | null;
};

/** Адреса для уведомлений о заявке. Токен бота сюда не попадает — он секрет. */
export type LeadDeliverySettings = {
  /** Получатели в Telegram «как есть» из jsonb: разбирает lead-delivery. */
  telegramChats: unknown[];
  /** УСТАРЕЛО: одиночный получатель, работает только при пустом списке. */
  telegramChatId: string | null;
  email: string | null;
};

const EMPTY_ANALYTICS: SiteAnalyticsSettings = {
  yandexMetrikaId: null,
  googleAnalyticsId: null,
};

// Настройки индексации живут в robots-rules.ts вместе с форматом файла:
// туда же ходят и роут /robots.txt, и предпросмотр в панели.

const EMPTY_LEAD_DELIVERY: LeadDeliverySettings = {
  telegramChats: [],
  telegramChatId: null,
  email: null,
};

function toSolution(item: AdminSolution): SiteSolution {
  return {
    id: item.key || item.id,
    icon: item.icon,
    label: item.label,
    kicker: item.kicker,
    title: item.title,
    description: item.description,
    bullets: strings(item.bullets),
    products: (item.products ?? []).map((product) => ({
      name: product.name,
      image: product.image,
    })),
  };
}

// ---------------------------------------------------------------------------
// Кэшированные запросы
// ---------------------------------------------------------------------------
//
// Внутри unstable_cache сидит «сырой» запрос: если он бросит исключение,
// в кэш не попадёт НИЧЕГО — ошибка не «залипнет» на время ревалидации, и
// следующий запрос попробует API снова. Фолбэк живёт снаружи кэша по той же
// причине: закэшировать статические данные под тегом означало бы не показать
// настоящие даже после того, как API поднялся.

const loadProducts = unstable_cache(
  async (): Promise<AdminProduct[]> => {
    const data = await apiFetch<Paginated<AdminProduct>>("/api/products", {
      query: { limit: PAGE_LIMIT },
      timeoutMs: currentTimeoutMs(),
    });
    return data?.items ?? [];
  },
  ["content", "products"],
  { tags: [CONTENT_TAGS.products], revalidate: REVALIDATE_SECONDS },
);

const loadArticles = unstable_cache(
  async (): Promise<AdminArticle[]> => {
    const data = await apiFetch<Paginated<AdminArticle>>("/api/articles", {
      query: { limit: PAGE_LIMIT },
      timeoutMs: currentTimeoutMs(),
    });
    return data?.items ?? [];
  },
  ["content", "articles"],
  { tags: [CONTENT_TAGS.articles], revalidate: REVALIDATE_SECONDS },
);

const loadFaq = unstable_cache(
  async (): Promise<AdminFaqItem[]> => {
    const data = await apiFetch<Paginated<AdminFaqItem>>("/api/faq", {
      query: { limit: PAGE_LIMIT },
      timeoutMs: currentTimeoutMs(),
    });
    return data?.items ?? [];
  },
  ["content", "faq"],
  { tags: [CONTENT_TAGS.faq], revalidate: REVALIDATE_SECONDS },
);

const loadSolutions = unstable_cache(
  async (): Promise<AdminSolution[]> => {
    const data = await apiFetch<Paginated<AdminSolution>>("/api/solutions", {
      query: { limit: PAGE_LIMIT },
      timeoutMs: currentTimeoutMs(),
    });
    return data?.items ?? [];
  },
  ["content", "solutions"],
  { tags: [CONTENT_TAGS.solutions], revalidate: REVALIDATE_SECONDS },
);

/**
 * Контакты, цифры и этапы отдаются одним эндпоинтом — и кэшируются вместе.
 *
 * Ключ сайта нужен не для чтения контактов (они публичные), а для получателей
 * уведомлений о заявках: анониму API их не отдаёт, иначе почта и chat_id
 * сотрудников были бы доступны любому запросом без токена. Без ключа сайт
 * продолжит работать — просто доставка возьмёт запасные значения из окружения.
 */
const loadSettings = unstable_cache(
  async (): Promise<SettingsResponse> => {
    const siteKey = process.env.ADMIN_SITE_API_KEY?.trim();
    return apiFetch<SettingsResponse>("/api/settings", {
      timeoutMs: currentTimeoutMs(),
      headers: siteKey ? { "x-api-key": siteKey } : undefined,
    });
  },
  ["content", "settings"],
  { tags: [CONTENT_TAGS.settings], revalidate: REVALIDATE_SECONDS },
);

// ---------------------------------------------------------------------------
// Дедупликация в пределах одного рендера + пауза после сбоя
// ---------------------------------------------------------------------------
//
// Один ресурс запрашивается за рендер один раз. Без этого `getContacts()`
// уходил в API трижды (корневой layout, футер, сама страница), и на зависшем
// сервере таймауты складывались: страница отдавалась 8–12 с вместо 4.
// `React.cache` — штатный для этой версии Next способ дедупликации не-fetch
// запросов, см. node_modules/next/dist/docs/01-app/01-getting-started/
// 06-fetching-data.md, раздел «Sharing data with context and React.cache».
// Мемоизируется и отказ, поэтому повторный вызов в том же рендере не платит
// второй таймаут.

const readProducts = cache(loadProducts);
const readArticles = cache(loadArticles);
const readSolutions = cache(loadSolutions);
const readSettings = cache(loadSettings);

/** До какого момента ресурс считается неотвечающим. Ключ — тег кэша. */
const unavailableUntil = new Map<ContentTag, number>();

function coolingDown(resource: ContentTag): boolean {
  const until = unavailableUntil.get(resource);
  if (until === undefined) return false;
  if (until <= Date.now()) {
    unavailableUntil.delete(resource);
    return false;
  }
  return true;
}

type Attempt<T> = { ok: true; value: T } | { ok: false; reason: string };

/** Одна попытка чтения — с учётом паузы после недавнего сбоя. */
async function attempt<T>(resource: ContentTag, load: () => Promise<T>): Promise<Attempt<T>> {
  if (coolingDown(resource)) {
    return { ok: false, reason: `API не ответил менее ${FAILURE_COOLDOWN_MS / 1000} с назад` };
  }

  try {
    const value = await load();
    unavailableUntil.delete(resource);
    // Ответ получен — снимаем режим укороченного ожидания.
    apiDownUntil = 0;
    return { ok: true, value };
  } catch (error) {
    unavailableUntil.set(resource, Date.now() + FAILURE_COOLDOWN_MS);
    // Сеть не ответила — значит, лежит весь API, а не один эндпоинт: остальные
    // ресурсы в этом же рендере не должны ждать полный таймаут каждый.
    if (error instanceof ApiError && error.isNetworkError) {
      apiDownUntil = Date.now() + FAILURE_COOLDOWN_MS;
    }
    return { ok: false, reason: describeError(error) };
  }
}

// ---------------------------------------------------------------------------
// Публичное API модуля
// ---------------------------------------------------------------------------
//
// Геттеры тоже обёрнуты в `React.cache`: страница, которая читает контакты и в
// layout, и в футере, разбирает ответ один раз.

/** Каталог: только опубликованные товары, в порядке сортировки из админки. */
export const getProducts = cache(async (): Promise<Product[]> => {
  const result = await attempt(CONTENT_TAGS.products, readProducts);
  if (!result.ok) return fallback("catalog", result.reason, PRODUCTS);
  if (result.value.length === 0) {
    return fallback("catalog", "API вернул пустой каталог", PRODUCTS);
  }
  return result.value.map(toProduct);
});

/**
 * Товар по slug. null — товара нет (страница обязана отдать 404).
 *
 * Ищем в общем списке ровно по тем же причинам, что и статью блога: список уже
 * закэширован под тегом `products`, поэтому товар, заведённый в панели после
 * сборки, открывается по своему адресу сразу, а отдельный кэш на каждый slug
 * пришлось бы сбрасывать поимённо — включая ещё не существовавшие адреса.
 *
 * Публичный список API отдаёт только опубликованные товары, так что снятый с
 * публикации товар исчезает отсюда сам и его страница отдаёт 404.
 *
 * Slug статических товаров лежит в `id` (см. `toProduct`: в базе он в `slug`,
 * а публичный тип у обоих источников один).
 */
export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.id === slug) ?? null;
}

/** Статьи блога: только опубликованные, в порядке из админки. */
export const getArticles = cache(async (): Promise<BlogArticle[]> => {
  const result = await attempt(CONTENT_TAGS.articles, readArticles);
  if (!result.ok) return fallback("blog", result.reason, BLOG_ARTICLES);
  if (result.value.length === 0) {
    return fallback("blog", "API вернул пустой блог", BLOG_ARTICLES);
  }
  return result.value.map(toArticle);
});

/**
 * Статья по slug. null — статьи нет (страница обязана отдать 404).
 *
 * Ищем в общем списке, а не отдельным запросом: список уже закэширован под
 * тегом `articles`, и статья, созданная в админке, появляется здесь сразу
 * после сброса тега — отдельный кэш на каждый slug пришлось бы сбрасывать
 * поимённо, включая ещё не существовавшие адреса.
 */
export async function getArticle(slug: string): Promise<BlogArticle | null> {
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}

/** Направления блока «Решения по задачам» с товарами-примерами. */
export const getSolutions = cache(async (): Promise<SiteSolution[]> => {
  const result = await attempt(CONTENT_TAGS.solutions, readSolutions);
  if (!result.ok) return fallback("solutions", result.reason, STATIC_SOLUTIONS);
  if (result.value.length === 0) {
    return fallback("solutions", "API вернул пустой список направлений", STATIC_SOLUTIONS);
  }

  // Пустой список примеров у направления — законное состояние, а не сбой:
  // администратор мог удалить все товары намеренно. Раньше сюда подставлялись
  // статические примеры того же направления, и удалённые товары возвращались
  // на сайт сами; блок «Решения по задачам» теперь рисует для пустого списка
  // осмысленную заглушку, поэтому подмена не нужна.
  return result.value.map(toSolution);
});

/**
 * Контакты. Фолбэк здесь пофайловый: пустое поле в базе (телефоны стёрли,
 * почту не заполнили) не должно превращаться в пустую строку в шапке.
 */
export const getContacts = cache(async (): Promise<SiteContacts> => {
  const result = await attempt(CONTENT_TAGS.settings, readSettings);
  if (!result.ok) return fallback("contacts", result.reason, STATIC_CONTACTS);

  const settings = result.value.settings;
  // Пустые строки отсеиваем: пробел, оставленный в поле «Телефоны», не должен
  // доехать до вёрстки как телефон.
  const phones = strings(settings?.phones)
    .map((phone) => phone.trim())
    .filter(Boolean);

  return {
    phones: phones.length > 0 ? phones : STATIC_CONTACTS.phones,
    telegram: settings?.telegram?.trim() || STATIC_CONTACTS.telegram,
    max: settings?.max?.trim() || STATIC_CONTACTS.max,
    email: settings?.email?.trim() || STATIC_CONTACTS.email,
    address: settings?.address?.trim() || STATIC_CONTACTS.address,
  };
});

/** Цифры доверия. Переносы строк в подписи значимы. */
export const getStats = cache(async (): Promise<SiteStat[]> => {
  const result = await attempt(CONTENT_TAGS.settings, readSettings);
  if (!result.ok) return fallback("stats", result.reason, STATIC_STATS);

  const stats = result.value.stats;
  if (!stats || stats.length === 0) {
    return fallback("stats", "API вернул пустой список цифр", STATIC_STATS);
  }
  return stats.map((stat) => ({ value: stat.value, label: stat.label, icon: stat.icon }));
});

/**
 * Вопросы и ответы: блок на главной, страница `/faq` и разметка FAQPage.
 *
 * Пустой список трактуется как сбой и подменяется эталоном из кода — по той же
 * причине, что и у каталога: чаще это недоступный API, чем намеренно пустой
 * раздел. Снять вопрос с сайта можно, сняв его с публикации в панели.
 */
export const getFaqItems = cache(async (): Promise<FaqItem[]> => {
  const result = await attempt(CONTENT_TAGS.faq, loadFaq);
  if (!result.ok) return fallback("faq", result.reason, FAQ_ITEMS);

  const items = result.value;
  if (items.length === 0) {
    return fallback("faq", "API вернул пустой список вопросов", FAQ_ITEMS);
  }

  return items.map((item) => ({
    q: item.question,
    a: item.answer,
    // Поле появилось позже остальных: у записей, сохранённых до него, значения
    // может не быть — считаем такие вопросы показываемыми на главной.
    showOnHome: item.showOnHome !== false,
  }));
});

/**
 * Счётчики аналитики из настроек панели.
 *
 * Фолбэк здесь — ПУСТО, а не значение из кода: номер счётчика существует
 * только в базе, придумывать его неоткуда. Недоступный API означает страницу
 * без счётчиков, но не сломанную страницу.
 */
export const getAnalytics = cache(async (): Promise<SiteAnalyticsSettings> => {
  const result = await attempt(CONTENT_TAGS.settings, readSettings);
  if (!result.ok) return fallback("analytics", result.reason, EMPTY_ANALYTICS);

  const settings = result.value.settings;
  return {
    yandexMetrikaId: settings?.yandexMetrikaId?.trim() || null,
    googleAnalyticsId: settings?.googleAnalyticsId?.trim() || null,
  };
});

/**
 * Куда сообщать о заявке (см. src/lib/lead-delivery.ts).
 *
 * Токена бота здесь нет и быть не может: он секрет и живёт только в
 * окружении сайта. Фолбэк — пусто: доставка тогда возьмёт запасные значения
 * из переменных окружения.
 */
export const getLeadDelivery = cache(async (): Promise<LeadDeliverySettings> => {
  const result = await attempt(CONTENT_TAGS.settings, readSettings);
  if (!result.ok) return fallback("lead-delivery", result.reason, EMPTY_LEAD_DELIVERY);

  const settings = result.value.settings;
  return {
    // Разбор и проверку получателей делает сама доставка: здесь важно только
    // не потерять список и не уронить приём заявки, если в jsonb мусор.
    telegramChats: Array.isArray(settings?.leadTelegramChats) ? settings.leadTelegramChats : [],
    telegramChatId: settings?.leadTelegramChatId?.trim() || null,
    email: settings?.leadEmail?.trim() || null,
  };
});

/**
 * Настройки индексации: главный выключатель и дополнительные запреты.
 *
 * ФОЛБЭК ЗДЕСЬ РАЗРЕШАЮЩИЙ, и это не описка. У остальных настроек фолбэк —
 * «как в коде» или «пусто», а здесь цена ошибки несимметрична: лишний день
 * обхода при недоступном API не стоит ничего, а случайный `Disallow: /`
 * выбивает сайт из выдачи на недели. Поэтому любой сбой чтения означает
 * «индексация разрешена», ровно как было до появления настройки.
 *
 * Поля читаются терпимо: пока бэкенд их не отдаёт (или в базе мусор),
 * получается то же разрешающее состояние, а не падение страницы.
 */
export const getRobots = cache(async (): Promise<RobotsSettings> => {
  const result = await attempt(CONTENT_TAGS.settings, readSettings);
  if (!result.ok) return fallback("robots", result.reason, DEFAULT_ROBOTS);

  const settings = result.value.settings;
  return {
    // Закрыт сайт только при ЯВНОМ false. undefined (поля ещё нет) и любое
    // другое значение — «разрешено», см. про несимметричную цену выше.
    indexing: settings?.robotsIndexing !== false,
    disallow: toDisallowPaths(settings?.robotsDisallow),
  };
});

/** Этапы работы. Переносы строк в названии значимы. */
export const getProcessSteps = cache(async (): Promise<SiteProcessStep[]> => {
  const result = await attempt(CONTENT_TAGS.settings, readSettings);
  if (!result.ok) return fallback("process", result.reason, STATIC_PROCESS);

  const process = result.value.process;
  if (!process || process.length === 0) {
    return fallback("process", "API вернул пустой список этапов", STATIC_PROCESS);
  }
  return process.map((step) => ({ n: step.n, title: step.title }));
});
