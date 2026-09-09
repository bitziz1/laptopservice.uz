<!-- GENERATED — single source: docs/service-animation/guide-final-v2.md — DO NOT EDIT, regenerate via generate_animation_prompts.py -->
---
slug: remont-monobloka
title: "Ремонт моноблока"
tone: светлый
bucket_recommended: тёмный
date_generated: 2026-09-09
tags: [service-animation, remont-monobloka]
---

# Ремонт моноблока — `remont-monobloka`

> **Bucket:** `тёмный` (тёмный `#171A20` / светлый `#D1D5DB` — см. `docs/service-animation/guide-final-v2.md §3`)
> Доминирующий тон объекта: **светлый** → рекомендуемый бакет **тёмный**. Проверьте глазами на первой картинке, при мягкой маске (>6% semi) смените бакет.

## Master templates (single source, не дублировать)

- Image master: `![[../_templates/master-image]]` → подставьте `BACKGROUND` + `SUBJECT` ниже
- Video master: `![[../_templates/master-video]]` → подставьте `MOTION` ниже

## SUBJECT (service-specific, from guide §4)

```text
A stylized 3D all-in-one desktop computer (screen + base in one unit), front-facing,
with the screen glowing a soft teal, and a small floating gear icon beside it
hinting at internal repair.
```

## MOTION A — базовый (стабильный loop)

```text
The screen glow breathes gently brighter and dimmer in a slow pulse, and the small
floating gear rotates one full smooth 360-degree turn in sync with the glow cycle,
returning to its exact starting rotation for a perfect loop.
```

## MOTION B — виральный (anticipation/overshoot)

```text
The screen glow builds up gradually like the machine is "waking up," brightness
rising with a slight overshoot past its peak before settling back — like a soft
flash. A thin teal scan-line sweeps once top-to-bottom across the screen exactly
at the brightness peak. The gear spins with natural acceleration-then-deceleration
(not constant speed), like a flywheel starting and coasting to a stop, resetting
to the dim state to loop.
```

## Copy-ready (собранный, для удобства — сгенерирован, не править вручную)

**Image (рекомендуемый бакет `тёмный`):**
```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D all-in-one desktop computer (screen + base in one unit), front-facing,
with the screen glowing a soft teal, and a small floating gear icon beside it
hinting at internal repair.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

**Video A:**
```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The screen glow breathes gently brighter and dimmer in a slow pulse, and the small
floating gear rotates one full smooth 360-degree turn in sync with the glow cycle,
returning to its exact starting rotation for a perfect loop.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The screen glow breathes gently brighter and dimmer in a slow pulse, and the small
floating gear rotates one full smooth 360-degree turn in sync with the glow cycle,
returning to its exact starting rotation for a perfect loop.
```

**Video B:**
```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The screen glow builds up gradually like the machine is "waking up," brightness
rising with a slight overshoot past its peak before settling back — like a soft
flash. A thin teal scan-line sweeps once top-to-bottom across the screen exactly
at the brightness peak. The gear spins with natural acceleration-then-deceleration
(not constant speed), like a flywheel starting and coasting to a stop, resetting
to the dim state to loop.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The screen glow builds up gradually like the machine is "waking up," brightness
rising with a slight overshoot past its peak before settling back — like a soft
flash. A thin teal scan-line sweeps once top-to-bottom across the screen exactly
at the brightness peak. The gear spins with natural acceleration-then-deceleration
(not constant speed), like a flywheel starting and coasting to a stop, resetting
to the dim state to loop.
```

> Примечание: copy-ready блоки выше — сгенерированы из master + SUBJECT/MOTION. При изменении master в `docs/service-animation/guide-final-v2.md` перегенерируйте: `python scripts/generate-prompts/generate_animation_prompts.py --out prompts`


## Как использовать

1. Выберите **Bucket** по таблице выше, скопируйте *Image prompt* (блок 1) → генерируете 1 картинку 640×640.
2. Проверьте контраст объект/фон глазами; если сливается — перегенерируйте на противоположном бакете.
3. Прогоните картинку через **Video prompt A** (начните с A; B — для топ-5 виральных).
4. Скачайте `*.mp4` → положите в `Attachments/remont-monobloka/raw-video.mp4` (папку можно открыть в Obsidian, drag & drop).
5. Запустите пайплайн:
```bash
./scripts/service-animation/process_service.sh remont-monobloka prompts/Attachments/remont-monobloka/raw-video.mp4
# выход: public/videos/services/remont-monobloka.{mp4,webm,poster.jpg,poster.webp} + /tmp/svc-anim/remont-monobloka/alpha.mov
```
6. QA: `python3 scripts/service-animation/check_alpha_quality.py /tmp/svc-anim/remont-monobloka/frames_out --threshold 6` (автоматически в `process_service.sh` шаг 2.5)
7. Добавьте slug в `src/components/ServiceCard.astro:animatedServices` и `src/pages/services/[slug].astro:animatedServices`, `npm run build`.

## Attachments (перетащите сюда файлы в Obsidian)

- `![[raw-image.png]]` — исходная картинка 640×640
- `![[raw-video.mp4]]` — исходное видео 4 сек (loop)
- После обработки появятся в `public/videos/services/remont-monobloka.*` — сюда можно вставить превью:
![[Attachments/remont-monobloka/preview.jpg|300]]

## Links

- Гайд: [[guide-final-v2.md|docs/service-animation/guide-final-v2.md §1-4]]
- Пайплайн: `scripts/service-animation/matte.py` / `scripts/service-animation/process_service.sh` / `scripts/service-animation/check_alpha_quality.py`
- Компонент: `src/components/ServiceAnimation.astro`
- Карточка услуги: `/services/remont-monobloka`
