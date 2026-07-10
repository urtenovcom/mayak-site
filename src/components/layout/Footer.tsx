import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { Phone, Telegram, Max, Mail, MapPin } from "@/components/icons";
import { SITE, CONTACTS, FOOTER_NAV } from "@/lib/site";

const telHref = (s: string) => "tel:" + s.replace(/[^\d+]/g, "");

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-carbon text-white/85">
      <Container className="relative">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1.3fr_1.3fr]">
          <div>
            <Logo white width={170} />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/55">
              Производим модульные и металлические конструкции любого назначения.
              Работаем по всей России.
            </p>
          </div>

          {Object.entries(FOOTER_NAV).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
                {title}
              </h4>
              <ul className="mt-5 flex flex-col gap-3">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="whitespace-pre-line text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
              Контакты
            </h4>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {CONTACTS.phones.map((p) => (
                <li key={p}>
                  <a
                    href={telHref(p)}
                    className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4 text-bluegray" />
                    {p}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${CONTACTS.email}`}
                  className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 text-bluegray" />
                  {CONTACTS.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bluegray" />
                {CONTACTS.address}
              </li>
            </ul>

            {/* Мессенджеры — иконками */}
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener"
                aria-label={`Telegram: ${CONTACTS.telegram}`}
                title={`Telegram: ${CONTACTS.telegram}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Telegram className="h-[18px] w-[18px]" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener"
                aria-label={`MAX: ${CONTACTS.max}`}
                title={`MAX: ${CONTACTS.max}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Max className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-7 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {SITE.legalName} {SITE.year}
          </span>
          <a
            href="https://алазар.рф"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-white"
          >
            Разработано Alazar Studio
          </a>
        </div>
      </Container>
    </footer>
  );
}
