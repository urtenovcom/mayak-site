import { PageHead, SkeletonList } from "@/components/admin/ui";

export default function SettingsLoading() {
  return (
    <>
      <PageHead title="Настройки" description="Загружаем данные…" />
      <SkeletonList rows={4} />
    </>
  );
}
