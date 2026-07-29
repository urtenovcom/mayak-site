import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function Loading() {
  return (
    <>
      <PageHead title="Новый товар" description="Загружаем форму…" />
      <SkeletonList rows={5} />
    </>
  );
}
