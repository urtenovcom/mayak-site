"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { controlClass } from "@/components/admin/ui";
import { renameMediaAction } from "@/lib/admin/media-actions";
import { cn } from "@/lib/cn";

/** Имя без расширения: расширение задаётся содержимым файла и не правится. */
function baseName(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

function extension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot) : "";
}

/**
 * Имя файла в медиатеке.
 *
 * Правится именно имя на диске, а не подпись рядом с ним: оно попадает в адрес
 * картинки, а адрес читают и люди, и поисковики. Загрузка даёт имя вида
 * `IMG_3421-1753…webp` — осмысленное приходится задавать руками.
 *
 * Расширение не показываем в поле и не даём менять: тип файла определяется
 * содержимым (всё перекодировано в WebP), а имя на это не влияет. Кириллицу
 * API транслитерирует, поэтому вводить можно по-русски.
 *
 * После переименования список перечитывается: у файла меняется адрес, и
 * ссылки на него в товарах и статьях API переписывает сам — иначе картинки
 * в уже собранном контенте отвалились бы.
 */
export function MediaNameEditor({
  id,
  filename,
  className,
}: {
  id: string;
  filename: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(baseName(filename));
  const [saved, setSaved] = useState(baseName(filename));
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const dirty = value.trim() !== saved.trim();

  async function save() {
    if (!dirty || state === "saving") return;
    if (!value.trim()) {
      setError("Имя не может быть пустым.");
      return;
    }

    setState("saving");
    setError(null);

    const result = await renameMediaAction(id, value);
    if (result.ok) {
      setSaved(baseName(result.data.filename));
      setValue(baseName(result.data.filename));
      setState("saved");
      setError(null);
      router.refresh();
    } else {
      setState("idle");
      setError(result.error);
    }
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={`media-name-${id}`}
        className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft"
      >
        Имя файла
      </label>
      <div className="flex items-center gap-1">
        <input
          id={`media-name-${id}`}
          className={cn(controlClass, "h-8 min-w-0 flex-1 text-[12px]")}
          value={value}
          maxLength={80}
          placeholder="bytovka-6m"
          onChange={(event) => {
            setValue(event.target.value);
            setState("idle");
          }}
          onKeyDown={(event) => {
            // Поле живёт вне формы: Enter здесь по умолчанию не делает ничего.
            if (event.key === "Enter") {
              event.preventDefault();
              void save();
            }
          }}
        />
        <span className="shrink-0 text-[12px] font-semibold text-ink-soft">
          {extension(filename)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="text-[11px] font-bold text-burgundy transition hover:underline disabled:opacity-40"
          disabled={!dirty || state === "saving"}
          onClick={() => void save()}
        >
          {state === "saving" ? "Переименовываем…" : "Переименовать"}
        </button>
        {state === "saved" && !dirty && (
          <span className="text-[11px] font-bold text-emerald-700">переименован</span>
        )}
      </div>
      {error && (
        <span role="alert" className="text-[11px] leading-snug text-burgundy">
          {error}
        </span>
      )}
    </div>
  );
}
