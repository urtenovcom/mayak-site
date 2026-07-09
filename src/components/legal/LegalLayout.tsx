import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

// Server-компонент для типографики длинного юридического/документального текста.
// Плагина @tailwindcss/typography нет, поэтому стилизуем дочерние элементы
// обычными Tailwind-классами:
//   h2 → text-2xl font-bold mt-10 mb-4
//   p  → text-ink-soft leading-relaxed mb-4
//   ul → list-disc pl-5
// Передавайте в children готовую разметку, используя эти классы.

export function LegalLayout({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader label={label} title={title} description={description} />
      <section className="py-14 sm:py-20">
        <Container>
          <div className="max-w-3xl text-[16px]">{children}</div>
        </Container>
      </section>
    </>
  );
}
