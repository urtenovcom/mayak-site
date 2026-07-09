import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

// Шаблон, требует проверки юристом.

export const metadata: Metadata = {
  title: "Сертификаты",
  description:
    "Продукция ООО «Маяк» соответствует требованиям нормативной документации. Сертификаты и документы о соответствии.",
};

const CERTIFICATES = [
  { title: "Сертификат соответствия", note: "Модульные здания" },
  { title: "Декларация о соответствии", note: "Металлоконструкции" },
  { title: "Паспорт качества", note: "Несущий каркас" },
  { title: "Сертификат на материалы", note: "Сэндвич-панели" },
  { title: "Протокол испытаний", note: "Узлы и соединения" },
  { title: "Сертификат пожарной безопасности", note: "Огнестойкость" },
];

export default function SertifikatyPage() {
  return (
    <LegalLayout
      label="Документы"
      title="Сертификаты"
      description="Продукция ООО «Маяк» соответствует требованиям действующих стандартов и нормативной документации."
    >
      <p className="text-ink-soft leading-relaxed mb-4">
        Производство модульных и металлических конструкций ведётся в соответствии
        с требованиями действующих государственных стандартов (ГОСТ), технических
        условий и санитарных норм. Применяемые материалы и комплектующие имеют
        документы, подтверждающие их качество и безопасность.
      </p>
      <p className="text-ink-soft leading-relaxed mb-4">
        Ниже представлены документы о соответствии. Копии сертификатов на
        конкретную продукцию предоставляются по запросу при заключении договора.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CERTIFICATES.map((cert) => (
          <div
            key={cert.title}
            className="rounded-[22px] border border-line bg-warm-soft p-5"
          >
            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-[16px] border border-dashed border-line bg-white">
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft/60">
                Документ
              </span>
            </div>
            <h2 className="mt-4 text-[16px] font-bold text-ink">{cert.title}</h2>
            <p className="mt-1 text-[14px] text-ink-soft">{cert.note}</p>
          </div>
        ))}
      </div>
    </LegalLayout>
  );
}
