"use client";

import { useId, useRef, useState } from "react";
import {
  MediaLibraryDialog,
  uploadImages,
  type UploadFailure,
} from "@/components/admin/ImagePicker";
import { Alert, TextInput, Thumb } from "@/components/admin/ui";
import { mediaSrc } from "@/lib/admin/format";
import { cn } from "@/lib/cn";
import { MAX_ALT_LENGTH, isLocalImagePath, type GalleryImage } from "@/lib/media";

/** Столько фотографий принимает API (см. MAX_IMAGES в контроллере товара). */
export const MAX_IMAGES = 24;

const smallButton =
  "inline-flex h-8 items-center justify-center rounded-full border border-line bg-white px-3 text-[12px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy disabled:opacity-40";

const dangerButton =
  "inline-flex h-8 items-center justify-center rounded-full border border-burgundy/25 bg-white px-3 text-[12px] font-bold text-burgundy transition hover:bg-burgundy hover:text-white disabled:opacity-40";

/**
 * Фотографии товара: галерея с выбором обложки.
 *
 * `images` — все фотографии в порядке показа, `cover` — обложка (её
 * показывают карточка каталога, JSON-LD и превью модалки). Обложка обязана
 * входить в набор, иначе API вернёт 400, поэтому компонент держит это
 * соответствие сам: первая добавленная фотография становится обложкой, а при
 * удалении обложки роль переходит к первой оставшейся.
 */
export function GalleryEditor({
  images,
  cover,
  onChange,
  disabled,
}: {
  images: GalleryImage[];
  cover: string;
  onChange: (next: { images: GalleryImage[]; cover: string }) => void;
  disabled?: boolean;
}) {
  const uid = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failures, setFailures] = useState<UploadFailure[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const full = images.length >= MAX_IMAGES;

  /**
   * Добавляет фотографии, не трогая уже имеющиеся; первая — обложка.
   *
   * Описание приезжает вместе с путём (из медиатеки — как значение по
   * умолчанию) и дальше живёт у товара своей жизнью: правка описания здесь
   * медиатеку не меняет, и наоборот.
   */
  function add(added: GalleryImage[]) {
    const next = [...images];
    let skippedDuplicates = 0;
    let skippedExternal = 0;

    for (const raw of added) {
      const path = raw.src.trim();
      if (!path) continue;
      if (!isLocalImagePath(path)) {
        skippedExternal += 1;
        continue;
      }
      if (next.some((image) => image.src === path)) {
        skippedDuplicates += 1;
        continue;
      }
      if (next.length >= MAX_IMAGES) break;
      next.push({ src: path, alt: raw.alt.trim().slice(0, MAX_ALT_LENGTH) });
    }

    const messages: string[] = [];
    if (skippedDuplicates > 0) messages.push(`уже есть в галерее: ${skippedDuplicates}`);
    if (skippedExternal > 0) messages.push(`не с этого сайта: ${skippedExternal}`);
    if (next.length === MAX_IMAGES && added.length > 0) {
      messages.push(`достигнут предел в ${MAX_IMAGES} фотографий`);
    }
    setNotice(messages.length > 0 ? `Добавлены не все — ${messages.join("; ")}.` : null);

    onChange({
      images: next,
      cover:
        cover && next.some((image) => image.src === cover) ? cover : (next[0]?.src ?? ""),
    });
  }

  /**
   * Загрузка нескольких файлов.
   *
   * Описание при загрузке не спрашивается: у свежезагруженного файла его ещё
   * нет, и вводят его тут же, в поле под миниатюрой — у каждой фотографии
   * своё. Уже загруженное не теряется, даже если файл в середине отвалился.
   */
  async function handleFiles(list: FileList | null) {
    const files = [...(list ?? [])];
    if (files.length === 0) return;

    setFailures([]);
    setNotice(null);
    setProgress({ done: 0, total: files.length });

    const { uploaded, failures: failed } = await uploadImages(files, (done, total) =>
      setProgress({ done, total }),
    );

    setProgress(null);
    setFailures(failed);
    if (uploaded.length > 0) add(uploaded.map((media) => ({ src: media.url, alt: "" })));
    if (fileRef.current) fileRef.current.value = "";
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ images: next, cover });
  }

  function remove(index: number) {
    const next = images.filter((_, i) => i !== index);
    // Обложку удалили — роль переходит к первой оставшейся фотографии.
    onChange({
      images: next,
      cover: next.some((image) => image.src === cover) ? cover : (next[0]?.src ?? ""),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={smallButton}
          disabled={disabled || full || progress !== null}
          onClick={() => fileRef.current?.click()}
        >
          {progress ? `Загружено ${progress.done} из ${progress.total}…` : "Загрузить фотографии"}
        </button>

        <MediaLibraryDialog
          onPick={(url, alt) => add([{ src: url, alt: alt ?? "" }])}
          disabled={disabled || full || progress !== null}
        />

        <span className="text-[12px] text-ink-soft/80">
          {images.length} из {MAX_IMAGES}
        </span>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {progress && (
        <p role="status" className="text-[12px] font-semibold text-ink-soft">
          Файлы уходят по одному: загружено {progress.done} из {progress.total}. Уже загруженные не
          потеряются.
        </p>
      )}

      {failures.length > 0 && (
        <Alert tone="error">
          Не удалось загрузить {failures.length} из выбранных файлов — остальные добавлены:
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            {failures.map((failure) => (
              <li key={failure.file}>
                <span className="font-semibold">{failure.file}</span> — {failure.error}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {notice && <Alert tone="info">{notice}</Alert>}

      {images.length === 0 ? (
        <p className="rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-4 py-6 text-center text-[13px] text-ink-soft">
          Фотографий пока нет. Загрузите файлы или выберите их из медиатеки — первая станет
          обложкой.
        </p>
      ) : (
        // Радиогруппа: обложка одна, поэтому именно radio, а не флажки —
        // стрелками между ними ходит сам браузер.
        <fieldset disabled={disabled}>
          <legend className="sr-only">Фотографии товара и выбор обложки</legend>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => {
              const isCover = image.src === cover;
              const coverId = `${uid}-cover-${index}`;
              const altId = `${uid}-alt-${index}`;

              return (
                <li
                  key={image.src}
                  className={cn(
                    "flex flex-col gap-2 rounded-brand-sm border bg-white p-2",
                    isCover ? "border-burgundy/50 ring-1 ring-burgundy/20" : "border-line",
                  )}
                >
                  <div className="relative">
                    <Thumb src={mediaSrc(image.src)} alt="" className="h-28 w-full" />
                    {isCover && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-burgundy px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                        Обложка
                      </span>
                    )}
                  </div>

                  <label
                    htmlFor={coverId}
                    className="inline-flex cursor-pointer select-none items-center gap-2 text-[12px] font-semibold text-ink"
                  >
                    <input
                      id={coverId}
                      type="radio"
                      name={`${uid}-cover`}
                      className="h-4 w-4 shrink-0 accent-[var(--burgundy)]"
                      checked={isCover}
                      disabled={disabled}
                      onChange={() => onChange({ images, cover: image.src })}
                    />
                    Обложка
                  </label>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={altId}
                      className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft"
                    >
                      Описание (alt)
                    </label>
                    <TextInput
                      id={altId}
                      value={image.alt}
                      maxLength={MAX_ALT_LENGTH}
                      disabled={disabled}
                      placeholder="Что на фотографии"
                      className="h-9 text-[13px]"
                      onChange={(event) =>
                        onChange({
                          images: images.map((item, i) =>
                            i === index ? { ...item, alt: event.target.value } : item,
                          ),
                          cover,
                        })
                      }
                    />
                    {!image.alt.trim() && (
                      <span className="text-[11px] leading-snug text-ink-soft/80">
                        Лучше заполнить: описание читают поисковики и те, кто картинку не видит.
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      className={smallButton}
                      disabled={disabled || index === 0}
                      aria-label={`Переместить фотографию ${index + 1} левее`}
                      onClick={() => move(index, -1)}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className={smallButton}
                      disabled={disabled || index === images.length - 1}
                      aria-label={`Переместить фотографию ${index + 1} правее`}
                      onClick={() => move(index, 1)}
                    >
                      →
                    </button>
                    <button
                      type="button"
                      className={dangerButton}
                      disabled={disabled || images.length === 1}
                      title={
                        images.length === 1
                          ? "У товара должна остаться хотя бы одна фотография — она же обложка"
                          : undefined
                      }
                      aria-label={`Удалить фотографию ${index + 1}`}
                      onClick={() => remove(index)}
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      {images.length === 1 && (
        <p className="text-[12px] leading-snug text-ink-soft/80">
          Это единственная фотография товара, поэтому она же обложка и удалить её нельзя. Загрузите
          вторую — тогда лишнюю можно будет убрать.
        </p>
      )}
    </div>
  );
}
