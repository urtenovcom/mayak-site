// Централизованные данные сайта ООО «Маяк»

export const SITE = {
  name: "ООО «Маяк»",
  legalName: 'ООО «Маяк»',
  tagline: "Производство модульных зданий",
  year: 2024,
};

export const CONTACTS = {
  phones: ["8 925 888-37-00", "8 966 979-55-66"],
  telegram: "8 966 979-55-66",
  max: "8 966 979-55-66",
  email: "companymayak@mail.ru",
  address: "Раменский район, деревня Рыбаки",
};

export const NAV = [
  { label: "Каталог", href: "/catalog" },
  { label: "Доставка", href: "/dostavka" },
  { label: "О компании", href: "/o-kompanii" },
  { label: "Контакты", href: "/kontakty" },
];

export const FOOTER_NAV = {
  Навигация: [
    { label: "Каталог", href: "/catalog" },
    { label: "Доставка", href: "/dostavka" },
    { label: "О компании", href: "/o-kompanii" },
    { label: "Контакты", href: "/kontakty" },
  ],
  Документы: [
    { label: "Гарантия", href: "/garantiya" },
    { label: "Сертификаты", href: "/sertifikaty" },
    { label: "Реквизиты", href: "/rekvizity" },
    { label: "Политика конфиденциальности", href: "/privacy-policy" },
    {
      label: "Согласие на обработку\nперсональных данных",
      href: "/personal-data-consent",
    },
  ],
};

// Направления для блока «Решения по задачам»
export const SOLUTIONS = [
  {
    id: "stroitelstvo",
    icon: "crane",
    label: "Для\nстроительства",
    kicker: "Для строительства",
    title: "Надёжные решения\nдля строительных объектов",
    description:
      "Вагончики, бытовки, склады и модульные здания для стройплощадок и временной инфраструктуры.",
    bullets: [
      "Быстрый монтаж и демонтаж",
      "Устойчивость к погодным условиям",
      "Возможность комплектации под задачу",
    ],
  },
  {
    id: "ofis",
    icon: "briefcase",
    label: "Для временного\nофиса",
    kicker: "Для временного офиса",
    title: "Комфортные офисы\nна объекте",
    description:
      "Модульные офисы и штабы строительства с отоплением, электрикой и удобной планировкой.",
    bullets: [
      "Утепление и круглогодичная эксплуатация",
      "Электрика и освещение",
      "Перегородки и санузел по запросу",
    ],
  },
  {
    id: "prozhivanie",
    icon: "home",
    label: "Для\nпроживания",
    kicker: "Для проживания",
    title: "Решения\nдля проживания",
    description:
      "Жилые модули и бытовки для вахты, бригад и временного размещения людей на объекте.",
    bullets: [
      "Тёплые стены и пол",
      "Окна и двери в комплекте",
      "Готово к подключению коммуникаций",
    ],
  },
  {
    id: "dacha",
    icon: "tree",
    label: "Для дачи\nи участка",
    kicker: "Для дачи и участка",
    title: "Конструкции\nдля дачи и участка",
    description:
      "Хозблоки, бытовки и компактные модули для дачи, сада и личного участка.",
    bullets: [
      "Простой выбор и понятный процесс",
      "Компактные размеры",
      "Доставка и установка под ключ",
    ],
  },
  {
    id: "sanitarnye",
    icon: "wc",
    label: "Для санитарных\nнужд",
    kicker: "Для санитарных нужд",
    title: "Санитарные\nмодули",
    description:
      "Душевые, туалетные и санитарные блоки для объектов, производств и общественных пространств.",
    bullets: [
      "Готовая сантехника",
      "Гигиеничные материалы",
      "Подключение к воде и канализации",
    ],
  },
  {
    id: "angary",
    icon: "warehouse",
    label: "Ангары и складские\nпомещения",
    kicker: "Ангары и склады",
    title: "Ангары и складские\nпомещения",
    description:
      "Металлические ангары, склады и хозяйственные помещения нужной площади и высоты.",
    bullets: [
      "Большие пролёты",
      "Прочный металлокаркас",
      "Индивидуальные габариты",
    ],
  },
  {
    id: "individualnye",
    icon: "sparkle",
    label: "Индивидуальные\nзадачи",
    kicker: "Индивидуальные задачи",
    title: "Индивидуальный\nпроект под задачу",
    description:
      "Если типового решения нет — спроектируем и изготовим конструкцию под ваши требования.",
    bullets: [
      "Нестандартные размеры",
      "Любая комплектация",
      "Проект под условия эксплуатации",
    ],
  },
] as const;

// Товары-примеры по направлениям (для блока «Решения по задачам»)
export type SolutionProduct = { name: string; image: string };

const img = (n: string) => `/renders/products/${n}.webp`;

export const SOLUTION_PRODUCTS: Record<string, SolutionProduct[]> = {
  stroitelstvo: [
    { name: "Строительная бытовка", image: img("bytovka-stroit") },
    { name: "Блок-контейнер", image: img("blok-konteyner") },
    { name: "Блок-контейнер из сэндвич-панелей", image: img("sendvich") },
    { name: "Пост охраны", image: img("post-ohrany") },
  ],
  ofis: [
    { name: "Офисный блок-контейнер", image: img("ofis") },
    { name: "Административно-бытовой комплекс (АБК)", image: img("abk") },
    { name: "Модульное здание", image: img("modulnoe-zdanie") },
    { name: "Пост охраны", image: img("post-ohrany") },
  ],
  prozhivanie: [
    { name: "Модульное общежитие", image: img("obshchezhitie") },
    { name: "Административно-бытовой комплекс", image: img("abk") },
    { name: "Утеплённая бытовка", image: img("bytovka-zima") },
  ],
  dacha: [
    { name: "Хозблок", image: img("hozblok") },
    { name: "Строительная бытовка", image: img("bytovka-stroit") },
    { name: "Блок-контейнер из сэндвич-панелей", image: img("sendvich") },
  ],
  sanitarnye: [
    { name: "Санитарный блок-контейнер", image: img("san") },
    { name: "ФАП / медпункт", image: img("fap") },
    { name: "Административно-бытовой корпус", image: img("abk") },
  ],
  angary: [
    { name: "Ангар на металлокаркасе", image: img("angar") },
    { name: "Блок-контейнер под склад", image: img("sklad") },
    { name: "Металлический навес", image: img("naves") },
    { name: "Блок-контейнер под оборудование", image: img("oborudovanie") },
  ],
  individualnye: [
    { name: "Модульное здание", image: img("modulnoe-zdanie") },
    { name: "Административно-бытовой комплекс", image: img("abk") },
    { name: "ФАП / медпункт", image: img("fap") },
    { name: "Блок-контейнер под оборудование", image: img("oborudovanie") },
  ],
};

// Этапы «Как мы работаем»
export const PROCESS = [
  {
    n: "1",
    title: "Вы рассказываете\nзадачу",
    text: "Мы уточняем детали и подбираем решение",
  },
  {
    n: "2",
    title: "Проектируем\nрешение",
    text: "Разрабатываем проект и согласовываем",
  },
  {
    n: "3",
    title: "Производим\nконструкцию",
    text: "Изготавливаем на собственном производстве",
  },
  {
    n: "4",
    title: "Доставляем\nна объект",
    text: "Оперативно доставляем в удобное время",
  },
  {
    n: "5",
    title: "Монтируем\nи сдаём",
    text: "Профессиональный монтаж и готовый результат",
  },
];

// Цифры доверия
export const STATS = [
  { value: "500+", label: "реализованных\nобъектов", icon: "cube" },
  { value: "2024", label: "год основания\nкомпании", icon: "calendar" },
  { value: "1993", label: "опыт команды\nв индустрии", icon: "user" },
  { value: "100%", label: "индивидуальный\nподход", icon: "target" },
];
