// Публичный доступ к медиатеке админки.
//
// Картинки, загруженные в панели, физически лежат рядом с API
// (`GET {ADMIN_API_URL}/uploads/…webp`) и в базе записаны путём `/uploads/…`.
// Публичным страницам этот путь нужен без авторизации, поэтому здесь стоит
// собственный прокси-роут сайта: браузер ходит только на свой домен, а адрес
// API остаётся деталью развёртывания.
//
// Почему прокси, а не `remotePatterns` для next/image:
//
//  • `remotePatterns` — конфигурация времени сборки, а `ADMIN_API_URL` задаётся
//    окружением (на проде API живёт во внутренней сети). Пришлось бы собирать
//    конфиг из переменной и пересобирать сайт при переезде API.
//  • API подписывает статику `Cross-Origin-Resource-Policy: same-site`, то есть
//    прямую загрузку с чужого origin браузер и так заблокирует.
//  • С прокси путь из базы (`/uploads/x.webp`) работает как есть — ни в базе,
//    ни в компонентах ничего переписывать не нужно, и `next/image` считает его
//    локальным (оптимизация и кэш `/_next/image` включаются сами).
//
// Наружу отдаются только растровые изображения: медиатека других файлов и не
// принимает (SVG запрещён намеренно), а лишний тип здесь означал бы новый
// вектор — поэтому расширение и Content-Type проверяются повторно.

import { ADMIN_API_URL } from "@/lib/admin/config";

/** Медиатека перекодирует всё в WebP; остальное — исторические файлы. */
const ALLOWED_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif"]);

/**
 * Кэш на стороне браузера и CDN.
 *
 * Имя файла содержит метку времени и 16 случайных hex-символов и при
 * перезаливке меняется, так что содержимое по конкретному адресу неизменно.
 */
const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  // Только имена файлов: ни `..`, ни пустых сегментов — выход за пределы
  // /uploads невозможен.
  const segments = path.filter((segment) => segment && segment !== "." && segment !== "..");
  if (segments.length === 0) return new Response("Not found", { status: 404 });

  const filename = segments[segments.length - 1];
  const dot = filename.lastIndexOf(".");
  const extension = dot === -1 ? "" : filename.slice(dot).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) return new Response("Not found", { status: 404 });

  const target = `${ADMIN_API_URL}/uploads/${segments.map(encodeURIComponent).join("/")}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  } catch (cause) {
    // Внутренний адрес API наружу не показываем — он уходит только в лог.
    console.error(`[uploads] API недоступен: ${ADMIN_API_URL}/uploads/…`, cause);
    return new Response("Upstream unavailable", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: upstream.status === 404 ? 404 : 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    console.error(`[uploads] апстрим вернул не изображение: ${contentType || "без типа"}`);
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": CACHE_CONTROL,
    // Те же ограничения, что ставит API на своей статике: браузер не угадывает
    // тип, а картинка не может выполнить ничего, даже если бы содержала скрипт.
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox",
  });

  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { status: 200, headers });
}
