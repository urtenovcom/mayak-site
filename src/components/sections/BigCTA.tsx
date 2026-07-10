"use client";

import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CallbackModal } from "@/components/CallbackModal";

export function BigCTA() {
  return (
    <section className="py-8">
      <Container>
        <div className="relative overflow-hidden rounded-[28px] bg-burgundy px-7 py-12 text-white sm:px-12 sm:py-16">
          {/* наш рендер — выглядывает справа наполовину */}
          <div className="pointer-events-none absolute inset-y-0 right-[-16%] hidden w-[52%] lg:block">
            <Image
              src="/renders/cta-office-v2.webp"
              alt="Модульный офис «Маяк»"
              fill
              sizes="680px"
              className="object-cover object-left scale-x-[-1.44] scale-y-[1.44]"
            />
          </div>

          <div className="relative max-w-xl">
            <span className="text-[14px] font-semibold text-warm/80">
              Не нашли подходящее решение?
            </span>
            <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[44px]">
              Создадим конструкцию
              <br />
              под вашу задачу
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/70">
              Разработаем индивидуальное решение под ваши требования.
            </p>
            <div className="mt-8">
              <CallbackModal
                trigger={
                  <Button variant="light" size="lg" withArrow>
                    Оставить заявку
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
