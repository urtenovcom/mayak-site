import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function Loading() {
  return (
    <>
      <PageHead title="Новая статья" description="Загружаем форму…" />
      <SkeletonList rows={5} />
    </>
  );
}
