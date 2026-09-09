# Scripts — laptopservice.uz

Все скрипты — по папкам. Каждая папка — self-contained: `README.md` + `requirements.txt` + скрипт(ы).

| Папка | Назначение | Вход → Выход |
|-------|------------|--------------|
| [`service-animation/`](service-animation/README.md) | AI-матирование + bake на `#171A20` | `raw-video.mp4` → `public/videos/services/<slug>.{mp4,webm,poster}` |
| [`generate-prompts/`](generate-prompts/README.md) | Генерация Obsidian vault с промптами 10 услуг | `docs/service-animation/guide-final-v2.md` → `prompts/services/<slug>/<slug>.md` |
| [`sync-prompts/`](sync-prompts/README.md) | Проверка связности vault → public | `prompts/` vs `public/videos/services` |
| [`convert-sticker/`](convert-sticker/README.md) | Telegram Video Sticker/Emoji 512 & 100 | `mp4` → `public/stickers/*.webm` + `public/emoji/*.webm` |
| [`content-threads/`](content-threads/README.md) | Импорт ленты Threads | `threads.com/share/XXX` → `content/threadsYYYY_MM/<slug>/` |
| [`content-reviews/`](content-reviews/README.md) | Импорт отзывов Yandex Maps | Yandex reviews → `content/reviewsYYYY_MM/<slug>/` |
| [`content-images/`](content-images/README.md) | Копирование оригиналов для Astro build | `content/**` → `dist/content` + `public/content` |
| [`indexnow/`](indexnow/README.md) | IndexNow пинг | URL → Bing/Yandex |
| [`_archive/`](_archive/README.md) | Депрекейтед | — |

### Быстрый старт

```bash
# анимации (главный пайплайн)
python scripts/generate-prompts/generate_animation_prompts.py --out prompts
# → откройте prompts/ как vault в Obsidian, скопируйте промпты, сгенерите видео
./scripts/service-animation/process_service.sh <slug> prompts/Attachments/<slug>/raw-video.mp4

# контент
npm run threads:import -- https://www.threads.com/share/XXX/ --date 2026-09-04
npm run reviews:import

# build
npm run build        # + scripts/content-images/copy-content-images.mjs (автоматом)
python scripts/sync-prompts/sync_prompts_to_frontend.py  # проверить анимации
```

### Требования по папкам

См. `requirements.txt` в каждой папке. Общее:

```bash
pip install "rembg[cpu]" onnxruntime Pillow tqdm  # service-animation
# остальное — stdlib (urllib), node + sharp уже в проекте
brew install ffmpeg webp  # для видео и poster webp
```

### Связанные доки

- `docs/service-animation/guide-final-v2.md` — финальный гайд v2 (бакет логика, 10 MOTION A/B)
- `content/CONTENT_GUIDE.md` — правила `content/**/*.md` (TinaCMS, filename = slug + `-DDmmmYYYY`)
- `docs/README.md` — индекс доков
- `prompts/README.md` — vault readme
