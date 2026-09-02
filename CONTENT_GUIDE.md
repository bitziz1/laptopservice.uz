# Инструкция по контенту — Laptop Service (для человека и агента)

> **Принцип: человек/агент пишет только `*.md` файлы в `content/` с оригинальными `jpg/png/webp` рядом. Всё остальное — SEO, sitemap, OG-картинки, `llms.txt`, оптимизация изображений (`avif/webp`) — генерируется при `npm run build` (SSG). Редактирование — локально через TinaCMS (`npm run dev:tina`) или напрямую `content/**/*.md`, публикация — `git commit` → `git push` → GH Pages.**

---

## 0. Быстрый старт (TinaCMS, локально)

1. **Установка (один раз):** `npm ci` → `npm run dev:tina` (поднимает `tinacms dev -c "astro dev"`). Админка: `http://localhost:4321/admin`, сайт: `http://localhost:4321`.
2. **Создание:** в админке `Сборки / Кейсы / Лента / Отзывы` → `Create New` → заполни `Title`/`Author`+`Date` → внизу поле **Filename** автогенерируется как `base-дата` (транслит кириллицы + суффикс `-DDmmmYYYY`), можно поправить латиницей **с сохранением суффикса** → `Save`. Формат суффикса: `-26aug2026` (день известен), `-aug2026` (день неизвестен), `-2026` (месяц неизвестен). Месяцы — англ. `jan feb mar apr may jun jul aug sep oct nov dec` в нижнем регистре.
   - **Автоматика для ленты:** `python scripts/fetch_threads.py https://www.threads.com/share/BBR4vE0M6h/ --date 2026-08-30` (см. §7 «Автоматический импорт Threads») — создаст `content/threads/<slug>-DDmmmYYYY.md` + скачает `og:image` без ручной заливки.
3. **Картинки:** в поле `Обложка`/`Галерея` → `Upload` → выбери `jpg/png` (до 4000px) → путь запишется как `/content/<collection>/file-DDmmmYYYY.jpg` (colocated рядом с `.md`, **имя фото тоже с датой**). Порядок — drag ☰, удаление — 🗑.
4. **Проверка:** `npm run build` (astro check + 29 страниц + 138 картинок `avif/webp`). Пуш: `git add content/ tina/tina-lock.json` → `commit` → `push origin/master` → деплой GH Pages.

**Не трогай:** `public/`, `src/assets/`, `dist/`, `src/data/`, `.obsidian/` (игнорируется). `tina/__generated__/` и `public/admin/` — генерируются, в git не коммить. `tina/tina-lock.json` — **коммить** (нужен для `git pull` на других ПК).

```bash
npm run dev:tina   # Tina + Astro (http://localhost:4321/admin + http://localhost:4321)
npm run dev        # только Astro без админки
npm run build      # проверка + сборка 29 страниц (dist/)
npm run threads:import -- https://www.threads.com/share/BBR4vE0M6h/ --date 2026-08-30  # автоимпорт ленты
npm run threads:import:dry  # проверка без записи
```

---

## 1. Стек и что генерируется при билде

- **SSG Astro 5.18 + `astro:content` + `sharp`** — статика, без БД, `output: static`.
- **Контент:** `content/cases/*.md`, `content/builds/*.md`, `content/threads/*.md`, `content/reviews/*.md` → `src/content.config.ts` (строгая `zod` схема, `image()`).
- **Картинки:** `image()` → `astro:assets` → Sharp → `dist/_astro/*.avif` + `*.webp` + `srcset` (`widths`, `sizes`) + `fallbackFormat="webp"`. Оригиналы не попадают в `dist`. Путь — **абсолютный** `/content/<collection>/file.jpg` (colocated, один уровень).
  - `threads`: `widths=[360,720,1080]` / `[180,360,720]`
  - `cases/builds`: `widths=[400,800,1200]` / `[400,600]`
  - `reviews`: `widths=[300,600]`
- **Схемы/диаграммы — как картинки:** если нужна схема, сгенерируй её локально (например, `mermaid CLI` → `mmdc -i scheme.mmd -o scheme.png`, `draw.io`, `Excalidraw`) и добавь как обычное изображение рядом с `.md` (`/content/<collection>/scheme-DDmmmYYYY.png`), вставь в body как `![Alt](/content/.../scheme-DDmmmYYYY.png)`. Клиентский рендер `mermaid` в проекте отключён — схемы хранятся только как `jpg/png/webp/svg`.
- **SEO (автомат):**
  - `BaseLayout.astro` — `<title>`, `<meta description>`, `canonical`, `og:*`, `hreflang`, `preload /logo.svg`
  - `SchemaOrg.astro` — `ElectronicsRepairShop`, `HowTo` (из `solution`), `BreadcrumbList`
  - `astro.config.mjs` — `@astrojs/sitemap` → `dist/sitemap-index.xml` (`filter !/404`)
  - `src/pages/og/[...slug].ts` — `astro-og-canvas` → `dist/og/**/*.png` (бренд `#19BD9B`)
  - `src/pages/robots.txt.ts` + `src/pages/llms*.txt.ts` → `dist/robots.txt`, `dist/llms*.txt`
- **Статика:** `dist/` → Caddy (`Caddyfile` `file_server`, `encode zstd gzip`, `Cache-Control: immutable` для `/_astro/*`).

**Правишь только `content/**/*.md` + картинки рядом + `tina/tina-lock.json`. Всё остальное — `dist/` после билда.**

---

## 2. Структура `content/` (filename = slug + дата)

> **Стандарт слага (везде обязателен):** `filename = base + суффикс_даты` где суффикс — `-DDmmmYYYY` (`-26aug2026`), если день неизвестен — `-mmmYYYY` (`-aug2026`), если месяц неизвестен — `-YYYY` (`-2026`). Месяцы — англ. 3-буквы нижний регистр: `jan feb mar apr may jun jul aug sep oct nov dec`. Дата берётся из поля `date` в `frontmatter`. **Это касается и `.md`, и фото (`.jpg/.png/.webp`) рядом.** Legacy-префикс `2026-08-26-` у `threads` миграции убран — теперь суффикс.

```
content/
  templates/                 # примеры для ручного копирования (актуальны, суффикс -DDmmmYYYY показан)
    cases_template.md
    builds_template.md
    threads_template.md
    reviews_template.md
  cases/
    asus-tuf-a15-korotkoe-zamykanie-19v-12aug2026.md
    asus-tuf-a15-korotkoe-zamykanie-19v-12aug2026-01.jpg
  builds/
    ai-workstation-rtx4090-r9-7950x-04aug2026.md
    ai-workstation-rtx4090-r9-7950x-1-04aug2026.png
    ai-workstation-rtx4090-r9-7950x-2-04aug2026.png
  threads/
    tea-spill-26aug2026.md
    tea-spill-26aug2026.jpg
    asus-rog-strix-scar-16jun2026.md
    asus-rog-strix-scar-16jun2026.jpg
  reviews/
    rev-sergey-d-24mar2026.md
    rev-sergey-d-24mar2026.webp
    avatars/Сергей Д.-24mar2026.webp
```

**Filename = URL:** `content/cases/asus-tuf-12aug2026.md` → `/cases/asus-tuf-12aug2026/`, `content/builds/gaming-1080p-rtx4060-10aug2026.md` → `/builds/gaming-1080p-rtx4060-10aug2026/`. Отдельного поля `slug` **нет** — имя файла и есть слаг. Переименовал файл — сменился URL (делай 301 в `Caddyfile` если уже индексирован). **Суффикс даты обязателен** — без него билд невалиден по гайду, Tina его добавляет автоматически.

**Кириллица в Filename:** Tina `tina/config.ts:6` `slugify` транслитерирует (`тестовый заголовок` → `testovyi-zagolovok`, `Сергей Д.` → `rev-sergey-d`), пустого `"-.md"` не бывает. Затем `tina/config.ts:24` `dateSuffix()` добавляет `-DDmmmYYYY` / `-mmmYYYY` / `-YYYY`. Поле `Filename` внизу формы Tina — единственное место для слага, автозаполняется из `Title`/`Author`/`handle`+`date`, можно поправить латиницей вручную **но суффикс сохраняй**. Агент пишет сразу латинский `content/.../<slug>-DDmmmYYYY.md`. При смене `date` — переименуй файл и фото чтобы суффикс совпадал с `date`.

**Картинки:** путь **абсолютный** `/content/<collection>/file-DDmmmYYYY.jpg` (например `/content/cases/photo-12aug2026.jpg`), файл лежит рядом с `.md` (`content/cases/photo-12aug2026.jpg`). Tina `tina/config.ts:mediaRoot: "content"` так сохраняет. Если у поста несколько фото — добавь индекс перед суффиксом: `slug-1-DDmmmYYYY.jpg`, `slug-2-DDmmmYYYY.jpg` или `slug-DDmmmYYYY-01.jpg`. Для `threads`/`reviews` аватар/галерея — аналогично: `tea-spill-26aug2026.jpg`, `rev-sergey-d-24mar2026.webp`, `avatars/Сергей Д.-24mar2026.webp`. Старые `./photo.jpg` и `2026-08-26-xxx` смигрированы в суффикс.

---

## 3. Типы контента — поля в `frontmatter` + `body`

### 3.1 `cases` → `/cases` + `/cases/[slug]`

**Frontmatter** (`src/content.config.ts:8`):

| Поле | Тип | Обяз. | Куда попадает | Пример |
|---|---|---|---|---|
| `title` | `string` | **да** | `<title>`, `og:title`, `HowTo name` | `"ASUS TUF Gaming A15: КЗ по 19V"` |
| `device` | `string` | **да** | Подзаголовок, хлебные крошки | `"ASUS TUF Gaming A15 (FA506)"` |
| `category` | `string` | **да** | Бейдж (enum в Tina) | `"Компонентный ремонт платы"` |
| `date` | `YYYY-MM-DD` | **да** | `formatDateRu`, `sitemap` | `2026-08-12` |
| `tags` | `string[]` | нет | `#tag` | `["ASUS","КЗ 19V"]` |
| `heroImage` | `image()` | нет | Обложка `[400,800,1200]` | `/content/cases/hero.jpg` |
| `gallery` | `image[]` | нет | Галерея 1-2 фото | `[/content/cases/photo-01.jpg]` |
| `keySpecs` | `{label,value}[]` | нет | Блок «Параметры» | `label: "Линия" value: "19V"` |
| `schemaType` | `HowTo|Article` | нет | SchemaOrg | `HowTo` |
| `summaryForSocial` | `string` | нет | `meta description` fallback | `"ASUS TUF спасён..."` |
| `problem/diagnosis/solution/result` | `string` | нет | `description` + `HowTo steps` (из `solution`) | `"1. Демонтаж..."` |

**Body:**
```md
---
title: "ASUS TUF..."
device: "ASUS TUF (FA506)"
category: "Компонентный ремонт платы"
date: 2026-08-12
tags: ["ASUS","КЗ 19V"]
heroImage: /content/cases/hero.jpg
gallery: [/content/cases/photo-01.jpg]
---

## Проблема
...
## Диагностика
...
## Решение
1. ...
## Результат
...
```
Рендер в `cases/[slug].astro:110` `<Content />` (`prose`). Если `problem/solution` пусты — берётся тело.

### 3.2 `builds` → `/builds` + `/builds/[slug]`

| Поле | Тип | Обяз. | Пример |
|---|---|---|---|
| `title` | `string` | **да** | `"Рабочая станция для AI — RTX 4090"` |
| `purpose` | `gaming|ai-work|office|rendering` | **да** | `ai-work` |
| `purposeLabel` | `string` | **да** | `"AI, нейросети и 3D-рендер"` |
| `date` | `YYYY-MM-DD` | **да** | `2026-08-04` |
| `description` | `string` | **да** | `"Для LLM..."` |
| `components` | `object` | нет | `cpu: "Ryzen 9", gpu: "RTX 4090"` |
| `complexity` | `easy|medium|hard` | нет | `hard` |
| `tags` | `string[]` | нет | `["RTX 4090"]` |
| `heroImage/gallery` | `image` | нет | `/content/builds/cover.jpg` |

Тело — доп. markdown (текст + обычные картинки `![alt](/content/...jpg)`).

### 3.3 `threads` → лента на `/` (`ThreadsScroller.astro`)

| Поле | Обяз. | Пример |
|---|---|---|
| `handle` | нет | `laptopservice_uz` |
| `date` | **да** | `2026-06-16` |
| `dateLabel` | нет | `"16 июня 2026"` |
| `gallery` | нет | `[/content/threads/asus-rog-strix-scar-16jun2026.jpg]` |
| `alts` | нет | `["До и после"]` 1:1 к `gallery` |

Body = текст поста (1-3 строки, `line-clamp-3`). **Filename:** `slug-DDmmmYYYY.md` (напр. `tea-spill-26aug2026.md`, `termo-29jan2026.md`). Фото: `slug-DDmmmYYYY.jpg` / `slug-DDmmmYYYY-01.jpg`.

### 3.4 `reviews` → `/reviews`

| Поле | Обяз. | Пример |
|---|---|---|
| `author` | **да** | `"Сергей Д."` |
| `source` | нет | `Яндекс Карты` |
| `rating` | нет | `5` |
| `date` | **да** | `2026-03-24` |
| `device` | нет | `"Ноутбук"` |
| `avatar` | нет | `/content/reviews/avatars/Сергей Д.-24mar2026.webp` |
| `gallery` | нет | `[/content/reviews/rev-sergey-d-24mar2026.webp]` |
| `captions` | нет | `["Фото ремонта"]` 1:1 |

Body = текст отзыва. **Filename:** `rev-author-DDmmmYYYY.md` (напр. `rev-sergey-d-24mar2026.md`, `rev-aleksandr-t-10jul2017.md`). Аватар/галерея тоже с суффиксом.

---

## 4. Картинки (стандарт именования с датой)

- **Куда:** рядом с `.md` (`/content/<collection>/file-DDmmmYYYY.jpg`), путь **абсолютный** `/content/...` (Tina так сохраняет).
- **Именование (обязательно):** `<slug>-DDmmmYYYY.ext` или `<slug>-<idx>-DDmmmYYYY.ext` (напр. `ai-workstation-rtx4090-r9-7950x-1-04aug2026.png`, `tea-spill-26aug2026.jpg`, `rev-sergey-d-24mar2026.webp`, `Сергей Д.-24mar2026.webp`). Суффикс берётся из `date` того `.md` к которому относится фото: `-26aug2026` / `-aug2026` / `-2026` (мес. `jan feb mar apr may jun jul aug sep oct nov dec`).
- **Формат:** `jpg/png/webp` оригинал до 4000px. Sharp → `dist/_astro/*.avif|webp`.
- **В Tina:** `Обложка`/`Галерея` → `Upload` → переименуй файл заранее с суффиксом даты (или Tina предложит имя — поправь чтобы добавить `-DDmmmYYYY` перед `.jpg`) → drag ☰, delete 🗑. Порядок в `gallery` = порядок в карусели.
- **У агента:** `heroImage: /content/cases/photo-12aug2026.jpg`, `gallery: [/content/cases/photo-12aug2026-01.jpg, /content/cases/photo-12aug2026-02.jpg]`, `alts`/`captions` строго 1:1. Для `threads`/`reviews` — аналогично с суффиксом.

**Не делай:** `public/`, `src/assets/`, `dist/`, фото без суффикса даты.

---

## 5. Схемы и диаграммы — только как картинки

Клиентский рендер `mermaid` удалён из проекта (нет `src/components/Mermaid.astro`, нет зависимости `mermaid`). Если нужна схема:

1. Нарисуй локально: `mermaid CLI` (`mmdc -i diagram.mmd -o diagram.png -b transparent`), `draw.io`, `Excalidraw`, `Figma` — любой инструмент.
2. Экспортируй в `png/svg/jpg` (до 4000px, светлый/тёмный фон — на твой выбор, но учитывай тёмную тему сайта `chassis-850`).
3. Положи рядом с `.md` как обычную картинку с суффиксом даты: `/content/cases/scheme-12aug2026.png` или `/content/builds/diagram-04aug2026.jpg`.
4. Вставь в тело как `![Подпись схемы](/content/cases/scheme-12aug2026.png)` — Sharp оптимизирует в `avif/webp` как любую другую картинку.

**Не используй** блоки ````mermaid` в `content/**/*.md` — они не рендерятся и останутся как код.

---

## 6. Что генерируется из `.md`

| Куда | Как | Поля |
|---|---|---|
| **Главная** `/` | `index.astro:14` `getCollection` + `ThreadsScroller` | `title, gallery, purposeLabel, device` |
| **Списки** `/cases` `/builds` `/reviews` | `getCollection` + `CaseCard/BuildCard` | все |
| **Страницы** `/cases/[slug]` `/builds/[slug]` | `getStaticPaths` `entry.id.replace(/.md$/, "")` → `dist/.../index.html` | `title, device, category, body, gallery, keySpecs` |
| **SEO** | `BaseLayout` `title/description/canonical/og`, `SchemaOrg` `HowTo` из `solution` | `title, problem/summaryForSocial` |
| **OG** | `og/[...slug].ts` `astro-og-canvas` | `title, description` |
| **Sitemap/Robots/llms** | `astro.config.mjs` `@astrojs/sitemap`, `robots.txt.ts`, `llms*.txt.ts` | `id, date` |

**Filename = slug + дата.** Поменял имя файла — старый URL → 301 в `Caddyfile`. Суффикс `-DDmmmYYYY` обязателен.

---

## 7. Добавление / редактирование

### Человек (TinaCMS, локально)

1. `npm run dev:tina` → `http://localhost:4321/admin` → коллекция → `Create New`.
2. Заполни `Title`/`Device`/`Category`/`Date` → `Filename` внизу автозаполнится как `slug-DDmmmYYYY` (транслит + дата: `-26aug2026` / `-aug2026` / `-2026`), поправь латиницей если нужно **с сохранением суффикса**.
3. `Обложка`/`Галерея` → Upload → **файл должен уже иметь суффикс даты** (переименуй до загрузки: `photo-12aug2026.jpg`) / drag. `Alts`/`Captions` 1:1.
4. Тело — `## Проблема` и т.д. (+ обычные картинки `![alt](/content/...jpg)` по ходу повествования).
5. `Save` → `git status` → `git add content/ tina/tina-lock.json` → `commit` → `push`.

### Агент

```json
{
  "file": "content/cases/asus-tuf-a15-korotkoe-zamykanie-19v-12aug2026.md",
  "frontmatter": {
    "title": "ASUS TUF Gaming A15: КЗ по 19V (60-80 симв)",
    "device": "ASUS TUF Gaming A15 (FA506)",
    "category": "Компонентный ремонт платы",
    "date": "2026-08-12",
    "tags": ["ASUS","КЗ 19V"],
    "heroImage": "/content/cases/asus-tuf-a15-korotkoe-zamykanie-19v-12aug2026-01.jpg",
    "gallery": ["/content/cases/asus-tuf-a15-korotkoe-zamykanie-19v-12aug2026-02.jpg"],
    "keySpecs": [{"label":"Линия","value":"19V"}],
    "schemaType": "HowTo"
  },
  "body": "## Проблема\n...\n![Схема](/content/cases/scheme-12aug2026.png)\n",
  "images": [{"path":"content/cases/asus-tuf-a15-korotkoe-zamykanie-19v-12aug2026-01.jpg","maxWidth":4000}]
}
```
Пишет только `content/**/*.md` + оригиналы рядом с суффиксом даты (`-DDmmmYYYY` / `-mmmYYYY` / `-YYYY`), `tina/tina-lock.json` коммитится. Примеры: `content/threads/tea-spill-26aug2026.md` + `/content/threads/tea-spill-26aug2026.jpg`, `content/reviews/rev-sergey-d-24mar2026.md` + `avatars/Сергей Д.-24mar2026.webp`.

### Автоматический импорт Threads из `threads.com/share/*` (рекомендуемый для ленты)

Скрипт `scripts/fetch_threads.py` вытаскивает текст/картинку/канонический URL из SSR `og:description` / `og:image` / `og:url` share-ссылки (без API-ключа, без Playwright) и сразу создаёт `content/threads/<slug>-DDmmmYYYY.md` + скачивает фото.

**Что делает:**
- `slug` = `slugify(body[:80])` + `dateSuffix(date)` как в `tina/config.ts:6` / `tina/config.ts:24` (транслит, суффикс `-DDmmmYYYY` обязателен).
- `date` берётся из `--date YYYY-MM-DD` (дата сообщения в Threads), иначе из `article:published_time` в HTML, иначе `today`.
- `gallery` = один `og:image` → `/content/threads/<slug>.jpg` (для карусели — расширь `all_images` в `scripts/fetch_threads.py:36`).
- `alts[0]` = первые 80 символов `body`, `url` = канонический `https://www.threads.com/@laptopservice_uz/post/<id>`.
- Идемпотентно: если `content/threads/<slug>.md` уже есть — добавляет `-2`, `-3` перед суффиксом.

**Установка:** Python 3.10+ в системе есть. Зависимостей нет (только stdlib `urllib`).

**Использование:**

```bash
# один пост — дата = дата сообщения (как в чате: 30.08 0:48 → 2026-08-30)
python scripts/fetch_threads.py https://www.threads.com/share/BBR4vE0M6h/ --date 2026-08-30
# пачкой
python scripts/fetch_threads.py https://www.threads.com/share/BAh1FFA_8M/ --date 2026-08-30 https://www.threads.com/share/_eq_ppozf/ --date 2026-09-01
# из файла (каждая строка: URL [YYYY-MM-DD])
python scripts/fetch_threads.py --file urls.txt
# проверка без записи
python scripts/fetch_threads.py --dry-run
# npm-алиасы (package.json:6)
npm run threads:import -- https://www.threads.com/share/BBR4vE0M6h/ --date 2026-08-30
npm run threads:import:dry
```

Пример `urls.txt`:
```
https://www.threads.com/share/BBR4vE0M6h/ 2026-08-30
https://www.threads.com/share/BAh1FFA_8M/ 2026-08-30
https://www.threads.com/share/_eq_ppozf/ 2026-09-01
```

**Проверено на 3 постах (30.08–01.09.2026):**
- `BBR4vE0M6h` → `ugadayte-chto-eto-30aug2026.md/jpg` — `Угадайте, что это 👀` → `DcoSkzHAi-O`
- `BAh1FFA_8M` → `u-nas-slezy-s-glaz-nadeemsya-hozyain-ne-byl-allergikom-30aug2026` — `у нас слезы с глаз😭` → `DcqLoVKglry`
- `_eq_ppozf` → `termopasta-dolzhna-byt-pastoy-a-ne-suhoy-korkoy-01sep2026` — `Термопаста должна быть пастой…` → `DctUQqbgsqE`

**После импорта:**
```bash
npm run build   # 29 страниц, ~204 изображения (sharp → avif/webp), проверка frontmatter
git add content/threads/*.md content/threads/*.jpg
git commit -m "feat(threads): add 3 posts via fetch_threads"
git push
```

**Частые ошибки:** `download failed` → `og:image` протух (подпись `oh`/`oe` живёт ~часы), перезапусти — скрипт скачает заново; `UnicodeEncodeError` в PowerShell — в скрипте уже `sys.stdout.reconfigure(encoding='utf-8')`.

### Редактирование / удаление

- Открой файл в `tina/admin` или `content/.../*.md`, правь, `Save`. Если меняешь `date` — **переименуй файл и все его фото** чтобы суффикс `-DDmmmYYYY` совпадал (напр. `-12aug2026` → `-13aug2026`).
- Переименовал файл → сменился URL (суффикс даты — часть URL, меняй только когда меняешь дату).
- Удалил файл → страница исчезнет из `sitemap`/`og` после билда. Удали и его фото `-DDmmmYYYY.*`.

### Проверка

```bash
npm run build   # astro check + 29 страниц, Tina не участвует (static)
# Ошибки frontmatter/картинок покажет astro check
```

Частые ошибки: `image not found` → путь не `/content/...` или файл не рядом с `.md`; `InvalidContentEntryDataError` → `category/purpose` опечатка (выбирай из списка Tina).

---

## 8. Деплой

`Dockerfile` `node:22-alpine` `npm run build` → `caddy:2-alpine` `dist/`. `Caddyfile` `encode zstd gzip`, `Cache-Control: immutable` для `/_astro/*`.

Пуш в `master` → GH Actions `npm ci` → `npm run build` → `dist` → GH Pages (static, без `tina` runtime).

---

## 9. Чек-лист (стандарт -DDmmmYYYY)

- [ ] Файл `content/{cases,builds,threads,reviews}/<slug>-DDmmmYYYY.md` (латиница, `slug` + `-26aug2026` / `-aug2026` / `-2026`)
- [ ] Суффикс даты в имени файла = `date` в `frontmatter` (`2026-08-12` → `-12aug2026`, `2026-08` → `-aug2026`, `2026` → `-2026`)
- [ ] `title`, `date`, `device`/`category`/`purpose` заполнены
- [ ] `heroImage`/`gallery`/`avatar` указывают на `/content/.../<slug>-DDmmmYYYY.*` рядом с `.md` (фото тоже с суффиксом, индексы `-1-`, `-2-` перед суффиксом)
- [ ] `alts`/`captions` 1:1 к `gallery`
- [ ] `npm run build` без ошибок, `dist/sitemap-index.xml` содержит URL с суффиксом
- [ ] Проверил `/cases/<slug>-DDmmmYYYY`, `/builds/<slug>-DDmmmYYYY` (картинки и схемы-как-картинки отображаются)

---

## 10. Где что лежит

| Что | Файл | Трогать? |
|---|---|---|
| Кейсы | `content/cases/*.md` + `*.jpg` | **да** |
| Сборки | `content/builds/*.md` | **да** |
| Лента | `content/threads/*.md` | **да** |
| Отзывы | `content/reviews/*.md` | **да** |
| Шаблоны | `content/templates/*.md` | копировать (пример) |
| Tina схема | `tina/config.ts` | нет (транслит Filename) |
| Коллекции | `src/content.config.ts` | нет |
| Схемы | `*.png/*.jpg` рядом с `.md` (`![alt](/content/...png)`) | **да** (генерируй локально, вставляй как картинку) |
| SEO/layout | `src/layouts/BaseLayout.astro` | нет |
