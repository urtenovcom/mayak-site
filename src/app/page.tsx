import { Hero } from "@/components/sections/Hero";
import { Solutions } from "@/components/sections/Solutions";
import { Process } from "@/components/sections/Process";
import { Stats } from "@/components/sections/Stats";
import { BigCTA } from "@/components/sections/BigCTA";
import { Container, SectionLabel } from "@/components/ui/Container";
import { BlockContainerAnatomy } from "@/components/sections/BlockContainerAnatomy";
import { BytovkaConfigurator } from "@/components/constructor/BytovkaConfigurator";
import { typo } from "@/lib/typo";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Solutions />
      <Process />
      <BlockContainerAnatomy />
      <section id="konfigurator" className="border-t border-line py-20 sm:py-24">
        <Container>
          <SectionLabel>Конструктор</SectionLabel>
          <h2 className="mt-4 text-balance text-[34px] font-extrabold tracking-[-0.02em] text-ink sm:text-[42px]">
            {typo("Подберите конструкцию под свою задачу")}
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-[16px] leading-relaxed text-ink-soft">
            {typo(
              "Выберите назначение, размеры и комплектацию. После отправки заявки менеджер подготовит индивидуальное предложение.",
            )}
          </p>
          <div className="mt-10">
            <BytovkaConfigurator />
          </div>
        </Container>
      </section>
      <BigCTA />
    </>
  );
}
