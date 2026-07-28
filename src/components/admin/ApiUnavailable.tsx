"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Alert } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";

/**
 * Экран «API не отвечает».
 *
 * Показывается вместо панели, когда сервер админки недоступен: раньше в этом
 * случае из layout'а летело исключение и пользователь видел системную
 * страницу 500 (в dev — оверлей со стеком).
 */
export function ApiUnavailable({ message }: { message: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-[520px]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo width={150} />
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
            Панель управления недоступна
          </h1>
        </div>

        <div className="rounded-brand-sm border border-line bg-white p-6 shadow-[0_1px_2px_rgba(66,30,42,0.04),0_12px_30px_-16px_rgba(66,30,42,0.12)]">
          <Alert tone="error" title="Нет связи с сервером админки">
            {message}
          </Alert>

          <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
            Данные каталога, блога и заявок хранятся в отдельном сервисе. Пока он не запущен,
            панель работать не может — сам сайт при этом открывается как обычно.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={pending}
              className="h-10 px-5 text-[14px]"
              onClick={() => startTransition(() => router.refresh())}
            >
              {pending ? "Проверяем…" : "Повторить попытку"}
            </Button>
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-[13px] font-bold text-ink transition hover:bg-warm-soft"
            >
              На сайт
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
