---
slug: zamena-akkumulyatora-noutbuka
title: "Замена аккумулятора ноутбука"
tone: светлый
bucket_recommended: тёмный
date_generated: 2026-09-09
tags: [service-animation, zamena-akkumulyatora-noutbuka]
---

# Замена аккумулятора ноутбука — `zamena-akkumulyatora-noutbuka`

> **Bucket:** `тёмный` (тёмный `#171A20` / светлый `#D1D5DB` — см. `docs/service-animation/guide-final-v2.md §3`)
> Доминирующий тон объекта: **светлый** → рекомендуемый бакет **тёмный**. Проверьте глазами на первой картинке, при мягкой маске (>6% semi) смените бакет.

## 1) Image prompt — copy-ready (рекомендуемый бакет)

```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D laptop battery icon (rounded rectangle cell) with a teal charging
bolt symbol in its center, partially filled with a glowing teal liquid-like level
indicator.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

### Альтернативные фоны (для теста A/B, если маска мягкая)

**Тёмный `#171A20` (default):**
```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D laptop battery icon (rounded rectangle cell) with a teal charging
bolt symbol in its center, partially filled with a glowing teal liquid-like level
indicator.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

**Светлый `#D1D5DB`:**
```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered light grey studio background (#D1D5DB), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: A stylized 3D laptop battery icon (rounded rectangle cell) with a teal charging
bolt symbol in its center, partially filled with a glowing teal liquid-like level
indicator.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

## 2) Video prompt — MOTION A (базовый, стабильный loop)

```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The teal fill level slowly rises from low to full like liquid filling a container,
the charging bolt flickers softly once it reaches full, then the level resets
and rises again — smooth loop, no sudden jump.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The teal fill level slowly rises from low to full like liquid filling a container,
the charging bolt flickers softly once it reaches full, then the level resets
and rises again — smooth loop, no sudden jump.
```

## 3) Video prompt — MOTION B (виральный, с физикой anticipation/overshoot)

```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The teal liquid-like fill rises and, on reaching the top, briefly overshoots and
settles back down like real liquid settling after being poured (a small bounce,
not a hard stop). The charging bolt flickers twice with increasing brightness at
the peak. A few tiny bubble-like light particles drift upward inside the fill.
The level then drains smoothly back down to reset the loop.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The teal liquid-like fill rises and, on reaching the top, briefly overshoots and
settles back down like real liquid settling after being poured (a small bounce,
not a hard stop). The charging bolt flickers twice with increasing brightness at
the peak. A few tiny bubble-like light particles drift upward inside the fill.
The level then drains smoothly back down to reset the loop.
```

## Как использовать

1. Выберите **Bucket** по таблице выше, скопируйте *Image prompt* (блок 1) → генерируете 1 картинку 640×640.
2. Проверьте контраст объект/фон глазами; если сливается — перегенерируйте на противоположном бакете.
3. Прогоните картинку через **Video prompt A** (начните с A; B — для топ-5 виральных).
4. Скачайте `*.mp4` → положите в `Attachments/zamena-akkumulyatora-noutbuka/raw-video.mp4` (папку можно открыть в Obsidian, drag & drop).
5. Запустите пайплайн:
```bash
./scripts/service-animation/process_service.sh zamena-akkumulyatora-noutbuka prompts/Attachments/zamena-akkumulyatora-noutbuka/raw-video.mp4
# выход: public/videos/services/zamena-akkumulyatora-noutbuka.{mp4,webm,poster.jpg,poster.webp} + /tmp/svc-anim/zamena-akkumulyatora-noutbuka/alpha.mov
```
6. QA: `python3 scripts/service-animation/check_alpha_quality.py /tmp/svc-anim/zamena-akkumulyatora-noutbuka/frames_out --threshold 6` (автоматически в `process_service.sh` шаг 2.5)
7. Добавьте slug в `src/components/ServiceCard.astro:animatedServices` и `src/pages/services/[slug].astro:animatedServices`, `npm run build`.

## Attachments (перетащите сюда файлы в Obsidian)

- `![[raw-image.png]]` — исходная картинка 640×640
- `![[raw-video.mp4]]` — исходное видео 4 сек (loop)
- После обработки появятся в `public/videos/services/zamena-akkumulyatora-noutbuka.*` — сюда можно вставить превью:
![[Attachments/zamena-akkumulyatora-noutbuka/preview.jpg|300]]

## Links

- Гайд: [[guide-final-v2.md|docs/service-animation/guide-final-v2.md §1-4]]
- Пайплайн: `scripts/service-animation/matte.py` / `scripts/service-animation/process_service.sh` / `scripts/service-animation/check_alpha_quality.py`
- Компонент: `src/components/ServiceAnimation.astro`
- Карточка услуги: `/services/zamena-akkumulyatora-noutbuka`
