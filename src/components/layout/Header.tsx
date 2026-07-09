"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Menu, Close } from "@/components/icons";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur-md">
      <Container className="flex h-[78px] items-center justify-between gap-6">
        <Logo width={148} />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium text-ink/80 transition-colors hover:text-burgundy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink
            href="/constructor"
            withArrow
            className="hidden sm:inline-flex"
          >
            Конструктор
          </ButtonLink>
          <button
            type="button"
            aria-label="Меню"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-burgundy lg:hidden"
          >
            {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* мобильное меню */}
      <div
        className={cn(
          "overflow-hidden border-t border-line bg-white transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base font-medium text-ink/85 hover:bg-warm-soft"
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink href="/constructor" withArrow className="mt-2 w-full">
            Конструктор
          </ButtonLink>
        </Container>
      </div>
    </header>
  );
}
