// Типы ответов REST API админки (react-project-admin-back).
// Даты приходят строками ISO — Prisma сериализует их через JSON.

/**
 * Результат server action. Ошибку возвращаем значением, а не исключением:
 * форма остаётся смонтированной, введённые данные не теряются, а текст
 * ошибки от API показывается пользователю дословно.
 */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type Paginated<T> = { items: T[]; pagination: Pagination };

export type AdminRole = "SUPERADMIN" | "USER";

export type AdminUser = {
  id: string;
  email: string;
  login: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = { user: AdminUser; token: string };

// ---------------------------------------------------------------------------
// Заявки
// ---------------------------------------------------------------------------

export const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "SPAM"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Обработана",
  SPAM: "Спам",
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  comment: string | null;
  source: string | null;
  page: string | null;
  utm: string | null;
  ip: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type LeadsResponse = Paginated<Lead> & {
  counts: Record<LeadStatus, number>;
};

// ---------------------------------------------------------------------------
// Каталог
// ---------------------------------------------------------------------------

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  /** Обложка. Всегда входит в `images`. */
  image: string;
  /**
   * Все фотографии товара в порядке показа, включая обложку: `{ src, alt }`.
   * Типизировано как `unknown[]` намеренно — у товаров, сохранённых до
   * появления описаний, тут могут лежать голые строки. Разбирает и то и
   * другое `toGalleryImages` (src/lib/media.ts).
   */
  images: unknown[];
  purpose: string;
  type: string;
  tags: string[];
  exploitation: string;
  options: string[];
  size: string;
  individual: boolean;
  description: string;
  complectation: string[];
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Блог
// ---------------------------------------------------------------------------

export type AdminArticle = {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  keywords: string[];
  intro: string[];
  /**
   * Тело статьи из колонки jsonb: массив блоков ({ id, type, … }) либо, у
   * статей, созданных до перехода на блоки, массив старых секций
   * ({ id, title, paragraphs?, bullets?, table? }). Типизировано как `unknown[]`
   * намеренно: разбирает и то и другое `toArticleBlocks` (src/lib/blog-blocks.ts).
   */
  sections: unknown[];
  published: boolean;
  sortOrder: number;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Направления
// ---------------------------------------------------------------------------

export type AdminSolutionProduct = {
  id: string;
  name: string;
  image: string;
  sortOrder: number;
};

export type AdminSolution = {
  id: string;
  key: string;
  icon: string;
  label: string;
  kicker: string;
  title: string;
  description: string;
  bullets: string[];
  sortOrder: number;
  published: boolean;
  products: AdminSolutionProduct[];
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Контакты и настройки
// ---------------------------------------------------------------------------

export type AdminSiteSettings = {
  id: string;
  phones: string[];
  telegram: string | null;
  max: string | null;
  email: string | null;
  address: string | null;

  // --- Счётчики аналитики (таб «Настройка метрик») -------------------------
  /** Номер счётчика Яндекс.Метрики: только цифры. Пусто = не подключать. */
  yandexMetrikaId: string | null;
  /** Идентификатор GA4 вида «G-XXXXXXXXXX». Пусто = не подключать. */
  googleAnalyticsId: string | null;

  // --- Доставка заявок (таб «Настройка заявок») ----------------------------
  /**
   * Получатели уведомлений в Telegram: `[{ chatId, label }]` из колонки jsonb.
   * Типизировано как `unknown[]` намеренно — в jsonb может лежать что угодно
   * (правка напрямую в базе, данные старой версии). Разбирает
   * `toTelegramChats` (src/lib/telegram-chats.ts).
   */
  leadTelegramChats: unknown[];

  /**
   * УСТАРЕЛО: одиночный получатель. Остался запасным вариантом на время
   * рассинхрона выкатки и в интерфейсе панели не показывается. Порядок выбора
   * при доставке: `leadTelegramChats` (если непуст) → это поле → переменная
   * окружения `TELEGRAM_CHAT_ID`. Новый код пишет только в `leadTelegramChats`.
   */
  leadTelegramChatId: string | null;
  /** Адрес для уведомлений о заявках. Отправка почты пока не реализована. */
  leadEmail: string | null;

  // --- robots.txt (таб «Индексация») --------------------------------------
  /**
   * Главный выключатель индексации. `false` — сайт целиком закрывается от
   * поисковиков: `Disallow: /` в robots.txt и `noindex` в метаданных.
   *
   * Поля помечены необязательными намеренно: они появились позже остальных,
   * и версия API без них — законное состояние на время выкатки. Читать их
   * надо через `getRobots` (src/lib/content.ts), где отсутствие значит
   * «индексация разрешена».
   */
  robotsIndexing?: boolean;

  /**
   * Дополнительные запрещённые пути от владельца. Служебных запретов
   * (`/api/`, `/admin`) здесь НЕТ: они зашиты в коде сайта
   * (`src/lib/robots-rules.ts`), чтобы не зависеть от содержимого базы.
   */
  robotsDisallow?: string[];

  // ВНИМАНИЕ: токена Telegram-бота здесь нет и быть не должно — он секрет и
  // живёт в .env сайта (TELEGRAM_BOT_TOKEN). База уезжает в резервные копии.
};

export type AdminFaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  /** Показывать на сайте вообще. Снятый флаг убирает вопрос отовсюду. */
  published: boolean;
  /** Показывать в блоке на главной. Снятый — вопрос остаётся только на /faq. */
  showOnHome: boolean;
};

export type AdminStat = {
  id: string;
  value: string;
  label: string;
  icon: string;
  sortOrder: number;
};

export type AdminProcessStep = {
  id: string;
  n: string;
  title: string;
  sortOrder: number;
};

export type SettingsResponse = {
  settings: AdminSiteSettings;
  stats: AdminStat[];
  process: AdminProcessStep[];
};

// ---------------------------------------------------------------------------
// Медиатека
// ---------------------------------------------------------------------------

export type AdminMedia = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  /** BigInt приходит строкой (BigInt.prototype.toJSON на бэке). */
  size: string | number;
  width: number | null;
  height: number | null;
  alt: string | null;
  createdAt: string;
};
