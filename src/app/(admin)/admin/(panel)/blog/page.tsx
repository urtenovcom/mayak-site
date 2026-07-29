import type { Metadata } from "next";
import Link from "next/link";
import {
  Alert,
  Badge,
  EmptyState,
  PageHead,
  Panel,
  Thumb,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { apiFetch, toUserMessage } from "@/lib/admin/api";
import { formatDateTime, mediaSrc } from "@/lib/admin/format";
import { requireToken } from "@/lib/admin/session";
import type { AdminArticle, Paginated } from "@/lib/admin/types";
import { toArticleBlocks } from "@/lib/blog-blocks";
import { cn } from "@/lib/cn";
import { DeleteArticle } from "./DeleteArticle";

export const metadata: Metadata = {
  title: "Блог",
  robots: { index: false, follow: false },
};

export default async function BlogPage() {
  const token = await requireToken("/admin/blog");

  let data: Paginated<AdminArticle> | null = null;
  let error: string | null = null;

  try {
    data = await apiFetch<Paginated<AdminArticle>>("/api/articles", {
      token,
      query: { published: "all", limit: 200 },
    });
  } catch (caught) {
    error = toUserMessage(caught);
  }

  return (
    <>
      <PageHead
        title="Блог"
        description="Статьи из блоков: заголовок, текст, список, таблица, цитата, изображение, галерея, видео, файл, аккордеон."
        actions={
          <ButtonLink href="/admin/blog/new" className="h-10 px-5 text-[14px]">
            Добавить статью
          </ButtonLink>
        }
      />

      {error && (
        <Alert tone="error" className="mb-4" title="Не удалось загрузить блог">
          {error}
        </Alert>
      )}

      <Panel bodyClassName="p-0">
        {data && data.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Статей пока нет"
              description="Создайте первую статью — она появится в разделе «Блог» на сайте."
              action={
                <ButtonLink href="/admin/blog/new" className="h-10 px-5 text-[14px]">
                  Добавить статью
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Обложка</th>
                  <th className={thClass}>Заголовок</th>
                  <th className={thClass}>Блоков</th>
                  <th className={thClass}>Публикация</th>
                  <th className={thClass}>Статус</th>
                  <th className={cn(thClass, "text-right")}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map((article) => (
                  <tr key={article.id}>
                    <td className={tdClass}>
                      <Thumb src={mediaSrc(article.image)} alt="" className="h-12 w-16" />
                    </td>
                    <td className={cn(tdClass, "max-w-[420px]")}>
                      <Link
                        href={`/admin/blog/${article.id}`}
                        className="font-bold text-ink transition hover:text-burgundy"
                      >
                        {article.title}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-ink-soft">
                        <Link
                          href={`/blog/${article.slug}`}
                          target="_blank"
                          className="hover:text-burgundy"
                        >
                          /blog/{article.slug} ↗
                        </Link>
                      </p>
                    </td>
                    <td className={cn(tdClass, "text-[13px] text-ink-soft")}>
                      {toArticleBlocks(article.sections).length}
                    </td>
                    <td className={cn(tdClass, "whitespace-nowrap text-[13px] text-ink-soft")}>
                      {formatDateTime(article.publishedAt)}
                    </td>
                    <td className={tdClass}>
                      {article.published ? (
                        <Badge tone="success">опубликована</Badge>
                      ) : (
                        <Badge tone="muted">черновик</Badge>
                      )}
                    </td>
                    <td className={cn(tdClass, "text-right")}>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/blog/${article.id}`}
                          className="inline-flex h-9 items-center rounded-full border border-line bg-white px-3.5 text-[13px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy"
                        >
                          Изменить
                        </Link>
                        <DeleteArticle id={article.id} title={article.title} />
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
