# 3D-рендеры для сайта ООО «Маяк» — промпты для генерации

Единый стиль: фотореалистичный 3D-рендер модульной/металлической конструкции,
вид 3/4, мягкий дневной свет, нейтральный фон с тонкой инженерной сеткой (blueprint),
сдержанная палитра (графит, белый, тёплый беж), без людей, без ярко-синего.
Соотношение преимущественно 4:3, высокое качество, чистые материалы.

## Главная — hero (заменяет ModuleRender variant="dark")
`hero-module-dark`
Modern dark glass modular building, charcoal steel frame, large tinted glass
panels, 3/4 perspective, standing on a light blueprint engineering grid floor,
soft studio daylight, photorealistic architectural render, neutral warm-grey
background, no people, 16:10.

## Главная / каталог — белый блок-контейнер (заменяет ModuleRender variant="light")
`module-white-container`
White corrugated steel modular cabin (block-container), light grey roof, two
windows and a door, 3/4 view on a subtle blueprint grid, clean daylight,
photorealistic, neutral background, 4:3.

## Каталог — типы решений
- `catalog-bytovka` — Construction site cabin (бытовка), white metal siding, single door, one window, on grid, 4:3.
- `catalog-bytovka-insulated` — Insulated winter cabin, white panels, sealed double-glazed window, snow-ready, 4:3.
- `catalog-office-container` — Modular office container, panoramic windows, light interior glow, 4:3.
- `catalog-sanitary` — Sanitary module cabin, compact, ventilation grilles, clean white, 4:3.
- `catalog-hozblok` — Small utility shed (хозблок), wood-grey panels, double doors, 4:3.
- `catalog-double-module` — Two-storey modular building assembled from containers, external stairs, 4:3.
- `catalog-angar` — Metal frame warehouse/hangar, arched steel roof, large sliding gate, 4:3.

## Большой CTA / производство (опционально)
- `cta-wireframe` — Wireframe blueprint of a modular building, burgundy line drawing on dark background.

> Параметры: размер ≥1280px по большей стороне, формат PNG/WebP.
> После генерации сложить в `public/renders/`, оптимизировать в WebP/AVIF,
> подключить через next/image вместо `<ModuleRender/>`.
