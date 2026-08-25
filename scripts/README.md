# Контент-инструмент laptopservice.uz

Пошаговая инструкция для нетехнических пользователей. Никакого кода писать не нужно — только копировать сообщения.

## Что это делает

Скрипт `content_tool.py` помогает переносить посты из Telegram-канала `@laptopservice_uz` на сайт в разделы «Кейсы» и «Сборки ПК» без автоматических вызовов AI-API.

Схема: **Скачать пост → Сгенерировать промпт → Вставить в ChatGPT/Claude → Сохранить ответ → Опубликовать**

---

## Установка (один раз)

1. Установите Python 3.10+ (есть на Windows по умолчанию).
2. Установите зависимости:

```powershell
pip install telethon pyyaml
```

3. Получите `API ID` и `API HASH` на https://my.telegram.org → API development tools → создайте приложение (любое название). Сохраните их.

4. Задайте переменные окружения (PowerShell, один раз на сессию):

```powershell
$env:TELEGRAM_API_ID="123456"
$env:TELEGRAM_API_HASH="ваш_hash"
```

5. При первом запуске `fetch-telegram` потребуется ввод номера телефона и кода из Telegram — создастся файл `scripts/laptopservice.session` (никому не передавайте).

---

## Типовой сценарий: новый кейс ремонта

### 1. Скачать свежие посты

```powershell
python scripts/content_tool.py fetch-telegram --limit 5
```

Скачает последние 5 постов в `content/_raw/telegram/<id>/`.

Каждый пост: `raw.json`, `text.txt`, `media/` (фото если были).

### 2. Сгенерировать промпт для AI

```powershell
python scripts/content_tool.py make-prompt --id 1042 --type case
```

Скрипт напечатает готовый промпт и сохранит его в `content/_raw/telegram/1042/prompt_case.txt`.

Для сборки ПК укажите `--type build`.

### 3. Получить структурированный ответ от AI

- Скопируйте весь промпт (от `Ты — помощник...` до конца).
- Вставьте в ChatGPT / Claude / локальную модель.
- Скопируйте ответ (только YAML) и сохраните в `content/_raw/telegram/1042/result.yaml`.

Важно: сохраняйте именно YAML, без ` ```yaml ` обёртки.

### 4. Импортировать в черновики

```powershell
python scripts/content_tool.py import-result --id 1042 --type case
```

Скрипт провалидирует поля и создаст черновик: `content/cases/drafts/<slug>.json`.

Для сборки: `--type build` → `content/builds/drafts/<slug>.json`.

Если есть ошибки валидации — исправьте YAML и повторите.

### 5. Проверить черновик

Откройте `content/cases/drafts/<slug>.json` в Блокноте, проверьте текст.

Социальный сниппет будет в `content/social_drafts/<slug>_social.txt`.

### 6. Опубликовать

```powershell
python scripts/content_tool.py publish --id <slug> --type case
```

Перенесёт файл из `drafts/` в `published/` и вызовет IndexNow-пинг (оповестит Яндекс/Бинг).

После этого:

- Скопируйте содержимое JSON из `published/` в `src/data/cases.ts` (или `builds.ts`) как новый элемент массива (или настройте сборку чтобы читать из `content/` напрямую — зависит от вашей реализации).
- Выполните `npm run build` локально для проверки.
- `git add .; git commit -m "add case: <slug>"; git push` — сайт обновится на GitHub Pages.

---

## Отзывы

1. Соберите отзывы (с Яндекс Карт / Google Maps) и вставьте в `content/_raw/reviews/inbox.txt`, каждый отзыв отделяйте строкой `---`.

Формат заголовка (первая строка блока): `Автор | Источник | Устройство | Дата`

Пример `inbox.txt`:

```
Азиз Каримов | Яндекс Карты | ASUS ROG Strix G15 | 2026-08-12
Огромное спасибо! Восстановили плату за день...

---
Сардор Мирзаев | Google Maps | Lenovo Legion 5 | 2026-08-10
Чистка с Honeywell PTM7950, температуры упали...
```

2. Запустите:

```powershell
python scripts/content_tool.py import-reviews
```

Отзывы появятся в `content/reviews/drafts/*.json`.

3. Проверьте и опубликуйте каждый: `python scripts/content_tool.py publish --id <slug> --type review`.

---

## Частые вопросы

**Нужен ли API-ключ Anthropic/OpenAI?** Нет. Вы копируете промпт вручную в любой чат — скрипт не вызывает AI сам.

**Что если нет Telethon?** `pip install telethon` — без него `fetch-telegram` не работает, остальные команды работают.

**Где взять ID поста?** После `fetch-telegram` посмотрите папки `content/_raw/telegram/` — имена папок и есть ID.

**Как вручную создать кейс без Telegram?** Создайте папку `content/_raw/telegram/my-custom/`, положите `raw.json` с полями `id`, `date`, `text`, затем `make-prompt --id my-custom`.

**IndexNow не срабатывает?** Проверьте файл `laptopserviceuz2026indexnowkey.txt` на сайте и ключ в `scripts/indexnow_ping.py`.

---

## Все команды

```
python scripts/content_tool.py fetch-telegram --limit 10 --channel @laptopservice_uz
python scripts/content_tool.py make-prompt --id 1042 --type case|build
python scripts/content_tool.py import-result --id 1042 --type case --file path/to/result.yaml
python scripts/content_tool.py import-reviews --clear
python scripts/content_tool.py publish --id my-case-slug --type case|build|review --no-ping
```
