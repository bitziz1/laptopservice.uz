#!/usr/bin/env python3
"""
Generate copy-ready prompts for 10 service animations (guide-final-v2) into
an Obsidian-friendly vault: prompts/services/<slug>.md + prompts/_index.md

Usage:
  python scripts/generate-prompts/generate_animation_prompts.py
  python scripts/generate-prompts/generate_animation_prompts.py --out prompts --guide docs/service-animation/guide-final-v2.md
  python scripts/generate-prompts/generate_animation_prompts.py --force
Vault can be opened directly in Obsidian (each file is standalone markdown).
After generation: paste results manually into vault/Attachments/<slug>/, then run
  ./scripts/service-animation/process_service.sh <slug> /path/to/generated-video.mp4  -> public/videos/services/
"""
import argparse, re, pathlib, datetime

SERVICES = [
    ("remont-posle-zalitiya", "Ремонт ноутбука после залития", "смешанный", "тёмный"),
    ("remont-materinskoy-platy-pk", "Ремонт материнской платы", "тёмный", "светлый"),
    ("remont-monobloka", "Ремонт моноблока", "светлый", "тёмный"),
    ("remont-videokarty-kompyutera", "Ремонт видеокарты", "светлый", "тёмный"),
    ("pereustanovka-windows", "Переустановка Windows", "тёмный", "светлый"),
    ("zamena-akkumulyatora-noutbuka", "Замена аккумулятора ноутбука", "светлый", "тёмный"),
    ("chistka-noutbuka-ot-pyli", "Чистка ноутбука от пыли", "тёмный", "светлый"),
    ("zamena-matritsy-ekrana", "Замена матрицы экрана ноутбука", "тёмный", "светлый"),
    ("zamena-razema-pitaniya", "Замена разъёма питания на ноутбуке", "тёмный", "светлый"),
    ("vosstanovlenie-dannyh-hdd", "Восстановление данных HDD", "светлый", "тёмный"),
]

GUIDE_PATH_DEFAULT = "docs/service-animation/guide-final-v2.md"
PROMPTS_OUT = "prompts"

def parse_guide(guide_path):
    text = pathlib.Path(guide_path).read_text(encoding="utf-8", errors="ignore")
    # extract per-service blocks via regex
    blocks = {}
    pattern = re.compile(r"### \d+\.\s+.*?—\s+`([^`]+)`\s*\n+?\*\*SUBJECT:\*\*\s*>?\s*(.*?)\s*\n+?\*\*MOTION A:\*\*\s*>?\s*(.*?)\s*\n+?\*\*MOTION B.*?:\*\*\s*>?\s*(.*?)(?=\n---|\n### \d+\.)", re.S)
    for m in pattern.finditer(text):
        slug, subj, motA, motB = m.group(1).strip(), m.group(2).strip(), m.group(3).strip(), m.group(4).strip()
        # clean leading > and whitespace
        def clean(s):
            s = re.sub(r"^>\s*", "", s, flags=re.M)
            s = re.sub(r"\n>\s*", " ", s)
            return s.strip()
        blocks[slug] = {"subject": clean(subj), "motion_a": clean(motA), "motion_b": clean(motB)}
    return blocks

MASTER_IMAGE_TEMPLATE = """3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: {background}

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: {subject}

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark"""

MASTER_VIDEO_TEMPLATE = """Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

{MOTION}

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: {motion}"""

BG_DARK = "plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background."
BG_LIGHT = "plain uncluttered light grey studio background (#D1D5DB), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background."

def build_files(out, guide_path):
    out = pathlib.Path(out)
    blocks = parse_guide(guide_path)
    today = datetime.date.today().isoformat()
    for slug, title, tone, bucket in SERVICES:
        subj = blocks.get(slug, {}).get("subject", f"[{title} — SUBJECT from guide]")
        motA = blocks.get(slug, {}).get("motion_a", "[MOTION A]")
        motB = blocks.get(slug, {}).get("motion_b", "[MOTION B]")
        bg_choice = BG_DARK if bucket == "тёмный" else BG_LIGHT
        bg_alt = BG_LIGHT if bucket == "тёмный" else BG_DARK
        # image prompts
        img_dark = MASTER_IMAGE_TEMPLATE.format(background=BG_DARK, subject=subj)
        img_light = MASTER_IMAGE_TEMPLATE.format(background=BG_LIGHT, subject=subj)
        img_recommended = MASTER_IMAGE_TEMPLATE.format(background=bg_choice, subject=subj)
        vid_a = MASTER_VIDEO_TEMPLATE.format(MOTION=motA, motion=motA)
        vid_b = MASTER_VIDEO_TEMPLATE.format(MOTION=motB, motion=motB)
        dir_path = out / "services" / slug
        dir_path.mkdir(parents=True, exist_ok=True)
        # attachments folder for Obsidian
        (out / "Attachments" / slug).mkdir(parents=True, exist_ok=True)
        # Thin per-service file: only service-specific deltas, master templates via embed (minimize duplication)
        md = f"""<!-- GENERATED — single source: docs/service-animation/guide-final-v2.md — DO NOT EDIT, regenerate via generate_animation_prompts.py -->
---
slug: {slug}
title: "{title}"
tone: {tone}
bucket_recommended: {bucket}
date_generated: {today}
tags: [service-animation, {slug}]
---

# {title} — `{slug}`

> **Bucket:** `{bucket}` (тёмный `#171A20` / светлый `#D1D5DB` — см. `docs/service-animation/guide-final-v2.md §3`)
> Доминирующий тон объекта: **{tone}** → рекомендуемый бакет **{bucket}**. Проверьте глазами на первой картинке, при мягкой маске (>6% semi) смените бакет.

## Master templates (single source, не дублировать)

- Image master: `![[../_templates/master-image]]` → подставьте `BACKGROUND` + `SUBJECT` ниже
- Video master: `![[../_templates/master-video]]` → подставьте `MOTION` ниже

## SUBJECT (service-specific, from guide §4)

```text
{subj}
```

## MOTION A — базовый (стабильный loop)

```text
{motA}
```

## MOTION B — виральный (anticipation/overshoot)

```text
{motB}
```

## Copy-ready (собранный, для удобства — сгенерирован, не править вручную)

**Image (рекомендуемый бакет `{bucket}`):**
```text
{img_recommended}
```

**Video A:**
```text
{vid_a}
```

**Video B:**
```text
{vid_b}
```

> Примечание: copy-ready блоки выше — сгенерированы из master + SUBJECT/MOTION. При изменении master в `docs/service-animation/guide-final-v2.md` перегенерируйте: `python scripts/generate-prompts/generate_animation_prompts.py --out prompts`


## Как использовать

1. Выберите **Bucket** по таблице выше, скопируйте *Image prompt* (блок 1) → генерируете 1 картинку 640×640.
2. Проверьте контраст объект/фон глазами; если сливается — перегенерируйте на противоположном бакете.
3. Прогоните картинку через **Video prompt A** (начните с A; B — для топ-5 виральных).
4. Скачайте `*.mp4` → положите в `Attachments/{slug}/raw-video.mp4` (папку можно открыть в Obsidian, drag & drop).
5. Запустите пайплайн:
```bash
./scripts/service-animation/process_service.sh {slug} prompts/Attachments/{slug}/raw-video.mp4
# выход: public/videos/services/{slug}.{{mp4,webm,poster.jpg,poster.webp}} + /tmp/svc-anim/{slug}/alpha.mov
```
6. QA: `python3 scripts/service-animation/check_alpha_quality.py /tmp/svc-anim/{slug}/frames_out --threshold 6` (автоматически в `process_service.sh` шаг 2.5)
7. Добавьте slug в `src/components/ServiceCard.astro:animatedServices` и `src/pages/services/[slug].astro:animatedServices`, `npm run build`.

## Attachments (перетащите сюда файлы в Obsidian)

- `![[raw-image.png]]` — исходная картинка 640×640
- `![[raw-video.mp4]]` — исходное видео 4 сек (loop)
- После обработки появятся в `public/videos/services/{slug}.*` — сюда можно вставить превью:
![[Attachments/{slug}/preview.jpg|300]]

## Links

- Гайд: [[guide-final-v2.md|docs/service-animation/guide-final-v2.md §1-4]]
- Пайплайн: `scripts/service-animation/matte.py` / `scripts/service-animation/process_service.sh` / `scripts/service-animation/check_alpha_quality.py`
- Компонент: `src/components/ServiceAnimation.astro`
- Карточка услуги: `/services/{slug}`
"""
        (dir_path / f"{slug}.md").write_text(md, encoding="utf-8")
        # placeholder for attachments index
        (pathlib.Path(out) / "Attachments" / slug / ".keep").touch(exist_ok=True)
    # index
    index_md = f"""# Services — animation prompts (Obsidian vault)

> Сгенерировано из `docs/service-animation/guide-final-v2.md` ({today}). Откройте эту папку как vault в Obsidian.

## Сервисы (10)

"""
    for slug, title, tone, bucket in SERVICES:
        index_md += f"- [[services/{slug}/{slug}|{title}]] — `{slug}` — {bucket} bucket\n"
    index_md += f"""
## Использование (кратко)

1. Откройте `services/<slug>/<slug>.md` → скопируйте *Image prompt* → генерите картинку.
2. Скопируйте *Video prompt A* (или B) → генерите видео 4 сек.
3. Перетащите файлы в `Attachments/<slug>/` прямо в Obsidian.
4. Запустите `./scripts/service-animation/process_service.sh <slug> prompts/Attachments/<slug>/raw-video.mp4`
5. Проверьте `public/videos/services/<slug>.*` и добавьте в `animatedServices`.

См. `docs/service-animation/guide-final-v2.md` §3-5 для выбора фона и QA.
"""
    (out / "services" / "_index.md").write_text(index_md, encoding="utf-8")
    (out / "README.md").write_text("# Prompts vault\n\nОткройте `prompts/` как Obsidian vault.\n- `services/<slug>/<slug>.md` — copy-ready промпты на каждый из 10 услуг (тёмный `#171A20` / светлый `#D1D5DB` + MOTION A/B)\n- `Attachments/<slug>/` — сюда перетаскивайте `raw-image.png` / `raw-video.mp4` прямо в Obsidian\n\nГенератор: `python scripts/generate-prompts/generate_animation_prompts.py`\n", encoding="utf-8")
    print(f"Generated {len(SERVICES)} services into {out}/services/ + Attachments/")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=PROMPTS_OUT)
    ap.add_argument("--guide", default=GUIDE_PATH_DEFAULT)
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()
    build_files(args.out, args.guide)
