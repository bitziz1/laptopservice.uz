# Content — Obsidian Vault

Откройте эту папку `content/` как vault в Obsidian.

Структура — **1 сущность = 1 папка с фото внутри**, папки сгруппированы по месяцам `YYYY_MM`:

```
content/
  cases/
    2026_08/
      lenovo-legion-5-bga-reballing-rtx3070-05aug2026/
        lenovo-legion-5-bga-reballing-rtx3070-05aug2026.md
        lenovo-legion-5-bga-reballing-rtx3070-05aug2026.avif
        lenovo-legion-5-bga-reballing-rtx3070-1-05aug2026.png
    2026_09/
      vosstanovlenie-dvuh-asus-rog-strix-rtx-3090-ti-lc-240-02sep2026/
        vosstanovlenie-dvuh-asus-rog-strix-rtx-3090-ti-lc-240-02sep2026.md
        vosstanovlenie-dvuh-asus-rog-strix-rtx-3090-ti-lc-240-*.jpg
  builds/
    2026_08/
      ai-workstation-rtx4090-r9-7950x-04aug2026/
        ai-workstation-rtx4090-r9-7950x-04aug2026.md
        ai-workstation-rtx4090-r9-7950x-1-04aug2026.png
  threads/
    2026_09/
      rtx3090ti-gta6-resurrected-04sep2026/
        rtx3090ti-gta6-resurrected-04sep2026.md
        rtx3090ti-gta6-resurrected-04sep2026.jpg
        vosstanovlenie-...-14-02sep2026.jpg  # 2-е фото
  reviews/
    2026_03/
      rev-sergey-d-24mar2026/
        rev-sergey-d-24mar2026.md
        rev-sergey-d-24mar2026.webp
        Сергей Д.-24mar2026.webp  # аватар
```

Каждый новый контент — **одна папка = один `.md` + оригинальные `jpg/png/webp` внутри**. Путь в frontmatter — абсолютный `/content/<collection>/<YYYY_MM>/<slug>/<file>`.

На `npm run build` / деплое Astro сам оптимизирует в `avif/webp` и вставит `<picture>`. Никакого `sync`, `public/media` или `src/assets` трогать не надо.

## Как создать кейс (пример)

1. Создайте папку `content/cases/2026_09/my-case-12sep2026/` (месяц берётся из поля `date`: `2026-09-12` → `2026_09`).
2. Внутри: `Новый файл` → `my-case-12sep2026.md` (имя папки = имя md = slug+суффикс даты).
3. Вставьте шаблон из `templates/cases_template.md`.
4. Перетащите фото прямо в эту же папку — в frontmatter укажите `heroImage: /content/cases/2026_09/my-case-12sep2026/photo.jpg`, `gallery: [/content/cases/2026_09/my-case-12sep2026/02.jpg]`.
5. Заполните поля, сохраните. Готово.

Аналогично для `builds/`, `threads/`, `reviews/`. Для `threads` можно автоматом: `python scripts/fetch_threads.py https://www.threads.com/share/XXX/ --date 2026-09-04` — скрипт сам создаст `content/threads/2026_09/<slug>/<slug>.md` + скачает фото.

## Шаблоны

- `templates/cases_template.md` — ремонт
- `templates/builds_template.md` — сборка
- `templates/threads_template.md` — пост ленты
- `templates/reviews_template.md` — отзыв

Копируйте шаблон в нужную папку `YYYY_MM/<slug>/` и переименуйте.

## Изображения

- Кладите оригиналы `jpg/png/webp` как есть, макс. 4000px, без пре-конвертации, в ту же папку что и `.md`.
- Ссылка в frontmatter — абсолютный путь: `/content/cases/2026_09/<slug>/photo.jpg` (файл лежит в той же папке, Astro оптимизирует).
- Если файл рядом, Obsidian покажет превью. Astro на билде сгенерит `avif/webp` + `srcset` в `dist/_astro/`.

## Проверка

```bash
npm run build   # соберет страницы + оптимизированные картинки
npm run dev     # локальный просмотр
```

Не нужно: `public/media`, `src/assets/images/media` — удалены.
