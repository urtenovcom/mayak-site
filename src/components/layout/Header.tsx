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
import { NAV } from "@/lib/site";
import { telHref, telegramHref } from "@/lib/phone";
import { cn } from "@/lib/cn";
import { CopyMaxContact } from "@/components/CopyMaxContact";
import { useContacts } from "@/components/ContactsProvider";

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
      className="group/tooltip relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-50 hidden w-max max-w-60 -translate-x-1/2 translate-y-1 rounded-xl bg-carbon px-3 py-2 text-center text-[12px] font-semibold leading-snug text-white opacity-0 shadow-xl transition-all duration-150 before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[5px] before:border-transparent before:border-b-carbon sm:block group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:translate-y-0 group-focus-visible/tooltip:opacity-100"
      >
        {label}
      </span>
    </a>
  );
}

export function Header() {
  // Контакты приходят из базы через ContactsProvider (layout); вне провайдера
  // хук отдаёт статические — шапка не может остаться без телефона.
  const contacts = useContacts();
  // Адрес чата собирается из контакта: правка номера в админке меняет и ссылку.
  // null — значение не разобрать, тогда иконки Telegram просто нет (вести на
  // пустой `https://t.me/` хуже, чем не показать её вовсе).
  const telegram = telegramHref(contacts.telegram);
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

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const solid = scrolled || !isHome || menuOpen;
  const hidden = isHome && !heroReady;

  return (
    <header
      className={cn(
        "z-50 transition-[background-color,opacity,transform] duration-700 ease-out",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
        solid
          ? menuOpen
            ? "bg-burgundy"
            : "bg-burgundy/95 backdrop-blur-md"
          : "bg-transparent",
        hidden
          ? "pointer-events-none -translate-y-3 opacity-0"
          : "opacity-100",
      )}
    >
      {/* тонкая линия под шапкой */}
      <div className="pointer-events-none absolute inset-x-0 top-[72px] h-px bg-white/[0.08]" />

      <div className="relative z-[60] mx-auto flex h-[72px] max-w-[1360px] items-center justify-between gap-5 px-5 sm:px-8">
        <Logo white width={130} />

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((i) => (
            <NavLink key={i.href} href={i.href} label={i.label} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 lg:flex">
            {telegram && (
              <IconLink href={telegram} label="Написать в Telegram">
                <Telegram className="h-[16px] w-[16px]" />
              </IconLink>
            )}
            <CopyMaxContact
              label="Написать в MAX"
              tooltipText="Скопировать номер"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <Max className="h-[16px] w-[16px]" />
            </CopyMaxContact>
            <IconLink href={`mailto:${contacts.email}`} label="Написать на почту">
              <Mail className="h-[16px] w-[16px]" />
            </IconLink>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            {contacts.phones.map((p) => (
              <a
                key={p}
                href={telHref(p)}
                aria-label={`Позвонить: ${p}`}
                className="group/tooltip relative inline-flex h-10 items-center gap-1.5 rounded-full border border-white/20 px-3.5 text-[13px] font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10"
              >
                <Phone className="h-3.5 w-3.5 text-[#d29aa8]" />
                {p}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-50 w-max -translate-x-1/2 translate-y-1 rounded-xl bg-carbon px-3 py-2 text-[12px] font-semibold text-white opacity-0 shadow-xl transition-all duration-150 before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[5px] before:border-transparent before:border-b-carbon group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:translate-y-0 group-focus-visible/tooltip:opacity-100"
                >
                  Позвонить
                </span>
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
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((v) => !v)}
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-burgundy/35 text-white backdrop-blur-sm lg:hidden"
          >
            {menuOpen ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        id="mobile-navigation"
        className={cn(
          "fixed inset-0 z-50 overflow-y-auto bg-burgundy transition-transform duration-300 ease-out lg:hidden",
          menuOpen ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="flex min-h-full flex-col px-5 pb-7 pt-[88px] sm:px-8">
          {NAV.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-3.5 text-[17px] font-medium text-white/85 hover:bg-white/5"
            >
              {i.label}
            </Link>
          ))}
          <div className="mt-5 grid gap-2">
            {contacts.phones.map((p) => (
              <a
                key={p}
                href={telHref(p)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 px-4 text-[14px] font-semibold text-white"
              >
                <Phone className="h-3.5 w-3.5 text-[#d29aa8]" />
                {p}
              </a>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 [&>a]:h-12 [&>a]:w-full">
            {telegram && (
              <IconLink href={telegram} label="Написать в Telegram">
                <Telegram className="h-[16px] w-[16px]" />
              </IconLink>
            )}
            <CopyMaxContact
              label="Написать в MAX"
              tooltipText="Скопировать номер"
              className="flex h-12 w-full items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <Max className="h-[16px] w-[16px]" />
            </CopyMaxContact>
            <IconLink href={`mailto:${contacts.email}`} label="Написать на почту">
              <Mail className="h-[16px] w-[16px]" />
            </IconLink>
          </div>
          <div className="mt-5">
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
