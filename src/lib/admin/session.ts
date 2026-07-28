// Сессия админки: JWT живёт в httpOnly-cookie и в клиентский JS не попадает.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "./api";
import {
  ADMIN_TOKEN_COOKIE,
  ADMIN_TOKEN_MAX_AGE,
  loginUrl,
} from "./config";
import type { AdminUser, LoginResponse } from "./types";

export async function readToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
}

/** Записывает токен. Вызывать можно только из server action / route handler. */
export async function writeToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_TOKEN_MAX_AGE,
  });
}

export async function dropToken(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_TOKEN_COOKIE);
}

// ---------------------------------------------------------------------------
// Подтверждение сессии
// ---------------------------------------------------------------------------

export type AdminSession = { token: string; user: AdminUser };

export type SessionResult =
  /** Токен валиден, роль подходит. */
  | { status: "ok"; session: AdminSession }
  /** Токена нет, он протух или отозван — нужен вход. */
  | { status: "unauthenticated" }
  /** Токен валиден, но роль не SUPERADMIN — в панель пускать нельзя. */
  | { status: "forbidden"; user: AdminUser }
  /** До API не дозвонились: сервер не запущен или сеть недоступна. */
  | { status: "unavailable"; message: string };

/**
 * Кэш подтверждённых токенов.
 *
 * Нужен из-за `/admin/uploads/*`: каждая картинка — отдельный HTTP-запрос,
 * и без кэша один экран медиатеки давал бы десятки обращений к
 * `/api/users/profile`. TTL короткий, чтобы отзыв доступа применялся быстро.
 */
const VERIFY_TTL_MS = 30_000;
const verified = new Map<string, { expiresAt: number; user: AdminUser }>();

function readCache(token: string): AdminUser | null {
  const hit = verified.get(token);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    verified.delete(token);
    return null;
  }
  return hit.user;
}

function writeCache(token: string, user: AdminUser): void {
  // Кэш живёт в памяти процесса — не даём ему расти бесконечно.
  if (verified.size > 200) verified.clear();
  verified.set(token, { expiresAt: Date.now() + VERIFY_TTL_MS, user });
}

function classify(token: string, user: AdminUser): SessionResult {
  return user.role === "SUPERADMIN"
    ? { status: "ok", session: { token, user } }
    : { status: "forbidden", user };
}

/**
 * Подтверждает токен у API и проверяет роль.
 *
 * Ошибки не бросает — возвращает значением, чтобы вызывающий код показал
 * пользователю нормальный экран вместо системного «500».
 */
export async function getSession(): Promise<SessionResult> {
  const token = await readToken();
  if (!token) return { status: "unauthenticated" };

  const cached = readCache(token);
  if (cached) return classify(token, cached);

  let user: AdminUser;
  try {
    user = await apiFetch<AdminUser>("/api/users/profile", { token });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isNetworkError) return { status: "unavailable", message: error.message };
      if (error.status === 401 || error.status === 403) return { status: "unauthenticated" };
      return { status: "unavailable", message: error.message };
    }
    throw error;
  }

  writeCache(token, user);
  return classify(token, user);
}

/**
 * Токен для страницы раздела. Layout панели уже подтвердил сессию и роль,
 * поэтому здесь достаточно наличия cookie: без неё — редирект на вход.
 */
export async function requireToken(nextPath?: string): Promise<string> {
  const token = await readToken();
  if (!token) redirect(loginUrl(nextPath));
  return token;
}

/**
 * Итог проверки доступа для мест без layout'а панели (route handlers,
 * server actions).
 *
 * Состояния РАЗЛИЧАЮТСЯ намеренно. Раньше здесь возвращался `string | null`,
 * и недоступный API схлопывался в `null` — пользователь видел «Требуется
 * вход», хотя его права были в порядке, а вход ничего бы не починил.
 */
export type VerifiedToken =
  /** Токен валиден, роль SUPERADMIN. */
  | { status: "ok"; token: string }
  /** Токена нет, он протух или отозван — нужен вход. */
  | { status: "unauthenticated" }
  /** Учётная запись есть, но прав администратора у неё нет. */
  | { status: "forbidden" }
  /** До API не дозвонились: дело не в правах, повторять вход бессмысленно. */
  | { status: "unavailable"; message: string };

export async function getVerifiedToken(): Promise<VerifiedToken> {
  const result = await getSession();

  switch (result.status) {
    case "ok":
      return { status: "ok", token: result.session.token };
    case "forbidden":
      return { status: "forbidden" };
    case "unavailable":
      return { status: "unavailable", message: result.message };
    default:
      return { status: "unauthenticated" };
  }
}

/** Выход: сбрасываем и cookie, и кэш подтверждения. */
export async function endSession(): Promise<void> {
  const token = await readToken();
  if (token) verified.delete(token);
  await dropToken();
}

/** Логин через API. Возвращает токен или бросает ApiError с текстом от API. */
export async function loginToApi(login: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { login, password },
  });
}

/** Профиль по конкретному токену — для проверки роли сразу после логина. */
export async function fetchProfile(token: string): Promise<AdminUser> {
  return apiFetch<AdminUser>("/api/users/profile", { token });
}
