import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-burgundy/70">
      {children}
    </span>
  );
}
