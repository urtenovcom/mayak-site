"use client";

import { useRouter } from "next/navigation";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { deleteProductAction } from "./actions";

export function DeleteProduct({
  id,
  name,
  redirectTo,
  triggerClassName,
}: {
  id: string;
  name: string;
  /** Куда уйти после удаления — нужно на странице редактирования. */
  redirectTo?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();

  return (
    <ConfirmDelete
      title="Удалить товар?"
      description={`«${name}» исчезнет из каталога. Действие необратимо.`}
      triggerClassName={triggerClassName}
      onConfirm={async () => {
        const result = await deleteProductAction(id);
        if (result.ok && redirectTo) router.push(redirectTo);
        return result;
      }}
    />
  );
}
