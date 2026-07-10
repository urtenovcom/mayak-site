"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Close } from "@/components/icons";
import {
  PRODUCTS,
  PRODUCT_TYPES,
  EXPLOITATIONS,
  PRODUCT_OPTIONS,
  PURPOSE_TAGS,
  type Product,
  type ProductType,
  type Exploitation,
  type ProductOption,
} from "@/lib/catalog";

type Filters = {
  purpose: string[];
  type: ProductType[];
  exploitation: Exploitation[];
  options: ProductOption[];
};

const EMPTY: Filters = { purpose: [], type: [], exploitation: [], options: [] };

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function matches(product: Product, f: Filters): boolean {
  if (f.purpose.length && !f.purpose.some((p) => product.tags.includes(p)))
    return false;
  if (f.type.length && !f.type.includes(product.type)) return false;
  if (f.exploitation.length && !f.exploitation.includes(product.exploitation))
    return false;
  if (f.options.length && !f.options.every((o) => product.options.includes(o)))
    return false;
  return true;
}

function FilterGroup<T extends string>({
  title,
  values,
  selected,
  onToggle,
}: {
  title: string;
  values: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div>
      <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-burgundy/70">
        {title}
      </h3>
      <div className="mt-3 flex flex-col items-start gap-2.5">
        {values.map((value) => {
          const active = selected.includes(value);
          return (
            <label
              key={value}
              className="flex cursor-pointer select-none items-center gap-2.5 text-[14px] text-ink/85 transition-colors hover:text-ink"
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => onToggle(value)}
                className="h-4 w-4 shrink-0 accent-[#421e2a]"
              />
              <span className={active ? "font-semibold text-ink" : ""}>
                {value}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function CatalogView() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(
    () => PRODUCTS.filter((p) => matches(p, filters)),
    [filters],
  );

  const activeCount =
    filters.purpose.length +
    filters.type.length +
    filters.exploitation.length +
    filters.options.length;

  const update = <K extends keyof Filters>(
    key: K,
    value: Filters[K][number],
  ) =>
    setFilters((prev) => ({
      ...prev,
      [key]: toggle(prev[key] as string[], value as string) as Filters[K],
    }));

  const filtersPanel = (
    <div className="flex flex-col gap-7">
      <FilterGroup
        title="Назначение"
        values={PURPOSE_TAGS}
        selected={filters.purpose}
        onToggle={(v) => update("purpose", v)}
      />
      <FilterGroup
        title="Тип конструкции"
        values={PRODUCT_TYPES}
        selected={filters.type}
        onToggle={(v) => update("type", v)}
      />
      <FilterGroup
        title="Эксплуатация"
        values={EXPLOITATIONS}
        selected={filters.exploitation}
        onToggle={(v) => update("exploitation", v)}
      />
      <FilterGroup
        title="Опции"
        values={PRODUCT_OPTIONS}
        selected={filters.options}
        onToggle={(v) => update("options", v)}
      />
      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => setFilters(EMPTY)}
          className="inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-burgundy hover:underline"
        >
          <Close className="h-4 w-4" />
          Сбросить фильтры ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        label="Каталог"
        title="Решения под любую задачу"
        description="Бытовки, блок-контейнеры, модульные здания, санитарные модули и металлоконструкции. Выберите готовое решение или соберите своё под условия эксплуатации."
      />

      <section className="bg-warm-bg py-12 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Фильтры — десктоп */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-[22px] border border-line bg-white/70 p-6">
                {filtersPanel}
              </div>
            </aside>

            {/* Фильтры — мобайл (сворачиваются) */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-5 py-3.5 text-[15px] font-semibold text-ink"
              >
                <span>
                  Фильтры
                  {activeCount > 0 && (
                    <span className="ml-2 rounded-full bg-burgundy px-2 py-0.5 text-[12px] text-white">
                      {activeCount}
                    </span>
                  )}
                </span>
                <span className="text-ink-soft">{mobileOpen ? "Скрыть" : "Показать"}</span>
              </button>
              {mobileOpen && (
                <div className="mt-3 rounded-[22px] border border-line bg-white p-6">
                  {filtersPanel}
                </div>
              )}
            </div>

            {/* Сетка / empty-state */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[14px] text-ink-soft">
                  Найдено решений: <span className="font-semibold text-ink">{filtered.length}</span>
                </p>
              </div>

              {filtered.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-5 rounded-[28px] border border-line bg-white p-8 sm:p-12">
                  <h3 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
                    Под такие фильтры готового решения нет
                  </h3>
                  <p className="max-w-md text-[15px] leading-relaxed text-ink-soft">
                    Это не значит, что мы не сможем помочь. Мы проектируем и
                    изготавливаем конструкции под индивидуальные требования —
                    габариты, комплектацию и условия эксплуатации. Соберите своё
                    решение в конструкторе или сбросьте часть фильтров.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <ButtonLink href="/constructor" variant="primary" size="lg" withArrow>
                      Индивидуальный расчёт
                    </ButtonLink>
                    <button
                      type="button"
                      onClick={() => setFilters(EMPTY)}
                      className="inline-flex h-14 items-center rounded-full border border-burgundy/35 bg-white px-7 text-base font-semibold text-burgundy transition-colors hover:bg-warm"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
