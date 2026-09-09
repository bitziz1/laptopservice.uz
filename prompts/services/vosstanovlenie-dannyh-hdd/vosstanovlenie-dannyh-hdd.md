<!-- GENERATED — single source: docs/service-animation/guide-final-v2.md — DO NOT EDIT, regenerate via generate_animation_prompts.py -->
---
slug: vosstanovlenie-dannyh-hdd
title: "Восстановление данных HDD"
tone: светлый
bucket_recommended: тёмный
date_generated: 2026-09-09
tags: [service-animation, vosstanovlenie-dannyh-hdd]
---

# Восстановление данных HDD — `vosstanovlenie-dannyh-hdd`

> **Bucket:** `тёмный` (тёмный `#171A20` / светлый `#D1D5DB` — см. `docs/service-animation/guide-final-v2.md §3`)
> Доминирующий тон объекта: **светлый** → рекомендуемый бакет **тёмный**. Проверьте глазами на первой картинке, при мягкой маске (>6% semi) смените бакет.

## 1) Image prompt — copy-ready (рекомендуемый бакет)

```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D hard drive disk with the top cover removed showing a circular
platter, a couple of small minimalist file/folder icons hovering just above it
with a soft teal glow trail connecting them to the platter.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

### Альтернативные фоны (для теста A/B, если маска мягкая)

**Тёмный `#171A20` (default):**
```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D hard drive disk with the top cover removed showing a circular
platter, a couple of small minimalist file/folder icons hovering just above it
with a soft teal glow trail connecting them to the platter.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

**Светлый `#D1D5DB`:**
```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered light grey studio background (#D1D5DB), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D hard drive disk with the top cover removed showing a circular
platter, a couple of small minimalist file/folder icons hovering just above it
with a soft teal glow trail connecting them to the platter.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

## 2) Video prompt — MOTION A (базовый, стабильный loop)

```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The platter spins steadily, the small file icons float slowly upward away from
the drive trailing a soft teal glow, then fade out and reappear at the platter to
restart the float — smooth continuous loop.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The platter spins steadily, the small file icons float slowly upward away from
the drive trailing a soft teal glow, then fade out and reappear at the platter to
restart the float — smooth continuous loop.
```

## 3) Video prompt — MOTION B (виральный, с физикой anticipation/overshoot)

```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The platter starts spinning up gradually from rest to full speed, like a real
disk spin-up. Small file icons "pop" out one at a time in a staggered sequence
(not all together), each with a tiny bounce-and-settle as it floats upward,
trailing a soft teal light streak like a data spark. The files fade near the top
as the platter gently decelerates back to rest, resetting the loop — like a
miniature rescue moment.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The platter starts spinning up gradually from rest to full speed, like a real
disk spin-up. Small file icons "pop" out one at a time in a staggered sequence
(not all together), each with a tiny bounce-and-settle as it floats upward,
trailing a soft teal light streak like a data spark. The files fade near the top
as the platter gently decelerates back to rest, resetting the loop — like a
miniature rescue moment.
```

## Как использовать

1. Выберите **Bucket** по таблице выше, скопируйте *Image prompt* (блок 1) → генерируете 1 картинку 640×640.
2. Проверьте контраст объект/фон глазами; если сливается — перегенерируйте на противоположном бакете.
3. Прогоните картинку через **Video prompt A** (начните с A; B — для топ-5 виральных).
4. Скачайте `*.mp4` → положите в `Attachments/vosstanovlenie-dannyh-hdd/raw-video.mp4` (папку можно открыть в Obsidian, drag & drop).
5. Запустите пайплайн:
```bash
./scripts/service-animation/process_service.sh vosstanovlenie-dannyh-hdd prompts/Attachments/vosstanovlenie-dannyh-hdd/raw-video.mp4
# выход: public/videos/services/vosstanovlenie-dannyh-hdd.{mp4,webm,poster.jpg,poster.webp} + /tmp/svc-anim/vosstanovlenie-dannyh-hdd/alpha.mov
```
6. QA: `python3 scripts/service-animation/check_alpha_quality.py /tmp/svc-anim/vosstanovlenie-dannyh-hdd/frames_out --threshold 6` (автоматически в `process_service.sh` шаг 2.5)
7. Добавьте slug в `src/components/ServiceCard.astro:animatedServices` и `src/pages/services/[slug].astro:animatedServices`, `npm run build`.

## Attachments (перетащите сюда файлы в Obsidian)

- `![[raw-image.png]]` — исходная картинка 640×640
- `![[raw-video.mp4]]` — исходное видео 4 сек (loop)
- После обработки появятся в `public/videos/services/vosstanovlenie-dannyh-hdd.*` — сюда можно вставить превью:
![[Attachments/vosstanovlenie-dannyh-hdd/preview.jpg|300]]

## Links

- Гайд: [[guide-final-v2.md|docs/service-animation/guide-final-v2.md §1-4]]
- Пайплайн: `scripts/service-animation/matte.py` / `scripts/service-animation/process_service.sh` / `scripts/service-animation/check_alpha_quality.py`
- Компонент: `src/components/ServiceAnimation.astro`
- Карточка услуги: `/services/vosstanovlenie-dannyh-hdd`
