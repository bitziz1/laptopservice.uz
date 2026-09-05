import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://laptopservice.uz",
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) => !page.includes("/404") && !page.includes("/yandex"),
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        const url = item.url; // e.g. https://laptopservice.uz/services/.../
        const isDaily =
          url === "https://laptopservice.uz/" ||
          url === "https://laptopservice.uz/services/" ||
          url.startsWith("https://laptopservice.uz/services/") ||
          url.startsWith("https://laptopservice.uz/cases/") ||
          url.startsWith("https://laptopservice.uz/builds/") ||
          url.startsWith("https://laptopservice.uz/contacts");
        item.changefreq = isDaily ? "daily" : "weekly";
        // keep priority 0.7 for all, or bump daily pages
        item.priority = isDaily ? 0.8 : 0.5;
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
  vite: {
    build: {
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
    },
  },
});