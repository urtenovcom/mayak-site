"use client";

/* ============================================================
   Модалка «Заказать звонок» — широкая, двухколоночная.
   Имя + телефон + когда позвонить (Сейчас / По времени) →
   заявка в /api/lead. Radix Dialog, анимация появления.
   ============================================================ */

import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { Check, Close } from "@/components/icons";
import { cn } from "@/lib/cn";
import { LEAD_ERROR_TEXT, sendLead, type LeadError } from "@/lib/lead-client";

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

const fieldClass =
  "h-13 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-burgundy/50 focus:ring-4 focus:ring-burgundy/8";

export function CallbackModal({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState<"Сейчас" | "По времени">("Сейчас");
  const [time, setTime] = useState("");
  const [company, setCompany] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<LeadError | null>(null);
  const [done, setDone] = useState(false);

  const nameValid = name.trim().length >= 2;
  const phoneValid = PHONE_RE.test(phone);
  const canSubmit = nameValid && phoneValid;

  function reset() {
    setName("");
    setPhone("");
    setWhen("Сейчас");
    setTime("");
    setCompany("");
    setTouched(false);
    setError(null);
    setDone(false);
  }

  async function submit() {
    if (!canSubmit) {
      setTouched(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    const whenText =
      when === "По времени" && time.trim()
        ? `По времени: ${time.trim()}`
        : when;
    const failure = await sendLead({
      name: name.trim(),
      phone,
      comment: `Когда позвонить: ${whenText}`,
      source: "Заявка «Заказать звонок» (модалка)",
      company,
    });
    setSubmitting(false);
    if (failure) {
      setError(failure);
      return;
    }
    setDone(true);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          <Dialog.Content
            aria-describedby={undefined}
            className="anim-modal relative w-full max-w-[980px] overflow-hidden rounded-[30px] border border-line bg-warm-bg shadow-[0_40px_120px_-30px_rgba(26,18,22,0.55)] focus:outline-none"
          >
            <Dialog.Close
              aria-label="Закрыть"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:bg-warm hover:text-ink"
            >
              <Close className="h-5 w-5" />
            </Dialog.Close>

            {done ? (
              <div className="flex flex-col items-center px-6 py-14 text-center sm:px-10">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy text-white">
                  <Check className="h-8 w-8" strokeWidth={2.5} />
                </span>
                <h2 className="mt-6 text-[24px] font-extrabold tracking-[-0.02em] text-ink">
                  Заявка принята
                </h2>
                <p className="mt-2 max-w-sm text-[15px] text-ink-soft">
                  {when === "По времени" && time.trim()
                    ? `Перезвоним в удобное время (${time.trim()}).`
                    : "Перезвоним вам в ближайшее время."}
                </p>
                <Dialog.Close asChild>
                  <Button variant="secondary" className="mt-7">
                    Закрыть
                  </Button>
                </Dialog.Close>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2">
                {/* Левая колонка */}
                <div className="flex flex-col justify-center border-b border-line bg-white/60 px-6 py-9 sm:px-9 sm:py-10 lg:border-b-0 lg:border-r">
                  <Dialog.Title className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[36px] lg:text-[40px]">
                    Укажите контактные данные и{" "}
                    <span className="text-burgundy">удобное время</span> для
                    звонка
                  </Dialog.Title>
                </div>

                {/* Правая колонка — форма */}
                <div className="px-6 py-9 sm:px-9 sm:py-10">
                  <p className="pr-10 text-[15px] leading-relaxed text-ink">
                    Мы перезвоним вам в течение 5 минут или в другое удобное
                    время.
                  </p>
                  <p className="mt-1 text-[13px] text-ink-soft">
                    Работаем Пн — Пт, с 9:00 до 18:00
                  </p>

                  <label className="mt-6 block text-[14px] font-medium text-ink-soft">
                    Как к вам обращаться?
                  </label>
                  <input
                    className={cn(fieldClass, "mt-2")}
                    placeholder="Введите ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {touched && !nameValid && (
                    <p className="mt-1.5 text-[13px] text-burgundy">Укажите имя</p>
                  )}

                  <label className="mt-4 block text-[14px] font-medium text-ink-soft">
                    Телефон для связи
                  </label>
                  <input
                    className={cn(fieldClass, "mt-2")}
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

                  <span className="mt-5 block text-[14px] font-medium text-ink-soft">
                    Когда вам позвонить?
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["Сейчас", "По времени"] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWhen(w)}
                        aria-pressed={when === w}
                        className={cn(
                          "h-11 rounded-xl border text-[14px] font-semibold transition-colors",
                          when === w
                            ? "border-burgundy bg-burgundy text-white"
                            : "border-line bg-white text-ink hover:border-burgundy/40",
                        )}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  {when === "По времени" && (
                    <input
                      className={cn(fieldClass, "mt-2")}
                      placeholder="Например: 21 октября в 14:00"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  )}

                  <HoneypotField
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />

                  <Button
                    type="button"
                    size="lg"
                    onClick={submit}
                    disabled={submitting}
                    className="mt-5 w-full"
                  >
                    {submitting ? "Отправляем…" : "Заказать звонок"}
                  </Button>

                  {error && (
                    <p className="mt-3 text-[13px] leading-snug text-burgundy">
                      {LEAD_ERROR_TEXT[error]}
                    </p>
                  )}

                  <p className="mt-4 text-[12px] leading-snug text-ink-soft/70">
                    Нажимая кнопку, вы соглашаетесь с{" "}
                    <Link
                      href="/personal-data-consent"
                      className="underline underline-offset-2 hover:text-ink"
                    >
                      обработкой персональных данных
                    </Link>
                    .
                  </p>
                </div>
              </div>
            )}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
