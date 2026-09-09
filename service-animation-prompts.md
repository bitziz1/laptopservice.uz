# Service Animation Prompts — legacy (deprecated 2026-09-09)

> **Актуальный гайд:** [`docs/service-animation/guide-final-v2.md`](docs/service-animation/guide-final-v2.md) (v2, после тестов 08.09.2026)
> Старый подход с `mid-grey #808080` и `colorkey` — не использовать. См. раздел 6 _archive в финальном гайде.

Этот файл оставлен для истории (`git log`). Все команды, промпты и пайплайн — только в `docs/service-animation/guide-final-v2.md` и в `scripts/`:
- `scripts/matte.py` — батч `isnet-general-use`
- `scripts/check_alpha_quality.py` — QA гейт по альфе (threshold 6%)
- `scripts/process_service.sh` — полный пайплайн `frames_in → frames_out → alpha.mov → mp4/webm → poster`
- `src/components/ServiceAnimation.astro` — компонент карточки (IntersectionObserver, prefers-reduced-motion)

Быстрый старт (новый):
```bash
pip install "rembg[cpu]" onnxruntime
chmod +x scripts/process_service.sh
./scripts/process_service.sh remont-videokarty-kompyutera /path/to/generated-video.mp4
# выход: public/videos/services/<slug>.{mp4,webm,poster.jpg,poster.webp}
```

См. также `scripts/README.md` для контент-инструмента и `CONTENT_GUIDE.md §5` для проверки качества.
