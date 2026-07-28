import type { NextConfig } from "next";

/**
 * Разрешённые origin'ы для серверных экшенов (формы админки).
 *
 * Без явного списка Next доверяет заголовку `X-Forwarded-Host`, то есть
 * проверку происхождения можно обмануть подделанным заголовком.
 * ВАЖНО: обратный прокси на проде обязан затирать входящие `X-Forwarded-Host`
 * и `X-Forwarded-Proto` своими значениями.
 */
const SERVER_ACTION_ORIGINS =
  process.env.NODE_ENV === "production"
    ? ["mayak-modul.ru", "www.mayak-modul.ru"]
    : [
        // Только для локальной разработки: 3000 — next dev по умолчанию,
        // 3199 — конфигурация проекта. На проде эти origin'ы доверенными быть
        // не должны: любая страница, открытая у администратора на localhost,
        // иначе смогла бы выполнять серверные экшены с его cookie.
        "localhost:3000",
        "localhost:3199",
        "127.0.0.1:3000",
        "127.0.0.1:3199",
      ];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      allowedOrigins: SERVER_ACTION_ORIGINS,
    },
  },
  // Документы (PDF) должны открываться в браузере, а не скачиваться.
  async headers() {
    return [
      {
        source: "/certs/:path*",
        headers: [{ key: "Content-Disposition", value: "inline" }],
      },
    ];
  },
};

export default nextConfig;
