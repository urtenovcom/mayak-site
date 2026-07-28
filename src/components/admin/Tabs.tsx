"use client";

// Табы разделов панели.
//
// Три свойства, ради которых это отдельный компонент, а не пара кнопок:
//
// 1. ВЫБРАННЫЙ ТАБ ЖИВЁТ В АДРЕСЕ (`?tab=…`). Перезагрузка страницы, «назад»
//    из формы редактирования и ссылка, отправленная коллеге, открывают тот же
//    таб. Адрес правится нативным `history.replaceState`, а не router.replace:
//    Next в этой версии подхватывает такой вызов в usePathname/useSearchParams
//    (node_modules/next/dist/docs/01-app/01-getting-started/
//    04-linking-and-navigating.md, раздел «Native History API»), но при этом
//    НЕ ходит на сервер за новым RSC-пейлоадом. Переключение таба мгновенное и
//    не стоит запроса к API админки.
//
// 2. СОДЕРЖИМОЕ НЕ РАЗМОНТИРУЕТСЯ (`forceMount`). В табах лежат формы с
//    несохранёнными правками; если бы Radix выкидывал неактивную панель из
//    дерева, введённый текст пропадал бы при каждом переключении. Прятать
//    приходится самим: с `forceMount` Radix проставляет только
//    `data-state="inactive"`, а атрибут `hidden` оставляет снятым.
//
// 3. КЛАВИАТУРА — из коробки Radix: стрелки перебирают табы (roving tabindex),
//    Tab уводит в панель, aria-controls/aria-labelledby связывают их.

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AdminTab = {
  /** Значение в адресе: `?tab=<value>`. Только латиница и дефис. */
  value: string;
  label: string;
  content: ReactNode;
};

export const TAB_PARAM = "tab";

export function AdminTabs({
  tabs,
  label,
  param = TAB_PARAM,
  className,
}: {
  tabs: AdminTab[];
  /** Подпись для скринридера: какой список табов это. */
  label: string;
  param?: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get(param);

  // Незнакомое значение в адресе — не ошибка: открываем первый таб.
  const [value, setValue] = useState(
    () => tabs.find((tab) => tab.value === fromUrl)?.value ?? tabs[0].value,
  );

  function handleChange(next: string) {
    setValue(next);

    const params = new URLSearchParams(searchParams.toString());
    params.set(param, next);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }

  return (
    <TabsPrimitive.Root value={value} onValueChange={handleChange} className={className}>
      <TabsPrimitive.List
        aria-label={label}
        className="mb-4 flex flex-wrap gap-1.5 rounded-brand-sm border border-line bg-white p-1.5"
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "inline-flex h-9 items-center rounded-full px-4 text-[13px] font-bold transition",
              "text-ink-soft hover:bg-warm-soft hover:text-burgundy",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30",
              "data-[state=active]:bg-burgundy data-[state=active]:text-white",
              "data-[state=active]:hover:bg-burgundy-800 data-[state=active]:hover:text-white",
            )}
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.value}
          value={tab.value}
          forceMount
          // `hidden` идёт после внутреннего значения Radix и перекрывает его:
          // с forceMount панель обязана оставаться в дереве, но неактивная не
          // должна ни показываться, ни попадать в порядок обхода Tab.
          hidden={tab.value !== value}
          className="focus-visible:outline-none"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
