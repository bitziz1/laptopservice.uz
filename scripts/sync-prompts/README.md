# Sync Prompts → Frontend

Проверяет связность `prompts/` vault и `public/videos/services/` — какие промпты есть, какие raw-видео отсутствуют, какие публичные артефакты собраны.

**Файлы:** `sync_prompts_to_frontend.py`

```bash
python3 scripts/sync-prompts/sync_prompts_to_frontend.py
# вывод: для каждого slug → prompt ✓/—, raw-image/video ✓/—, public mp4/webm/poster ✓/—
# если raw-video есть, но public mp4 нет:
./scripts/service-animation/process_service.sh <slug> prompts/Attachments/<slug>/raw-video.mp4
```

---

См. также `docs/service-animation/guide-final-v2.md` и главный `scripts/README.md`.
