"use client";

import { useEffect } from "react";
import { Alert, PageHead } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";

export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <>
      <PageHead title="Что-то пошло не так" />
      <Alert tone="error" title="Раздел не открылся">
        {error.message || "Неизвестная ошибка."}
      </Alert>
      <div className="mt-4">
        <Button type="button" onClick={reset} className="h-10 px-5 text-[14px]">
          Попробовать снова
        </Button>
      </div>
    </>
  );
}
