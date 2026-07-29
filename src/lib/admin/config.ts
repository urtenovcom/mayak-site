// Константы админки. Файл нарочно без побочных эффектов: его импортируют
// и серверные модули, и `proxy.ts`.

/**
 * Адрес REST API админки.
 *
 * Переменная НЕ имеет префикса NEXT_PUBLIC_ и потому недоступна браузеру:
 * все обращения к API идут только с сервера (server components / actions /
 * route handlers), клиент ходит исключительно на свой домен.
 */
export const ADMIN_API_URL = (
  process.env.ADMIN_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

/** httpOnly-cookie с JWT. Значение продублировано в `src/proxy.ts` (см. комментарий там). */
export const ADMIN_TOKEN_COOKIE = "mayak_admin_token";

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin/leads";

/** JWT от API живёт 10 дней (app/auth/generate-token.js) — cookie не должна жить дольше. */
export const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 24 * 10;

/**
 * Сообщение для учётной записи без прав администратора.
 * Живёт здесь, а не в actions.ts: из файла с "use server" можно
 * экспортировать только async-функции.
 */
export const ROLE_ERROR =
  "Вход в панель разрешён только администратору (роль SUPERADMIN). Обратитесь к владельцу сайта.";

/** Управляющие символы нельзя пускать в заголовок Location — это его расщепление. */
function hasControlChars(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/**
 * Куда вернуть пользователя после входа.
 *
 * Разрешён только собственный раздел админки. Проверка намеренно строгая:
 * префикс `/admin` без слэша пропускал бы `/admin.evil.example/x`, а без
 * запрета `..` — `/admin/../../evil`.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return ADMIN_HOME_PATH;

  // Только относительный путь от корня: ни схемы, ни протокол-относительного
  // «//host», ни обратных слэшей (часть браузеров нормализует их в «/»).
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return ADMIN_HOME_PATH;
  }
  if (hasControlChars(value)) return ADMIN_HOME_PATH;

  const pathname = value.split(/[?#]/)[0];

  // Ровно `/admin` или что-то внутри `/admin/`; `/admin.evil.example` — нет.
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return ADMIN_HOME_PATH;

  // Любые `..` в сегментах — отказ, нормализацией не занимаемся.
  if (pathname.split("/").some((segment) => segment === "..")) return ADMIN_HOME_PATH;

  if (pathname === ADMIN_LOGIN_PATH) return ADMIN_HOME_PATH;

  return value;
}

/** Ссылка на страницу входа с сохранением запрошенного адреса. */
export function loginUrl(nextPath?: string | null): string {
  if (!nextPath || nextPath === ADMIN_HOME_PATH) return ADMIN_LOGIN_PATH;
  return `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`;
}
