import { headers } from "next/headers";

/**
 * Защита входа в панель от подбора логина и пароля.
 *
 * ПОЧЕМУ ЗДЕСЬ, А НЕ ТОЛЬКО В API. Форма входа отправляется в server action, и
 * дальше сайт сам зовёт REST API уже со своего сервера. До API клиентский адрес
 * не доходит — он видит один и тот же IP для всех посетителей. Поэтому его
 * ограничитель на практике работает как общий счётчик: перебор с чужого адреса
 * не тормозится персонально, а исчерпать счётчик и лишить входа настоящего
 * администратора может кто угодно. Реальный адрес виден только здесь.
 *
 * Ограничитель на API при этом остаётся — он прикрывает случай, когда кто-то
 * стучится в API напрямую, в обход сайта.
 *
 * Счётчики живут в памяти процесса: перезапуск сбрасывает их, а при нескольких
 * воркерах каждый считает свои. Для панели одного сайта этого достаточно;
 * если появится несколько инстансов, счётчики надо выносить в общее хранилище.
 */

const WINDOW_MS = 15 * 60 * 1000;

/** Порог по адресу: с одного IP редко ошибаются больше десяти раз подряд. */
const MAX_FAILURES_PER_IP = 10;

/**
 * Порог по логину — отдельно и строже по смыслу: он ловит распределённый
 * перебор одной учётной записи с разных адресов, который счётчик по IP
 * пропускает.
 */
const MAX_FAILURES_PER_LOGIN = 20;

type Attempt = { failures: number[]; };

const byIp = new Map<string, Attempt>();
const byLogin = new Map<string, Attempt>();

function prune(map: Map<string, Attempt>, key: string, now: number): number[] {
  const recent = (map.get(key)?.failures ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length === 0) {
    map.delete(key);
    return [];
  }
  map.set(key, { failures: recent });
  return recent;
}

/** Чтобы карты не росли бесконечно на долгоживущем процессе. */
function sweep(map: Map<string, Attempt>, now: number) {
  if (map.size < 5000) return;
  for (const [key, attempt] of map) {
    if (attempt.failures.every((time) => now - time >= WINDOW_MS)) map.delete(key);
  }
}

/**
 * Адрес клиента. За обратным прокси берётся из заголовка — nginx на проде
 * обязан формировать его из `$remote_addr`, а не дописывать к присланному
 * клиентом (иначе значение подделывается и защита обходится). Требование
 * зафиксировано в docs/DEPLOY.md.
 */
async function clientIp(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return store.get("x-real-ip") ?? "unknown";
}

export type LoginGuardVerdict =
  | { blocked: false }
  | { blocked: true; retryAfterSeconds: number };

/** Проверка перед попыткой входа. */
export async function checkLoginAllowed(login: string): Promise<LoginGuardVerdict> {
  const now = Date.now();
  const ip = await clientIp();
  const loginKey = login.toLowerCase();

  const ipFailures = prune(byIp, ip, now);
  const loginFailures = prune(byLogin, loginKey, now);

  const blockedUntil = Math.max(
    ipFailures.length >= MAX_FAILURES_PER_IP ? Math.min(...ipFailures) + WINDOW_MS : 0,
    loginFailures.length >= MAX_FAILURES_PER_LOGIN ? Math.min(...loginFailures) + WINDOW_MS : 0,
  );

  if (blockedUntil > now) {
    return { blocked: true, retryAfterSeconds: Math.ceil((blockedUntil - now) / 1000) };
  }
  return { blocked: false };
}

/** Неудачная попытка — засчитываем обоим счётчикам. */
export async function registerFailedLogin(login: string): Promise<void> {
  const now = Date.now();
  const ip = await clientIp();
  const loginKey = login.toLowerCase();

  byIp.set(ip, { failures: [...prune(byIp, ip, now), now] });
  byLogin.set(loginKey, { failures: [...prune(byLogin, loginKey, now), now] });

  sweep(byIp, now);
  sweep(byLogin, now);

  // Событие безопасности: по логу видно и сам факт подбора, и его источник.
  console.warn(
    `[admin] неудачный вход: логин «${loginKey}», адрес ${ip}, попыток с адреса ${byIp.get(ip)?.failures.length ?? 0}`,
  );
}

/** Успешный вход снимает накопленные неудачи — иначе он ничего не значил бы. */
export async function clearLoginFailures(login: string): Promise<void> {
  const ip = await clientIp();
  byIp.delete(ip);
  byLogin.delete(login.toLowerCase());
}

/** Текст отказа: без деталей о том, существует ли учётная запись. */
export function blockedMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Слишком много неудачных попыток входа. Повторите через ${minutes} мин.`;
}
