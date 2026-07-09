import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  white = false,
  className,
  width = 150,
}: {
  white?: boolean;
  className?: string;
  width?: number;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label="ООО «Маяк» — на главную">
      <Image
        src={white ? "/logo-white.svg" : "/logo.svg"}
        alt="ООО «Маяк»"
        width={width}
        height={Math.round((width / 150) * 60)}
        priority
        className="h-auto w-auto"
        style={{ width }}
      />
    </Link>
  );
}
