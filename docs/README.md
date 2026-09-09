# Docs — laptopservice.uz

- [`service-animation/guide-final-v2.md`](service-animation/guide-final-v2.md) — **финальный гайд v2 (08.09.2026)** по анимациям услуг: мастер-промпты (фото/видео 640×640), выбор фона по контрасту (`#171A20` dark / `#D1D5DB` light), 10 услуг (SUBJECT + MOTION A/B), пайплайн `matte.py` + `check_alpha_quality.py` + `process_service.sh`, QA checklist.
- `service-animation-guide-final.md` (в корне) — копия того же файла для быстрого доступа.
- [`CONTENT_GUIDE.md`](../CONTENT_GUIDE.md) — правила контента TinaCMS / `content/**/*.md`
- [`PROGRESS.md`](../PROGRESS.md) — журнал реализации

## Prompts vault (Obsidian)

- `prompts/` — откройте как vault в Obsidian для генерации анимаций.
- `prompts/services/<slug>/<slug>.md` — copy-ready промпты (тёмный/светлый бакет, MOTION A/B) сгенерированы из `docs/service-animation/guide-final-v2.md`.
- Генератор: `python scripts/generate_animation_prompts.py --out prompts`
- После генерации картинки/видео перетащите в `prompts/Attachments/<slug>/raw-*.mp4` прямо в Obsidian → запустите `./scripts/process_service.sh <slug> prompts/Attachments/<slug>/raw-video.mp4` → артефакты в `public/videos/services/`.
- Проверка: `python scripts/sync_prompts_to_frontend.py`
