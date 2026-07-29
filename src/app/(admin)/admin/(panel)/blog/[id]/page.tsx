import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, PageHead } from "@/components/admin/ui";
import { ApiError, apiFetch, toUserMessage } from "@/lib/admin/api";
import { requireToken } from "@/lib/admin/session";
import type { AdminArticle } from "@/lib/admin/types";
import { ArticleForm } from "../ArticleForm";

export const metadata: Metadata = {
  title: "Статья",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const token = await requireToken(`/admin/blog/${id}`);

  let article: AdminArticle | null = null;
  let error: string | null = null;

  try {
    article = await apiFetch<AdminArticle>(`/api/articles/${id}`, { token });
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 404) notFound();
    error = toUserMessage(caught);
  }

  if (error || !article) {
    return (
      <>
        <PageHead title="Статья" />
        <Alert tone="error" title="Не удалось загрузить статью">
          {error ?? "Пустой ответ API."}
        </Alert>
      </>
    );
  }

  // Заголовок, «Назад», удаление, публикация и сохранение — в закреплённой
  // шапке формы (FormBar), поэтому отдельного PageHead здесь нет.
  return <ArticleForm article={article} />;
}
