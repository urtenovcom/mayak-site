import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function Loading() {
  return (
    <>
      <PageHead title="Направление" description="Загружаем форму…" />
      <SkeletonList rows={5} />
    </>
  );
}
