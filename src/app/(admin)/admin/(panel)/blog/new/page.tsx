import type { Metadata } from "next";
import { requireToken } from "@/lib/admin/session";
import { ArticleForm } from "../ArticleForm";

export const metadata: Metadata = {
  title: "Новая статья",
  robots: { index: false, follow: false },
};

export default async function NewArticlePage() {
  await requireToken("/admin/blog/new");

  // Заголовок и кнопки — в закреплённой шапке самой формы (FormBar),
  // поэтому PageHead здесь не нужен: он дублировал бы название.
  return <ArticleForm />;
}
