import { getContacts } from "@/lib/content";
import { telHref, telegramHref } from "@/lib/phone";
import { Phone, Telegram, Max, Mail } from "@/components/icons";
import { cn } from "@/lib/cn";
import { CopyMaxContact } from "@/components/CopyMaxContact";

export async function ContactRows({ className }: { className?: string }) {
  const contacts = await getContacts();
  // Ссылка на чат — из значения контакта, а не константой в вёрстке.
  const telegram = telegramHref(contacts.telegram);
  const rowClass =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink/90";

  return (
    <ul className={cn("flex flex-col", className)}>
      {contacts.phones.map((p) => (
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
        {telegram ? (
          <a href={telegram} className={cn(rowClass, "transition-colors hover:bg-warm-soft")}>
            <Telegram className="h-[18px] w-[18px] text-burgundy" />
            {contacts.telegram}
          </a>
        ) : (
          // Разобрать значение не удалось — показываем контакт текстом, а не
          // ссылкой в никуда.
          <span className={rowClass}>
            <Telegram className="h-[18px] w-[18px] text-burgundy" />
            {contacts.telegram}
          </span>
        )}
      </li>
      <li>
        <CopyMaxContact
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink/90 transition-colors hover:bg-warm-soft"
        >
          <Max className="h-[18px] w-[18px] text-burgundy" />
          {contacts.max}
        </CopyMaxContact>
      </li>
      <li>
        <a
          href={`mailto:${contacts.email}`}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink/90 transition-colors hover:bg-warm-soft"
        >
          <Mail className="h-[18px] w-[18px] text-burgundy" />
          {contacts.email}
        </a>
      </li>
    </ul>
  );
}
