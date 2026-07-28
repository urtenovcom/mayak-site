import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/icons";
import type { SiteStat } from "@/lib/content-types";
import { typo } from "@/lib/typo";

/** Цифры доверия. Данные приходят пропом из страницы (база админки + фолбэк). */
export function Stats({ stats }: { stats: SiteStat[] }) {
  return (
    <section className="py-16">
      <Container>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-[22px] border border-line bg-white px-6 py-7"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warm text-burgundy">
                <Icon name={s.icon as IconName} className="h-6 w-6" />
              </span>
              <div>
                <div className="text-[30px] font-extrabold leading-none tracking-tight text-burgundy">
                  {s.value}
                </div>
                <div className="mt-1.5 whitespace-pre-line text-[13px] leading-tight text-ink-soft">
                  {typo(s.label)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
