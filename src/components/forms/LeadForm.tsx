"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Check } from "@/components/icons";
import { cn } from "@/lib/cn";

const schema = z.object({
  name: z.string().min(2, "Укажите имя"),
  phone: z
    .string()
    .regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, "Введите телефон полностью"),
  comment: z.string().optional(),
  consent: z.literal(true, { message: "Необходимо согласие" }),
});

type FormValues = z.infer<typeof schema>;

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

const field =
  "h-13 w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-burgundy/50 focus:ring-4 focus:ring-burgundy/8";

export function LeadForm({
  source = "Заявка с сайта",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const consent = watch("consent");

  async function onSubmit(values: FormValues) {
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        source,
        page: typeof window !== "undefined" ? window.location.pathname : "",
        utm:
          typeof window !== "undefined" ? window.location.search : "",
      }),
    }).catch(() => null);
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-3xl border border-line bg-warm-soft/60 p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-burgundy text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="text-xl font-bold text-ink">Заявка отправлена</h3>
        <p className="text-[15px] text-ink-soft">
          Менеджер свяжется с вами в ближайшее время.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 sm:p-8",
        compact && "p-5 sm:p-6",
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input
            className={field}
            placeholder="Ваше имя"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-[13px] text-burgundy">{errors.name.message}</p>
          )}
        </div>
        <div>
          <input
            className={field}
            placeholder="+7 (___) ___-__-__"
            inputMode="tel"
            value={watch("phone") ?? ""}
            onChange={(e) =>
              setValue("phone", maskPhone(e.target.value), {
                shouldValidate: true,
              })
            }
          />
          {errors.phone && (
            <p className="mt-1.5 text-[13px] text-burgundy">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {!compact && (
        <textarea
          className={cn(field, "h-28 resize-none py-3")}
          placeholder="Комментарий к задаче (необязательно)"
          {...register("comment")}
        />
      )}

      <label className="flex items-start gap-3 text-[13px] leading-snug text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[#421e2a]"
          {...register("consent")}
        />
        <span>
          Соглашаюсь с{" "}
          <Link href="/privacy-policy" className="text-burgundy underline">
            политикой конфиденциальности
          </Link>{" "}
          и обработкой персональных данных.
        </span>
      </label>
      {errors.consent && (
        <p className="-mt-2 text-[13px] text-burgundy">{errors.consent.message}</p>
      )}

      <Button type="submit" size="lg" withArrow disabled={isSubmitting || !consent}>
        {isSubmitting ? "Отправляем…" : "Отправить заявку"}
      </Button>
    </form>
  );
}
