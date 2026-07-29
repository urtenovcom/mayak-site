// Тонкий клиент REST API админки. Используется ТОЛЬКО на сервере:
// в server components, server actions и route handlers.
//
// Главное правило: текст ошибки от API отдаётся наверх дословно — именно там
// приходит список незаполненных полей («Missing or empty required fields: …»),
// и пользователь должен его увидеть.

import { ADMIN_API_URL } from "./config";
import { translateApiError, type FieldLabels } from "./errors";

/** Статус 0 = до сервера не дозвонились (сеть/сервер не запущен). */
export const NETWORK_ERROR_STATUS = 0;

export const API_UNAVAILABLE_MESSAGE =
  "Сервер админки не отвечает. Проверьте, что он запущен, и повторите попытку.";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS;
  }
}

export type ApiQuery = Record<string, string | number | boolean | undefined | null>;

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
  query?: ApiQuery;
  /**
   * Предел ожидания ответа. Нужен публичным страницам: без него зависший
   * (а не упавший) API держал бы рендер страницы до системного таймаута.
   * Превышение выглядит как сетевая ошибка — сработает фолбэк.
   */
  timeoutMs?: number;
  /**
   * Дополнительные заголовки. Нужны публичному чтению настроек: часть полей
   * (получатели уведомлений о заявках) отдаётся только по ключу сайта —
   * анониму API их не показывает, чтобы почта и chat_id сотрудников не
   * утекали наружу.
   */
  headers?: Record<string, string>;
};

export function buildApiUrl(path: string, query?: ApiQuery): string {
  const url = new URL(`${ADMIN_API_URL}${path.startsWith("/") ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Сообщение об ошибке из тела ответа API; иначе — понятный русский текст. */
function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["message", "error"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  if (status === 401) return "Требуется вход в админку.";
  if (status === 403) return "Недостаточно прав для этой операции.";
  if (status === 404) return "Запись не найдена.";
  return `API ответил ошибкой ${status}.`;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", token, body, query, timeoutMs } = options;

  const headers: Record<string, string> = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
    });
  } catch (cause) {
    // Внутренний адрес API — деталь развёртывания, наружу её не показываем:
    // она уходит только в серверный лог.
    console.error(`[admin] API недоступен: ${method} ${ADMIN_API_URL}${path}`, cause);
    throw new ApiError(NETWORK_ERROR_STATUS, API_UNAVAILABLE_MESSAGE);
  }

  const text = await response.text();
  const data = text ? parseJson(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(data, response.status));
  }

  return data as T;
}

/**
 * Текст любой ошибки для показа пользователю — уже по-русски.
 * @param labels названия полей конкретной формы (см. translateApiError).
 */
export function toUserMessage(error: unknown, labels: FieldLabels = {}): string {
  if (error instanceof ApiError) {
    // Сетевую ошибку и наши собственные тексты переводить не надо.
    return error.isNetworkError ? error.message : translateApiError(error.message, labels);
  }
  if (error instanceof Error && error.message) return translateApiError(error.message, labels);
  return "Неизвестная ошибка.";
}
