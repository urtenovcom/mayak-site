// Опции шагов конструктора (пока — бытовка).
// Визуальные оси (обшивка, цвет) живут в configurator-assets.ts.
// Здесь — невизуальные параметры: размер, утепление, окна/двери, отделка, инженерия.

export type StepOption = {
  value: string;
  label: string;
  hint?: string;
  /** Путь к рендеру опции (для отделки и дверей). */
  img?: string;
};

// Назначение — ЗАДАЧА (для чего). Не пересекается с типом (формой).
export const PURPOSE: StepOption[] = [
  { value: "Стройплощадка", label: "Для строительства", hint: "Бытовки и штаб на объекте" },
  { value: "Проживание", label: "Для проживания", hint: "Жильё, вахта, общежитие" },
  { value: "Офис", label: "Офис / рабочее место", hint: "Приёмная, штаб, кабинет" },
  { value: "Санитария", label: "Санитарные нужды", hint: "Душевые и санузлы" },
  { value: "Хранение", label: "Хранение", hint: "Склад инвентаря и материалов" },
  { value: "Отдых", label: "Отдых и дача", hint: "Сезонный дом на участке" },
];

// Тип конструкции — ФОРМ-ФАКТОР. Без повторов с назначением.
export const CONSTRUCTION_TYPES: StepOption[] = [
  { value: "Бытовка", label: "Бытовка", hint: "Каркасная, металл/дерево" },
  { value: "Блок-контейнер", label: "Блок-контейнер", hint: "Цельносварной модуль" },
  { value: "Модульное здание", label: "Модульное здание", hint: "Из нескольких блоков" },
  { value: "Хозблок", label: "Хозблок", hint: "Компактный, для хранения" },
  { value: "Пост охраны", label: "Пост охраны", hint: "Компактная кабина" },
  { value: "Ангар / навес", label: "Ангар / навес", hint: "Лёгкий металлокаркас" },
];

export const SIZES: StepOption[] = [
  { value: "3×2.4 м", label: "3×2.4 м", hint: "≈ 7 м²" },
  { value: "4×2.4 м", label: "4×2.4 м", hint: "≈ 10 м²" },
  { value: "6×2.4 м", label: "6×2.4 м", hint: "≈ 14 м²" },
  { value: "6×3 м", label: "6×3 м", hint: "≈ 18 м²" },
];

export const EXPLOITATION: StepOption[] = [
  { value: "Летняя", label: "Летняя", hint: "Без утепления" },
  { value: "Зимняя", label: "Зимняя", hint: "Минвата 100 мм, пароизоляция" },
];

export const WINDOWS: StepOption[] = [
  { value: "Без окон", label: "Без окон" },
  { value: "1 окно ПВХ", label: "1 окно ПВХ" },
  { value: "2 окна ПВХ", label: "2 окна ПВХ" },
];

export const DOORS: StepOption[] = [
  {
    value: "Металлическая",
    label: "Металлическая",
    hint: "Глухая входная",
    img: "/renders/constructor/bytovka/door/metal.webp",
  },
  {
    value: "Утеплённая",
    label: "Утеплённая",
    hint: "С окном, для зимы",
    img: "/renders/constructor/bytovka/door/insul.webp",
  },
];

export const INTERIOR: StepOption[] = [
  {
    value: "Вагонка (дерево)",
    label: "Вагонка",
    hint: "Натуральное дерево",
    img: "/renders/constructor/bytovka/interior/vagonka-v2.webp",
  },
  {
    value: "ЛДВП",
    label: "ЛДВП",
    hint: "Ламинированная панель",
    img: "/renders/constructor/bytovka/interior/ldvp-v2.webp",
  },
  {
    value: "МДФ-панели",
    label: "МДФ-панели",
    hint: "Гладкая отделка",
    img: "/renders/constructor/bytovka/interior/mdf-v2.webp",
  },
  {
    value: "ПВХ-панели",
    label: "ПВХ-панели",
    hint: "Влагостойкие",
    img: "/renders/constructor/bytovka/interior/pvh-v2.webp",
  },
];

export const ENGINEERING: StepOption[] = [
  { value: "Электрика (розетки, свет)", label: "Электрика", hint: "Розетки и освещение" },
  { value: "Электрика под обогрев", label: "Под обогрев", hint: "Щит и автомат" },
  { value: "Отопление (конвектор)", label: "Отопление", hint: "Конвектор" },
  { value: "Санузел", label: "Санузел", hint: "Подводка воды" },
  { value: "Вентиляция", label: "Вентиляция", hint: "Вытяжная" },
];
