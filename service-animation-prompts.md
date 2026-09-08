# Промпты для генерации service-анимаций

## Актуальный подход (после 2026-09-08)

**Вырезаем по форме (AI-матирование), а не по цвету.** Фон теперь не важен для ключа, поэтому требование `flat solid #00FF00 chroma-key` убрано — модель его игнорировала и делала виньетку (тёмно-синий → зелёный), а наш акцент `#19BD9B` (teal) близок к зелёному хромакею и съедался вместе с фоном.

### Базовый промпт (рекомендован, для фото и видео 640×640, 3–4 сек loop, 24fps)

```
plain uncluttered mid-grey studio background (#808080), evenly lit, minimal shadow,
subject clearly separated from background, no other objects in frame,
single centered object (GPU / motherboard / cooler etc.), soft diffused studio lighting,
photorealistic, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins),
neutral reflections only, no color spill, no vignetting, no gradient, no text, no watermark
Negative: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

### Эксперимент с другим фоном (для следующего батча — отдать агенту)

**Цель:** проверить, что уход от зелёного убирает spill в отражениях. Сгенерить один и тот же объект на 3 фонах, прогнать один пайплайн `isnet`, запечь на `#171A20`, сравнить глазами дырки/отражения и кайму у teal-glow.

| Вариант | Промпт фона (заменить 1-ю строку базового) | Ожидание | Когда использовать |
|---|---|---|---|
| **A — mid-grey `#808080`** | `plain uncluttered mid-grey studio background (#808080), evenly lit, minimal shadow` | Серый spill незаметен, но для серого GPU контраст низкий → 14% semi, мягкая маска (v3). | Цветные платы (зелёный текстолит) — ок. Для серого GPU — не лучший. |
| **B — тёмный `#171A20` (рекомендован для серого металла)** | `plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow` | Фон = цвет карточки, контраст высокий (объект 130 vs фон 23), spill тёмный → невидим на `#171A20`, isnet даёт острую маску. | Серые/металлические объекты (GPU, кулер, рама) — **основной для следующего батча**. |
| **C — светлый `#D1D5DB`** | `plain light grey studio background (#D1D5DB), evenly lit, minimal shadow` | Светлый spill, проверка переэкспозиции. Контраст тоже высокий, но spill светлый заметнее на тёмной карте. | Контроль/фото на светлом сайте. |

Для видео добавить: `looping 3-second animation, 24fps, seamless loop, no camera shake`.
Для фото: `centered, 1:1 square crop, 640×640`.

**Что отправить агенту:** фраза выше + базовый промпт + негатив. Попросить не использовать слова `chroma`, `green screen`, `vignette`. Для каждого варианта сгенерить 1 видео + 1 фото одного объекта.

Почему не зелёный и почему `#808080` (и альтернативы):
- Зелёный даёт **color spill**: PBR-материал (металл/пластик GPU) отражает окружение. На v1 (градиент тёмно-синий→зелёный) в дырках/отверстиях и в отражении корпуса остался ярко-зелёный налёт, а свечение teal `#19BD9B` рядом с зелёным дало зелёную кайму. AI-матирование `isnet-general-use` режет по форме, но **сохраняет отражение** как часть объекта — поэтому зелёный spill остаётся видимым даже при идеальной маске.
- На v2 (яркий chroma `~#00FF00`) тот же `isnet` дал 4 варианта одинакового качества (baked mp4/webm/alpha) — чище, но spill принципиально не исчезает, пока фон насыщенно-зелёный. Любой `colorkey` ещё хуже: `colorkey=0x85b180:0.06:0.02` на v1 и `0x05EE0B:0.20:0.10` на v2 — разные magic-константы, на следующем ролике снова перебор, а teal `#19BD9B` (25,189,155) близок к зелёному и съедается вместе с фоном.
- Нейтральный серый далёк от `#19BD9B`, модель легко держит его ровным (не тянет в виньетку как `#00FF00`), `isnet`/`birefnet` сегментируют стабильно (~63% transparent / 34% opaque на всех кадрах), а отражение серого на металле выглядит как естественный студийный софтбокс, а не артефакт. При запекании на `#171A20` серый spill сливается с картой и не заметен; зелёный — контрастирует.

**Вывод эксперимента 08.09.2026:**
- v1 gradient isnet: края чёткие, но свечение по зелёному дало зелёную кайму + яркий зелёный в дырках/отражениях.
- v1 colorkey: очень плохо, зелёная кайма по краю.
- v1 isnet baked: оставил больше зелёного там, где его было много — ярко в дырках и отражениях.
- v2 bright chroma isnet (4 варианта): одинаково хорошо, но риск spill остаётся.
- v3 `generated-gray.mp4` mid-grey `#808080` (129,129,129): фон ровный, spill серый незаметен на `#171A20`, но **контраст низкий** — объект GPU серый ~130/200 vs фон 129 → isnet даёт 14% semi (vs 1-2% на зелёном), мат период размыт, файл 298K/356K vs 187K/191K. Причина: серый на сером — PBR-отражение серого сливается, модель менее уверена.

**Рекомендация после v3:** для серого металлического GPU идеальный фон — **не mid-grey, а тёмный charcoal в цвет карточки `#171A20` / `#2A2E38` или светлый `#D1D5DB`**, чтобы дать контраст 100+ единиц по яркости. Cерый `#808080` оставить только если объект цветной (плата с зелёными/синими элементами). Для нейтрального теста — генерить вариант B (`#171A20`) как основной для серых объектов.

### Пайплайн обработки (вместо colorkey)

```bash
# 0) Извлечь кадры и прогнать через AI-матирование (isnet-general-use, не u2net)
#    u2net на градиенте даёт фликер: в 2/6 кадрах центр объекта становился transparent
#    isnet даёт стабильно ~63% transparent / 34% opaque по всем кадрам.
pip install "rembg[cpu]" onnxruntime
# см. /tmp/matte_isnet.py — держит сессию, обрабатывает 97 кадров за ~65с на MPS

# Альтернатива через backgroundremover (только u2net, для этого ролика фликер):
# backgroundremover -i input.mp4 -tv -o /tmp/alpha.mov

# 1) Собрать альфа-видео (ProRes 4444, 640×640, 24fps)
ffmpeg -framerate 24 -i /tmp/frames_out/%04d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le /tmp/alpha.mov

# 2) Запечённый вариант для <video> на 40–50 карточках (дешево, бесшовно на #171A20)
ffmpeg -i /tmp/alpha.mov -f lavfi -i "color=color=0x171A20:s=640x640:r=24" \
  -filter_complex "[0:v]format=yuva420p[fg];[1:v][fg]overlay=shortest=1:format=yuv420,format=yuv420p[out]" \
  -map "[out]" -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p -movflags +faststart -an \
  public/videos/services/<slug>.mp4

ffmpeg -i /tmp/alpha.mov -f lavfi -i "color=color=0x171A20:s=640x640:r=24" \
  -filter_complex "[0:v]format=yuva420p[fg];[1:v][fg]overlay=shortest=1:format=yuv420,format=yuv420p[out]" \
  -map "[out]" -c:v libvpx-vp9 -b:v 0 -crf 32 -auto-alt-ref 0 -an \
  public/videos/services/<slug>.webm

# 3) Опционально: alpha-webm для canvas / HEVC+alpha .mov для Safari
ffmpeg -i /tmp/alpha.mov -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -b:v 0 -crf 32 -an \
  public/videos/services/<slug>-alpha.webm
# Safari HEVC-alpha — отдельным энкодером, если нужен (не ProRes 25M)

# 4) Постер
ffmpeg -ss 1.5 -i public/videos/services/<slug>.mp4 -frames:v 1 -q:v 2 poster.jpg
cwebp -q 85 poster.jpg -o poster.webp
```

Проверяйте глазами, не пикселем в углу: извлеките `alpha_*.png` и наложите на `#171A20` и на шахматку, смотрите: 1) тонкие лопасти вентилятора, 2) дырки/отверстия на корпусе, 3) отражения на металле и 4) кайму вокруг teal-glow `#19BD9B` — зелёный фон даёт зелёную кайму именно там (v1).

### Устаревший colorkey-подход (не использовать)

```bash
# Хрупко: градиент ≠ один цвет, magic colorkey=0x85b180:0.06:0.02 (v1) vs 0x05EE0B:0.20:0.10 (v2) — разные на каждый ролик
ffmpeg -i input.mp4 -vf "colorkey=0x00FF00:0.3:0.15,format=yuva420p" ...
# На следующем ролике с другой виньеткой снова перебор, teal #19BD9B съедается, а PBR-отражение зелёного остаётся в дырках
# Факт 08.09: v1 colorkey — очень плохой, зелёная кайма; v1 isnet — оставил зелёный в отражениях; v2 isnet (bright chroma) — 4 варианта одинаковы, но spill принципиально остаётся
```

### Интеграция в проект

- Компонент: `src/components/ServiceAnimation.astro` (IntersectionObserver, prefers-reduced-motion, preload none)
- Карта анимаций: `src/components/ServiceCard.astro:animatedServices` + `src/pages/services/[slug].astro:animatedServices`
- Для новой услуги: сгенерить видео с промптом выше → прогнать пайплайном → добавить запись в обе карты.
