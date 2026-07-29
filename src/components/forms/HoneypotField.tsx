"use client";

/* ============================================================
   Honeypot — приманка для ботов.
   Поле невидимо для человека, но остаётся в потоке документа:
   прячем уводом за пределы экрана, а НЕ через display:none —
   иначе автозаполнение ботов его пропустит. Из фокуса и из
   дерева доступности поле исключено. Если /api/lead получает
   его непустым — заявка отбрасывается как спам.
   ============================================================ */

import type { ComponentPropsWithRef } from "react";

export function HoneypotField({
  name = "company",
  ...props
}: ComponentPropsWithRef<"input">) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-0">
      <label>
        Компания
        <input
          {...props}
          name={name}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  );
}
