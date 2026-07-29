"use client";

/* ============================================================
   Конструктор бытовки.
   Шаги: Назначение → Тип → Размер → Обшивка и цвет → Утепление →
   Окна и двери → Отделка → Инженерия → Итог → Контакты.
   Справа — крупное превью в размер блока (экстерьер, на шаге
   «Отделка» — интерьер). Готовые рендеры, без перекраски.
   ============================================================ */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { Check, ChevronLeft, ChevronRight } from "@/components/icons";
import { cn } from "@/lib/cn";
import { LEAD_ERROR_TEXT, sendLead, type LeadError } from "@/lib/lead-client";
import {
  CLADDINGS,
  COLORS,
  type CladdingId,
  type ColorId,
} from "@/lib/configurator-assets";
import {
  PURPOSE,
  CONSTRUCTION_TYPES,
  SIZES,
  EXPLOITATION,
  WINDOWS,
  DOORS,
  INTERIOR,
  ENGINEERING,
  type StepOption,
} from "@/lib/configurator-steps";

/* —————————————————————————— Состояние —————————————————————————— */

type Config = {
  purpose: string;
  type: string;
  size: string;
  customLength: string;
  customWidth: string;
  customHeight: string;
  cladding: CladdingId;
  color: ColorId;
  exploitation: string;
  windows: string;
  door: string;
  interior: string;
  engineering: string[];
};

const DEFAULT: Config = {
  purpose: "",
  type: "Бытовка",
  size: "",
  customLength: "",
  customWidth: "",
  customHeight: "",
  cladding: "proflist",
  color: "white",
  exploitation: "",
  windows: "",
  door: "Металлическая",
  interior: "",
  engineering: [],
};

const STEPS = [
  "Назначение",
  "Тип конструкции",
  "Размер",
  "Обшивка и цвет",
  "Утепление",
  "Окна и двери",
  "Отделка",
  "Инженерия",
  "Итог",
  "Контакты",
] as const;

/* —————————————————————————— Утилиты —————————————————————————— */

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7").replace(/^7?/, "7");
  const d = digits.slice(0, 11);
  const p = d.slice(1);
  let out = "+7";
  if (p.length > 0) out += " (" + p.slice(0, 3);
  if (p.length >= 3) out += ") " + p.slice(3, 6);
  if (p.length >= 6) out += "-" + p.slice(6, 8);
  if (p.length >= 8) out += "-" + p.slice(8, 10);
  return out;
}

const PHONE_RE = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

function specLines(c: Config) {
  const cl = CLADDINGS.find((x) => x.id === c.cladding)!;
  const co = COLORS.find((x) => x.id === c.color)!;
  return [
    ["Назначение", c.purpose || "—"],
    ["Тип конструкции", c.type || "—"],
    [
      "Размер",
      c.size === "Свой вариант"
        ? `${c.customLength} × ${c.customWidth} × ${c.customHeight} м`
        : c.size || "—",
    ],
    ["Обшивка", cl.label],
    ["Цвет", `${co.label} · ${co.ral}`],
    ["Эксплуатация", c.exploitation || "—"],
    ["Окна", c.windows || "—"],
    ["Дверь", c.door || "—"],
    ["Отделка", c.interior || "—"],
    ["Инженерия", c.engineering.length ? c.engineering.join(", ") : "—"],
  ] as const;
}

function buildComment(c: Config) {
  return specLines(c)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

/* —————————————————————————— UI-примитивы —————————————————————————— */

function OptionCard({
  option,
  selected,
  onClick,
}: {
  option: StepOption;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left transition-all",
        selected
          ? "border-burgundy/40 bg-warm-soft/50"
          : "border-line hover:border-burgundy/25 hover:bg-warm-soft/40",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-semibold tracking-tight text-ink">
          {option.label}
        </span>
        {option.hint && (
          <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
            {option.hint}
          </span>
        )}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-burgundy bg-burgundy text-white"
            : "border-line bg-white text-transparent",
        )}
      >
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
    </button>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink sm:text-[25px]">
        {title}
      </h3>
      <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-soft">
        {subtitle}
      </p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

const fieldClass =
  "h-13 w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-burgundy/50 focus:ring-4 focus:ring-burgundy/8";

/* —————————————————————————— Главный компонент —————————————————————————— */

export function BytovkaConfigurator() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState<Config>(DEFAULT);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [company, setCompany] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<LeadError | null>(null);
  const [done, setDone] = useState(false);
  const total = STEPS.length;
  const set = <K extends keyof Config>(key: K, value: Config[K]) =>
    setCfg((c) => ({ ...c, [key]: value }));

  const toggleEng = (value: string) =>
    setCfg((c) => ({
      ...c,
      engineering: c.engineering.includes(value)
        ? c.engineering.filter((v) => v !== value)
        : [...c.engineering, value],
    }));

  const phoneValid = PHONE_RE.test(phone);
  const nameValid = name.trim().length >= 2;
  const customSizeValid = [cfg.customLength, cfg.customWidth, cfg.customHeight].every(
    (value) => Number(value.replace(",", ".")) > 0,
  );

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return !!cfg.purpose;
      case 1:
        return !!cfg.type;
      case 2:
        return !!cfg.size && (cfg.size !== "Свой вариант" || customSizeValid);
      case 3:
        return true;
      case 4:
        return !!cfg.exploitation;
      case 5:
        return !!cfg.windows && !!cfg.door;
      case 6:
        return !!cfg.interior;
      case 7:
        return true;
      case 8:
        return true;
      case 9:
        return nameValid && phoneValid;
      default:
        return false;
    }
  }, [step, cfg, customSizeValid, nameValid, phoneValid]);

  const isLast = step === total - 1;

  function next() {
    if (isLast) {
      void submit();
      return;
    }
    if (canNext) {
      setStep((s) => Math.min(s + 1, total - 1));
      setTouched(false);
    } else {
      setTouched(true);
    }
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    setTouched(false);
  }

  async function submit() {
    if (!canNext) {
      setTouched(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    const failure = await sendLead({
      name: name.trim(),
      phone,
      comment:
        buildComment(cfg) +
        (comment.trim() ? `\nКомментарий: ${comment.trim()}` : ""),
      source: "Заявка из Конструктора (бытовка)",
      company,
    });
    setSubmitting(false);
    if (failure) {
      setError(failure);
      return;
    }
    setDone(true);
  }

  const activeColor = COLORS.find((c) => c.id === cfg.color)!;

  /* —— Экран успеха —— */
  if (done) {
    return (
      <div className="rounded-[28px] border border-line bg-white p-8 sm:p-12">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy text-white shadow-[0_14px_36px_-16px_rgba(66,30,42,0.7)]">
            <Check className="h-8 w-8" strokeWidth={2.5} />
          </span>
          <h2 className="mt-6 text-[26px] font-extrabold tracking-[-0.02em] text-ink sm:text-[30px]">
            Заявка отправлена
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
            Мы получили вашу конфигурацию. Менеджер свяжется, уточнит детали и
            подготовит индивидуальное предложение.
          </p>
          <div className="mt-6 w-full overflow-hidden rounded-2xl border border-line">
            <ul className="divide-y divide-line bg-white text-left">
              {specLines(cfg).map(([k, v]) => (
                <li
                  key={k}
                  className="flex justify-between gap-4 px-4 py-2 text-[13.5px]"
                >
                  <span className="text-ink-soft">{k}</span>
                  <span className="text-right font-medium text-ink">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <Button variant="secondary" onClick={() => window.location.assign("/")}>
              Вернуться на главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-stretch">
      <aside className="flex min-w-0 min-h-[360px] flex-col justify-between rounded-[28px] bg-burgundy p-7 text-white sm:p-10 lg:h-[760px]">
        <div>
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/65">
            Конструктор
          </span>
          <h2 className="mt-5 text-balance text-[34px] font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-[42px]">
            Подберите конструкцию под свою задачу
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/72">
            Выберите назначение, размеры и комплектацию. После отправки заявки
            менеджер подготовит индивидуальное предложение.
          </p>
        </div>
        <p className="mt-10 border-t border-white/20 pt-6 text-[14px] leading-relaxed text-white/65">
          Все параметры можно уточнить и скорректировать вместе с менеджером до
          запуска конструкции в производство.
        </p>
      </aside>
      {/* —— Шаги —— */}
      <div className="flex min-w-0 flex-col rounded-[28px] border border-line bg-white p-5 shadow-[0_24px_60px_-40px_rgba(12,16,20,0.35)] sm:p-8 lg:h-[760px]">
        {/* Прогресс */}
        <div className="mb-7">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-burgundy/70">
              Шаг {step + 1} из {total}
            </span>
            <span className="text-[13px] font-medium text-ink-soft">
              {STEPS[step]}
            </span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                  i <= step ? "bg-burgundy" : "bg-warm",
                )}
              />
            ))}
          </div>
        </div>

        <div className="min-h-[420px] flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
          {/* 0 — Назначение */}
          {step === 0 && (
            <StepShell
              title="Для чего нужна конструкция?"
              subtitle="Выберите основную задачу — от неё отталкиваемся при подборе."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {PURPOSE.map((o) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={cfg.purpose === o.value}
                    onClick={() => set("purpose", o.value)}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {/* 1 — Тип конструкции */}
          {step === 1 && (
            <StepShell
              title="Тип конструкции"
              subtitle="Какой формат ближе. Сейчас конструктор собран для бытовки — остальные типы подбираем с менеджером."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {CONSTRUCTION_TYPES.map((o) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={cfg.type === o.value}
                    onClick={() => set("type", o.value)}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {/* 2 — Размер */}
          {step === 2 && (
            <StepShell
              title="Размер бытовки"
              subtitle="Выберите габарит. Точные размеры уточним при разговоре."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {SIZES.map((o) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={cfg.size === o.value}
                    onClick={() => set("size", o.value)}
                  />
                ))}
                <OptionCard
                  option={{
                    value: "Свой вариант",
                    label: "Свой вариант",
                    hint: "Укажите точные габариты",
                  }}
                  selected={cfg.size === "Свой вариант"}
                  onClick={() => set("size", "Свой вариант")}
                />
              </div>
              {cfg.size === "Свой вариант" && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {([
                    ["customLength", "Длина, м"],
                    ["customWidth", "Ширина, м"],
                    ["customHeight", "Высота, м"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="text-[13px] font-medium text-ink-soft">
                      {label}
                      <input
                        className={cn(fieldClass, "mt-1.5")}
                        inputMode="decimal"
                        placeholder="0,0"
                        value={cfg[key]}
                        onChange={(event) =>
                          set(key, event.target.value.replace(/[^\d.,]/g, ""))
                        }
                      />
                    </label>
                  ))}
                </div>
              )}
              {touched && !canNext && (
                <p className="mt-3 text-[13px] text-burgundy">
                  Выберите размер или укажите длину, ширину и высоту
                </p>
              )}
            </StepShell>
          )}

          {/* 3 — Обшивка и цвет */}
          {step === 3 && (
            <StepShell
              title="Обшивка и цвет"
              subtitle="Выберите материал стен и цвет будущей конструкции."
            >
              <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-burgundy/70">
                Обшивка
              </span>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {CLADDINGS.map((cl) => (
                  <button
                    key={cl.id}
                    type="button"
                    onClick={() => set("cladding", cl.id)}
                    aria-pressed={cfg.cladding === cl.id}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                      cfg.cladding === cl.id
                        ? "border-burgundy/40 bg-warm-soft/50"
                        : "border-line hover:border-burgundy/25 hover:bg-warm-soft/40",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">
                        {cl.label}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-soft">
                        {cl.hint}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <span className="mt-6 block text-[13px] font-bold uppercase tracking-[0.14em] text-burgundy/70">
                Цвет стен
              </span>
              <div className="mt-2 flex flex-wrap gap-3 p-1">
                {COLORS.map((co) => (
                  <button
                    key={co.id}
                    type="button"
                    onClick={() => set("color", co.id)}
                    aria-pressed={cfg.color === co.id}
                    title={`${co.label} · ${co.ral}`}
                    aria-label={`${co.label} ${co.ral}`}
                    className={cn(
                      "relative h-11 w-11 rounded-full border transition-transform",
                      cfg.color === co.id
                        ? "border-burgundy ring-2 ring-burgundy/25"
                        : "border-line hover:scale-105",
                    )}
                    style={{ background: co.swatch }}
                  >
                    {cfg.color === co.id && (
                      <Check
                        className={cn(
                          "absolute inset-0 m-auto h-4 w-4",
                          co.id === "white" ? "text-ink" : "text-white",
                        )}
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[14px]">
                <span className="font-semibold text-ink">{activeColor.label}</span>
                <span className="text-ink-soft"> · {activeColor.ral}</span>
              </p>
            </StepShell>
          )}

          {/* 4 — Утепление */}
          {step === 4 && (
            <StepShell
              title="Эксплуатация и утепление"
              subtitle="Как будете использовать — от этого зависит утепление контура."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {EXPLOITATION.map((o) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={cfg.exploitation === o.value}
                    onClick={() => set("exploitation", o.value)}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {/* 5 — Окна и двери */}
          {step === 5 && (
            <StepShell title="Окна и двери" subtitle="Остекление и входная дверь.">
              <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-burgundy/70">
                Окна
              </span>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {WINDOWS.map((o) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={cfg.windows === o.value}
                    onClick={() => set("windows", o.value)}
                  />
                ))}
              </div>
              <span className="mt-6 block text-[13px] font-bold uppercase tracking-[0.14em] text-burgundy/70">
                Дверь
              </span>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {DOORS.map((o) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={cfg.door === o.value}
                    onClick={() => set("door", o.value)}
                  />
                ))}
              </div>
              {touched && (!cfg.windows || !cfg.door) && (
                <p className="mt-3 text-[13px] text-burgundy">
                  Выберите вариант окон и двери
                </p>
              )}
            </StepShell>
          )}

          {/* 6 — Отделка */}
          {step === 6 && (
            <StepShell
              title="Внутренняя отделка"
              subtitle="Выберите материал для обшивки стен и потолка внутри."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {INTERIOR.map((o) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={cfg.interior === o.value}
                    onClick={() => set("interior", o.value)}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {/* 7 — Инженерия */}
          {step === 7 && (
            <StepShell
              title="Инженерия"
              subtitle="Отметьте всё, что нужно. Можно выбрать несколько или пропустить."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {ENGINEERING.map((o) => (
                  <OptionCard
                    key={o.value}
                    option={o}
                    selected={cfg.engineering.includes(o.value)}
                    onClick={() => toggleEng(o.value)}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {/* 8 — Итог */}
          {step === 8 && (
            <StepShell
              title="Итоговая конфигурация"
              subtitle="Проверьте параметры. Если всё верно — переходите к контактам."
            >
              <ul className="divide-y divide-line rounded-2xl border border-line">
                {specLines(cfg).map(([k, v]) => (
                  <li
                    key={k}
                    className="flex justify-between gap-4 px-4 py-2.5 text-[14px]"
                  >
                    <span className="text-ink-soft">{k}</span>
                    <span className="text-right font-medium text-ink">{v}</span>
                  </li>
                ))}
              </ul>
            </StepShell>
          )}

          {/* 9 — Контакты */}
          {step === 9 && (
            <StepShell
              title="Контакты"
              subtitle="Оставьте контакты — менеджер свяжется и подготовит предложение по вашей конфигурации."
            >
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                      Ваше имя
                    </label>
                    <input
                      className={fieldClass}
                      placeholder="Как к вам обращаться"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {touched && !nameValid && (
                      <p className="mt-1.5 text-[13px] text-burgundy">
                        Укажите имя
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                      Телефон
                    </label>
                    <input
                      className={fieldClass}
                      placeholder="+7 (___) ___-__-__"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(maskPhone(e.target.value))}
                    />
                    {touched && !phoneValid && (
                      <p className="mt-1.5 text-[13px] text-burgundy">
                        Введите телефон полностью
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                    Комментарий (необязательно)
                  </label>
                  <textarea
                    className={cn(fieldClass, "h-24 resize-none py-3")}
                    placeholder="Дополнительные пожелания"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <p className="text-[12px] leading-snug text-ink-soft/70">
                  Нажимая кнопку, вы соглашаетесь с{" "}
                  <Link
                    href="/personal-data-consent"
                    className="underline underline-offset-2 hover:text-ink"
                  >
                    обработкой персональных данных
                  </Link>
                  .
                </p>

                <HoneypotField
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </StepShell>
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-burgundy/25 bg-burgundy/5 px-4 py-3 text-[13px] leading-snug text-burgundy">
            {LEAD_ERROR_TEXT[error]}
          </p>
        )}

        {/* Навигация */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            className="px-4"
          >
            <ChevronLeft className="-ml-1 h-[18px] w-[18px]" />
            Назад
          </Button>
          {isLast ? (
            <Button
              type="button"
              size="lg"
              withArrow
              onClick={next}
              disabled={submitting}
            >
              {submitting ? "Отправляем…" : "Отправить заявку"}
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={next} disabled={!canNext}>
              Далее
              <ChevronRight className="-mr-1 h-[18px] w-[18px]" />
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
