import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { CONTACTS, SITE } from "@/lib/site";

// Шаблон, требует проверки юристом. Числовые реквизиты — плейсхолдеры.

export const metadata: Metadata = {
  title: "Реквизиты",
  description:
    "Реквизиты ООО «Маяк»: ИНН, КПП, ОГРН, расчётный счёт, банк, юридический адрес, контакты.",
};

const REQUISITES: { label: string; value: string }[] = [
  { label: "Полное наименование", value: "Общество с ограниченной ответственностью «Маяк»" },
  { label: "Сокращённое наименование", value: SITE.legalName },
  { label: "ИНН", value: "уточняются" },
  { label: "КПП", value: "уточняются" },
  { label: "ОГРН", value: "уточняются" },
  { label: "Расчётный счёт", value: "уточняются" },
  { label: "Банк", value: "уточняются" },
  { label: "БИК", value: "уточняются" },
  { label: "Корреспондентский счёт", value: "уточняются" },
  { label: "Юридический адрес", value: "уточняются" },
  { label: "Адрес производства", value: CONTACTS.address },
  { label: "Электронная почта", value: CONTACTS.email },
];

export default function RekvizityPage() {
  return (
    <LegalLayout
      label="Документы"
      title="Реквизиты"
      description="Реквизиты ООО «Маяк» для заключения договоров и оформления документов."
    >
      <div className="overflow-hidden rounded-[22px] border border-line bg-warm-soft">
        <dl className="divide-y divide-line">
          {REQUISITES.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-6 sm:px-6"
            >
              <dt className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-soft sm:w-56">
                {row.label}
              </dt>
              <dd className="text-[15px] font-medium text-ink">
                {row.label === "Электронная почта" ? (
                  <a
                    href={`mailto:${row.value}`}
                    className="text-burgundy underline underline-offset-2"
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-6 text-[14px] text-ink-soft leading-relaxed">
        Часть реквизитов уточняется. Актуальные банковские и регистрационные
        данные предоставляются при заключении договора.
      </p>
    </LegalLayout>
  );
}
