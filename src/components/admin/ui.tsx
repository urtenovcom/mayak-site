// Примитивы админки. Дизайн-система сайта (токены из globals.css), но плотнее:
// это рабочий инструмент, а не витрина.
//
// В файле нет ни хуков, ни серверного кода — компоненты одинаково работают
// и в server, и в client components.

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// ---------------------------------------------------------------------------
// Поля ввода
// ---------------------------------------------------------------------------

export const controlClass =
  "w-full rounded-brand-sm border border-line bg-white px-3 py-2 text-[14px] leading-snug text-ink outline-none transition " +
  "placeholder:text-ink-soft/50 focus:border-burgundy/60 focus:ring-2 focus:ring-burgundy/15 disabled:opacity-50";

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClass, "h-10", className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlClass, "min-h-[92px] resize-y", className)} {...props} />;
}

export function SelectInput({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(controlClass, "h-10 pr-8", className)} {...props} />;
}

export function Field({
  label,
  hint,
  required,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft"
      >
        {label}
        {required && <span className="ml-1 text-burgundy">*</span>}
      </label>
      {children}
      {hint && <p className="text-[12px] leading-snug text-ink-soft/80">{hint}</p>}
    </div>
  );
}

/**
 * Выбор нескольких значений из справочника.
 *
 * Нужен там, где значение уходит в фильтр или в перечисление: свободный ввод
 * там опасен — опечатка или новое слово молча выкидывают запись из фильтров,
 * потому что справочники живут в коде (`src/lib/catalog.ts`), а не в базе.
 *
 * Значения, уже сохранённые у записи, но отсутствующие в справочнике, не
 * теряются: они показываются отмеченными в конце списка и помечены. Снять
 * такое значение можно, добавить новое такое — нет.
 *
 * Разметка — обычные `<input type="checkbox">` внутри `<label>`: работает с
 * клавиатуры без единой строчки JS, подпись связана с контролом, на узком
 * экране «чипы» переносятся по строкам.
 */
export function CheckboxGroup({
  label,
  hint,
  options,
  selected,
  onChange,
  disabled,
  unknownHint = "нет в справочнике — в фильтрах не участвует",
  className,
}: {
  label: string;
  hint?: ReactNode;
  /** Справочник: значения, которые разрешено добавлять. */
  options: readonly string[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  /** Подпись у значения, которого нет в справочнике. */
  unknownHint?: string;
  className?: string;
}) {
  // Порядок значимый: сначала справочник, потом «чужие» значения записи.
  const unknown = selected.filter((item) => !options.includes(item));

  function toggle(value: string, checked: boolean) {
    onChange(
      checked
        ? [...selected.filter((item) => item !== value), value]
        : selected.filter((item) => item !== value),
    );
  }

  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-1.5", className)} disabled={disabled}>
      <legend className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft">
        {label}
      </legend>

      <div className="flex flex-wrap gap-2 pt-0.5">
        {[...options, ...unknown].map((value) => {
          const checked = selected.includes(value);
          const isUnknown = !options.includes(value);

          return (
            <label
              key={value}
              title={isUnknown ? unknownHint : undefined}
              className={cn(
                "inline-flex max-w-full cursor-pointer select-none items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] leading-snug transition",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-burgundy/30",
                checked
                  ? "border-burgundy/45 bg-burgundy/[0.06] font-semibold text-ink"
                  : "border-line bg-white text-ink-soft hover:border-burgundy/40 hover:text-ink",
                isUnknown && "border-dashed",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-[var(--burgundy)]"
                checked={checked}
                disabled={disabled}
                onChange={(event) => toggle(value, event.target.checked)}
              />
              <span className="min-w-0 truncate">{value}</span>
              {isUnknown && (
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-burgundy/70">
                  вне справочника
                </span>
              )}
            </label>
          );
        })}
      </div>

      {hint && <p className="text-[12px] leading-snug text-ink-soft/80">{hint}</p>}

      {unknown.length > 0 && (
        <p className="text-[12px] leading-snug text-burgundy/80">
          Значения с пометкой «вне справочника» сохранены у товара, но ни одним фильтром каталога не
          отбираются. Снять можно, добавить новое такое — нельзя.
        </p>
      )}
    </fieldset>
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: { label: string } & ComponentProps<"input">) {
  return (
    <label
      className={cn(
        "inline-flex select-none items-center gap-2.5 text-[14px] text-ink",
        className,
      )}
    >
      <input
        type="checkbox"
        className="h-4 w-4 shrink-0 accent-[var(--burgundy)]"
        {...props}
      />
      {label}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Контейнеры
// ---------------------------------------------------------------------------

export function Panel({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-brand-sm border border-line bg-white shadow-[0_1px_2px_rgba(66,30,42,0.04)]",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-extrabold tracking-tight text-ink">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PageHead({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Состояния
// ---------------------------------------------------------------------------

// Акцентная полоса — box-shadow, а не border-left: в globals.css есть
// незаслоённое правило `* { border-color: var(--line) }`, которое перебивает
// любые утилиты Tailwind для цвета рамки.
const alertTones = {
  error: "bg-burgundy/[0.07] text-burgundy-800 shadow-[inset_4px_0_0_var(--burgundy)]",
  success: "bg-emerald-50 text-emerald-900 shadow-[inset_4px_0_0_#059669]",
  info: "bg-warm-soft text-ink-soft shadow-[inset_4px_0_0_var(--warm)]",
} as const;

export function Alert({
  tone = "error",
  title,
  className,
  children,
}: {
  tone?: keyof typeof alertTones;
  title?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "rounded-brand-sm border py-3 pl-5 pr-3.5 text-[14px] leading-relaxed",
        alertTones[tone],
        className,
      )}
    >
      {title && <p className="font-bold">{title}</p>}
      {children && <div className={cn(title && "mt-1", "whitespace-pre-line")}>{children}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-brand-sm border border-dashed border-line bg-warm-bg/60 px-6 py-12 text-center">
      <p className="text-[15px] font-bold text-ink">{title}</p>
      {description && (
        <p className="max-w-md text-[13px] leading-relaxed text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Скелет для loading.tsx — форма страницы читается до прихода данных. */
export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-brand-sm border border-line bg-white"
          style={{ opacity: 1 - index * 0.09 }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Мелочи
// ---------------------------------------------------------------------------

const badgeTones = {
  neutral: "border-line bg-warm-soft text-ink-soft",
  accent: "border-burgundy/25 bg-burgundy/10 text-burgundy",
  success: "border-emerald-600/25 bg-emerald-50 text-emerald-700",
  muted: "border-line bg-white text-ink-soft",
} as const;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof badgeTones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-bold leading-5",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Превью картинки в админке.
 *
 * Осознанно обычный <img>, а не next/image: загруженные файлы отдаются через
 * защищённый cookie роут `/admin/uploads/...`, а оптимизатор next/image ходит
 * за исходником без cookie и получил бы 401.
 */
export function Thumb({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-brand-sm border border-dashed border-line bg-warm-bg text-[11px] text-ink-soft/70",
          className,
        )}
      >
        нет
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("rounded-brand-sm border border-line bg-warm-bg object-cover", className)}
    />
  );
}

export const tableClass = "w-full border-collapse text-left text-[14px]";
export const thClass =
  "sticky top-0 z-10 whitespace-nowrap border-b border-line bg-warm-soft px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-soft";
export const tdClass = "border-b border-line px-3 py-2.5 align-top";

/** Пагинация ссылками: состояние живёт в URL, страница остаётся серверной. */
export function Pagination({
  page,
  pages,
  total,
  hrefFor,
}: {
  page: number;
  pages: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) {
    return <p className="text-[13px] text-ink-soft">Всего записей: {total}</p>;
  }

  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-line bg-white px-3 text-[13px] font-bold text-ink transition hover:border-burgundy/40 hover:text-burgundy";

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Страницы">
      <span className="mr-1 text-[13px] text-ink-soft">
        Стр. {page} из {pages} · всего {total}
      </span>
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={linkClass}>
          Назад
        </Link>
      )}
      {page < pages && (
        <Link href={hrefFor(page + 1)} className={linkClass}>
          Вперёд
        </Link>
      )}
    </nav>
  );
}
