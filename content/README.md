# Content — Obsidian Vault

Откройте эту папку `content/` как vault в Obsidian.

Структура для работы без лишних действий:

```
content/
  cases/     — кейсы ремонтов (1 файл = 1 кейс)
  builds/    — сборки ПК
  threads/   — лента Threads на главной
  reviews/   — отзывы
```

Каждый новый контент — **один `.md` файл** с frontmatter + оригинальные `png/jpg/webp` рядом (перетащили из Telegram/проводника/другого источника). Никакого `sync`, `public/media` или `src/assets` трогать не надо. На `npm run build` / деплое Astro сам оптимизирует в `avif/webp` и вставит `<picture>` .

## Как создать кейс (пример)

1. В Obsidian: `Новый файл` в `cases/` → `asus-rog-zephyrus.md`
2. Вставьте шаблон из `templates/cases_template.md` (или скопируйте существующий `cases/*.md`).
3. Перетащите фото прямо рядом с md файлом (например `cases/asus-rog-zephyrus.jpg` или в подпапку `cases/asus-rog-zephyrus/photo.jpg`) — в frontmatter укажите `gallery: [./photo.jpg]`.
4. Заполните поля, сохраните. Готово — при деплое Astro сам оптимизирует в `avif/webp`.

Аналогично для `builds/`, `threads/`, `reviews/`.

## Шаблоны

- `templates/cases_template.md` — ремонт
- `templates/builds_template.md` — сборка
- `templates/threads_template.md` — пост ленты
- `templates/reviews_template.md` — отзыв

Копируйте шаблон в нужный раздел и переименуйте.

## Изображения

- Кладите оригиналы `jpg/png` как есть, макс. 4000px, без пре-конвертации.
- Ссылка в frontmatter **относительно md файла**: `heroImage: ./my-photo.jpg` или `gallery: [./01.jpg, ./02.jpg]`
- Если файл рядом, Obsidian покажет превью. Astro на билде сгенерит `avif/webp` + `srcset` в `dist/_astro/`.

## Проверка

```bash
npm run build   # соберет 29 страниц + 66+ оптимизированных картинок
npm run dev     # локальный просмотр
```

Не нужно: `public/media`, `src/assets/images/media`, `scripts/sync_media.py` — оставлены только для старых данных, удалятся после миграции.
