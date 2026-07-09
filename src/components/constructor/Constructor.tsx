"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Icon,
  type IconName,
} from "@/components/icons";
import { cn } from "@/lib/cn";

/* ——————————————————————————————————————————————
   Данные шагов
   —————————————————————————————————————————————— */

type Option = { value: string; label: string; hint?: string; icon?: IconName };

const PURPOSE: Option[] = [
  { value: "Строительство", label: "Для строительства", hint: "Бытовки, склады, штабы", icon: "crane" },
  { value: "Временный офис", label: "Временный офис", hint: "Офис, штаб на объекте", icon: "briefcase" },
  { value: "Проживание", label: "Для проживания", hint: "Жильё, общежитие", icon: "home" },
  { value: "Дача / отдых", label: "Дача и отдых", hint: "Сезонный дом, баня", icon: "tree" },
  { value: "Санитарный модуль", label: "Санитарный модуль", hint: "Душевые, туалеты", icon: "wc" },
  { value: "Склад / ангар", label: "Склад или ангар", hint: "Хранение, производство", icon: "warehouse" },
];

const TYPE: Option[] = [
  { value: "Блок-контейнер", label: "Блок-контейнер", hint: "Одиночный модуль", icon: "cube" },
  { value: "Модульное здание", label: "Модульное здание", hint: "Несколько блоков", icon: "home" },
  { value: "Бытовка", label: "Бытовка", hint: "Деревянная / металл", icon: "briefcase" },
  { value: "Ангар / навес", label: "Ангар или навес", hint: "Каркасная конструкция", icon: "warehouse" },
];

const AREA: Option[] = [
  { value: "до 15 м²", label: "до 15 м²", hint: "1 модуль" },
  { value: "15–30 м²", label: "15–30 м²", hint: "1–2 модуля" },
  { value: "30–60 м²", label: "30–60 м²", hint: "2–4 модуля" },
  { value: "более 60 м²", label: "более 60 м²", hint: "Здание из блоков" },
];

const EQUIPMENT: Option[] = [
  { value: "Окна", label: "Окна", icon: "home" },
  { value: "Двери", label: "Двери", icon: "warehouse" },
  { value: "Электрика", label: "Электрика", icon: "sparkle" },
  { value: "Утепление", label: "Утепление", icon: "cube" },
  { value: "Санузел", label: "Санузел", icon: "wc" },
  { value: "Перегородки", label: "Перегородки", icon: "briefcase" },
];

const TIMING: Option[] = [
  { value: "Срочно", label: "Срочно", hint: "В течение недели" },
  { value: "1–2 недели", label: "1–2 недели" },
  { value: "В этом месяце", label: "В этом месяце" },
  { value: "Планирую заранее", label: "Планирую заранее" },
];

const YESNO: Option[] = [
  { value: "Да, нужен монтаж", label: "Да, нужен монтаж" },
  { value: "Без монтажа", label: "Без монтажа" },
];

/* ——————————————————————————————————————————————
   Состояние и типы шагов
   —————————————————————————————————————————————— */

type Params = {
  purpose: string;
  type: string;
  area: string;
  equipment: string[];
  city: string;
  access: string;
  install: string;
  timing: string;
};

const EMPTY: Params = {
  purpose: "",
  type: "",
  area: "",
  equipment: [],
  city: "",
  access: "",
  install: "",
  timing: "",
};

const STEPS = [
  "Назначение",
  "Тип конструкции",
  "Размеры",
  "Комплектация",
  "Условия",
  "Контакты",
] as const;

/* ——————————————————————————————————————————————
   Утилиты
   —————————————————————————————————————————————— */

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

function buildComment(p: Params, comment: string) {
  const lines = [
    `Назначение: ${p.purpose || "—"}`,
    `Тип конструкции: ${p.type || "—"}`,
    `Примерная площадь: ${p.area || "—"}`,
    `Комплектация: ${p.equipment.length ? p.equipment.join(", ") : "—"}`,
    `Город / населённый пункт: ${p.city || "—"}`,
    `Возможность подъезда: ${p.access || "—"}`,
    `Монтаж: ${p.install || "—"}`,
    `Срок: ${p.timing || "—"}`,
  ];
  if (comment.trim()) lines.push(`Комментарий: ${comment.trim()}`);
  return lines.join("\n");
}

/* ——————————————————————————————————————————————
   UI-примитивы
   —————————————————————————————————————————————— */

const cardBase =
  "group relative flex w-full items-start gap-3.5 rounded-[22px] border bg-white p-4 text-left transition-all duration-200 sm:p-5";

function OptionCard({
  option,
  selected,
  onClick,
}: {
  option: Option;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        cardBase,
        selected
          ? "border-burgundy/40 bg-warm-soft/50 shadow-[0_10px_30px_-18px_rgba(66,30,42,0.5)]"
          : "border-line hover:border-burgundy/25 hover:bg-warm-soft/40",
      )}
    >
      {option.icon && (
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors",
            selected
              ? "border-burgundy/30 bg-burgundy text-white"
              : "border-line bg-warm-soft text-burgundy/70",
          )}
        >
          <Icon name={option.icon} className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1 pt-0.5">
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
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-burgundy bg-burgundy text-white"
            : "border-line bg-white text-transparent",
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
    </button>
  );
}

const fieldClass =
  "h-13 w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-burgundy/50 focus:ring-4 focus:ring-burgundy/8";

/* ——————————————————————————————————————————————
   Главный компонент
   —————————————————————————————————————————————— */

export function Constructor() {
  const [step, setStep] = useState(0);
  const [params, setParams] = useState<Params>(EMPTY);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const total = STEPS.length;
  const set = <K extends keyof Params>(key: K, value: Params[K]) =>
    setParams((p) => ({ ...p, [key]: value }));

  const toggleEquipment = (value: string) =>
    setParams((p) => ({
      ...p,
      equipment: p.equipment.includes(value)
        ? p.equipment.filter((v) => v !== value)
        : [...p.equipment, value],
    }));

  const phoneValid = PHONE_RE.test(phone);
  const nameValid = name.trim().length >= 2;

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return !!params.purpose;
      case 1:
        return !!params.type;
      case 2:
        return !!params.area;
      case 3:
        return true; // комплектация необязательна
      case 4:
        return !!params.city.trim() && !!params.install;
      case 5:
        return nameValid && phoneValid && consent;
      default:
        return false;
    }
  }, [step, params, nameValid, phoneValid, consent]);

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
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone,
        comment: buildComment(params, comment),
        source: "Заявка из Конструктора",
        page: typeof window !== "undefined" ? window.location.pathname : "",
        utm: typeof window !== "undefined" ? window.location.search : "",
      }),
    }).catch(() => null);
    setSubmitting(false);
    setDone(true);
  }

  /* —— Экран успеха —— */
  if (done) {
    return (
      <div className="rounded-[28px] border border-line bg-white p-8 sm:p-12">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy text-white shadow-[0_14px_36px_-16px_rgba(66,30,42,0.7)]">
            <Check className="h-8 w-8" strokeWidth={2.5} />
          </span>
          <h2 className="mt-6 text-[26px] font-extrabold tracking-[-0.02em] text-ink sm:text-[30px]">
            Заявка отправлена
          </h2>
          <p className="mt-3 max-w-md text-[16px] leading-relaxed text-ink-soft">
            Менеджер свяжется с вами в ближайшее время, уточнит параметры и
            подготовит индивидуальное предложение.
          </p>
          <p className="mt-2 max-w-md text-[14px] text-ink-soft/80">
            Стоимость рассчитывается индивидуально после уточнения параметров.
          </p>
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
    <div className="rounded-[28px] border border-line bg-white p-5 shadow-[0_24px_60px_-40px_rgba(12,16,20,0.35)] sm:p-8">
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

      {/* Контент шага */}
      <div className="min-h-[280px]">
        {/* Шаг 1 — Назначение */}
        {step === 0 && (
          <StepShell
            title="Для чего нужна конструкция?"
            subtitle="Выберите основное назначение — это поможет подобрать оптимальное решение."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {PURPOSE.map((o) => (
                <OptionCard
                  key={o.value}
                  option={o}
                  selected={params.purpose === o.value}
                  onClick={() => set("purpose", o.value)}
                />
              ))}
            </div>
          </StepShell>
        )}

        {/* Шаг 2 — Тип конструкции */}
        {step === 1 && (
          <StepShell
            title="Тип конструкции"
            subtitle="Какой формат вам ближе? При необходимости менеджер предложит альтернативу."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {TYPE.map((o) => (
                <OptionCard
                  key={o.value}
                  option={o}
                  selected={params.type === o.value}
                  onClick={() => set("type", o.value)}
                />
              ))}
            </div>
          </StepShell>
        )}

        {/* Шаг 3 — Размеры / площадь */}
        {step === 2 && (
          <StepShell
            title="Примерная площадь"
            subtitle="Ориентировочный размер — точные параметры уточним при разговоре."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {AREA.map((o) => (
                <OptionCard
                  key={o.value}
                  option={o}
                  selected={params.area === o.value}
                  onClick={() => set("area", o.value)}
                />
              ))}
            </div>
          </StepShell>
        )}

        {/* Шаг 4 — Комплектация (мультивыбор) */}
        {step === 3 && (
          <StepShell
            title="Комплектация"
            subtitle="Отметьте всё, что нужно. Можно выбрать несколько пунктов или пропустить шаг."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {EQUIPMENT.map((o) => (
                <OptionCard
                  key={o.value}
                  option={o}
                  selected={params.equipment.includes(o.value)}
                  onClick={() => toggleEquipment(o.value)}
                />
              ))}
            </div>
          </StepShell>
        )}

        {/* Шаг 5 — Условия объекта */}
        {step === 4 && (
          <StepShell
            title="Условия объекта"
            subtitle="Где установить и нужен ли монтаж — это влияет на доставку и сроки."
          >
            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                    Город / населённый пункт
                  </label>
                  <input
                    className={fieldClass}
                    placeholder="Например, Раменское"
                    value={params.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                  {touched && !params.city.trim() && (
                    <p className="mt-1.5 text-[13px] text-burgundy">
                      Укажите город или населённый пункт
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                    Возможность подъезда (необязательно)
                  </label>
                  <input
                    className={fieldClass}
                    placeholder="Например, есть подъезд для манипулятора"
                    value={params.access}
                    onChange={(e) => set("access", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <span className="mb-2 block text-[13px] font-medium text-ink-soft">
                  Нужен ли монтаж?
                </span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {YESNO.map((o) => (
                    <OptionCard
                      key={o.value}
                      option={o}
                      selected={params.install === o.value}
                      onClick={() => set("install", o.value)}
                    />
                  ))}
                </div>
                {touched && !params.install && (
                  <p className="mt-1.5 text-[13px] text-burgundy">
                    Выберите вариант монтажа
                  </p>
                )}
              </div>

              <div>
                <span className="mb-2 block text-[13px] font-medium text-ink-soft">
                  Желаемый срок (необязательно)
                </span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TIMING.map((o) => (
                    <OptionCard
                      key={o.value}
                      option={o}
                      selected={params.timing === o.value}
                      onClick={() => set("timing", o.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </StepShell>
        )}

        {/* Шаг 6 — Контакты */}
        {step === 5 && (
          <StepShell
            title="Контакты"
            subtitle="Оставьте контакты — менеджер свяжется и подготовит предложение."
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
                  placeholder="Дополнительные пожелания к проекту"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <label className="flex items-start gap-3 text-[13px] leading-snug text-ink-soft">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-[#421e2a]"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  Соглашаюсь с{" "}
                  <Link href="/privacy-policy" className="text-burgundy underline">
                    политикой конфиденциальности
                  </Link>{" "}
                  и обработкой персональных данных.
                </span>
              </label>
              {touched && !consent && (
                <p className="-mt-2 text-[13px] text-burgundy">
                  Необходимо согласие на обработку данных
                </p>
              )}

              <p className="rounded-2xl border border-line bg-warm-soft/50 px-4 py-3 text-[13px] leading-snug text-ink-soft">
                Стоимость рассчитывается индивидуально после уточнения
                параметров.
              </p>
            </div>
          </StepShell>
        )}
      </div>

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
  );
}

/* ——————————————————————————————————————————————
   Обёртка шага
   —————————————————————————————————————————————— */

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
      <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink sm:text-[26px]">
        {title}
      </h2>
      <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-soft">
        {subtitle}
      </p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
