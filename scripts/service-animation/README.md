# Service Animation — isnet matting + bake to #171A20

AI-матирование видео по форме (isnet-general-use), QA гейт по альфе, сборка ProRes4444 alpha.mov, запекание на цвет карточки #171A20 (mp4/webm + poster). Используется вместе с `prompts/` vault.

**Файлы:** `matte.py`, `check_alpha_quality.py`, `process_service.sh`

### Установка (один раз)
```bash
pip install "rembg[cpu]" onnxruntime Pillow tqdm
# ffmpeg + cwebp (poster webp) — `brew install ffmpeg webp` / `apt install ffmpeg webp`
chmod +x process_service.sh
```

### Использование
```bash
# Полный пайплайн на одно сырое видео 640×640 (4 сек, 24fps, ровный фон #171A20 или #D1D5DB)
./process_service.sh <slug> /path/to/raw-video.mp4
# пример:
./process_service.sh remont-videokarty-kompyutera prompts/Attachments/remont-videokarty-kompyutera/raw-video.mp4
# выход: public/videos/services/<slug>.{mp4,webm,poster.jpg,poster.webp} + /tmp/svc-anim/<slug>/alpha.mov

# Отдельные шаги
python3 matte.py /tmp/svc-anim/<slug>/frames_in /tmp/svc-anim/<slug>/frames_out
python3 check_alpha_quality.py /tmp/svc-anim/<slug>/frames_out --threshold 6
```

**QA гейт:** шаг 2.5 в `process_service.sh` — если `semi > 6%` (низкий контраст объект/фон), пайплайн стоп и просит перегенерировать на противоположном бакете (тёмный ↔ светлый). См. `docs/service-animation/guide-final-v2.md §3`.

**Важно:** фон — не фиксированный `#808080`. Выбор бакета по правилу из гайда §3 (светлый объект → тёмный фон `#171A20`, тёмный объект → светлый `#D1D5DB`).

См. `docs/service-animation/guide-final-v2.md` §1-5.

---

См. также `docs/service-animation/guide-final-v2.md` и главный `scripts/README.md`.
