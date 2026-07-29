"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  focusMediaAlt,
  uploadImages,
  type UploadFailure,
} from "@/components/admin/ImagePicker";
import { MediaAltEditor } from "@/components/admin/MediaAltEditor";
import { MediaNameEditor } from "@/components/admin/MediaNameEditor";
import { Alert, EmptyState, Panel, Thumb } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { formatBytes, formatDateTime, mediaSrc } from "@/lib/admin/format";
import type { AdminMedia } from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { deleteMediaAction, revalidateMediaAction } from "./actions";

/**
 * Медиатека: загрузка и список файлов.
 *
 * Порядок работы — «сначала загрузил, потом подписал». При загрузке описание
 * не спрашивается вовсе: на пачку файлов одна подпись бессмысленна. Только что
 * загруженные файлы собираются в отдельный блок над списком, у каждого своё
 * поле описания и своя кнопка сохранения, а фокус уезжает в первое из них.
 *
 * Список приходит с сервера (`items`), свежезагруженные файлы клиент держит у
 * себя: они видны сразу, не дожидаясь `router.refresh()`, а когда список
 * перечитается — показываются уже данные сервера.
 */
export function MediaLibrary({ items, total }: { items: AdminMedia[]; total: number }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<AdminMedia[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failures, setFailures] = useState<UploadFailure[]>([]);
  const focusTargetRef = useRef<string | null>(null);

  // Фокус ставим в эффекте: к этому моменту поле описания уже отрисовано.
  // Цель лежит в ref — эффекту нечего пересчитывать, состояние он не трогает.
  useEffect(() => {
    const target = focusTargetRef.current;
    if (!target) return;
    focusTargetRef.current = null;
    focusMediaAlt(target);
  }, [uploaded]);

  const server = new Map(items.map((item) => [item.id, item]));
  // Свежие показываем в порядке загрузки, остальные — как отдал сервер.
  const fresh = uploaded.map((item) => server.get(item.id) ?? item);
  const freshIds = new Set(uploaded.map((item) => item.id));
  const rest = items.filter((item) => !freshIds.has(item.id));

  async function handleFiles(list: FileList | null) {
    const files = [...(list ?? [])];
    if (files.length === 0) return;

    setFailures([]);
    setProgress({ done: 0, total: files.length });

    const result = await uploadImages(files, (done, count) =>
      setProgress({ done, total: count }),
    );

    setProgress(null);
    setFailures(result.failures);
    if (fileRef.current) fileRef.current.value = "";
    if (result.uploaded.length === 0) return;

    const ids = new Set(result.uploaded.map((media) => media.id));
    setUploaded((current) => [
      ...result.uploaded,
      ...current.filter((media) => !ids.has(media.id)),
    ]);
    focusTargetRef.current = result.uploaded[0].id;

    await revalidateMediaAction();
    router.refresh();
  }

  function forget(id: string) {
    setUploaded((current) => current.filter((media) => media.id !== id));
  }

  return (
    <>
      <Panel className="mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={progress !== null}
              className="h-10 px-5 text-[14px]"
              onClick={() => fileRef.current?.click()}
            >
              {progress ? `Загружено ${progress.done} из ${progress.total}…` : "Загрузить изображения"}
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => void handleFiles(event.target.files)}
            />
          </div>

          <p className="text-[13px] leading-snug text-ink-soft">
            Можно выбрать сразу несколько файлов. Принимаются только растровые изображения — всё
            перекодируется в WebP. Описание (alt) заполняется <b>после</b> загрузки, у каждого файла
            своё.
          </p>

          {progress && (
            <p role="status" className="text-[13px] font-semibold text-ink-soft">
              Файлы уходят по одному: загружено {progress.done} из {progress.total}. Уже загруженные
              не потеряются.
            </p>
          )}

          {failures.length > 0 && (
            <Alert tone="error" title="Загрузились не все файлы">
              <ul className="list-disc space-y-1 pl-5">
                {failures.map((failure) => (
                  <li key={failure.file}>
                    <span className="font-semibold">{failure.file}</span> — {failure.error}
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </div>
      </Panel>

      {fresh.length > 0 && (
        <section className="mb-4 rounded-brand-sm border border-burgundy/30 bg-burgundy/[0.04] p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p role="status" className="text-[14px] font-bold leading-snug text-burgundy-800">
              Только что загружено: {fresh.length}. Заполните описание у каждого файла и сохраните —
              его читают поисковики и те, кто картинку не видит.
            </p>
            <button
              type="button"
              className="text-[12px] font-bold text-burgundy transition hover:underline"
              onClick={() => setUploaded([])}
            >
              Готово, свернуть
            </button>
          </div>

          <MediaGrid items={fresh} highlight onDeleted={forget} />
        </section>
      )}

      {items.length === 0 && fresh.length === 0 ? (
        <EmptyState
          title="Пока ничего не загружено"
          description="Загрузите первое изображение — описание к нему заполняется тут же, после загрузки. Потом файл можно будет выбрать в карточке товара или статьи."
        />
      ) : (
        <>
          {fresh.length > 0 && rest.length > 0 && (
            <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-soft">
              Остальные файлы
            </h2>
          )}
          <MediaGrid items={rest} onDeleted={forget} />
        </>
      )}

      {total > 0 && <p className="mt-3 text-[13px] text-ink-soft">Всего файлов: {total}</p>}
    </>
  );
}

function MediaGrid({
  items,
  highlight,
  onDeleted,
}: {
  items: AdminMedia[];
  highlight?: boolean;
  onDeleted: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "flex flex-col overflow-hidden rounded-brand-sm border bg-white",
            highlight ? "border-burgundy/50 ring-1 ring-burgundy/20" : "border-line",
          )}
        >
          <div className="relative">
            <Thumb
              src={mediaSrc(item.url)}
              alt={item.alt ?? ""}
              className="h-32 w-full rounded-none border-0"
            />
            {highlight && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-burgundy px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                Только что
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-3">
            <p className="text-[11px] text-ink-soft">
              {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
              {formatBytes(item.size)} · {formatDateTime(item.createdAt)}
            </p>

            <MediaNameEditor id={item.id} filename={item.filename} />
            <MediaAltEditor id={item.id} alt={item.alt ?? ""} />

            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              <CopyPathButton url={item.url} />
              <DeleteMedia id={item.id} filename={item.filename} onDeleted={onDeleted} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CopyPathButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-[12px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy"
    >
      {copied ? "Скопировано" : "Копировать путь"}
    </button>
  );
}

export function DeleteMedia({
  id,
  filename,
  onDeleted,
}: {
  id: string;
  filename: string;
  onDeleted?: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <ConfirmDelete
      title="Удалить файл?"
      description={`«${filename}» будет удалён с диска. Ссылки на него в товарах и статьях перестанут работать.`}
      triggerClassName="h-8 px-3 text-[12px]"
      onConfirm={async () => {
        const result = await deleteMediaAction(id);
        if (result.ok) {
          onDeleted?.(id);
          router.refresh();
        }
        return result;
      }}
    />
  );
}
