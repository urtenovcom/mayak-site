import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { Requisites } from "@/components/Requisites";

export const metadata: Metadata = {
  title: "Реквизиты",
  description:
    "Реквизиты ООО «Маяк»: ИНН, КПП, ОГРН, адрес производства, контакты. Банковские реквизиты — по запросу.",
};

export default function RekvizityPage() {
  return (
    <LegalLayout
      label="Документы"
      title="Реквизиты"
      description="Реквизиты ООО «Маяк» для заключения договоров и оформления документов."
    >
      <Requisites />
    </LegalLayout>
  );
}
