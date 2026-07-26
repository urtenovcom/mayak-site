import Image from "next/image";
import { Container, SectionLabel } from "@/components/ui/Container";
import { ArrowRight, Check } from "@/components/icons";
import { SERTIFIKAT_SOOTVETSTVIYA } from "@/components/CertificateCard";
import { typo } from "@/lib/typo";

// Ключевые данные сертификата (по документу).
const DETAILS = [
  "Продукция: мобильные здания блок-контейнерного типа, модель БК-00",
  "№ РОСС RU.33026.04ЦЭТООС002.С02759",
  "Орган по сертификации: «ПРОМЭКСПЕРТИЗА»",
  "Срок действия: 18.05.2026 — 17.05.2029",
];

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5M8.5 13h7M8.5 16.5h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Блок сертификации: превью документа + PDF слева, чек-лист данных справа. */
export function CertificationBlock() {
  const c = SERTIFIKAT_SOOTVETSTVIYA;
  return (
    <section className="border-b border-line">
      <Container className="py-16 sm:py-20">
        <SectionLabel>Документы</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-balance text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
          {typo("Сертификат соответствия на продукцию")}
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr] lg:items-center">
          {/* Левая колонка — превью и карточка PDF */}
          <a
            href={c.pdf}
            target="_blank"
            rel="noopener"
            className="group block rounded-[28px] border border-line bg-warm-soft p-5 transition-all duration-200 hover:-translate-y-1 hover:border-burgundy/30 hover:shadow-[0_24px_60px_-34px_rgba(26,18,22,0.55)] sm:p-6"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[16px] border border-line bg-white">
              <Image
                src={c.image}
                alt={c.title}
                fill
                sizes="(max-width: 1024px) 90vw, 460px"
                className="object-contain transition-transform duration-300 group-hover:scale-[1.015]"
              />
            </div>

            <div className="mt-5 flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-burgundy text-white">
                <FileIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-[16px] font-bold text-ink">{c.title}</p>
                <p className="text-[14px] text-ink-soft">{c.note}</p>
              </div>
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-burgundy">
              Открыть PDF
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>

          {/* Правая колонка — вводный текст и чек-лист данных сертификата */}
          <div>
            <p className="text-pretty text-[16px] leading-relaxed text-ink-soft">
              {typo(
                "Мобильные здания блок-контейнерного типа ООО «Маяк» прошли добровольную сертификацию и соответствуют требованиям технических условий. Документ можно открыть и скачать.",
              )}
            </p>
            <ul className="mt-6 flex flex-col">
              {DETAILS.map((detail, i) => (
              <li
                key={detail}
                className={`flex items-start gap-4 py-5 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-burgundy/30 text-burgundy">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="text-pretty text-[15px] leading-relaxed text-ink">
                  {typo(detail)}
                </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
