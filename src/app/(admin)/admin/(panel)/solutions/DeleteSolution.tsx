"use client";

import { useRouter } from "next/navigation";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { deleteSolutionAction } from "./actions";

export function DeleteSolution({
  id,
  label,
  redirectTo,
}: {
  id: string;
  label: string;
  redirectTo?: string;
}) {
  const router = useRouter();

  return (
    <ConfirmDelete
      title="Удалить направление?"
      description={`«${label}» и его товары-примеры будут удалены. Действие необратимо.`}
      onConfirm={async () => {
        const result = await deleteSolutionAction(id);
        if (result.ok && redirectTo) router.push(redirectTo);
        return result;
      }}
    />
  );
}
