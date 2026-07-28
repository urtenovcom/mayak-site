"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState, useTransition } from "react";
import { Alert, Checkbox, Field, Panel, TextInput } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { AdminSiteSettings } from "@/lib/admin/types";
import {
  MAX_DISALLOW_LENGTH,
  MAX_DISALLOW_PATHS,
  renderRobotsTxt,
  SERVICE_DISALLOW,
  toDisallowPaths,
} from "@/lib/robots-rules";
import { SITE_URL } from "@/lib/site";
import { saveRobotsAction, type RobotsFormValues } from "./actions";

/** Строка списка. `key` — ключ React, на сервер не уходит. */
type PathRow = { value: string; key: string };

let rowSeq = 0;
function toRows(paths: string[]): PathRow[] {
  return paths.map((value) => ({ value, key: `path-${rowSeq++}` }));
}

const secondaryButton =
  "inline-flex h-9 items-center rounded-full border border-line bg-white px-4 text-[13px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy disabled:opacity-50";

export function RobotsForm({ settings }: { settings: AdminSiteSettings }) {
  const router = useRouter();
  const uid = useId();

  // Отсутствующее поле (старая версия API) читается как «разрешено» — то же
  // правило, что и на сайте: сбой не должен закрывать сайт от поисковиков.
  const [indexing, setIndexing] = useState(settings.robotsIndexing !== false);
  const [rows, setRows] = useState<PathRow[]>(() =>
    toRows(toDisallowPaths(settings.robotsDisallow)),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // ПРЕДПРОСМОТР строится той же функцией, что и настоящий /robots.txt
  // (src/lib/robots-rules.ts), и обновляется на каждое нажатие клавиши:
  // текстовый формат без предпросмотра ломают регулярно, а увидев файл
  // целиком, человек замечает лишний или потерянный путь сразу.
  const preview = useMemo(
    () =>
      renderRobotsTxt(
        {
          indexing,
          // В предпросмотр идут только пригодные пути: недописанная строка не
          // должна показывать заведомо неверный файл.
          disallow: toDisallowPaths(rows.map((row) => row.value.trim())),
        },
        SITE_URL,
      ),
    [indexing, rows],
  );

  function updateRow(key: string, value: string) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, value } : row)));
  }

  function addRow() {
    setRows((current) => [...current, { value: "", key: `path-${rowSeq++}` }]);
  }

  function removeRow(key: string) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const values: RobotsFormValues = {
      robotsIndexing: indexing,
      robotsDisallow: rows.map((row) => row.value),
    };

    startTransition(async () => {
      const result = await saveRobotsAction(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Сохранено. robots.txt на сайте уже изменился.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Panel
        title="Индексация сайта поисковиками"
        description="Пускать ли поисковики на сайт и какие разделы закрыть от обхода. Файл /robots.txt собирается отсюда."
      >
        {/* Главный выключатель */}
        <div className="rounded-brand-sm border border-line bg-warm-bg/40 p-3.5">
          <Checkbox
            label="Разрешить индексацию сайта поисковиками"
            checked={indexing}
            disabled={pending}
            onChange={(event) => setIndexing(event.target.checked)}
            className="font-bold"
          />
          <p className="mt-1.5 pl-[26px] text-[13px] leading-relaxed text-ink-soft">
            Обычное состояние — включено. Снимите галочку только на время, когда сайт не должен
            попадать в поиск: например, пока идёт наполнение или переезд.
          </p>
        </div>

        {!indexing && (
          <Alert tone="error" title="Сайт закрыт от поисковиков" className="mt-3">
            {
              "Пока галочка снята, поисковикам запрещён весь сайт целиком, а страницы отдают " +
              "noindex. Новые страницы в поиск не попадут, а те, что уже там, со временем из " +
              "него выпадут.\n\n" +
              "Возврат не мгновенный: даже сразу после включения поисковику нужно время, чтобы " +
              "заново обойти сайт и вернуть страницы в выдачу. Не оставляйте выключенным " +
              "«на всякий случай»."
            }
          </Alert>
        )}

        {/* Дополнительные запреты */}
        <fieldset className="mt-6 min-w-0" disabled={pending || !indexing}>
          <legend className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
            Дополнительно закрыть от обхода
          </legend>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            Адреса, которые не должны попадать в поиск, — каждый с новой строки и от «/»:
            например <code className="font-mono text-[12px]">/lp-test</code> или{" "}
            <code className="font-mono text-[12px]">/old/</code>. До {MAX_DISALLOW_PATHS} штук.
            Косая черта в конце закрывает весь раздел, без неё — адрес и всё, что начинается
            с него.
          </p>

          <div className="mt-3 flex flex-col gap-2.5">
            {rows.length === 0 && (
              <div className="rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-4 py-6 text-center">
                <p className="text-[13px] font-bold text-ink">Дополнительных запретов нет</p>
                <p className="mx-auto mt-1 max-w-lg text-[13px] leading-relaxed text-ink-soft">
                  Это нормальное состояние: служебные разделы закрыты и без этого списка.
                </p>
              </div>
            )}

            {rows.map((row, index) => (
              <div
                key={row.key}
                className="grid gap-3 rounded-brand-sm border border-line bg-warm-bg/40 p-3.5 lg:grid-cols-[1fr_auto] lg:items-start"
              >
                <Field label={`Путь ${index + 1}`} htmlFor={`${uid}-${row.key}`}>
                  <TextInput
                    id={`${uid}-${row.key}`}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={MAX_DISALLOW_LENGTH}
                    placeholder="/lp-test"
                    value={row.value}
                    onChange={(event) => updateRow(row.key, event.target.value)}
                  />
                </Field>

                <div className="lg:pt-[26px]">
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    className="inline-flex h-10 items-center rounded-full border border-burgundy/25 bg-white px-4 text-[13px] font-bold text-burgundy transition hover:bg-burgundy hover:text-white"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button
              type="button"
              className={secondaryButton}
              onClick={addRow}
              disabled={pending || rows.length >= MAX_DISALLOW_PATHS}
            >
              + Добавить путь
            </button>
          </div>

          {rows.length >= MAX_DISALLOW_PATHS && (
            <p className="mt-2 text-[12px] leading-snug text-burgundy/80">
              Достигнут предел — {MAX_DISALLOW_PATHS} путей. Чтобы добавить новый, удалите
              какой-нибудь из списка.
            </p>
          )}

          {!indexing && (
            <p className="mt-2 text-[12px] leading-snug text-ink-soft">
              Список отключён: индексация выключена целиком, и отдельные запреты в файл не
              попадают — общий запрет их и так покрывает. Значения сохранятся и вернутся, когда
              индексацию включат.
            </p>
          )}
        </fieldset>

        {/* Предпросмотр */}
        <div className="mt-6">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
            Что получится в /robots.txt
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            Ровно этот текст поисковики увидят по адресу{" "}
            <span className="font-mono text-[12px]">{SITE_URL}/robots.txt</span> сразу после
            сохранения.
          </p>
          <pre className="mt-2 overflow-x-auto rounded-brand-sm border border-line bg-carbon/[0.03] p-3.5 font-mono text-[12.5px] leading-relaxed text-ink">
            {preview}
          </pre>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Alert tone="info" title="Служебные запреты стоят всегда">
            {
              `Строки ${SERVICE_DISALLOW.join(", ")} прописаны в коде сайта и из панели не ` +
              "меняются. Так сделано нарочно: панель управления и служебные адреса обязаны " +
              "оставаться закрытыми от обхода, даже если настройки однажды не прочитаются. " +
              "Чтобы изменить этот набор, нужна правка кода и выкладка сайта.\n\n" +
              "Ссылка на карту сайта (/sitemap.xml) остаётся в файле в любом состоянии " +
              "выключателя: она не зависит от правил обхода, а карта собирается автоматически."
            }
          </Alert>

          {error && (
            <Alert tone="error" title="Не удалось сохранить">
              {error}
            </Alert>
          )}
          {success && <Alert tone="success">{success}</Alert>}

          <div>
            <Button type="submit" disabled={pending} className="h-10 px-5 text-[14px]">
              {pending ? "Сохраняем…" : "Сохранить"}
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}
