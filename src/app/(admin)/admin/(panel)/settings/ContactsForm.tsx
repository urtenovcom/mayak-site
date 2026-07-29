"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert, Field, Panel, TextArea, TextInput } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { arrayToLines } from "@/lib/admin/format";
import type { AdminSiteSettings } from "@/lib/admin/types";
import { saveContactsAction, type ContactsFormValues } from "./actions";

export function ContactsForm({ settings }: { settings: AdminSiteSettings }) {
  const router = useRouter();
  const [values, setValues] = useState<ContactsFormValues>({
    phones: arrayToLines(settings.phones),
    telegram: settings.telegram ?? "",
    max: settings.max ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ContactsFormValues>(key: K, value: ContactsFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveContactsAction(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Контакты сохранены.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Panel title="Контакты" description="Телефоны, мессенджеры, почта и адрес производства.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field
            label="Телефоны"
            htmlFor="phones"
            hint="По одному номеру на строку."
            className="lg:col-span-2"
          >
            <TextArea
              id="phones"
              rows={3}
              value={values.phones}
              onChange={(event) => set("phones", event.target.value)}
              disabled={pending}
            />
          </Field>

          <Field label="Telegram" htmlFor="telegram">
            <TextInput
              id="telegram"
              value={values.telegram}
              onChange={(event) => set("telegram", event.target.value)}
              disabled={pending}
            />
          </Field>

          <Field label="MAX" htmlFor="max">
            <TextInput
              id="max"
              value={values.max}
              onChange={(event) => set("max", event.target.value)}
              disabled={pending}
            />
          </Field>

          <Field label="E-mail" htmlFor="email">
            <TextInput
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
              disabled={pending}
            />
          </Field>

          <Field label="Адрес" htmlFor="address">
            <TextInput
              id="address"
              value={values.address}
              onChange={(event) => set("address", event.target.value)}
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
              {pending ? "Сохраняем…" : "Сохранить контакты"}
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}
