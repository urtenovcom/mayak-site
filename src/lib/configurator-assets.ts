// Ассеты визуального конструктора.
// Каждый (обшивка × цвет) — отдельный сгенерированный рендер (без перекраски).
// Пока заполнена бытовка; остальные типы добавляются по мере генерации.

export type CladdingId = "proflist" | "vagonka";
export type ColorId = "white" | "grey" | "green" | "blue";

export type CladdingOption = {
  id: CladdingId;
  label: string;
  hint: string;
};

export type ColorOption = {
  id: ColorId;
  label: string;
  ral: string;
  /** Цвет свотча в UI (приблизительный к RAL). */
  swatch: string;
};

export const CLADDINGS: CladdingOption[] = [
  { id: "proflist", label: "Профлист", hint: "Профилированный стальной лист" },
  { id: "vagonka", label: "Вагонка", hint: "Деревянная обшивка, окрашенная" },
];

export const COLORS: ColorOption[] = [
  { id: "white", label: "Белый", ral: "RAL 9003", swatch: "#EEEEEA" },
  { id: "grey", label: "Серый", ral: "RAL 7004", swatch: "#96968F" },
  { id: "green", label: "Зелёный мох", ral: "RAL 6005", swatch: "#2F4A3A" },
  { id: "blue", label: "Синий", ral: "RAL 5005", swatch: "#153F73" },
];

/** Путь к рендеру бытовки для выбранной пары обшивка+цвет. */
export function bytovkaRender(cladding: CladdingId, color: ColorId): string {
  return `/renders/constructor/bytovka/${cladding}-${color}-v3.webp`;
}
