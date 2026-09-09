<!-- GENERATED — single source: docs/service-animation/guide-final-v2.md — DO NOT EDIT, regenerate via generate_animation_prompts.py -->
---
slug: remont-posle-zalitiya
title: "Ремонт ноутбука после залития"
tone: смешанный
bucket_recommended: тёмный
date_generated: 2026-09-09
tags: [service-animation, remont-posle-zalitiya]
---

# Ремонт ноутбука после залития — `remont-posle-zalitiya`

> **Bucket:** `тёмный` (тёмный `#171A20` / светлый `#D1D5DB` — см. `docs/service-animation/guide-final-v2.md §3`)
> Доминирующий тон объекта: **смешанный** → рекомендуемый бакет **тёмный**. Проверьте глазами на первой картинке, при мягкой маске (>6% semi) смените бакет.

## Master templates (single source, не дублировать)

- Image master: `![[../_templates/master-image]]` → подставьте `BACKGROUND` + `SUBJECT` ниже
- Video master: `![[../_templates/master-video]]` → подставьте `MOTION` ниже

## SUBJECT (service-specific, from guide §4)

```text
An open laptop viewed from a slight top angle, keyboard visible, with a single
stylized water droplet frozen mid-air above the keyboard and a thin teal
protective energy shield/dome hovering just above the keys, deflecting the droplet.
```

## MOTION A — базовый (стабильный loop)

```text
The water droplet falls slowly toward the keyboard, hits the teal shield, ripples
outward across the shield surface, and the droplet splashes away in a soft teal
sparkle. The shield fades and a new droplet begins to fall, creating a perfect loop.
```

## MOTION B — виральный (anticipation/overshoot)

```text
The droplet falls with a believable gravity acceleration, and right before impact
there's a tiny anticipation beat — the shield brightens slightly as if bracing.
On impact the shield flexes inward briefly like a trampoline (slight overshoot),
then springs back with a soft bounce-and-settle, while the droplet shatters into
several small teal droplet-shaped sparks that arc outward under gravity and fade
like tiny fireworks. Shield glow fades to rest exactly as the next droplet begins
to fall.
```

## Copy-ready (собранный, для удобства — сгенерирован, не править вручную)

**Image (рекомендуемый бакет `тёмный`):**
```text
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: An open laptop viewed from a slight top angle, keyboard visible, with a single
stylized water droplet frozen mid-air above the keyboard and a thin teal
protective energy shield/dome hovering just above the keys, deflecting the droplet.

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark
```

**Video A:**
```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The water droplet falls slowly toward the keyboard, hits the teal shield, ripples
outward across the shield surface, and the droplet splashes away in a soft teal
sparkle. The shield fades and a new droplet begins to fall, creating a perfect loop.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The water droplet falls slowly toward the keyboard, hits the teal shield, ripples
outward across the shield surface, and the droplet splashes away in a soft teal
sparkle. The shield fades and a new droplet begins to fall, creating a perfect loop.
```

**Video B:**
```text
Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

The droplet falls with a believable gravity acceleration, and right before impact
there's a tiny anticipation beat — the shield brightens slightly as if bracing.
On impact the shield flexes inward briefly like a trampoline (slight overshoot),
then springs back with a soft bounce-and-settle, while the droplet shatters into
several small teal droplet-shaped sparks that arc outward under gravity and fade
like tiny fireworks. Shield glow fades to rest exactly as the next droplet begins
to fall.

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: The droplet falls with a believable gravity acceleration, and right before impact
there's a tiny anticipation beat — the shield brightens slightly as if bracing.
On impact the shield flexes inward briefly like a trampoline (slight overshoot),
then springs back with a soft bounce-and-settle, while the droplet shatters into
several small teal droplet-shaped sparks that arc outward under gravity and fade
like tiny fireworks. Shield glow fades to rest exactly as the next droplet begins
to fall.
```

> Примечание: copy-ready блоки выше — сгенерированы из master + SUBJECT/MOTION. При изменении master в `docs/service-animation/guide-final-v2.md` перегенерируйте: `python scripts/generate-prompts/generate_animation_prompts.py --out prompts`


## Как использовать

1. Выберите **Bucket** по таблице выше, скопируйте *Image prompt* (блок 1) → генерируете 1 картинку 640×640.
2. Проверьте контраст объект/фон глазами; если сливается — перегенерируйте на противоположном бакете.
3. Прогоните картинку через **Video prompt A** (начните с A; B — для топ-5 виральных).
4. Скачайте `*.mp4` → положите в `Attachments/remont-posle-zalitiya/raw-video.mp4` (папку можно открыть в Obsidian, drag & drop).
5. Запустите пайплайн:
```bash
./scripts/service-animation/process_service.sh remont-posle-zalitiya prompts/Attachments/remont-posle-zalitiya/raw-video.mp4
# выход: public/videos/services/remont-posle-zalitiya.{mp4,webm,poster.jpg,poster.webp} + /tmp/svc-anim/remont-posle-zalitiya/alpha.mov
```
6. QA: `python3 scripts/service-animation/check_alpha_quality.py /tmp/svc-anim/remont-posle-zalitiya/frames_out --threshold 6` (автоматически в `process_service.sh` шаг 2.5)
7. Добавьте slug в `src/components/ServiceCard.astro:animatedServices` и `src/pages/services/[slug].astro:animatedServices`, `npm run build`.

## Attachments (перетащите сюда файлы в Obsidian)

- `![[raw-image.png]]` — исходная картинка 640×640
- `![[raw-video.mp4]]` — исходное видео 4 сек (loop)
- После обработки появятся в `public/videos/services/remont-posle-zalitiya.*` — сюда можно вставить превью:
![[Attachments/remont-posle-zalitiya/preview.jpg|300]]

## Links

- Гайд: [[guide-final-v2.md|docs/service-animation/guide-final-v2.md §1-4]]
- Пайплайн: `scripts/service-animation/matte.py` / `scripts/service-animation/process_service.sh` / `scripts/service-animation/check_alpha_quality.py`
- Компонент: `src/components/ServiceAnimation.astro`
- Карточка услуги: `/services/remont-posle-zalitiya`
