"use client";

/* ============================================================
   Модалка «Получить расчёт» (КП) — широкая, двухколоночная,
   в бренде «Маяка». Способ связи + телефон + вложение ТЗ →
   заявка в /api/lead. Radix Dialog, анимация появления.
   ============================================================ */

import { useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Phone, Telegram, Max, Check, Close } from "@/components/icons";
import { cn } from "@/lib/cn";

const CHANNELS = [
  { value: "Звонок", label: "Звонок", Icon: Phone },
  { value: "Telegram", label: "Telegram", Icon: Telegram },
  { value: "MAX", label: "MAX", Icon: Max },
] as const;

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

export function ProposalModal({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<string>("Звонок");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const phoneValid = PHONE_RE.test(phone);
  const canSubmit = phoneValid && consent;

  function reset() {
    setChannel("Звонок");
    setPhone("");
    setFile(null);
    setConsent(false);
    setTouched(false);
    setDone(false);
  }

  async function submit() {
    if (!canSubmit) {
      setTouched(true);
      return;
    }
    setSubmitting(true);
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Заявка на расчёт (КП)",
        phone,
        comment:
          `Способ связи: ${channel}` +
          (file ? `\nТЗ приложено: ${file.name}` : ""),
        source: "Заявка «Получить расчёт» (модалка КП)",
        page: typeof window !== "undefined" ? window.location.pathname : "",
        utm: typeof window !== "undefined" ? window.location.search : "",
      }),
    }).catch(() => null);
    setSubmitting(false);
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
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-[70] bg-ink/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          <Dialog.Content
            aria-describedby={undefined}
            className="anim-modal relative w-full max-w-[980px] overflow-hidden rounded-[30px] bg-warm-bg shadow-[0_40px_120px_-30px_rgba(26,18,22,0.55)] focus:outline-none"
          >
            <Dialog.Close
              aria-label="Закрыть"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:bg-warm hover:text-ink lg:border-white/20 lg:bg-white/10 lg:text-white lg:hover:bg-white/20"
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
                  Подготовим индивидуальное предложение и свяжемся с вами
                  ({channel.toLowerCase()}).
                </p>
                <Dialog.Close asChild>
                  <Button variant="secondary" className="mt-7">
                    Закрыть
                  </Button>
                </Dialog.Close>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                {/* Левая колонка — форма */}
                <div className="px-6 py-9 sm:px-9 sm:py-10">
                  <Dialog.Title className="text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[32px]">
                    Подготовим{" "}
                    <span className="text-burgundy">индивидуальное предложение</span>{" "}
                    для вас или вашего руководства
                  </Dialog.Title>

                  <span className="mt-6 block text-[14px] font-medium text-ink-soft">
                    Какой способ связи вам удобен?
                  </span>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {CHANNELS.map((c) => {
                      const active = channel === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setChannel(c.value)}
                          aria-pressed={active}
                          className={cn(
                            "flex h-11 items-center justify-center gap-2 rounded-xl border text-[14px] font-semibold transition-colors",
                            active
                              ? "border-burgundy bg-burgundy text-white"
                              : "border-line bg-white text-ink hover:border-burgundy/40",
                          )}
                        >
                          <c.Icon className="h-[18px] w-[18px]" />
                          <span className="hidden sm:inline">{c.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    className="mt-3 h-13 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-burgundy/50 focus:ring-4 focus:ring-burgundy/8"
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

                  {/* Вложение ТЗ */}
                  <p className="mt-5 text-[13.5px] leading-snug text-ink-soft">
                    Если у вас есть техническое задание — можете прикрепить его
                    ниже.
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="rounded-xl border border-line bg-white px-4 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-burgundy/40"
                    >
                      Выберите файл
                    </button>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">
                      {file ? file.name : "Файл не выбран"}
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    onClick={submit}
                    disabled={submitting}
                    className="mt-5 w-full"
                  >
                    {submitting ? "Отправляем…" : "Получить расчёт"}
                  </Button>

                  <label className="mt-4 flex items-start gap-2.5 text-[12.5px] leading-snug text-ink-soft">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[#421e2a]"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>
                      Я ознакомлен(а) с{" "}
                      <Link href="/privacy-policy" className="text-burgundy underline">
                        политикой конфиденциальности
                      </Link>
                    </span>
                  </label>
                  {touched && !consent && (
                    <p className="mt-1 text-[13px] text-burgundy">
                      Необходимо согласие на обработку данных
                    </p>
                  )}
                </div>

                {/* Правая колонка — брендовый визуал */}
                <div className="relative hidden overflow-hidden lg:block">
                  <Image
                    src="/renders/products/abk.webp"
                    alt=""
                    fill
                    sizes="440px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-burgundy/92 to-burgundy-800/95" />
                  <div className="relative flex h-full flex-col justify-between p-8 text-white">
                    <Logo white width={130} />
                    <div>
                      <p className="text-[19px] font-extrabold leading-tight tracking-[-0.01em]">
                        Коммерческое предложение под вашу задачу
                      </p>
                      <ul className="mt-5 space-y-2.5 text-[14px] text-white/85">
                        {[
                          "Подбор решения и комплектации",
                          "Ориентир по стоимости и срокам",
                          "Учёт условий эксплуатации",
                        ].map((t) => (
                          <li key={t} className="flex items-center gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                              <Check className="h-3 w-3" strokeWidth={2.5} />
                            </span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
