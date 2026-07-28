import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function Loading() {
  return (
    <>
      <PageHead title="Новое направление" description="Загружаем форму…" />
      <SkeletonList rows={5} />
    </>
  );
}
