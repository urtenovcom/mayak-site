"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { MediaAltEditor, mediaAltInputId } from "@/components/admin/MediaAltEditor";
import { Alert, TextInput, Thumb, controlClass } from "@/components/admin/ui";
import { mediaSrc } from "@/lib/admin/format";
import type { AdminMedia, Paginated } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

const buttonClass =
  "inline-flex h-9 items-center justify-center rounded-full border border-line bg-white px-3.5 text-[13px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy disabled:opacity-50";

/** Ошибка загрузки конкретного файла — показываем, какой именно и почему. */
export type UploadFailure = { file: string; error: string };

/** Ответ загрузки → запись медиатеки. `null`, если API вернул что-то другое. */
function toAdminMedia(data: Record<string, unknown> | null): AdminMedia | null {
  if (!data || typeof data.id !== "string" || typeof data.url !== "string") return null;

  return {
    id: data.id,
    url: data.url,
    filename:
      typeof data.filename === "string" ? data.filename : (data.url.split("/").pop() ?? data.url),
    mimeType: typeof data.mimeType === "string" ? data.mimeType : "image/webp",
    size: typeof data.size === "string" || typeof data.size === "number" ? data.size : 0,
    width: typeof data.width === "number" ? data.width : null,
    height: typeof data.height === "number" ? data.height : null,
    alt: typeof data.alt === "string" ? data.alt : null,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
  };
}

/**
 * Загружает файл через свой домен: JWT подставляет серверный роут.
 *
 * Описание при загрузке не задаётся вовсе — его заполняют потом у каждого
 * файла отдельно (`MediaAltEditor`). Возвращает запись медиатеки целиком:
 * вызывающей стороне нужен и путь, и `id`, чтобы тут же дать полю описания.
 */
export async function uploadImage(file: File): Promise<{ media: AdminMedia } | { error: string }> {
  const body = new FormData();
  body.append("file", file);

  let response: Response;
  try {
    response = await fetch("/admin/api/media", { method: "POST", body });
  } catch {
    return { error: "Сеть недоступна: файл не загружен." };
  }

  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : `Ошибка загрузки (${response.status}).`;
    return { error: message };
  }

  const media = toAdminMedia(data);
  if (!media) return { error: "API не вернул данные о загруженном файле." };
  return { media };
}

/**
 * Загрузка пачки файлов.
 *
 * Эндпоинт медиатеки принимает по одному файлу на запрос, поэтому грузим
 * последовательно. Отвалившийся файл не отменяет остальные: успешные копятся,
 * неудачные возвращаются списком с причиной.
 */
export async function uploadImages(
  files: readonly File[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ uploaded: AdminMedia[]; failures: UploadFailure[] }> {
  const uploaded: AdminMedia[] = [];
  const failures: UploadFailure[] = [];

  for (const [index, file] of files.entries()) {
    const result = await uploadImage(file);
    if ("error" in result) failures.push({ file: file.name, error: result.error });
    else uploaded.push(result.media);
    onProgress?.(index + 1, files.length);
  }

  return { uploaded, failures };
}

/**
 * Ставит фокус в поле описания только что загруженного файла.
 *
 * `preventScroll` + `block: "nearest"` — чтобы страница не прыгала: если поле
 * и так на экране, прокрутки не будет вовсе.
 */
export function focusMediaAlt(mediaId: string): void {
  const input = document.getElementById(mediaAltInputId(mediaId));
  if (!(input instanceof HTMLInputElement)) return;

  input.focus({ preventScroll: true });
  input.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

export function ImagePicker({
  id,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const result = await uploadImage(file);
    setUploading(false);
    if ("error" in result) setError(result.error);
    else onChange(result.media.url);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <Thumb src={mediaSrc(value)} alt="" className="h-16 w-16 shrink-0" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TextInput
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/uploads/файл.webp или /renders/файл.webp"
            disabled={disabled}
          />

          <div className="flex flex-wrap gap-2">
            <MediaLibraryDialog onPick={(url) => onChange(url)} disabled={disabled} />

            <button
              type="button"
              className={buttonClass}
              disabled={disabled || uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Загружаем…" : "Загрузить файл"}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
          </div>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}

/**
 * Выбор файла из медиатеки. Используется и одиночным полем, и галереей товара.
 *
 * Здесь же можно загрузить новые файлы: порядок такой же, как в разделе
 * «Медиатека» — сначала загрузили, потом подписали каждый файл по отдельности.
 */
export function MediaLibraryDialog({
  onPick,
  disabled,
}: {
  /** `alt` — описание файла из медиатеки: значение по умолчанию для места, куда его вставляют. */
  onPick: (url: string, alt: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminMedia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failures, setFailures] = useState<UploadFailure[]>([]);
  /** id только что загруженных файлов: они идут первыми и подсвечены. */
  const [fresh, setFresh] = useState<string[]>([]);
  const focusTargetRef = useRef<string | null>(null);

  // Фокус ставим после того, как поле отрисовано, — то есть в эффекте, уже
  // по готовому DOM. Цель лежит в ref, чтобы эффект ничего не пересчитывал.
  useEffect(() => {
    const target = focusTargetRef.current;
    if (!target) return;
    focusTargetRef.current = null;
    focusMediaAlt(target);
  }, [items]);

  const load = useCallback(async (query: string) => {
    setError(null);
    setItems(null);
    setFresh([]);
    try {
      const response = await fetch(
        `/admin/api/media?limit=60${query ? `&search=${encodeURIComponent(query)}` : ""}`,
      );
      const data = (await response.json().catch(() => null)) as
        | (Paginated<AdminMedia> & { error?: string })
        | null;

      if (!response.ok || !data) {
        setError(typeof data?.error === "string" ? data.error : "Не удалось загрузить медиатеку.");
        setItems([]);
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setError("Сеть недоступна: медиатека не загружена.");
      setItems([]);
    }
  }, []);

  // Список грузим на открытии диалога, а не в эффекте: поиск перезапускается
  // кнопкой, а setState внутри useEffect даёт каскадные рендеры.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) void load(search);
  }

  async function handleFiles(list: FileList | null) {
    const files = [...(list ?? [])];
    if (files.length === 0) return;

    setFailures([]);
    setProgress({ done: 0, total: files.length });

    const { uploaded, failures: failed } = await uploadImages(files, (done, total) =>
      setProgress({ done, total }),
    );

    setProgress(null);
    setFailures(failed);
    if (fileRef.current) fileRef.current.value = "";
    if (uploaded.length === 0) return;

    const uploadedIds = new Set(uploaded.map((media) => media.id));
    setFresh(uploaded.map((media) => media.id));
    setItems((current) => [
      ...uploaded,
      ...(current ?? []).filter((media) => !uploadedIds.has(media.id)),
    ]);
    focusTargetRef.current = uploaded[0].id;
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger className={buttonClass} disabled={disabled}>
        Из медиатеки
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-carbon/40 backdrop-blur-[2px]" />
        <Dialog.Content className="anim-modal fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[min(860px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-brand-sm border border-line bg-white shadow-float">
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <Dialog.Title className="text-[16px] font-extrabold tracking-tight text-ink">
              Медиатека
            </Dialog.Title>
            <Dialog.Close className="text-[13px] font-bold text-ink-soft transition hover:text-burgundy">
              Закрыть
            </Dialog.Close>
          </header>

          <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
            <input
              className={cn(controlClass, "h-9 min-w-[200px] flex-1")}
              value={search}
              aria-label="Поиск по имени файла"
              placeholder="Поиск по имени файла"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void load(search);
                }
              }}
            />
            <button type="button" className={buttonClass} onClick={() => void load(search)}>
              Найти
            </button>

            <button
              type="button"
              className={buttonClass}
              disabled={progress !== null}
              onClick={() => fileRef.current?.click()}
            >
              {progress ? `Загружено ${progress.done} из ${progress.total}…` : "Загрузить файлы"}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => void handleFiles(event.target.files)}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {error && <Alert tone="error">{error}</Alert>}

            {progress && (
              <p role="status" className="mb-3 text-[13px] font-semibold text-ink-soft">
                Файлы уходят по одному: загружено {progress.done} из {progress.total}. Уже
                загруженные не потеряются.
              </p>
            )}

            {failures.length > 0 && (
              <Alert tone="error" className="mb-3">
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

            {fresh.length > 0 && !progress && (
              <p
                role="status"
                className="mb-3 rounded-brand-sm bg-burgundy/[0.07] px-3.5 py-2.5 text-[13px] leading-snug text-burgundy-800 shadow-[inset_4px_0_0_var(--burgundy)]"
              >
                Загружено файлов: {fresh.length}. Они первые в списке и отмечены — заполните
                описание у каждого и сохраните. Клик по картинке вставляет её.
              </p>
            )}

            {items === null && <p className="text-[14px] text-ink-soft">Загружаем медиатеку…</p>}

            {items !== null && items.length === 0 && !error && (
              <p className="text-[14px] text-ink-soft">
                Пока ничего не загружено. Нажмите «Загрузить файлы» — описание заполняется потом, у
                каждого файла отдельно.
              </p>
            )}

            {items !== null && items.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => {
                  const isFresh = fresh.includes(item.id);

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "flex flex-col overflow-hidden rounded-brand-sm border bg-white",
                        isFresh ? "border-burgundy/50 ring-1 ring-burgundy/20" : "border-line",
                      )}
                    >
                      <button
                        type="button"
                        className="group text-left transition hover:opacity-90"
                        onClick={() => {
                          onPick(item.url, item.alt ?? "");
                          setOpen(false);
                        }}
                      >
                        <div className="relative">
                          <Thumb
                            src={mediaSrc(item.url)}
                            alt={item.alt ?? ""}
                            className="h-28 w-full rounded-none border-0"
                          />
                          {isFresh && (
                            <span className="absolute left-1.5 top-1.5 rounded-full bg-burgundy px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                              Только что
                            </span>
                          )}
                        </div>
                        <span className="block truncate px-2.5 pt-2 text-[12px] font-semibold text-ink group-hover:text-burgundy">
                          {item.filename}
                        </span>
                        <span className="block px-2.5 pb-2 text-[11px] text-ink-soft/80">
                          Нажмите, чтобы вставить
                        </span>
                      </button>

                      <MediaAltEditor
                        id={item.id}
                        alt={item.alt ?? ""}
                        className="mt-auto border-t border-line px-2.5 py-2"
                        onSaved={(next) =>
                          setItems(
                            (current) =>
                              current?.map((media) =>
                                media.id === item.id ? { ...media, alt: next } : media,
                              ) ?? current,
                          )
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
