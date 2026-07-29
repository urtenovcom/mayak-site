import type { Metadata } from "next";
import Link from "next/link";
import {
  Alert,
  Badge,
  EmptyState,
  PageHead,
  Panel,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { AdminTabs } from "@/components/admin/Tabs";
import { ButtonLink } from "@/components/ui/Button";
import { apiFetch, toUserMessage } from "@/lib/admin/api";
import { requireToken } from "@/lib/admin/session";
import type {
  AdminFaqItem,
  AdminSolution,
  Paginated,
  SettingsResponse,
} from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { DeleteSolution } from "./DeleteSolution";
import { FaqEditor } from "./FaqEditor";
import { ProcessEditor } from "./ProcessEditor";
import { StatsEditor } from "./StatsEditor";

export const metadata: Metadata = {
  title: "Главная",
  robots: { index: false, follow: false },
};

/**
 * Раздел «Главная» — блоки главной страницы сайта.
 *
 * Адрес намеренно остался прежним (`/admin/solutions`): по нему уже ходят
 * закладки, а формы направлений живут во вложенных маршрутах
 * `/admin/solutions/new` и `/admin/solutions/[id]`.
 *
 * Направления, цифры и этапы читаются двумя запросами, независимо друг от
 * друга: упавший `/api/settings` не должен прятать таблицу направлений и
 * наоборот — иначе один сбой уносит весь раздел.
 */
export default async function HomePage() {
  const token = await requireToken("/admin/solutions");

  const [solutions, settings, faq] = await Promise.all([
    apiFetch<Paginated<AdminSolution>>("/api/solutions", {
      token,
      query: { published: "all", limit: 200 },
    })
      .then((data) => ({ data, error: null as string | null }))
      .catch((caught) => ({ data: null, error: toUserMessage(caught) })),
    apiFetch<SettingsResponse>("/api/settings", { token })
      .then((data) => ({ data, error: null as string | null }))
      .catch((caught) => ({ data: null, error: toUserMessage(caught) })),
    apiFetch<Paginated<AdminFaqItem>>("/api/faq", {
      token,
      query: { published: "all", limit: 200 },
    })
      .then((data) => ({ data, error: null as string | null }))
      .catch((caught) => ({ data: null, error: toUserMessage(caught) })),
  ]);

  return (
    <>
      <PageHead
        title="Главная"
        description="Блоки главной страницы сайта: направления, цифры доверия, вопросы и ответы, этапы работы."
      />

      <AdminTabs
        label="Блоки главной страницы"
        tabs={[
          {
            value: "solutions",
            label: "Направления",
            content: (
              <SolutionsTab items={solutions.data?.items ?? null} error={solutions.error} />
            ),
          },
          {
            value: "stats",
            label: "Цифры доверия",
            content: settings.data ? (
              <StatsEditor stats={settings.data.stats} />
            ) : (
              <Alert tone="error" title="Не удалось загрузить цифры доверия">
                {settings.error}
              </Alert>
            ),
          },
          {
            value: "faq",
            label: "Вопросы и ответы",
            content: faq.data ? (
              <FaqEditor items={faq.data.items} />
            ) : (
              <Alert tone="error" title="Не удалось загрузить вопросы">
                {faq.error}
              </Alert>
            ),
          },
          {
            value: "process",
            label: "Этапы работы",
            content: settings.data ? (
              <ProcessEditor steps={settings.data.process} />
            ) : (
              <Alert tone="error" title="Не удалось загрузить этапы работы">
                {settings.error}
              </Alert>
            ),
          },
        ]}
      />
    </>
  );
}

function SolutionsTab({ items, error }: { items: AdminSolution[] | null; error: string | null }) {
  return (
    <>
      {error && (
        <Alert tone="error" className="mb-4" title="Не удалось загрузить направления">
          {error}
        </Alert>
      )}

      <Panel
        title="Решения по задачам"
        description="Вкладки блока на главной: описание направления и товары-примеры."
        actions={
          <ButtonLink href="/admin/solutions/new" className="h-10 px-5 text-[14px]">
            Добавить направление
          </ButtonLink>
        }
        bodyClassName="p-0"
      >
        {items && items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Направлений пока нет"
              description="Добавьте первое — оно появится вкладкой в блоке решений."
              action={
                <ButtonLink href="/admin/solutions/new" className="h-10 px-5 text-[14px]">
                  Добавить направление
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Вкладка</th>
                  <th className={thClass}>Заголовок</th>
                  <th className={thClass}>Иконка</th>
                  <th className={thClass}>Примеры</th>
                  <th className={thClass}>Порядок</th>
                  <th className={thClass}>Статус</th>
                  <th className={cn(thClass, "text-right")}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {(items ?? []).map((solution) => (
                  <tr key={solution.id}>
                    <td className={tdClass}>
                      <Link
                        href={`/admin/solutions/${solution.id}`}
                        className="font-bold text-ink transition hover:text-burgundy"
                      >
                        {solution.label}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-ink-soft">{solution.key}</p>
                    </td>
                    <td className={cn(tdClass, "max-w-[380px] text-[13px] text-ink-soft")}>
                      {solution.title}
                    </td>
                    <td className={cn(tdClass, "text-[13px] text-ink-soft")}>{solution.icon}</td>
                    <td className={cn(tdClass, "text-[13px] text-ink-soft")}>
                      {solution.products?.length ?? 0}
                    </td>
                    <td className={cn(tdClass, "text-[13px] text-ink-soft")}>
                      {solution.sortOrder}
                    </td>
                    <td className={tdClass}>
                      {solution.published ? (
                        <Badge tone="success">опубликовано</Badge>
                      ) : (
                        <Badge tone="muted">черновик</Badge>
                      )}
                    </td>
                    <td className={cn(tdClass, "text-right")}>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/solutions/${solution.id}`}
                          className="inline-flex h-9 items-center rounded-full border border-line bg-white px-3.5 text-[13px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy"
                        >
                          Изменить
                        </Link>
                        <DeleteSolution id={solution.id} label={solution.label} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
