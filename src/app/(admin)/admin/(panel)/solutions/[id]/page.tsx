import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, PageHead } from "@/components/admin/ui";
import { ApiError, apiFetch, toUserMessage } from "@/lib/admin/api";
import { requireToken } from "@/lib/admin/session";
import type { AdminSolution } from "@/lib/admin/types";
import { DeleteSolution } from "../DeleteSolution";
import { SolutionForm } from "../SolutionForm";

export const metadata: Metadata = {
  title: "Направление",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditSolutionPage({ params }: PageProps) {
  const { id } = await params;
  const token = await requireToken(`/admin/solutions/${id}`);

  let solution: AdminSolution | null = null;
  let error: string | null = null;

  try {
    solution = await apiFetch<AdminSolution>(`/api/solutions/${id}`, { token });
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 404) notFound();
    error = toUserMessage(caught);
  }

  if (error || !solution) {
    return (
      <>
        <PageHead title="Направление" />
        <Alert tone="error" title="Не удалось загрузить направление">
          {error ?? "Пустой ответ API."}
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHead
        title={solution.label}
        description={solution.key}
        actions={
          <DeleteSolution
            id={solution.id}
            label={solution.label}
            redirectTo="/admin/solutions"
          />
        }
      />
      <SolutionForm solution={solution} />
    </>
  );
}
