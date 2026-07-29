import type { MetadataRoute } from "next";
import { getRobots } from "@/lib/content";
import { buildRobotsRule } from "@/lib/robots-rules";
import { SITE_URL } from "@/lib/site";

/**
 * `/robots.txt` собирается из настроек панели (Настройки → Индексация).
 *
 * Что важно не потерять при правках:
 *
 * 1. САМИ ПРАВИЛА живут в `src/lib/robots-rules.ts` — там же, где их читает
 *    предпросмотр в панели. Разъехавшись, они превратили бы предпросмотр в
 *    ложь: человек видел бы одно, поисковик получал другое.
 * 2. ФОЛБЭК РАЗРЕШАЮЩИЙ. Недоступный API настроек означает robots.txt в том
 *    же виде, в каком он был до появления настройки, — см. `getRobots`.
 * 3. `Sitemap` ОСТАЁТСЯ и при выключенной индексации. Директива не зависит от
 *    правил обхода, а карта сайта отдаётся всегда: закрытая индексация — это
 *    обычно временное состояние (переезд, доработка), и терять ссылку на
 *    карту из-за него незачем.
 * 4. Маршрут кэшируется тегом `settings` (внутри `getRobots`), поэтому
 *    сохранение в панели меняет файл сразу, а не через пять минут.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getRobots();

  return {
    rules: buildRobotsRule(settings),
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
