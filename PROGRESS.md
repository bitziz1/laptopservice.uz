# Журнал реализации проекта laptopservice.uz

## Текущий статус: [ГОТОВО] Все требования и корректировки выполнены

---

### Реализованные изменения:
1. **Точные контакты и ссылки**:
   - Яндекс Карты: `https://yandex.com/maps/org/laptop_service/81659688745`
   - Google Maps: `https://maps.app.goo.gl/nhNuRttDTpXGpabW7`
   - Телефон сервиса: `+998(93)228-77-38`
   - Telegram сервиса: `https://t.me/remontnoutbukov_uz` (@remontnoutbukov_uz)
   - Руководитель сервиса Руслан: `+998(90)358-77-38` / `@remontnoutbukov_uz` (строго по делу, только на странице контактов)
   - Telegram канал: `https://t.me/laptopservice_uz`
   - Telegram чат: `https://t.me/laptop_service_chat`
   - Facebook: `https://www.facebook.com/RemontNoutbukov.uz`
   - Instagram: `https://www.instagram.com/laptopservice_uz`

2. **Отказ от форм на сайте и прямой CTA**:
   - Полностью удалены формы заявок и модальные окна.
   - Все кнопки на сайте ведут на звонок `+998(93)228-77-38` или в Telegram `@remontnoutbukov_uz` (без упоминания имени мастера, через IconLink).

3. **Переработка ценовой политики и копирайта**:
   - Удалены конкретные диапазоны цен на услуги (цены индивидуальны).
   - Сделан четкий акцент: **цена ремонта определяется после диагностики и ВСЕГДА согласуется строго ДО начала работ**.
   - Добавлена информация о приеме ноутбуков лично на ул. Паркент 11 или отправке через Яндекс Доставку / курьером.

4. **Терминология и тон**:
   - Всюду слово «лаборатория» заменено на **«сервисный центр»**.
   - Блок про мастера Руслана переписан в спокойный, уважительный и профессиональный инженерный тон без агрессивного маркетинга.
   - В отзывах добавлена поддержка фото выполненных работ.

5. **Минималистичный промышленный дизайн (Chassis Grayscale)**:
   - Полностью убраны цветные градиенты, неоновые подсветки и визуальный шум.
   - Использована нейтральная градация серого цвета (матовый титан / магниевый корпус ноутбука, без выжигающего белого и угольно-черного).
   - Чистая, контрастная типографика с моноширинными акцентами для технических параметров.

6. **Аналитика и Менеджер тегов**:
   - Внедрен контейнер **Google Tag Manager** (`GTM-MHDMSHWH`) в `<head>` и `<noscript>` сразу после `<body>`.

7. **Инфраструктура и Деплой**:
   - Подготовлен Ansible Playbook (`ansible/playbook.yml`) для автоматического развертывания на чистый Ubuntu 24.04 LTS VPS с Docker и Caddy.
   - Подготовлены инструкции для локального запуска на Windows.

8. **IconLink — единый компонент ссылок с иконками (Задача A)**:
   - Создан `src/components/IconLink.astro` с вариантами `button`/`inline`/`icon-only`, поддержка `telegram`, `phone`, `instagram`, `facebook`, `yandex-maps`, `google-maps` (SVG из `public/`).
   - Заменены все голые текстовые ссылки на `IconLink` в `Header.astro`, `Footer.astro`, `MasterBadge.astro`, `pages/index.astro` (hero, блок отзывов, адресный блок), `pages/contacts.astro`, `pages/cases/[slug].astro`, `pages/services/[slug].astro`, `pages/services/index.astro`.
   - Логотип в шапке/подвале заменён на `public/logo.svg`, favicon обновлён, добавлены `phone.svg`, `Telegram_Logo.svg` и др.

9. **Сборки ПК и расширенный апгрейд (Задача B)**:
   - Создан `src/data/builds.ts` (`BuildItem`, типы `gaming|ai-work|office|rendering`) с 3 примерами: игровая RTX 4060, AI-станция RTX 4090, офисная i5-12400.
   - `src/components/BuildCard.astro`, `src/pages/builds/index.astro` (фильтр по purpose), `src/pages/builds/[slug].astro` (таблица компонентов + Schema.org Product/Offer).
   - Расширен `src/data/services.ts` → `upgrade-noutbuka`: добавлены замена матрицы/клавиатуры/аккумулятора, расширены `symptoms`/`stages`/`faq`.
   - Навигация: «Сборки ПК» в `Header`, ссылка в `Footer`, блок-preview на `pages/index.astro`, баннер на `pages/services/index.astro`.
   - `scripts/indexnow_ping.py` дополнен URL `/builds` и слагов.

10. **Контент-инструмент без AI-API (Задача C)**:
   - Переработан `scripts/telegram_ingest.py` в `scripts/content_tool.py` — CLI с командами `fetch-telegram` (реальный Telethon, сохраняет в `content/_raw/telegram/<id>/`), `make-prompt --id --type case|build` (печатает промпт), `import-result --id` (валидирует YAML → `content/cases|builds/drafts/`), `import-reviews` (парсит `content/_raw/reviews/inbox.txt` → `content/reviews/drafts/`), `publish --id --type` (перемещает в `published/` + IndexNow пинг).
   - Добавлен `scripts/README.md` с пошаговой инструкцией для нетехнического пользователя.

11. **Типографика self-hosted (Задача D)**:
   - Скачаны woff2 в `public/fonts/`: `Inter-Regular`, `Inter-Bold`, `Inter-ExtraBold`, `JetBrainsMono-Regular`, `JetBrainsMono-Bold`.
   - `src/styles/global.css` — добавлены 5 `@font-face` с `font-display: swap`.
   - `tailwind.config.mjs` — задана единая шкала `fontSize` (2xs–5xl) + `fontFamily.sans/mono`.
   - Пройдены все `src/components/` и `src/pages/`: `font-mono` убран из навигации/кнопок/лейблов, оставлен только для технических таблиц (`keySpecs`, компоненты сборок) и цен (`PriceTable`, `BuildCard` price).

12. **Последние правки по ТЗ заказчика (август 2026)**:
   - **Терминология**: везде «Кейсы» заменено на «Наши работы» (навигация, заголовки, breadcrumbs, `cases/index`, `cases/[slug]`, главная).
   - **Иконки**: все контактные и CTA-ссылки переведены на `IconLink` — `reviews.astro`, `about.astro`, `prices.astro`/`PriceTable`, `cases/index`, `ServiceCard`; иконки для Telegram/phone/maps/instagram/facebook/yandex/google теперь единообразны.
   - **Сроки/цены → сложность**: из `ServiceItem` и `BuildItem` удалены поля `timeRange`/`warranty`/`price`; добавлены `complexity: easy|medium|hard` и конфиги `complexityConfig`/`buildComplexityConfig` с бейджами: Легкий (зеленый `emerald`), Стандартный (желтый `amber`), Сложный (красный `red`); обновлены `ServiceCard`, `BuildCard`, `services/[slug]`, `builds/[slug]`; скрипт `content_tool.py` валидирует `complexity` вместо `price`.
   - **Руслан**: удалены все упоминания вне контактов (`MasterBadge`, `about`, `index`, `services.ts`, `SchemaOrg`, `i18n`, `reviews`); в `contacts.astro` добавлен отдельный блок «Руководитель сервиса — Руслан» с `+998 (90) 358-77-38` и `@remontnoutbukov_uz` (строго по делу); `siteConfig` дополнен объектом `manager` и обновлён `telegram.masterHandle` на `@remontnoutbukov_uz`, CTA-лейблы стали нейтральными («Написать в Telegram», «Позвонить»).