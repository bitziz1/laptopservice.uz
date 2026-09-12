# Service Images — прозрачные фото услуг (isnet + colorkey fallback)

Фото услуг: `content/services/<slug>/image.png` → `public/images/services/<slug>.webp` (прозрачный, фон `#171A20` накладывается CSS).

**Файлы:** `matte_image.py` (isnet), `matte_colorkey.py` (цветовой ключ), `process_image.sh` (оркестрация + QA), `ingest_images.sh` (batch)

### Установка (один раз)
```bash
pip install "rembg[cpu]" onnxruntime Pillow scipy numpy
brew install webp ffmpeg  # cwebp + ffmpeg
chmod +x process_image.sh ingest_images.sh
```

### Использование

```bash
# один файл — авто-выбор метода (isnet → QA → fallback colorkey если корпус прозрачный)
./scripts/service-images/process_image.sh zamena-razema-pitaniya content/services/zamena-razema-pitaniya/image.png

# принудительно colorkey (когда isnet провалился и нужно без скачивания)
./scripts/service-images/process_image.sh zamena-razema-pitaniya content/services/zamena-razema-pitaniya/image.png --method colorkey
# или
python3 scripts/service-images/matte_colorkey.py content/services/zamena-razema-pitaniya/image.png /tmp/out.png --thresh 55 --sigma 0.7
cwebp -q 90 /tmp/out.png -o public/images/services/zamena-razema-pitaniya.webp

# batch — все услуги где src новее webp
./scripts/service-images/ingest_images.sh
# npm alias
npm run services:ingest:images
```

### Когда какой метод

- **isnet-general-use** (по умолчанию) — `rembg` AI, хорошо когда контраст объект/фон высокий. QA: `trans 45-65%`, `opaque >35%`, `semi <15%`. Работает для `zamera-akkumulyatora` (72% trans), `zamena-matritsy-ekrana` (61%), `remont-shleyfa` (55%).
- **colorkey fallback** — без скачивания, только `Pillow+scipy+numpy`. Применяется когда isnet делает корпус прозрачным (кейс `zamena-razema-pitaniya` 2026-09: isnet дал `80.2% trans / 12.2% semi / 7.6% opaque` — боковина ноутбука стала дырой на `#171A20`). Критерий авто-fallback в `process_image.sh:60`: `trans>75 || opaque<15` → переключается на `matte_colorkey.py --thresh 55 --sigma 0.7`.

**Алгоритм colorkey:**
1. Оценка bg — самый светлый угол 10×10 из 4 углов (фильтрует тёмный экран ноутбука в углу).
2. `dist = sqrt((RGB-bg)^2)`, `hard = dist < 55`.
3. `exterior = hard` компоненты связанные с границей (`scipy.label`), только экстерьер → `alpha 0`, interior → `255`.
4. Гаусс `sigma 0.7` для антиалиаса 1px.

Без скачивания моделей (`birefnet` 973MB не требуется — пользователь запретил загрузку).

### Диагностика

```bash
# проверить QA вручную
python3 -c "from PIL import Image; im=Image.open('/tmp/test.png'); a=im.split()[-1]; h=a.histogram(); t=sum(h); print(f\"{sum(h[0:5])/t*100:.1f}% trans {sum(h[5:250])/t*100:.1f}% semi\")"
# превью на фоне сайта
python3 -c "from PIL import Image; import numpy as np; a=np.array(Image.open('/tmp/out.png').convert('RGBA')); al=a[:,:,3,None]/255; bg=np.array([23,26,32]); comp=(a[:,:,:3]*al+bg*(1-al)).astype(np.uint8); Image.fromarray(comp).save('/tmp/preview.png')"
```

### Интеграция

- `ingest_images.sh` перебирает `content/services/*/*.md`, берёт первый `image.{png,jpg,jpeg}` в папке, вызывает `process_image.sh`.
- Выход только `public/images/services/<slug>.webp` (png в `/tmp` удаляется, webp `q90`).
- Сайт: `src/pages/services/[slug].astro` + `ServiceCard` — `bg #171A20` на всю ширину, изображение поверх.

См. также `docs/service-animation/guide-final-v2.md` (аналогичный QA для видео) и `docs/content-guide.md`.
