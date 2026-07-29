import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function BlogLoading() {
  return (
    <>
      <PageHead title="Блог" description="Загружаем список…" />
      <SkeletonList rows={5} />
    </>
  );
}
