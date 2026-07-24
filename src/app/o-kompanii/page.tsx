import type { Metadata } from "next";
import { Container, SectionLabel } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Check, Icon, type IconName } from "@/components/icons";
import {
  CertificateCard,
  SERTIFIKAT_SOOTVETSTVIYA,
} from "@/components/CertificateCard";
import { typo } from "@/lib/typo";

export const metadata: Metadata = {
  title: "О компании — ООО «Маяк»",
  description:
    "ООО «Маяк» — производитель модульных и металлических конструкций: бытовки, блок-модули, санитарные блоки и ангары. Собственное производство, контроль качества и индивидуальный подход к каждой задаче.",
};

const stats: { value: string; label: string; icon: IconName }[] = [
  { value: "500+", label: "выполненных работ", icon: "cube" },
  { value: "30+ лет", label: "опыт команды в строительной сфере", icon: "user" },
  { value: "100%", label: "индивидуальный подход к задаче", icon: "target" },
  {
    value: "1 точка",
    label: "ответственности: производство, доставка и монтаж",
    icon: "home",
  },
];

const advantages: { title: string; text: string }[] = [
  {
    title: "Собственное производство",
    text: "Контролируем качество изготовления и комплектацию без зависимости от посредников. Можем быстро вносить правки, менять исполнение и адаптировать конструкцию под задачу заказчика.",
  },
  {
    title: "Контроль на каждом этапе",
    text: "Проверяем основные элементы конструкции в процессе изготовления: каркас, сварные соединения, утепление, отделку, электрику и дополнительное оснащение.",
  },
  {
    title: "Опытная команда",
    text: "Используем практический опыт команды в строительной сфере, чтобы учитывать особенности объекта, условия эксплуатации, доставку и монтаж при подборе конструкции.",
  },
  {
    title: "Индивидуальное изготовление",
    text: "Изготавливаем конструкции под задачу заказчика: с нужными размерами, планировкой, отделкой, оснащением и условиями эксплуатации.",
  },
];

export default function OKompaniiPage() {
  return (
    <>
      <PageHeader
        label="О компании"
        title="О компании ООО «Маяк»"
        description="ООО «Маяк» изготавливает модульные и металлические конструкции для частных и коммерческих объектов. Мы подбираем решения под конкретную задачу: от формата и размеров до комплектации, отделки и условий эксплуатации."
      />

      <section className="border-b border-line">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <SectionLabel>Кто мы</SectionLabel>
            <h2 className="mt-3 text-balance text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
              {typo("Производитель модульных и металлических конструкций")}
            </h2>
            <div className="mt-5 flex flex-col gap-4 text-pretty text-[16px] leading-relaxed text-ink-soft">
              <p>
                {typo(
                  "ООО «Маяк» изготавливает бытовки, блок-контейнеры, модульные здания, хозблоки, санитарные решения и металлические конструкции. Производство находится в Раменском городском округе, деревня Рыбаки.",
                )}
              </p>
              <p>
                {typo(
                  "Компания берёт на себя основные этапы работы: изготовление, доставку и монтаж. При подготовке заказа учитываются назначение конструкции, размеры, планировка, комплектация, отделка и условия эксплуатации.",
                )}
              </p>
              <p>
                {typo(
                  "Мы работаем с частными заказчиками, строительными организациями, производственными объектами и коммерческими компаниями.",
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-[22px] border border-line bg-white p-5 shadow-[0_14px_40px_-30px_rgba(0,12,15,0.4)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-warm-soft text-burgundy">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <p className="mt-4 text-[26px] font-extrabold tracking-[-0.02em] text-ink">
                  {typo(s.value)}
                </p>
                <p className="mt-1 text-pretty text-[13px] leading-snug text-ink-soft">
                  {typo(s.label)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-warm-soft/40">
        <Container className="py-16 sm:py-20">
          <SectionLabel>Подход к работе</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-balance text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
            {typo("Производство, контроль и индивидуальное исполнение")}
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {advantages.map((a) => (
              <div
                key={a.title}
                className="rounded-[22px] border border-line bg-white p-6 shadow-[0_14px_40px_-30px_rgba(0,12,15,0.4)]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-balance text-[18px] font-bold tracking-[-0.01em] text-ink">
                      {typo(a.title)}
                    </h3>
                    <p className="mt-2 text-pretty text-[15px] leading-relaxed text-ink-soft">
                      {typo(a.text)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16 sm:py-20">
          <SectionLabel>Документы</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-balance text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
            {typo("Сертификат соответствия на продукцию")}
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-[16px] leading-relaxed text-ink-soft">
            {typo(
              "Мобильные здания блок-контейнерного типа ООО «Маяк» прошли добровольную сертификацию и соответствуют требованиям технических условий. Документ можно открыть и скачать.",
            )}
          </p>
          <div className="mt-8 grid gap-8 sm:grid-cols-[320px_1fr] sm:items-center">
            <CertificateCard {...SERTIFIKAT_SOOTVETSTVIYA} />
            <ul className="flex flex-col gap-3.5">
              {[
                "Продукция: мобильные здания блок-контейнерного типа, модель БК-00",
                "№ РОСС RU.33026.04ЦЭТ0ОС002.С02759",
                "Орган по сертификации: «ПРОМЭКСПЕРТИЗА»",
                "Срок действия: 18.05.2026 — 17.05.2029",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] text-ink"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                    <Check className="h-4 w-4" />
                  </span>
                  {typo(item)}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-20">
          <div className="engineering-grid relative overflow-hidden rounded-[28px] border border-line">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-white/80" />
            <div className="relative flex flex-col items-start gap-6 p-8 sm:p-12">
              <h2 className="max-w-2xl text-balance text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
                {typo("Соберите конструкцию под свою задачу прямо сейчас")}
              </h2>
              <p className="max-w-xl text-pretty text-[16px] leading-relaxed text-ink-soft">
                {typo(
                  "Выберите тип модуля, размеры и комплектацию в конструкторе — мы подготовим расчёт и предложим оптимальное решение.",
                )}
              </p>
              <ButtonLink href="/constructor" size="lg" withArrow>
                Перейти в конструктор
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
