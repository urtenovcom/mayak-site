import { CONTACTS } from "@/lib/site";
import { Phone, Send, Message, Mail } from "@/components/icons";
import { cn } from "@/lib/cn";

const telHref = (s: string) => "tel:" + s.replace(/[^\d+]/g, "");

export function ContactRows({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {CONTACTS.phones.map((p) => (
        <li key={p}>
          <a
            href={telHref(p)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ink transition-colors hover:bg-warm-soft"
          >
            <Phone className="h-[18px] w-[18px] text-burgundy" />
            {p}
          </a>
        </li>
      ))}
      <li>
        <a
          href="https://t.me/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink/90 transition-colors hover:bg-warm-soft"
        >
          <Send className="h-[18px] w-[18px] text-burgundy" />
          Telegram: {CONTACTS.telegram}
        </a>
      </li>
      <li>
        <a
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink/90 transition-colors hover:bg-warm-soft"
        >
          <Message className="h-[18px] w-[18px] text-burgundy" />
          MAX: {CONTACTS.max}
        </a>
      </li>
      <li>
        <a
          href={`mailto:${CONTACTS.email}`}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink/90 transition-colors hover:bg-warm-soft"
        >
          <Mail className="h-[18px] w-[18px] text-burgundy" />
          {CONTACTS.email}
        </a>
      </li>
    </ul>
  );
}
