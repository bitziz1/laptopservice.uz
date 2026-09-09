# Generate Prompts — Obsidian vault for 10 services

Генерирует copy-ready промпты для 10 услуг в `prompts/` vault (Obsidian). Читает `docs/service-animation/guide-final-v2.md` §4 (SUBJECT + MOTION A/B) и создаёт `prompts/services/<slug>/<slug>.md` с тёмным/светлым бакетом, видео A/B, инструкцией.

**Файлы:** `generate_animation_prompts.py`

### Генерация / обновление vault
```bash
python3 scripts/generate-prompts/generate_animation_prompts.py --out prompts --guide docs/service-animation/guide-final-v2.md
# или из корня:
python scripts/generate-prompts/generate_animation_prompts.py
```

### Структура vault (открыть `prompts/` как vault в Obsidian)

```
prompts/
 ├─ services/<slug>/<slug>.md  # 10 файлов: image (dark/light) + video A/B + checklist
 ├─ services/_index.md         # dashboard
 └─ Attachments/<slug>/        # перетащите сюда raw-image.png / raw-video.mp4
```

### Связь с пайплайном
После генерации картинки/видео → перетащите в `Attachments/<slug>/` → запустите `../service-animation/process_service.sh`
Проверка: `python scripts/sync-prompts/sync_prompts_to_frontend.py`


---

См. также `docs/service-animation/guide-final-v2.md` и главный `scripts/README.md`.
