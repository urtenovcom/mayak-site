"use client";

import { useRouter } from "next/navigation";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { deleteArticleAction } from "./actions";

export function DeleteArticle({
  id,
  title,
  redirectTo,
}: {
  id: string;
  title: string;
  redirectTo?: string;
}) {
  const router = useRouter();

  return (
    <ConfirmDelete
      title="Удалить статью?"
      description={`«${title}» исчезнет из блога. Действие необратимо.`}
      onConfirm={async () => {
        const result = await deleteArticleAction(id);
        if (result.ok && redirectTo) router.push(redirectTo);
        return result;
      }}
    />
  );
}
