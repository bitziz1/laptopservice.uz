import type { APIRoute } from "astro";

const robotsTxt = `User-agent: *
Allow: /

# Explicit AI and LLM Crawler Permissions
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Yandex
Allow: /

Sitemap: https://laptopservice.uz/sitemap-index.xml
`;

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};