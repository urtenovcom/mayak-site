import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/icons";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-burgundy text-white border border-burgundy hover:bg-burgundy-800 hover:border-burgundy-800 shadow-[0_10px_28px_-14px_rgba(66,30,42,0.7)]",
  secondary:
    "bg-white text-burgundy border border-burgundy/35 hover:bg-warm hover:border-burgundy/50",
  ghost:
    "bg-transparent text-burgundy border border-transparent hover:bg-warm-soft",
  light:
    "bg-white text-burgundy border border-transparent hover:bg-warm shadow-[0_10px_28px_-16px_rgba(0,12,15,0.5)]",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  children: ReactNode;
  className?: string;
};

const baseClass =
  "group inline-flex items-center justify-center gap-2.5 rounded-full font-semibold tracking-tight transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none";

function inner(children: ReactNode, withArrow?: boolean) {
  return (
    <>
      <span>{children}</span>
      {withArrow && (
        <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  withArrow,
  className,
  children,
  ...props
}: BaseProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button
      className={cn(baseClass, variants[variant], sizes[size], className)}
      {...props}
    >
      {inner(children, withArrow)}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  withArrow,
  className,
  children,
  href,
  ...props
}: BaseProps & { href: string } & Omit<
    ComponentProps<typeof Link>,
    "className" | "children" | "href"
  >) {
  return (
    <Link
      href={href}
      className={cn(baseClass, variants[variant], sizes[size], className)}
      {...props}
    >
      {inner(children, withArrow)}
    </Link>
  );
}
