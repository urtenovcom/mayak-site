"use client";

import { useState } from "react";
import { CONTACTS, SITE } from "@/lib/site";
import { Copy, Check } from "@/components/icons";

// Публичные реквизиты компании. Банковские реквизиты на сайте не размещаются —
// по запросу. Юридический адрес добавляется, когда будет предоставлен.
const REQUISITES: { label: string; value: string }[] = [
  {
    label: "Полное наименование",
    value: "Общество с ограниченной ответственностью «Маяк»",
  },
  { label: "Сокращённое наименование", value: SITE.legalName },
  { label: "ИНН", value: "9703183643" },
  { label: "КПП", value: "770301001" },
  { label: "ОГРН", value: "1247700440954" },
  { label: "Адрес производства", value: CONTACTS.address },
  { label: "Электронная почта", value: CONTACTS.email },
];

// Копирование с запасным путём через execCommand (для не-HTTPS-контекста
// и браузеров без Clipboard API).
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Переходим к запасному способу ниже.
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Таблица публичных реквизитов с кнопками копирования + примечание о банковских данных. */
export function Requisites({
  note = true,
  className,
}: {
  note?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    if (await writeClipboard(value)) {
      setCopied(label);
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1500);
    }
  };

  return (
    <div className={className}>
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
              <dd className="flex-1 text-[15px] font-medium text-ink">
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
              <button
                type="button"
                onClick={() => copy(row.label, row.value)}
                aria-label={`Скопировать: ${row.label}`}
                title={copied === row.label ? "Скопировано" : "Скопировать"}
                className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-lg border border-line bg-white text-ink-soft transition-colors hover:border-burgundy/40 hover:text-burgundy sm:mt-0 sm:self-auto"
              >
                {copied === row.label ? (
                  <Check className="h-4 w-4 text-burgundy" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </dl>
      </div>
      {note && (
        <p className="mt-6 text-[14px] leading-relaxed text-ink-soft">
          Банковские реквизиты предоставляются при заключении договора или по
          запросу.
        </p>
      )}
    </div>
  );
}
