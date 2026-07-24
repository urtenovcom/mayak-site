"use client";

/* ============================================================
   Модалка «Подобрать решение» — обратный звонок / подбор.
   Открывается по кнопке (trigger). Выбор способа связи + телефон
   + согласие → заявка в /api/lead. Radix Dialog.
   ============================================================ */

import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
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

export function SolutionModal({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<string>("Звонок");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const phoneValid = PHONE_RE.test(phone);
  const canSubmit = phoneValid;

  function reset() {
    setChannel("Звонок");
    setPhone("");
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
        name: "Заявка на подбор",
        phone,
        comment: `Способ связи: ${channel}`,
        source: "Заявка «Подобрать решение» (модалка)",
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
                Мы свяжемся с вами удобным способом ({channel.toLowerCase()}) и
                поможем подобрать решение под вашу задачу.
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
                <Dialog.Title className="text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[40px] lg:text-[44px]">
                  Давайте мы поможем подобрать{" "}
                  <span className="text-burgundy">лучшее решение</span>
                </Dialog.Title>
              </div>

              {/* Правая колонка — форма */}
              <div className="px-6 py-9 sm:px-9 sm:py-10">
                <p className="pr-10 text-[15px] leading-relaxed text-ink-soft">
                  Мы позвоним и поможем подобрать именно то, что{" "}
                  <span className="font-semibold text-ink">
                    подходит под ваши задачи
                  </span>
                  .
                </p>

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

                <Button
                  type="button"
                  size="lg"
                  onClick={submit}
                  disabled={submitting}
                  className="mt-4 w-full"
                >
                  {submitting ? "Отправляем…" : "Подобрать решение"}
                </Button>

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
