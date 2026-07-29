import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function MediaLoading() {
  return (
    <>
      <PageHead title="Медиатека" description="Загружаем файлы…" />
      <SkeletonList rows={4} />
    </>
  );
}
