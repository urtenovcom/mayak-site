import type { Metadata } from "next";
import { Alert, PageHead } from "@/components/admin/ui";
import { apiFetch, toUserMessage } from "@/lib/admin/api";
import { requireToken } from "@/lib/admin/session";
import type { AdminMedia, Paginated } from "@/lib/admin/types";
import { MediaLibrary } from "./MediaTools";

export const metadata: Metadata = {
  title: "Медиатека",
  robots: { index: false, follow: false },
};

export default async function MediaPage() {
  const token = await requireToken("/admin/media");

  let data: Paginated<AdminMedia> | null = null;
  let error: string | null = null;

  try {
    data = await apiFetch<Paginated<AdminMedia>>("/api/media", { token, query: { limit: 100 } });
  } catch (caught) {
    error = toUserMessage(caught);
  }

  return (
    <>
      <PageHead
        title="Медиатека"
        description="Изображения для каталога, блога и направлений. Сначала загрузите файлы, потом заполните описание (alt) у каждого — это значение по умолчанию: при вставке картинки оно копируется на место и дальше правится там."
      />

      {error && (
        <Alert tone="error" className="mb-4" title="Не удалось загрузить медиатеку">
          {error}
        </Alert>
      )}

      <MediaLibrary items={data?.items ?? []} total={data?.pagination.total ?? 0} />
    </>
  );
}
