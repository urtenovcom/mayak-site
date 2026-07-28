import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function CatalogLoading() {
  return (
    <>
      <PageHead title="Каталог" description="Загружаем список…" />
      <SkeletonList rows={6} />
    </>
  );
}
