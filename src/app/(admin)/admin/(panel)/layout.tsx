import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ApiUnavailable } from "@/components/admin/ApiUnavailable";
import { Logo } from "@/components/Logo";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/config";
import { getSession } from "@/lib/admin/session";
import { logoutAction } from "../actions";

/**
 * Layout всей панели. Здесь настоящая проверка сессии: токен из cookie
 * подтверждается запросом к API, роль обязана быть SUPERADMIN.
 *
 * Ошибки getSession() возвращает значением, а не исключением: исключение из
 * layout'а соседний error.tsx не ловит, и пользователь получал системную
 * страницу 500 вместо понятного сообщения.
 */
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const result = await getSession();

  // Невалидный/протухший токен — на вход. Страница входа сама подтверждает
  // сессию, поэтому зацикливания редиректов не будет.
  if (result.status === "unauthenticated") redirect(ADMIN_LOGIN_PATH);

  // Не администратор: в панель не пускаем вовсе, объясняем на странице входа.
  if (result.status === "forbidden") redirect(ADMIN_LOGIN_PATH);

  if (result.status === "unavailable") return <ApiUnavailable message={result.message} />;

  const { user } = result.session;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="shrink-0 border-b border-line bg-white lg:sticky lg:top-0 lg:h-screen lg:w-[248px] lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <Logo width={124} />
            <Link
              href="/"
              target="_blank"
              className="text-[12px] font-bold text-ink-soft transition hover:text-burgundy"
            >
              Сайт ↗
            </Link>
          </div>

          <AdminNav className="lg:flex-1" />

          <div className="border-t border-line pt-3">
            <p className="truncate text-[13px] font-bold text-ink">{user.name || user.login}</p>
            <p className="truncate text-[12px] text-ink-soft">{user.login} · администратор</p>
            <form action={logoutAction} className="mt-2.5">
              <button
                type="submit"
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy"
              >
                <i className="fi fi-rr-sign-out text-[13px] leading-none" aria-hidden />
                Выйти
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Ширина ограничена намеренно: без потолка на широком мониторе подпись
          поля оказывается у левого края, а само поле — у правого, и глаза
          бегают через весь экран. 1100px — комфортная длина строки формы. */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}
