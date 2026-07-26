import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
