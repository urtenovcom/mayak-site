"use client";

import { ProposalModal } from "@/components/ProposalModal";
import { Phone } from "@/components/icons";

/** Плавающая кнопка «Получить расчёт» — открывает модалку-КП. Доступна на всех страницах. */
export function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7">
      <ProposalModal
        trigger={
          <button
            type="button"
            className="group flex items-center gap-2.5 rounded-full bg-burgundy px-5 py-4 font-semibold text-white shadow-[0_20px_45px_-18px_rgba(66,30,42,0.85)] transition-all duration-200 hover:bg-burgundy-800"
          >
            <Phone className="h-5 w-5" />
            <span className="hidden sm:inline">Получить расчёт</span>
          </button>
        }
      />
    </div>
  );
}
