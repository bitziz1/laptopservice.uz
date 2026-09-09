# Copy Content Images — Astro build helper

Копирует оригиналы `content/**/*.jpg|png|webp|mp4|webm` → `dist/content/` и видео в `public/content` для `astro dev`. Оптимизирует постеры (jpg75 + webp/avif). Вызывается автоматически в `npm run build`.

**Файлы:** `copy-content-images.mjs`

```bash
node scripts/content-images/copy-content-images.mjs
# автоматически: npm run build / npm run build:prod
```

---

См. также `docs/service-animation/guide-final-v2.md` и главный `scripts/README.md`.
