import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert } from "@/components/admin/ui";
import { Logo } from "@/components/Logo";
import { ROLE_ERROR, safeNextPath } from "@/lib/admin/config";
import { getSession } from "@/lib/admin/session";
import { typo } from "@/lib/typo";
import { LoginForm } from "./LoginForm";
import { resetSessionAction } from "./actions";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : "";
  const nextPath = safeNextPath(rawNext);

  // Сессию подтверждаем, а не просто смотрим на наличие cookie: иначе
  // протухший токен гонял бы пользователя между панелью и входом по кругу.
  const session = await getSession();
  if (session.status === "ok") redirect(nextPath);

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo width={160} />
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
              Панель управления
            </h1>
            <p className="mt-1 text-[14px] text-ink-soft">
              {typo("Раздел для сотрудников ООО «Маяк»")}
            </p>
          </div>
        </div>

        {session.status === "forbidden" && (
          <Alert tone="error" className="mb-4" title="Доступ в панель закрыт">
            {`Вы вошли как «${session.user.login}». ${ROLE_ERROR}`}
            <form action={resetSessionAction} className="mt-3">
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full border border-burgundy bg-burgundy px-4 text-[13px] font-bold text-white transition hover:bg-burgundy-800"
              >
                Выйти и войти под другой учётной записью
              </button>
            </form>
          </Alert>
        )}

        {session.status === "unavailable" && (
          <Alert tone="error" className="mb-4" title="Нет связи с сервером админки">
            {session.message}
          </Alert>
        )}

        <div className="rounded-brand-sm border border-line bg-white p-6 shadow-[0_1px_2px_rgba(66,30,42,0.04),0_12px_30px_-16px_rgba(66,30,42,0.12)]">
          <LoginForm nextPath={nextPath} />
        </div>
      </div>
    </main>
  );
}
