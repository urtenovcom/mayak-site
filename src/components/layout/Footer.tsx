import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { Phone, Telegram, Max, Mail, MapPin } from "@/components/icons";
import { getContacts } from "@/lib/content";
import { SITE, FOOTER_NAV } from "@/lib/site";
import { telHref, telegramHref } from "@/lib/phone";
import { typo } from "@/lib/typo";
import { CopyMaxContact } from "@/components/CopyMaxContact";

export async function Footer() {
  // Серверный компонент: контакты берёт сам. Запрос кэширован под тегом
  // `settings`, поэтому общий с layout вызов ходит в API один раз.
  const contacts = await getContacts();
  // Ссылка на чат собирается из того же значения, что и подпись в тултипе:
  // правка номера в админке меняет и то, и другое. null — значение не
  // разобрать, тогда иконки Telegram нет.
  const telegram = telegramHref(contacts.telegram);

  // Копирайт не должен устаревать: год основания — текущий год.
  const currentYear = new Date().getFullYear();
  const copyrightYears =
    currentYear > SITE.foundedYear
      ? `${SITE.foundedYear}—${currentYear}`
      : `${SITE.foundedYear}`;

  return (
    <footer className="relative overflow-hidden bg-carbon text-white/85">
      <Container className="relative">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1.3fr_1.3fr]">
          <div>
            <Logo white width={170} />
            <p className="mt-6 max-w-xs text-pretty text-sm leading-relaxed text-white/55">
              {typo(
                "Производим модульные и металлические конструкции любого назначения. Доставка и монтаж — до 300 км от производства.",
              )}
            </p>
          </div>

          {Object.entries(FOOTER_NAV).map(([title, links]) => (
            <div key={title}>
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
                {title}
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="whitespace-pre-line text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {typo(l.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
              Контакты
            </h2>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {contacts.phones.map((p) => (
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
                  href={`mailto:${contacts.email}`}
                  className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 text-bluegray" />
                  {contacts.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bluegray" />
                {contacts.address}
              </li>
            </ul>

            {/* Мессенджеры — иконками */}
            <div className="mt-5 flex items-center gap-2.5">
              {telegram && (
                <a
                  href={telegram}
                  target="_blank"
                  rel="noopener"
                  aria-label="Написать в Telegram"
                  className="group/tooltip relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Telegram className="h-[18px] w-[18px]" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-50 w-max max-w-60 -translate-x-1/2 translate-y-1 rounded-xl bg-white px-3 py-2 text-center text-[12px] font-semibold leading-snug text-carbon opacity-0 shadow-xl transition-all duration-150 before:absolute before:left-1/2 before:top-full before:-translate-x-1/2 before:border-[5px] before:border-transparent before:border-t-white group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:translate-y-0 group-focus-visible/tooltip:opacity-100"
                  >
                    Написать в Telegram
                  </span>
                </a>
              )}
              <CopyMaxContact
                label="Написать в MAX"
                tooltipText="Скопировать номер"
                tooltipAbove
                tooltipLight
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Max className="h-[18px] w-[18px]" />
              </CopyMaxContact>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 border-t border-white/10 py-7 text-sm text-white/45 sm:flex-row sm:justify-between">
          <span>
            © {SITE.legalName} {copyrightYears}
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
