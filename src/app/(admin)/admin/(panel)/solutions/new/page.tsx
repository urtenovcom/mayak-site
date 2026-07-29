import type { Metadata } from "next";
import { PageHead } from "@/components/admin/ui";
import { requireToken } from "@/lib/admin/session";
import { SolutionForm } from "../SolutionForm";

export const metadata: Metadata = {
  title: "Новое направление",
  robots: { index: false, follow: false },
};

export default async function NewSolutionPage() {
  await requireToken("/admin/solutions/new");

  return (
    <>
      <PageHead
        title="Новое направление"
        description="Обязательные поля отмечены звёздочкой. Ключ соберётся автоматически."
      />
      <SolutionForm />
    </>
  );
}
