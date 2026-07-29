"use client";

import { useState } from "react";
import { controlClass } from "@/components/admin/ui";
import { updateMediaAltAction } from "@/lib/admin/media-actions";
import { cn } from "@/lib/cn";
import { MAX_ALT_LENGTH } from "@/lib/media";

/**
 * DOM-идентификатор поля описания.
 *
 * Детерминированный, а не `useId()`: после загрузки фокус ставится в поле
 * первого загруженного файла, а тот, кто ставит фокус, знает только id файла.
 */
export function mediaAltInputId(mediaId: string): string {
  return `media-alt-${mediaId}`;
}

/**
 * Описание (alt) одного файла медиатеки: своё поле и своё сохранение.
 *
 * Порядок работы: файл сначала загружают, потом подписывают. Общего описания
 * «на пачку» нет — при загрузке нескольких файлов одна подпись на все ничего
 * не описывает.
 *
 * Значение по умолчанию, а не единый источник: при вставке картинки в товар
 * или в блок статьи описание копируется на место и дальше живёт там своей
 * жизнью. Пустое описание — легальное значение (декоративная картинка),
 * поэтому подсказка мягкая и сохранить не мешает.
 */
export function MediaAltEditor({
  id,
  alt,
  onSaved,
  className,
}: {
  id: string;
  alt: string;
  /** Сообщает наружу сохранённое значение — список выше держит его у себя. */
  onSaved?: (alt: string) => void;
  className?: string;
}) {
  const [value, setValue] = useState(alt);
  // Эталон для сравнения — то, что реально лежит в базе. Держим его в
  // состоянии, а не в пропсе: после сохранения «сохранено» должно появиться
  // сразу, не дожидаясь, пока страница перечитает список.
  const [saved, setSaved] = useState(alt);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const dirty = value.trim() !== saved.trim();

  async function save() {
    if (!dirty || state === "saving") return;

    setState("saving");
    setError(null);

    const result = await updateMediaAltAction(id, value);
    if (result.ok) {
      const next = value.trim();
      setSaved(next);
      setState("saved");
      setError(null);
      onSaved?.(next);
    } else {
      setState("idle");
      setError(result.error);
    }
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={mediaAltInputId(id)}
        className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft"
      >
        Описание (alt)
      </label>
      <input
        id={mediaAltInputId(id)}
        className={cn(controlClass, "h-8 text-[12px]")}
        value={value}
        maxLength={MAX_ALT_LENGTH}
        placeholder="Что на изображении"
        onChange={(event) => {
          setValue(event.target.value);
          setState("idle");
        }}
        onKeyDown={(event) => {
          // Enter сохраняет: поле живёт вне формы, и по умолчанию клавиша
          // здесь не делает ничего — руки с клавиатуры убирать не нужно.
          if (event.key === "Enter") {
            event.preventDefault();
            void save();
          }
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="text-[11px] font-bold text-burgundy transition hover:underline disabled:opacity-40"
          disabled={!dirty || state === "saving"}
          onClick={() => void save()}
        >
          {state === "saving" ? "Сохраняем…" : "Сохранить описание"}
        </button>
        {state === "saved" && !dirty && (
          <span className="text-[11px] font-bold text-emerald-700">сохранено</span>
        )}
      </div>
      {error && (
        <span role="alert" className="text-[11px] leading-snug text-burgundy">
          {error}
        </span>
      )}
      {!error && !value.trim() && (
        <span className="text-[11px] leading-snug text-ink-soft/80">
          Лучше заполнить: описание читают поисковики и те, кто картинку не видит.
        </span>
      )}
    </div>
  );
}
