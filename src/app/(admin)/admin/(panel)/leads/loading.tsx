import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function LeadsLoading() {
  return (
    <>
      <PageHead title="Заявки" description="Загружаем список…" />
      <SkeletonList rows={8} />
    </>
  );
}
