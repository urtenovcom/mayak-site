"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

/* ============================================================
   Блок «Карта производства» на всю ширину (перед футером).
   Яндекс.Карты (JS API 2.1) в тёмном бренд-стиле (CSS-инверсия
   тайлов). Поверх — «радар»: круг 300 км, концентрические
   кольца и вращающаяся развёртка от точки производства.
   Карта статичная. Ключ — NEXT_PUBLIC_YANDEX_MAPS_KEY.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { typo } from "@/lib/typo";

// Точка производства (деревня Рыбаки, Раменский г.о., МО)
const POINT: [number, number] = [55.6, 38.1];
const RADIUS_KM = 300;
const KEY =
  process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY ||
  "498c8430-33dc-4a80-9e73-0e3aba218664";

function MapInfo() {
  return (
    <div className="max-w-md rounded-2xl bg-carbon/80 p-5 backdrop-blur-md sm:p-6">
      <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#d29aa8]">
        География работы
      </span>
      <h2 className="mt-2 text-[22px] font-extrabold tracking-[-0.02em] text-white sm:text-[28px]">
        Собственное производство
      </h2>
      <p className="mt-2 text-pretty text-[14px] leading-relaxed text-white/60">
        {typo(
          "Производственная площадка находится в Раменском городском округе, деревня Рыбаки.",
        )}
      </p>
      <p className="mt-2 text-pretty text-[14px] leading-relaxed text-white/60">
        {typo(
          "Основная зона доставки и монтажа — до 300 км от производства. Более дальние направления обсуждаются индивидуально.",
        )}
      </p>
    </div>
  );
}

function loadYmaps(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.ymaps && w.ymaps.ready) {
      w.ymaps.ready(() => resolve(w.ymaps));
      return;
    }
    const done = () => w.ymaps.ready(() => resolve(w.ymaps));
    const existing = document.getElementById(
      "ymaps-script",
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", done);
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.id = "ymaps-script";
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${KEY}&lang=ru_RU`;
    s.async = true;
    s.onload = done;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export function ProductionMap() {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [sweep, setSweep] = useState(0); // диаметр развёртки в px

  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | null = null;

    loadYmaps()
      .then((ymaps) => {
        if (disposed || !boxRef.current || mapRef.current) return;

        const map = new ymaps.Map(
          boxRef.current,
          { center: POINT, zoom: 6, controls: [] },
          { suppressMapOpenBlock: true, yandexMapDisablePoiInteractivity: true },
        );
        mapRef.current = map;

        // статичная карта — без перетаскивания и зума
        map.behaviors.disable([
          "drag",
          "scrollZoom",
          "dblClickZoom",
          "multiTouch",
          "rightMouseButtonMagnifier",
          "leftMouseButtonMagnifier",
        ]);

        // невидимый круг 300 км — только для расчёта границ и размера радара
        const sizer = new ymaps.Circle(
          [POINT, RADIUS_KM * 1000],
          {},
          { fillOpacity: 0, strokeOpacity: 0 },
        );
        map.geoObjects.add(sizer);

        const recalc = () => {
          if (disposed) return;
          map.container.fitToViewport();
          map
            .setBounds(sizer.geometry.getBounds(), {
              checkZoomRange: true,
              zoomMargin: 60,
            })
            .then(() => {
              if (disposed) return;
              const z = map.getZoom();
              const proj = map.options.get("projection");
              const b = sizer.geometry.getBounds(); // [[minLat,minLon],[maxLat,maxLon]]
              const cG = proj.toGlobalPixels(POINT, z);
              const eG = proj.toGlobalPixels([POINT[0], b[1][1]], z);
              setSweep(Math.abs(eG[0] - cG[0]) * 2);
            });
        };
        recalc();

        ro = new ResizeObserver(recalc);
        ro.observe(boxRef.current);
      })
      .catch(() => {
        /* нет ключа/сети — карта не критична, тихий фолбэк */
      });

    return () => {
      disposed = true;
      ro?.disconnect();
      try {
        mapRef.current?.destroy();
      } catch {
        /* noop */
      }
      mapRef.current = null;
    };
  }, []);

  return (
    <section className="isolate w-full overflow-hidden bg-carbon">
      <div className="px-5 py-6 sm:px-8 md:hidden">
        <MapInfo />
      </div>

      <div className="relative overflow-hidden">
      {/* Тайлы Яндекса — инвертируем в тёмную тему */}
      <div ref={boxRef} className="mayak-map-dark h-[360px] w-full sm:h-[440px] md:h-[560px]" />

      {/* Радар поверх карты */}
      {sweep > 0 && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-[400] -translate-x-1/2 -translate-y-1/2"
          style={{ width: sweep, height: sweep }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="49"
              fill="rgba(122,47,67,0.16)"
              stroke="#d29aa8"
              strokeOpacity="0.7"
              strokeWidth="0.5"
            />
            <circle
              cx="50"
              cy="50"
              r="33"
              fill="none"
              stroke="#d29aa8"
              strokeOpacity="0.28"
              strokeWidth="0.4"
              strokeDasharray="1.5 2.5"
            />
            <circle
              cx="50"
              cy="50"
              r="16.5"
              fill="none"
              stroke="#d29aa8"
              strokeOpacity="0.28"
              strokeWidth="0.4"
              strokeDasharray="1.5 2.5"
            />
          </svg>
          <div className="mayak-radar-sweep absolute inset-0 h-full w-full rounded-full" />
          <span className="mayak-map-dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* виньетка + инфо-плашка */}
      <div className="pointer-events-none absolute inset-0 z-[450] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,8,9,0.55)_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] hidden p-10 md:block">
        <div className="pointer-events-auto inline-block">
          <MapInfo />
        </div>
      </div>
      </div>
    </section>
  );
}
