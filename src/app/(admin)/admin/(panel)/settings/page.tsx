import type { Metadata } from "next";
import { Alert, PageHead } from "@/components/admin/ui";
import { AdminTabs } from "@/components/admin/Tabs";
import { apiFetch, toUserMessage } from "@/lib/admin/api";
import { requireToken } from "@/lib/admin/session";
import type { SettingsResponse } from "@/lib/admin/types";
import { AnalyticsForm } from "./AnalyticsForm";
import { ContactsForm } from "./ContactsForm";
import { LeadDeliveryForm } from "./LeadDeliveryForm";
import { RobotsForm } from "./RobotsForm";

export const metadata: Metadata = {
  title: "Настройки",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const token = await requireToken("/admin/settings");

  let data: SettingsResponse | null = null;
  let error: string | null = null;

  try {
    data = await apiFetch<SettingsResponse>("/api/settings", { token });
  } catch (caught) {
    error = toUserMessage(caught);
  }

  return (
    <>
      <PageHead
        title="Настройки"
        description="Контакты компании, счётчики аналитики, уведомления о заявках и индексация."
      />

      {error && (
        <Alert tone="error" title="Не удалось загрузить настройки">
          {error}
        </Alert>
      )}

      {data && (
        <AdminTabs
          label="Разделы настроек"
          tabs={[
            {
              value: "contacts",
              label: "Контакты",
              content: <ContactsForm settings={data.settings} />,
            },
            {
              value: "analytics",
              label: "Настройка метрик",
              content: <AnalyticsForm settings={data.settings} />,
            },
            {
              value: "leads",
              label: "Настройка заявок",
              content: <LeadDeliveryForm settings={data.settings} />,
            },
            {
              value: "robots",
              label: "Индексация",
              content: <RobotsForm settings={data.settings} />,
            },
          ]}
        />
      )}
    </>
  );
}
