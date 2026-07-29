"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string; icon: string };

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/leads", label: "Заявки", icon: "fi fi-rr-comment" },
  { href: "/admin/catalog", label: "Каталог", icon: "fi fi-rr-cube" },
  { href: "/admin/blog", label: "Блог", icon: "fi fi-rr-document" },
  // Блоки главной страницы сайта: направления, цифры доверия, этапы работы.
  // Адрес раздела остался прежним (/admin/solutions) — ссылки из закладок и
  // форм редактирования направлений продолжают работать.
  { href: "/admin/solutions", label: "Главная", icon: "fi fi-rr-home" },
  { href: "/admin/media", label: "Медиатека", icon: "fi fi-rr-picture" },
  // Настройки — последним пунктом: это не ежедневная работа с контентом, а
  // редкая настройка сайта, и в конце списка она не мешает.
  { href: "/admin/settings", label: "Настройки", icon: "fi fi-rr-settings" },
];

export function AdminNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-0.5", className)} aria-label="Разделы админки">
      {ADMIN_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-brand-sm px-3 py-2 text-[14px] font-semibold transition",
              active
                ? "bg-burgundy text-white"
                : "text-ink-soft hover:bg-warm-soft hover:text-burgundy",
            )}
          >
            <i className={cn(item.icon, "text-[15px] leading-none")} aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
