"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert, Field, Panel, TextInput } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { AdminSiteSettings } from "@/lib/admin/types";
import { saveAnalyticsAction, type AnalyticsFormValues } from "./actions";

export function AnalyticsForm({ settings }: { settings: AdminSiteSettings }) {
  const router = useRouter();
  const [values, setValues] = useState<AnalyticsFormValues>({
    yandexMetrikaId: settings.yandexMetrikaId ?? "",
    googleAnalyticsId: settings.googleAnalyticsId ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof AnalyticsFormValues>(key: K, value: AnalyticsFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveAnalyticsAction(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Счётчики сохранены. На сайте они появятся сразу.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Panel
        title="Счётчики аналитики"
        description="Оба поля необязательные. Пустое поле — счётчик на сайт не подключается."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Field
            label="Яндекс.Метрика"
            htmlFor="yandexMetrikaId"
            hint="Номер счётчика — только цифры, например 98765432. Взять в Метрике: Настройка → Номер счётчика."
          >
            <TextInput
              id="yandexMetrikaId"
              inputMode="numeric"
              autoComplete="off"
              placeholder="98765432"
              value={values.yandexMetrikaId}
              onChange={(event) => set("yandexMetrikaId", event.target.value)}
              disabled={pending}
            />
          </Field>

          <Field
            label="Google Analytics 4"
            htmlFor="googleAnalyticsId"
            hint="Идентификатор потока данных вида G-XXXXXXXXXX."
          >
            <TextInput
              id="googleAnalyticsId"
              autoComplete="off"
              placeholder="G-XXXXXXXXXX"
              value={values.googleAnalyticsId}
              onChange={(event) => set("googleAnalyticsId", event.target.value)}
              disabled={pending}
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {error && (
            <Alert tone="error" title="Не удалось сохранить">
              {error}
            </Alert>
          )}
          {success && <Alert tone="success">{success}</Alert>}
          <div>
            <Button type="submit" disabled={pending} className="h-10 px-5 text-[14px]">
              {pending ? "Сохраняем…" : "Сохранить счётчики"}
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}
