"use client";

/* ============================================================
   Единая шапка сайта (на всех страницах одинаковая по составу).
   На главной — фиксированная, прозрачная над видео-героем и
   сплошная бордовая при скролле. На остальных — sticky, сразу
   сплошная бордовая. Лого, свайп-меню, иконки мессенджеров,
   кнопки-телефоны и «Заказать звонок» (модалка).
   ============================================================ */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { CallbackModal } from "@/components/CallbackModal";
import { Phone, Telegram, Max, Mail, Menu, Close } from "@/components/icons";
import { NAV, CONTACTS } from "@/lib/site";
import { cn } from "@/lib/cn";

const telHref = (s: string) => "tel:" + s.replace(/[^\d+]/g, "");

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative py-1 text-[15px] font-medium text-white/85 transition-colors hover:text-white"
    >
      {label}
      <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // на главной шапка проявляется вместе с контентом героя (сигнал от Hero)
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // синхронизация появления шапки с героем
  useEffect(() => {
    if (!isHome) {
      setHeroReady(true);
      return;
    }
    const w = window as typeof window & { __heroRevealed?: boolean };
    if (w.__heroRevealed) {
      setHeroReady(true);
      return;
    }
    setHeroReady(false);
    const onReveal = () => setHeroReady(true);
    window.addEventListener("hero-revealed", onReveal);
    return () => window.removeEventListener("hero-revealed", onReveal);
  }, [isHome]);

  // закрывать мобильное меню при переходе
  useEffect(() => setMenuOpen(false), [pathname]);

  const solid = scrolled || !isHome;
  const hidden = isHome && !heroReady;

  return (
    <header
      className={cn(
        "z-50 transition-[background-color,opacity,transform] duration-700 ease-out",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
        solid ? "bg-burgundy/95 backdrop-blur-md" : "bg-transparent",
        hidden
          ? "pointer-events-none -translate-y-3 opacity-0"
          : "translate-y-0 opacity-100",
      )}
    >
      {/* тонкая линия под шапкой */}
      <div className="pointer-events-none absolute inset-x-0 top-[72px] h-px bg-white/[0.08]" />

      <div className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between gap-5 px-5 sm:px-8">
        <Logo white width={130} />

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((i) => (
            <NavLink key={i.href} href={i.href} label={i.label} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 lg:flex">
            <IconLink href="https://t.me/" label={`Telegram: ${CONTACTS.telegram}`}>
              <Telegram className="h-[16px] w-[16px]" />
            </IconLink>
            <IconLink href="#" label={`MAX: ${CONTACTS.max}`}>
              <Max className="h-[16px] w-[16px]" />
            </IconLink>
            <IconLink href={`mailto:${CONTACTS.email}`} label={CONTACTS.email}>
              <Mail className="h-[16px] w-[16px]" />
            </IconLink>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            {CONTACTS.phones.map((p) => (
              <a
                key={p}
                href={telHref(p)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/20 px-3.5 text-[13px] font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10"
              >
                <Phone className="h-3.5 w-3.5 text-[#d29aa8]" />
                {p}
              </a>
            ))}
          </div>

          <CallbackModal
            trigger={
              <Button
                variant="light"
                className="hidden !h-10 !px-4 !text-[14px] sm:inline-flex"
              >
                Заказать звонок
              </Button>
            }
          />

          <button
            type="button"
            aria-label="Меню"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
          >
            {menuOpen ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/[0.08] bg-burgundy/95 backdrop-blur-md transition-[max-height] duration-300 lg:hidden",
          menuOpen ? "max-h-[520px]" : "max-h-0",
        )}
      >
        <div className="mx-auto flex max-w-[1360px] flex-col gap-1 px-5 py-4 sm:px-8">
          {NAV.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-white/85 hover:bg-white/5"
            >
              {i.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-wrap gap-2">
            {CONTACTS.phones.map((p) => (
              <a
                key={p}
                href={telHref(p)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-2 text-[13px] font-semibold text-white"
              >
                <Phone className="h-3.5 w-3.5 text-[#d29aa8]" />
                {p}
              </a>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <IconLink href="https://t.me/" label="Telegram">
              <Telegram className="h-[16px] w-[16px]" />
            </IconLink>
            <IconLink href="#" label="MAX">
              <Max className="h-[16px] w-[16px]" />
            </IconLink>
            <IconLink href={`mailto:${CONTACTS.email}`} label="Email">
              <Mail className="h-[16px] w-[16px]" />
            </IconLink>
          </div>
          <div className="mt-3">
            <CallbackModal
              trigger={
                <Button variant="light" className="w-full">
                  Заказать звонок
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
