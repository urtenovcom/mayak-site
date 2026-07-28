import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import {
  Alert,
  Badge,
  EmptyState,
  PageHead,
  Panel,
  Pagination,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { apiFetch, toUserMessage } from "@/lib/admin/api";
import { formatDateTime } from "@/lib/admin/format";
import { requireToken } from "@/lib/admin/session";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
  type LeadsResponse,
} from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { typo } from "@/lib/typo";
import { LeadDelete, LeadStatusSelect } from "./LeadRowActions";

export const metadata: Metadata = {
  title: "Заявки",
  robots: { index: false, follow: false },
};

const LIMIT = 20;

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

function hrefFor(status: string, page: number) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/leads?${query}` : "/admin/leads";
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawStatus = typeof params.status === "string" ? params.status.toUpperCase() : "";
  const status = isLeadStatus(rawStatus) ? rawStatus : "";
  const page = Math.max(1, Number(params.page) || 1);

  const token = await requireToken(hrefFor(status, page));

  let data: LeadsResponse | null = null;
  let error: string | null = null;

  try {
    data = await apiFetch<LeadsResponse>("/api/leads", {
      token,
      query: { status: status || undefined, page, limit: LIMIT },
    });
  } catch (caught) {
    error = toUserMessage(caught);
  }

  const filters: { value: string; label: string; count?: number }[] = [
    { value: "", label: "Все", count: data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : undefined },
    ...LEAD_STATUSES.map((item) => ({
      value: item,
      label: LEAD_STATUS_LABELS[item],
      count: data?.counts?.[item],
    })),
  ];

  return (
    <>
      <PageHead
        title="Заявки"
        description={typo("Обращения с форм сайта. Комментарий содержит спецификацию из конструктора.")}
      />

      {error && (
        <Alert tone="error" className="mb-4" title="Не удалось загрузить заявки">
          {error}
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = status === filter.value;
          return (
            <Link
              key={filter.value || "all"}
              href={hrefFor(filter.value, 1)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-bold transition",
                active
                  ? "border-burgundy bg-burgundy text-white"
                  : "border-line bg-white text-ink-soft hover:border-burgundy/40 hover:text-burgundy",
              )}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span className={cn("text-[12px]", active ? "text-white/70" : "text-ink-soft/70")}>
                  {filter.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <Panel bodyClassName="p-0">
        {data && data.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={status ? "В этом статусе заявок нет" : "Заявок пока нет"}
              description={
                status
                  ? "Снимите фильтр, чтобы увидеть остальные обращения."
                  : typo("Как только с сайта придёт первая заявка, она появится здесь.")
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Дата</th>
                  <th className={thClass}>Имя</th>
                  <th className={thClass}>Телефон</th>
                  <th className={thClass}>Источник</th>
                  <th className={thClass}>Страница</th>
                  <th className={thClass}>Статус</th>
                  <th className={cn(thClass, "text-right")}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map((lead) => {
                  const isNew = lead.status === "NEW";
                  return (
                    <Fragment key={lead.id}>
                      <tr className={cn(isNew && "bg-burgundy/[0.04]")}>
                        <td className={cn(tdClass, "whitespace-nowrap")}>
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden
                              className={cn(
                                "h-6 w-1 shrink-0 rounded-full",
                                isNew ? "bg-burgundy" : "bg-transparent",
                              )}
                            />
                            <span className="text-[13px] text-ink-soft">
                              {formatDateTime(lead.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <span className="font-bold text-ink">{lead.name}</span>
                          {isNew && (
                            <Badge tone="accent" className="ml-2">
                              новая
                            </Badge>
                          )}
                        </td>
                        <td className={cn(tdClass, "whitespace-nowrap")}>
                          <a
                            href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                            className="font-semibold text-burgundy hover:underline"
                          >
                            {lead.phone}
                          </a>
                        </td>
                        <td className={cn(tdClass, "text-[13px] text-ink-soft")}>
                          {lead.source || "—"}
                        </td>
                        <td className={cn(tdClass, "max-w-[220px] text-[13px] text-ink-soft")}>
                          <span className="block truncate" title={lead.page ?? ""}>
                            {lead.page || "—"}
                          </span>
                          {lead.utm && (
                            <span className="block truncate text-[12px] text-ink-soft/70" title={lead.utm}>
                              {lead.utm}
                            </span>
                          )}
                        </td>
                        <td className={tdClass}>
                          <LeadStatusSelect id={lead.id} status={lead.status} />
                        </td>
                        <td className={cn(tdClass, "text-right")}>
                          <LeadDelete id={lead.id} name={lead.name} />
                        </td>
                      </tr>

                      {lead.comment && (
                        <tr className={cn(isNew && "bg-burgundy/[0.04]")}>
                          <td className={cn(tdClass, "pt-0")} colSpan={7}>
                            <div className="ml-3 rounded-brand-sm border border-line bg-warm-soft/70 px-3.5 py-2.5">
                              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft/80">
                                Комментарий
                              </p>
                              {/* Спецификация из конструктора многострочная — показываем целиком. */}
                              <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink">
                                {lead.comment}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {data && data.items.length > 0 && (
        <div className="mt-4">
          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            total={data.pagination.total}
            hrefFor={(next) => hrefFor(status, next)}
          />
        </div>
      )}
    </>
  );
}
