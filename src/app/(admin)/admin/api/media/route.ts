// Прокси медиатеки для браузера: клиент ходит только на свой домен,
// а JWT из httpOnly-cookie подставляется здесь, на сервере.

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  API_UNAVAILABLE_MESSAGE,
  ApiError,
  apiFetch,
  buildApiUrl,
  toUserMessage,
} from "@/lib/admin/api";
import { getVerifiedToken } from "@/lib/admin/session";
import type { AdminMedia, Paginated } from "@/lib/admin/types";

/**
 * Проверка доступа. Недоступный API отделён от отказа в правах: раньше оба
 * случая давали 401 «Требуется вход», и при выключенном сервере админки
 * пользователь шёл логиниться вместо того, чтобы поднять API.
 *
 * Возвращает готовый ответ, если пускать нельзя, иначе — токен.
 */
async function authorize(): Promise<{ token: string } | { response: NextResponse }> {
  const verified = await getVerifiedToken();

  if (verified.status === "ok") return { token: verified.token };

  if (verified.status === "unavailable") {
    return {
      response: NextResponse.json({ error: verified.message }, {
        status: 503,
        headers: { "Retry-After": "10" },
      }),
    };
  }

  if (verified.status === "forbidden") {
    return {
      response: NextResponse.json(
        { error: "Недостаточно прав: медиатека доступна только администратору." },
        { status: 403 },
      ),
    };
  }

  return {
    response: NextResponse.json(
      { error: "Требуется вход в админку под учётной записью администратора." },
      { status: 401 },
    ),
  };
}

/**
 * Проверка происхождения запроса.
 *
 * Серверные экшены Next делают её сами, а этот роут написан руками, поэтому
 * на одном `SameSite=lax` полагаться нельзя (он не защищает GET-навигацию и
 * зависит от версии браузера). Правило: запрос обязан быть с нашего же
 * origin — либо по `Sec-Fetch-Site`, либо по совпадению `Origin` с `Host`.
 */
async function isSameOrigin(): Promise<boolean> {
  const headerList = await headers();

  const fetchSite = headerList.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin";

  const origin = headerList.get("origin");
  const host = headerList.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function forbiddenOrigin() {
  return NextResponse.json({ error: "Запрос отклонён: чужое происхождение." }, { status: 403 });
}

export async function GET(request: Request) {
  if (!(await isSameOrigin())) return forbiddenOrigin();

  const access = await authorize();
  if ("response" in access) return access.response;
  const { token } = access;

  const url = new URL(request.url);

  try {
    const data = await apiFetch<Paginated<AdminMedia>>("/api/media", {
      token,
      query: {
        search: url.searchParams.get("search") ?? undefined,
        page: url.searchParams.get("page") ?? undefined,
        limit: url.searchParams.get("limit") ?? 60,
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError && error.status > 0 ? error.status : 502;
    return NextResponse.json({ error: toUserMessage(error) }, { status });
  }
}

export async function POST(request: Request) {
  if (!(await isSameOrigin())) return forbiddenOrigin();

  const access = await authorize();
  if ("response" in access) return access.response;
  const { token } = access;

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать файл." }, { status: 400 });
  }

  const file = incoming.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Выберите файл изображения." }, { status: 400 });
  }

  // Пересобираем FormData: наружу уходит только файл и alt.
  const outgoing = new FormData();
  outgoing.append("file", file, file.name);
  const alt = incoming.get("alt");
  if (typeof alt === "string" && alt.trim()) outgoing.append("alt", alt.trim());

  let response: Response;
  try {
    response = await fetch(buildApiUrl("/api/media/upload"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: outgoing,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: API_UNAVAILABLE_MESSAGE }, { status: 502 });
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const record = (data ?? {}) as Record<string, unknown>;
    const raw =
      typeof record.message === "string" && record.message.trim()
        ? record.message.trim()
        : `API ответил ошибкой ${response.status}.`;
    return NextResponse.json({ error: toUserMessage(new ApiError(response.status, raw)) }, {
      status: response.status,
    });
  }

  return NextResponse.json(data, { status: 201 });
}
