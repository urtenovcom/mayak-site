// Счётчики посещаемости: Яндекс.Метрика и Google Analytics 4.
//
// Номера задаются в админке (Настройки → Настройка метрик) и приходят сюда
// пропсами. Четыре правила, из-за которых компонент выглядит именно так:
//
// 1. НЕОБЯЗАТЕЛЬНЫ ПООТДЕЛЬНОСТИ. Пустое значение — счётчик не подключается
//    вовсе: ни тега, ни запроса к чужому домену. Если API настроек недоступен,
//    `getAnalytics()` возвращает пустые значения (фолбэк), и страница просто
//    рисуется без счётчиков — падать из-за аналитики она не должна.
//
// 2. ТОЛЬКО ПУБЛИЧНЫЕ СТРАНИЦЫ. Компонент подключён в layout группы
//    (frontend). У админки свой корневой layout (src/app/(admin)/layout.tsx),
//    поэтому в /admin счётчики не попадают: раздел под noindex, а визиты
//    редактора завышали бы статистику.
//
// 3. СТРАТЕГИЯ ЗАГРУЗКИ — afterInteractive. Это значение по умолчанию у
//    next/script и рекомендованное документацией именно для аналитики и тег-
//    менеджеров: скрипт вставляется на клиенте после начала гидратации, то
//    есть не задерживает ни разметку, ни интерактивность.
//    См. node_modules/next/dist/docs/01-app/03-api-reference/02-components/
//    script.md (раздел «afterInteractive») и 01-app/02-guides/scripts.md.
//    beforeInteractive здесь был бы вреден — он тянет чужой скрипт вперёд
//    собственного кода страницы.
//
// 4. ЗНАЧЕНИЕ ПРОВЕРЯЕТСЯ ПЕРЕД ПОДСТАНОВКОЙ. Номер уезжает во ВСТРОЕННЫЙ
//    скрипт, то есть это не текст, а исполняемый код. Панель формат проверяет,
//    но в базу можно записать что угодно и напрямую, поэтому здесь стоит
//    вторая проверка: не подошло под шаблон — счётчик не подключается.

import Script from "next/script";

/** Номер счётчика Метрики — только цифры. */
const METRIKA_ID = /^\d{1,12}$/;

/** Идентификатор потока GA4: «G-» и латиница с цифрами (как проверяет API). */
const GA4_ID = /^G-[A-Z0-9]{4,18}$/;

export type SiteAnalyticsProps = {
  yandexMetrikaId?: string | null;
  googleAnalyticsId?: string | null;
};

export function SiteAnalytics({ yandexMetrikaId, googleAnalyticsId }: SiteAnalyticsProps) {
  const metrika = yandexMetrikaId?.trim() ?? "";
  const ga = googleAnalyticsId?.trim().toUpperCase() ?? "";

  const hasMetrika = METRIKA_ID.test(metrika);
  const hasGa = GA4_ID.test(ga);

  if (!hasMetrika && !hasGa) return null;

  return (
    <>
      {hasMetrika && (
        <>
          <Script id="yandex-metrika" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${metrika}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });`}
          </Script>
          {/* Пиксель для посетителей без JS — часть штатного кода Метрики. */}
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${metrika}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}

      {hasGa && (
        <>
          <Script
            id="ga4-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga}');`}
          </Script>
        </>
      )}
    </>
  );
}
