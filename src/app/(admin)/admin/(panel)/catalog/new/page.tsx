import type { Metadata } from "next";
import { requireToken } from "@/lib/admin/session";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = {
  title: "Новый товар",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  await requireToken("/admin/catalog/new");

  // Заголовок и кнопки — в закреплённой шапке самой формы (FormBar),
  // поэтому PageHead здесь не нужен: он дублировал бы название.
  return <ProductForm />;
}
