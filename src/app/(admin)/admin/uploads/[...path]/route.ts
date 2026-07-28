// Отдаёт загруженные картинки (`/uploads/...` на API) через собственный домен,
// чтобы браузер админки не ходил на сторонний порт.

import { ADMIN_API_URL } from "@/lib/admin/config";
import { getVerifiedToken } from "@/lib/admin/session";

/**
 * Заголовки безопасности, которыми API подписывает статику `/uploads`
 * (express.static в server.js бэкенда). Проксируем их как есть, а если
 * апстрим что-то не прислал — ставим собственное безопасное значение.
 */
const FORWARDED_HEADERS: Record<string, string | null> = {
  "content-type": "application/octet-stream",
  "content-security-policy": "default-src 'none'; img-src 'self'; sandbox",
  "cross-origin-resource-policy": "same-site",
  "x-content-type-options": "nosniff",
  // Значения по умолчанию нет: вложением файл делает только апстрим.
  "content-disposition": null,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  // Наличия cookie мало: подошёл бы любой мусор, просроченный токен или
  // учётка без прав. Сессию подтверждаем у API (с коротким кэшем, иначе
  // каждая миниатюра давала бы отдельный запрос профиля).
  //
  // Недоступный API — это НЕ отказ в правах: отвечать на него 401 «Требуется
  // вход» значит отправлять администратора логиниться там, где вход и так
  // не работает. Такому случаю отдельный статус.
  const verified = await getVerifiedToken();

  if (verified.status === "unavailable") {
    return new Response(verified.message, {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "10" },
    });
  }
  if (verified.status === "forbidden") {
    return new Response("Недостаточно прав для просмотра медиатеки.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  if (verified.status !== "ok") {
    return new Response("Требуется вход в админку.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { path } = await params;

  // Только имя файла: выход за пределы /uploads невозможен.
  const segments = path.filter((segment) => segment && segment !== "." && segment !== "..");
  if (segments.length === 0) return new Response("Not found", { status: 404 });

  const target = `${ADMIN_API_URL}/uploads/${segments.map(encodeURIComponent).join("/")}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, { cache: "no-store" });
  } catch {
    return new Response("Upstream unavailable", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: upstream.status === 404 ? 404 : 502 });
  }

  const headers = new Headers();
  for (const [name, fallback] of Object.entries(FORWARDED_HEADERS)) {
    const value = upstream.headers.get(name) ?? fallback;
    if (value) headers.set(name, value);
  }
  // Кэш только приватный: файл доступен исключительно администратору.
  headers.set("Cache-Control", "private, max-age=300");

  return new Response(upstream.body, { status: 200, headers });
}
