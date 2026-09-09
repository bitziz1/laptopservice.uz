---
slug: chistka-noutbuka-ot-pyli
title: "Чистка ноутбука от пыли"
tone: тёмный
bucket_recommended: светлый
date_generated: 2026-09-09
tags: [service-animation, chistka-noutbuka-ot-pyli]
---

# Чистка ноутбука от пыли — `chistka-noutbuka-ot-pyli`

> **Bucket:** `светлый` (тёмный `#171A20` / светлый `#D1D5DB` — см. `docs/service-animation/guide-final-v2.md §3`)
> Доминирующий тон объекта: **тёмный** → рекомендуемый бакет **светлый**. Проверьте глазами на первой картинке, при мягкой маске (>6% semi) смените бакет.

## 1) Image prompt — copy-ready (рекомендуемый бакет)

```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered light grey studio background (#D1D5DB), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D laptop cooling fan seen through a vent grille, a few small grey dust
particle shapes near the blades, teal air-flow streak lines suggesting airflow.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

### Альтернативные фоны (для теста A/B, если маска мягкая)

**Тёмный `#171A20` (default):**
```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D laptop cooling fan seen through a vent grille, a few small grey dust
particle shapes near the blades, teal air-flow streak lines suggesting airflow.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

**Светлый `#D1D5DB`:**
```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered light grey studio background (#D1D5DB), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D laptop cooling fan seen through a vent grille, a few small grey dust
particle shapes near the blades, teal air-flow streak lines suggesting airflow.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

## 2) Video prompt — MOTION A (базовый, стабильный loop)

```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The dust particles are blown away from the fan in a soft outward burst along the
teal airflow streaks and fade out, the fan spins cleanly, then a couple of dust
particles gently drift back into place to reset the loop.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The dust particles are blown away from the fan in a soft outward burst along the
teal airflow streaks and fade out, the fan spins cleanly, then a couple of dust
particles gently drift back into place to reset the loop.
```

## 3) Video prompt — MOTION B (виральный, с физикой anticipation/overshoot)

```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The dust particles tremble slightly in place first, as if the fan is winding up
(anticipation beat), then burst outward in a satisfying single "poof" that follows
a natural gravity arc and scatter — not a straight blow — leaving a brief teal
air-current swirl trailing behind. The particles then gently float back inward in
slow motion to reset the loop, like a tiny playful cleanup gag.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The dust particles tremble slightly in place first, as if the fan is winding up
(anticipation beat), then burst outward in a satisfying single "poof" that follows
a natural gravity arc and scatter — not a straight blow — leaving a brief teal
air-current swirl trailing behind. The particles then gently float back inward in
slow motion to reset the loop, like a tiny playful cleanup gag.
```

## Как использовать

1. Выберите **Bucket** по таблице выше, скопируйте *Image prompt* (блок 1) → генерируете 1 картинку 640×640.
2. Проверьте контраст объект/фон глазами; если сливается — перегенерируйте на противоположном бакете.
3. Прогоните картинку через **Video prompt A** (начните с A; B — для топ-5 виральных).
4. Скачайте `*.mp4` → положите в `Attachments/chistka-noutbuka-ot-pyli/raw-video.mp4` (папку можно открыть в Obsidian, drag & drop).
5. Запустите пайплайн:
```bash
./scripts/service-animation/process_service.sh chistka-noutbuka-ot-pyli prompts/Attachments/chistka-noutbuka-ot-pyli/raw-video.mp4
# выход: public/videos/services/chistka-noutbuka-ot-pyli.{mp4,webm,poster.jpg,poster.webp} + /tmp/svc-anim/chistka-noutbuka-ot-pyli/alpha.mov
```
6. QA: `python3 scripts/service-animation/check_alpha_quality.py /tmp/svc-anim/chistka-noutbuka-ot-pyli/frames_out --threshold 6` (автоматически в `process_service.sh` шаг 2.5)
7. Добавьте slug в `src/components/ServiceCard.astro:animatedServices` и `src/pages/services/[slug].astro:animatedServices`, `npm run build`.

## Attachments (перетащите сюда файлы в Obsidian)

- `![[raw-image.png]]` — исходная картинка 640×640
- `![[raw-video.mp4]]` — исходное видео 4 сек (loop)
- После обработки появятся в `public/videos/services/chistka-noutbuka-ot-pyli.*` — сюда можно вставить превью:
![[Attachments/chistka-noutbuka-ot-pyli/preview.jpg|300]]

## Links

- Гайд: [[guide-final-v2.md|docs/service-animation/guide-final-v2.md §1-4]]
- Пайплайн: `scripts/service-animation/matte.py` / `scripts/service-animation/process_service.sh` / `scripts/service-animation/check_alpha_quality.py`
- Компонент: `src/components/ServiceAnimation.astro`
- Карточка услуги: `/services/chistka-noutbuka-ot-pyli`
