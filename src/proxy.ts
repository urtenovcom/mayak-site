import { NextResponse, type NextRequest } from "next/server";

// Имя cookie продублировано литералом сознательно: proxy может выполняться
// вне основного рантайма приложения, и документация Next 16 просит не
// полагаться здесь на общие модули. Источник истины — ADMIN_TOKEN_COOKIE
// в src/lib/admin/config.ts.
const ADMIN_TOKEN_COOKIE = "mayak_admin_token";
const LOGIN_PATH = "/admin/login";

/**
 * Дешёвый заслон на /admin/*: без cookie сразу уводим на страницу входа
 * и запоминаем запрошенный адрес. Настоящая проверка токена — в layout
 * админки и в каждом server action (proxy может быть обойдён рефакторингом
 * матчера, поэтому полагаться только на него нельзя).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === LOGIN_PATH) return NextResponse.next();
  if (request.cookies.has(ADMIN_TOKEN_COOKIE)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.search = "";
  url.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
