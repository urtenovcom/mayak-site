import Image from "next/image";
import { ArrowRight } from "@/components/icons";

// Сертификат соответствия ООО «Маяк» (мобильные здания блок-контейнерного типа).
export const SERTIFIKAT_SOOTVETSTVIYA = {
  image: "/certs/sertifikat-sootvetstviya.webp",
  pdf: "/certs/sertifikat-sootvetstviya.pdf",
  title: "Сертификат соответствия",
  note: "Мобильные здания блок-контейнерного типа",
};

/** Карточка сертификата: превью-изображение со ссылкой на PDF. */
export function CertificateCard({
  image,
  pdf,
  title,
  note,
  className,
}: {
  image: string;
  pdf: string;
  title: string;
  note?: string;
  className?: string;
}) {
  return (
    <a
      href={pdf}
      target="_blank"
      rel="noopener"
      className={`group block rounded-[22px] border border-line bg-warm-soft p-5 transition-all duration-200 hover:-translate-y-1 hover:border-burgundy/30 hover:shadow-[0_20px_50px_-30px_rgba(26,18,22,0.5)] ${className ?? ""}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[16px] border border-line bg-white">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 90vw, 340px"
          className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <h3 className="mt-4 text-[16px] font-bold text-ink">{title}</h3>
      {note && <p className="mt-1 text-[14px] text-ink-soft">{note}</p>}
      <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-burgundy">
        Открыть PDF
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}
