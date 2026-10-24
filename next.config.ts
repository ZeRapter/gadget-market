import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Мы убрали экспериментальные cacheComponents и partialPrefetching
  // Оставили только Turbopack для быстрой сборки (если он не глючит)
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;