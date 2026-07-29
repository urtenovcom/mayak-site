import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, PageHead } from "@/components/admin/ui";
import { ApiError, apiFetch, toUserMessage } from "@/lib/admin/api";
import { requireToken } from "@/lib/admin/session";
import type { AdminProduct } from "@/lib/admin/types";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = {
  title: "Товар",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const token = await requireToken(`/admin/catalog/${id}`);

  let product: AdminProduct | null = null;
  let error: string | null = null;

  try {
    product = await apiFetch<AdminProduct>(`/api/products/${id}`, { token });
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 404) notFound();
    error = toUserMessage(caught);
  }

  if (error || !product) {
    return (
      <>
        <PageHead title="Товар" />
        <Alert tone="error" title="Не удалось загрузить товар">
          {error ?? "Пустой ответ API."}
        </Alert>
      </>
    );
  }

  // Название, «Назад», удаление, публикация и сохранение — в закреплённой
  // шапке формы (FormBar), поэтому отдельного PageHead здесь нет.
  return <ProductForm product={product} />;
}
