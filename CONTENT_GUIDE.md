# Инструкция по контенту — Laptop Service (для человека и агента)

> **Принцип: человек/агент пишет только `*.md` файлы в `content/` с оригинальными `jpg/png` рядом. Всё остальное — SEO, sitemap, OG-картинки, `llms.txt`, оптимизация изображений — генерируется автоматически при `npm run build` (SSG).**

---

## 0. Быстрый старт (3 шага)

1. Открой папку `content/` как vault в Obsidian (или любым редактором). Создай файл из шаблона в `content/templates/`.
2. Перетащи оригиналы `jpg/png` (до 4000px, без сжатия) рядом с `.md` файлом, укажи их в `gallery`/`heroImage`.
3. Сохрани, проверь `npm run dev` → `npm run build` → деплой. Готово.

**Ничего не трогай в `public/`, `src/assets/`, `dist/`, `src/data/`. Не делай `sync`, не конвертируй в `webp` вручную.**

```bash
npm run dev     # предпросмотр http://localhost:4321
npm run build   # проверка + сборка 29 статических страниц + 70+ картинок avif/webp
# astro check — валидация frontmatter и картинок
```

---

## 1. Стек и что генерируется при билде

- **SSG Astro 5.18 + `astro:content` (content collections) + `sharp`** — сайт полностью статический, без БД.
- **Контент:** `content/cases/*.md`, `content/builds/*.md`, `content/threads/*.md`, `content/reviews/*.md` → коллекции `src/content.config.ts`.
- **Картинки:** `image()` в frontmatter → `import.meta.glob` → Sharp на билде → `dist/_astro/*.avif` + `*.webp` + `srcset` (`widths`, `sizes`) + `fallbackFormat="webp"`. Оригиналы не попадают в `dist` как есть.
- **SEO (автомат):**
  - `BaseLayout.astro:52` — `<title>`, `<meta description>`, `canonical`, `og:*`, `twitter:*`, `hreflang`, `preload /logo.svg`
  - `SchemaOrg.astro` — `ElectronicsRepairShop`, `Service`, `HowTo` (из `solution`), `FAQPage`, `BreadcrumbList`
  - `astro.config.mjs:24` — `@astrojs/sitemap` → `dist/sitemap-index.xml` + `sitemap-0.xml` (фильтр `!/404`, `changefreq:weekly`)
  - `src/pages/og/[...slug].ts` — `astro-og-canvas` → `dist/og/**/*.png` (бренд `#19BD9B`, шрифты `DejaVuSans`, лого `/public/logo-og.png`) для каждой страницы/case/build/service
  - `src/pages/robots.txt.ts` — `Allow`, `Sitemap`, разрешения для `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Yandex`
  - `public/llms.txt` + `public/llms-full.txt` — **сейчас статика в `public/`**, при билде должны пересобираться из коллекций (см. раздел 5) → `dist/llms.txt` для LLM-краулеров
  - `src/layouts/BaseLayout.astro:18` — `type` (`LocalBusiness`/`HowTo`/`Service`/`FAQPage`) → влияет на Schema
- **Статика:** `dist/` → Caddy (`Caddyfile` `file_server`, `encode zstd gzip`, `Cache-Control: immutable` для `/_astro/*, *.webp, *.avif`)

**Человек/агент правит только `content/**/*.md` + картинки. Всё остальное — `dist/` после билда.**

---

## 2. Структура `content/` (Obsidian vault)

```
content/
  README.md                # краткая памятка (эта инструкция — полная)
  templates/
    cases_template.md      # шаблон кейса
    builds_template.md     # шаблон сборки
    threads_template.md    # шаблон поста ленты
    reviews_template.md    # шаблон отзыва
  cases/
    asus-tuf-a15-korotkoe-zamykanie-19v.md
    lenovo-legion-5-bga-reballing-rtx3070.md
    lenovo-legion-5-bga-reballing-rtx3070-1.png  # оригинал рядом с md
    lenovo-legion-5-bga-reballing-rtx3070-2.png
    ...
  builds/
    ai-workstation-rtx4090-r9-7950x.md
    ai-workstation-rtx4090-r9-7950x-1.png
    ...
  threads/
    2026-06-16-asus-rog-strix-scar.md
    01-before-after.jpg
    ...
  reviews/
    rev-sergey-d.md
    rev-sergey-d.webp
    ...
```

**Obsidian:** `File → Open vault → выбери папку content`. В `Settings → Files & Links → Default location for new attachments → Same folder as current file` — чтобы перетаскивание клало картинки рядом с `.md`.

**Slug:** если в frontmatter нет `slug`, берётся имя файла без `.md`. `asus-tuf.md` → `/cases/asus-tuf/`. Меняй имя файла — меняется URL (делай 301 в `Caddyfile` если уже был проиндексирован).

---

## 3. Типы контента — все поля в `frontmatter` + `body`

### 3.1 `cases` — кейсы ремонтов (`content/cases/*.md`) → `/cases` + `/cases/[slug]` + главная лента

**Frontmatter** (`src/content.config.ts:8`):

| Поле | Тип | Обяз. | SEO / куда попадает | Пример |
|---|---|---|---|---|
| `title` | `string` | **да** | `<title>`, `<h1>`, `og:title`, `sitemap`, `llms-full.txt`, `HowTo name` | `"ASUS TUF Gaming A15: КЗ по 19V"` |
| `device` | `string` | **да** | Подзаголовок, хлебные крошки | `"ASUS TUF Gaming A15 (FA506)"` |
| `category` | `string` | **да** | Бейдж, фильтр | `"Компонентный ремонт платы"` |
| `date` | `YYYY-MM-DD` | **да** | `<time datetime>`, `formatDateRu`, сортировка, `sitemap lastmod`, `og` | `2026-08-12` |
| `tags` | `string[]` | нет | Карточки ` #tag`, `og`, `llms` | `["ASUS","КЗ 19V"]` |
| `heroImage` | `image()` | нет | Обложка, `<Picture>` 1 картинка | `./hero.jpg` |
| `gallery` | `image[]` | нет | Галерея 1-2 фото, `Picture widths=[400,800,1200]` | `[./photo-01.jpg, ./photo-02.jpg]` |
| `keySpecs` | `{label,value}[]` | нет | Блок «Параметры ремонта» | `- label: "Линия" value: "19V"` |
| `schemaType` | `"HowTo" \| "Article"` | нет | `SchemaOrg` `HowTo` vs `Article` | `HowTo` (default) |
| `summaryForSocial` | `string` | нет | `meta description` fallback, `og:description` если нет `problem` | `"ASUS TUF спасён..."` |
| `problem` | `string` | нет | `description` (первые 150 симв.), секция `01` | `"Ноутбук погас..."` |
| `diagnosis` | `string` | нет | Секция `02` | `"Замер B+ 0.1 Ом..."` |
| `solution` | `string` | нет | `howToSteps` (разбивка по `\n`), секция `03` | `"1. Демонтаж...\n2. Проверка..."` |
| `result` | `string` | нет | Секция `04` | `"КЗ устранено..."` |
| `slug` | `string` | нет | Переопределяет имя файла | `"my-custom-slug"` |

**Body (Markdown):**
```md
---
title: "ASUS TUF..."
device: "ASUS TUF (FA506)"
category: "Компонентный ремонт платы"
date: 2026-08-12
tags: ["ASUS","КЗ 19V"]
gallery:
  - ./photo-01.jpg
keySpecs:
  - label: "Линия" 
    value: "19V"
---

## Проблема
Ноутбук погас...

## Диагностика
Замер B+ 0.1 Ом...

## Решение
1. Демонтаж...
2. ...

## Результат
КЗ устранено...
```
Тело рендерится в `cases/[slug].astro:112` `<Content />` внутри `prose`. Если `problem/diagnosis/solution/result` в frontmatter пусты — берётся тело.

**SEO:** `BaseLayout:37` `title`, `description` (из `problem`/`summaryForSocial`), `breadcrumbs`, `HowTo` steps из `solution` → `SchemaOrg.astro:116`, `og/[slug].png`.

### 3.2 `builds` — сборки ПК (`content/builds/*.md`) → `/builds` + `/builds/[slug]`

| Поле | Тип | Обяз. | SEO | Пример |
|---|---|---|---|---|
| `title` | `string` | **да** | `<title>`, `og` | `"Рабочая станция для AI — RTX 4090 + Ryzen 9"` |
| `purpose` | `gaming\|ai-work\|office\|rendering` | **да** | Фильтр на `/builds`, `Product category` | `ai-work` |
| `purposeLabel` | `string` | **да** | Бейдж | `"AI, нейросети и 3D-рендер"` |
| `date` | `YYYY-MM-DD` | **да** | Сортировка, `sitemap` | `2026-08-04` |
| `description` | `string` | **да** | `meta description`, `Product description` | `"Для LLM, Stable Diffusion..."` |
| `components` | `object` | нет | Таблица «Состав» | `cpu: "Ryzen 9...", gpu: "RTX 4090..."` |
| `complexity` | `easy\|medium\|hard` | нет | Бейдж | `hard` |
| `tags` | `string[]` | нет | `#tag` | `["RTX 4090"]` |
| `heroImage/gallery` | `image` | нет | `<Picture>` | `./cover.jpg` |

Тело — доп. markdown (рендерится под галереей).

### 3.3 `threads` — лента на главной (`content/threads/*.md`) → `ThreadsScroller.astro` на `/`

| Поле | Обяз. | SEO | Пример |
|---|---|---|---|
| `handle` | нет | Бейдж | `laptopservice_uz` (default) |
| `date` | **да** | `<time>`, сортировка `desc` | `2026-06-16` |
| `dateLabel` | нет | Переопределяет `formatDateRu` | `"16 июня 2026"` |
| `gallery` | нет | `<Picture widths=[360,720,1080]>` | `[./01-before-after.jpg]` |
| `alts` | нет | `alt` 1-к-1 к `gallery` | `["До и после чистки"]` |

**Body = текст поста** (1-3 строки, `line-clamp-3`). Пример `content/threads/2026-06-16-asus-rog-strix-scar.md` — см. выше.

Сортировка `desc` по `date` в `ThreadsScroller.astro:14`.

### 3.4 `reviews` — отзывы (`content/reviews/*.md`) → `/reviews` + главная

| Поле | Обяз. | SEO | Пример |
|---|---|---|---|
| `author` | **да** | Карточка | `"Сергей Д."` |
| `source` | нет | Бейдж | `Яндекс Карты` (enum) |
| `rating` | нет | `★★★★★` | `5` |
| `date` | **да** | Сортировка | `2026-03-24` |
| `device` | нет | Подпись | `"Ноутбук"` |
| `gallery` | нет | `<Picture>` фото ремонта | `[./photo.jpg]` |
| `captions` | нет | Подпись под фото | `["Фото ремонта"]` |

Body = текст отзыва (`entry.body`).

---

## 4. Картинки — только оригиналы

- **Куда класть:** рядом с `.md` файлом (`./photo.jpg` или `./sub/photo.jpg`). Путь в frontmatter **относительно `.md` файла**.
- **Формат:** `jpg/png/webp/avif` оригинал, до 4000px, без ручной конвертации. Не клади в `public/` или `src/assets/`.
- **Оптимизация:** `src/content.config.ts:10` `image()` → `astro:assets` → Sharp при `build` → `dist/_astro/*.avif` + `*.webp` + `srcset` (`widths` в компонентах) + `fallbackFormat="webp"` (без `png` фолбэка).
  - `threads`: `widths=[360,720,1080]` / `[180,360,720]`, `sizes="(max-width:640px) 260px,280px"`
  - `cases/builds`: `widths=[400,800,1200]` / `[400,600]`
  - `reviews`: `widths=[300,600]`
- **В Obsidian:** перетащи файл — появится `./photo.jpg`, превью сразу. В `md` пиши `gallery: [./photo.jpg]` (+ `alts`).

**Не делай:** `public/media`, `src/assets/images/media`, `scripts/sync_media.py` — удалены.

---

## 5. Что генерируется из твоего `.md` (SEO/LLM)

Напишешь `.md` — при билде появится везде:

| Куда | Как генерится | Поля из `.md` |
|---|---|---|
| **Главная** `/` | `src/pages/index.astro:14` `getCollection("cases|builds|reviews")` + `ThreadsScroller` | `title, gallery, purposeLabel, device, date, tags` |
| **Списки** `/cases`, `/builds`, `/reviews` | `src/pages/cases/index.astro:3`, `builds/index.astro:3`, `reviews.astro:3` `getCollection` + `CaseCard/BuildCard/ReviewCard` | все |
| **Страницы** `/cases/[slug]`, `/builds/[slug]` | `getStaticPaths` из коллекций → `dist/cases/<slug>/index.html` | `title, device, category, date, problem/diagnosis/solution/result` (+ `body`), `gallery`, `keySpecs`, `tags` |
| **SEO meta** | `BaseLayout.astro:57` `title`, `description`, `canonical`, `og:image` | `title`, `problem/summaryForSocial/description` |
| **Schema.org** | `SchemaOrg.astro` `ElectronicsRepairShop` + `HowTo` (из `solution` → `howToSteps`) + `BreadcrumbList` + `FAQPage` | `schemaType, solution, title, description` |
| **OG картинки** | `src/pages/og/[...slug].ts` `astro-og-canvas` → `dist/og/**/*.png` (`#19BD9B`, `DejaVuSans`) | `title, description` |
| **Sitemap** | `astro.config.mjs:24` `@astrojs/sitemap` → `dist/sitemap-index.xml` | `slug, date` |
| **Robots** | `src/pages/robots.txt.ts` | `Sitemap: + Allow GPTBot/ClaudeBot/PerplexityBot/CCBot/Yandex` |
| **llms.txt** | `public/llms.txt` (сейчас статика) → **должен генериться** из коллекций при билде `src/pages/llms.txt.ts` | `title, device, category, tags` (раздел 6) |
| **llms-full.txt** | `public/llms-full.txt` — полный контекст для LLM | все поля + примеры работ |

**Правило:** `slug` из имени файла или `slug:` в frontmatter. Поменял — старый URL 301 добавь в `Caddyfile`.

---

## 6. `llms.txt` / `llms-full.txt` — LLM SEO

Сейчас `public/llms.txt:1` и `public/llms-full.txt:1` — **статика**. Для автоподгрузки нового контента сделай динамическую генерацию (аналогично `robots.txt.ts`):

**`src/pages/llms.txt.ts` (пример, создай):**
```ts
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
export const GET: APIRoute = async () => {
  const cases = await getCollection("cases");
  const builds = await getCollection("builds");
  const body = `# Laptop Service
> ${cases.length} кейсов, ${builds.length} сборок...
## Наши работы
${cases.map(c=>`- [${c.data.title}](https://laptopservice.uz/cases/${c.id.replace(/\.md$/,"")}) — ${c.data.device}`).join("\n")}
## Сборки
${builds.map(b=>`- [${b.data.title}](https://laptopservice.uz/builds/${b.id.replace(/\.md$/,"")})`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
```
Аналогично `llms-full.txt.ts` — добавь `siteConfig`, `servicesData`, `keySpecs`, полный текст `body`.

После создания `src/pages/llms.txt.ts` удали `public/llms.txt` (иначе `public` скопируется поверх `dist`). Или оставь как fallback — `dist/llms.txt` из маршрута переопределит.

---

## 7. Добавление / редактирование — пошагово (Obsidian)

### Кейс
1. Скопируй `content/templates/cases_template.md` → `content/cases/novyy-keis.md`
2. Перетащи 1-2 оригинальных фото рядом → `content/cases/novyy-keis-1.jpg`
3. Заполни frontmatter:
   ```yaml
   title: "Lenovo Legion: ..."
   device: "Lenovo Legion 5 Pro (16ACH6H)"
   category: "BGA-пайка и реболлинг"
   date: 2026-08-20
   tags: ["Lenovo","BGA"]
   gallery:
     - ./novyy-keis-1.jpg
   keySpecs:
     - label: "Чип" 
       value: "GDDR6"
   ```
4. Тело — секции `## Проблема` / `## Диагностика` / `## Решение` / `## Результат` (см. существующие `content/cases/*.md`).
5. Сохрани.

### Сборка / Threads / Отзыв — аналогично из `content/templates/`.

### Редактирование
- Открой `content/cases/<slug>.md` в Obsidian, правь frontmatter или тело, сохрани.
- Переименовал файл — сменился `slug`/URL.
- Удалил файл — страница исчезнет из `sitemap`/`og`/`llms` после билда.
- Заменил картинку — перезапиши файл с тем же именем, билд пересоберёт `avif/webp`.

### Проверка
```bash
npm run dev          # http://localhost:4321 — смотри главную, /cases, /builds, /reviews
npm run build        # astro check + build → dist/ (29 страниц)
# Ошибки frontmatter / картинок покажет `astro check`
```

### Частые ошибки
- `image not found` → путь в `gallery` не относительно `.md` файла.
- `InvalidContentEntryDataError: problem: Required` → у `cases` сделай `problem` не в frontmatter, а в теле `## Проблема` (схема `optional`), или добавь `problem: "..."` в frontmatter.
- `slug` дублируется → два файла с одним `slug` / именем — переименуй.

---

## 8. Деплой

`Dockerfile` → `node:22-alpine` `npm run build` → `caddy:2-alpine` `file_server` `dist/`. `Caddyfile` — `encode zstd gzip`, `Cache-Control: immutable` для `/_astro/*, *.avif, *.webp`, `try_files {path} {path}/ /404.html`.

Пуш в `main` → CI `npm run build` → `dist` → прод.

---

## 9. Чек-лист для агента/человека

- [ ] Файл в `content/{cases,builds,threads,reviews}/*.md` из шаблона
- [ ] `title`, `date` (YYYY-MM-DD), `device`/`category`/`purpose` заполнены
- [ ] `gallery` указывает на существующий `./*.jpg` рядом
- [ ] `alts`/`captions` совпадают по количеству с `gallery`
- [ ] `tags` 2-5, `slug` латиницей если переопределяешь
- [ ] `npm run build` без ошибок, `dist/_astro/*.{avif,webp}` появились, `dist/sitemap-index.xml` содержит новый URL, `dist/llms.txt` обновлён
- [ ] Проверил `/cases/<slug>`, `/builds/<slug>`, главную ленту

---

## 10. Для агента — машинный формат

```json
{
  "task": "create_case",
  "file": "content/cases/<slug>.md",
  "frontmatter": {
    "title": "string, 60-80 симв, включает устройство и проблему",
    "device": "string, точная модель",
    "category": "Компонентный ремонт платы | BGA-пайка и реболлинг | Восстановление после залития | Ремонт петель и корпуса | Профилактика и охлаждение | Прошивка BIOS / EC | Разъемы и пайка",
    "date": "YYYY-MM-DD",
    "tags": ["string"],
    "gallery": ["./photo.jpg"],
    "keySpecs": [{"label":"string","value":"string"}],
    "schemaType": "HowTo"
  },
  "body": "## Проблема\n...\n## Диагностика\n...\n## Решение\n1. ...\n## Результат\n...",
  "images": [{"path":"content/cases/photo.jpg","alt":"string","maxWidth":4000}]
}
```

Агент **только** пишет `content/**/*.md` + кладёт оригиналы `jpg/png` рядом. Не трогает `public/`, `src/`, `dist/`, не запускает `sharp` вручную.

---

## 11. Где что лежит (шпаргалка)

| Что | Файл | Трогать? |
|---|---|---|
| Кейсы | `content/cases/*.md` + `*.jpg` | **да** |
| Сборки | `content/builds/*.md` + `*.png` | **да** |
| Лента | `content/threads/*.md` + `*.jpg` | **да** |
| Отзывы | `content/reviews/*.md` + `*.webp` | **да** |
| Шаблоны | `content/templates/*.md` | копировать |
| Конфиг коллекций | `src/content.config.ts` | нет (если не добавляешь тип) |
| SEO layout | `src/layouts/BaseLayout.astro` | нет |
| Schema | `src/components/SchemaOrg.astro` | нет |
| Sitemap | `astro.config.mjs` | нет |
| OG | `src/pages/og/[...slug].ts` | нет |
| Robots | `src/pages/robots.txt.ts` | нет |
| llms | `public/llms*.txt` → `src/pages/llms.txt.ts` | нет (генеритcя) |

Вопросы — смотри `content/README.md` (кратко) и примеры `content/cases/*.md`.
