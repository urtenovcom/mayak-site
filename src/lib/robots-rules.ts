// Правила robots.txt: единственное место, где решается, что окажется в файле.
//
// Модуль нарочно без зависимостей — его импортируют сразу трое:
//
//   • src/app/robots.ts            — отдаёт настоящий /robots.txt;
//   • серверный экшен панели       — проверяет введённые пути;
//   • форма настроек ("use client")— рисует ПРЕДПРОСМОТР файла.
//
// Предпросмотр и настоящая выдача обязаны совпадать до символа, иначе он
// вреднее, чем его отсутствие: человек поверит картинке, а поисковик увидит
// другое. Поэтому текст собирает одна функция `renderRobotsTxt`, а формат
// строк повторяет сериализатор Next
// (node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js:
// User-Agent → Allow → Disallow → пустая строка → Host → Sitemap).

/**
 * СЛУЖЕБНЫЕ запреты — зашиты в коде и из панели не редактируются.
 *
 * Это не жадность к правам: `/admin` и `/api/` не должны зависеть от
 * содержимого базы. Если однажды настройки не прочитаются (недоступный API,
 * пустая таблица, откат миграции), панель и служебные эндпоинты обязаны
 * остаться закрытыми от обхода — а они останутся, потому что этот список
 * живёт рядом с кодом, который его печатает.
 */
export const SERVICE_DISALLOW = ["/api/", "/admin"] as const;

/** Потолок числа дополнительных путей. Столько же принимает API. */
export const MAX_DISALLOW_PATHS = 50;

/** Предел длины одного пути. Столько же принимает API. */
export const MAX_DISALLOW_LENGTH = 200;

/** Настройки индексации из панели. */
export type RobotsSettings = {
  /** Главный выключатель. `false` — сайт закрыт от поисковиков целиком. */
  indexing: boolean;
  /** Дополнительные запрещённые пути владельца. */
  disallow: string[];
};

/**
 * Состояние по умолчанию — РАЗРЕШАЮЩЕЕ.
 *
 * Именно оно уходит в фолбэк, когда настройки не прочитались. Сбой сети не
 * должен закрывать сайт от поисковиков: восстановление позиций после
 * случайного `Disallow: /` занимает недели, а лишний день обхода при
 * недоступном API не стоит ничего.
 */
export const DEFAULT_ROBOTS: RobotsSettings = { indexing: true, disallow: [] };

/**
 * Путь для `Disallow`: от одного «/», без пробелов, не длиннее предела.
 *
 * Пробел значим: в robots.txt строка обрывается по нему, поэтому
 * «/старая страница» превратилась бы в запрет «/старая» — то есть запретила
 * бы лишнее и молча.
 */
export function isValidDisallowPath(value: string): boolean {
  const path = value.trim();
  return (
    path.startsWith("/") &&
    path.length <= MAX_DISALLOW_LENGTH &&
    !/\s/.test(path)
  );
}

/**
 * Произвольные данные из API → список путей.
 *
 * Терпим к мусору по тем же соображениям, что и разбор получателей Telegram:
 * в колонке может лежать что угодно (правка напрямую в базе, данные от версии
 * до выкатки полей), и это не должно ронять ни панель, ни выдачу robots.txt.
 * Битая запись пропускается, порядок сохраняется, дубликаты схлопываются.
 */
export function toDisallowPaths(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const paths: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") continue;

    const path = item.trim();
    if (!isValidDisallowPath(path) || seen.has(path)) continue;

    seen.add(path);
    paths.push(path);

    if (paths.length >= MAX_DISALLOW_PATHS) break;
  }

  return paths;
}

/**
 * Итоговое правило для одного `User-agent`.
 *
 * При выключенной индексации это `Disallow: /` и ничего больше: общий запрет
 * покрывает и служебные пути, и пользовательские, а перечислять их рядом
 * значило бы предлагать поисковику список интересных адресов.
 */
export function buildRobotsRule(settings: RobotsSettings) {
  if (!settings.indexing) {
    return { userAgent: "*", disallow: "/" as string | string[] };
  }

  return {
    userAgent: "*",
    allow: "/",
    disallow: [...SERVICE_DISALLOW, ...settings.disallow] as string | string[],
  };
}

/**
 * Тот самый текст, который отдаёт `/robots.txt`.
 *
 * Используется предпросмотром в панели; сам роут строит файл через
 * `MetadataRoute.Robots`, а Next печатает его этим же форматом. Совпадение
 * проверяется руками при правках: расхождение делает предпросмотр ложью.
 */
export function renderRobotsTxt(settings: RobotsSettings, siteUrl: string): string {
  const rule = buildRobotsRule(settings);
  const lines = [`User-Agent: ${rule.userAgent}`];

  if ("allow" in rule && rule.allow) lines.push(`Allow: ${rule.allow}`);

  const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
  for (const path of disallow) lines.push(`Disallow: ${path}`);

  // Пустая строка после блока правил, затем Host и Sitemap — так же, как их
  // печатает Next.
  lines.push("", `Host: ${siteUrl}`, `Sitemap: ${siteUrl}/sitemap.xml`);

  return `${lines.join("\n")}\n`;
}
