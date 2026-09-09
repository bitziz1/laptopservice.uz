<!-- GENERATED — single source: docs/service-animation/guide-final-v2.md — DO NOT EDIT, regenerate via generate_animation_prompts.py -->
---
slug: remont-videokarty-kompyutera
title: "Ремонт видеокарты"
tone: светлый
bucket_recommended: тёмный
date_generated: 2026-09-09
tags: [service-animation, remont-videokarty-kompyutera]
---

# Ремонт видеокарты — `remont-videokarty-kompyutera`

> **Bucket:** `тёмный` (тёмный `#171A20` / светлый `#D1D5DB` — см. `docs/service-animation/guide-final-v2.md §3`)
> Доминирующий тон объекта: **светлый** → рекомендуемый бакет **тёмный**. Проверьте глазами на первой картинке, при мягкой маске (>6% semi) смените бакет.

## Master templates (single source, не дублировать)

- Image master: `![[../_templates/master-image]]` → подставьте `BACKGROUND` + `SUBJECT` ниже
- Video master: `![[../_templates/master-video]]` → подставьте `MOTION` ниже

## SUBJECT (service-specific, from guide §4)

```text
A stylized 3D graphics card viewed at an angle, cooling fan visible, a thin teal
LED light strip along its edge.
```

## MOTION A — базовый (стабильный loop)

```text
The fan blades spin at a constant steady speed (naturally loopable rotation), the
teal LED strip pulses gently in a slow breathing rhythm independent of the fan.
```

## MOTION B — виральный (anticipation/overshoot)

```text
The fan blades spin with subtle natural momentum — a barely perceptible wobble
in speed as if catching a light draft, while still looping cleanly over 3 seconds.
The teal LED strip has a "chase" light effect: a brighter pulse of light travels
along the strip once per loop like a heartbeat, and a small light flare glints
off the metal fan hub as it catches the light at one point in the rotation.
```

## Copy-ready (собранный, для удобства — сгенерирован, не править вручную)

**Image (рекомендуемый бакет `тёмный`):**
```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D graphics card viewed at an angle, cooling fan visible, a thin teal
LED light strip along its edge.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

**Video A:**
```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The fan blades spin at a constant steady speed (naturally loopable rotation), the
teal LED strip pulses gently in a slow breathing rhythm independent of the fan.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The fan blades spin at a constant steady speed (naturally loopable rotation), the
teal LED strip pulses gently in a slow breathing rhythm independent of the fan.
```

**Video B:**
```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The fan blades spin with subtle natural momentum — a barely perceptible wobble
in speed as if catching a light draft, while still looping cleanly over 3 seconds.
The teal LED strip has a "chase" light effect: a brighter pulse of light travels
along the strip once per loop like a heartbeat, and a small light flare glints
off the metal fan hub as it catches the light at one point in the rotation.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The fan blades spin with subtle natural momentum — a barely perceptible wobble
in speed as if catching a light draft, while still looping cleanly over 3 seconds.
The teal LED strip has a "chase" light effect: a brighter pulse of light travels
along the strip once per loop like a heartbeat, and a small light flare glints
off the metal fan hub as it catches the light at one point in the rotation.
```

> Примечание: copy-ready блоки выше — сгенерированы из master + SUBJECT/MOTION. При изменении master в `docs/service-animation/guide-final-v2.md` перегенерируйте: `python scripts/generate-prompts/generate_animation_prompts.py --out prompts`


## Как использовать

1. Выберите **Bucket** по таблице выше, скопируйте *Image prompt* (блок 1) → генерируете 1 картинку 640×640.
2. Проверьте контраст объект/фон глазами; если сливается — перегенерируйте на противоположном бакете.
3. Прогоните картинку через **Video prompt A** (начните с A; B — для топ-5 виральных).
4. Скачайте `*.mp4` → положите в `Attachments/remont-videokarty-kompyutera/raw-video.mp4` (папку можно открыть в Obsidian, drag & drop).
5. Запустите пайплайн:
```bash
./scripts/service-animation/process_service.sh remont-videokarty-kompyutera prompts/Attachments/remont-videokarty-kompyutera/raw-video.mp4
# выход: public/videos/services/remont-videokarty-kompyutera.{mp4,webm,poster.jpg,poster.webp} + /tmp/svc-anim/remont-videokarty-kompyutera/alpha.mov
```
6. QA: `python3 scripts/service-animation/check_alpha_quality.py /tmp/svc-anim/remont-videokarty-kompyutera/frames_out --threshold 6` (автоматически в `process_service.sh` шаг 2.5)
7. Добавьте slug в `src/components/ServiceCard.astro:animatedServices` и `src/pages/services/[slug].astro:animatedServices`, `npm run build`.

## Attachments (перетащите сюда файлы в Obsidian)

- `![[raw-image.png]]` — исходная картинка 640×640
- `![[raw-video.mp4]]` — исходное видео 4 сек (loop)
- После обработки появятся в `public/videos/services/remont-videokarty-kompyutera.*` — сюда можно вставить превью:
![[Attachments/remont-videokarty-kompyutera/preview.jpg|300]]

## Links

- Гайд: [[guide-final-v2.md|docs/service-animation/guide-final-v2.md §1-4]]
- Пайплайн: `scripts/service-animation/matte.py` / `scripts/service-animation/process_service.sh` / `scripts/service-animation/check_alpha_quality.py`
- Компонент: `src/components/ServiceAnimation.astro`
- Карточка услуги: `/services/remont-videokarty-kompyutera`
