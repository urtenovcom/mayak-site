import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function SolutionsLoading() {
  return (
    <>
      <PageHead title="Главная" description="Загружаем блоки главной страницы…" />
      <SkeletonList rows={5} />
    </>
  );
}
