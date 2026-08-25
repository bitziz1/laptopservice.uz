#!/usr/bin/env python3
"""
Content Tool for laptopservice.uz

CLI для работы с контентом без прямого вызова LLM API.
Подход: fetch -> make-prompt (копируешь в ChatGPT/Claude вручную) -> import-result -> publish

Команды:
  fetch-telegram  — скачать посты из Telegram-канала через Telethon
  make-prompt     — сгенерировать промпт для AI на основе сырого поста
  import-result   — провалидировать YAML-ответ AI и сохранить в drafts
  import-reviews  — разобрать inbox с отзывами
  publish         — перенести из drafts в published и дернуть IndexNow

Автор: laptopservice.uz
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
RAW_TELEGRAM = ROOT / "content" / "_raw" / "telegram"
RAW_REVIEWS = ROOT / "content" / "_raw" / "reviews"
CASES_DRAFTS = ROOT / "content" / "cases" / "drafts"
CASES_PUBLISHED = ROOT / "content" / "cases" / "published"
BUILDS_DRAFTS = ROOT / "content" / "builds" / "drafts"
BUILDS_PUBLISHED = ROOT / "content" / "builds" / "published"
REVIEWS_DRAFTS = ROOT / "content" / "reviews" / "drafts"
REVIEWS_PUBLISHED = ROOT / "content" / "reviews" / "published"
SOCIAL_DRAFTS = ROOT / "content" / "social_drafts"

# Ensure base dirs exist
for p in [RAW_TELEGRAM, RAW_REVIEWS, CASES_DRAFTS, CASES_PUBLISHED, BUILDS_DRAFTS, BUILDS_PUBLISHED, REVIEWS_DRAFTS, REVIEWS_PUBLISHED, SOCIAL_DRAFTS]:
    p.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    translit = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', ' ': '-',
        '—': '-', '–': '-', '_': '-',
    }
    s = text.lower()
    out = []
    for ch in s:
        if ch in translit:
            out.append(translit[ch])
        elif ch.isalnum() or ch == '-':
            out.append(ch)
        elif ch in ('/', '\\', '.', ',', ':', ';'):
            out.append('-')
    res = ''.join(out)
    res = re.sub(r'-+', '-', res).strip('-')
    return res[:80] if len(res) > 80 else res


def load_yaml(path: Path) -> dict:
    """Load YAML without requiring PyYAML if not installed (fallback to simple parser)."""
    try:
        import yaml  # type: ignore
        with open(path, encoding="utf-8") as f:
            data = yaml.safe_load(f)
            if not isinstance(data, dict):
                raise ValueError("YAML root must be a mapping")
            return data
    except ImportError:
        # Very naive fallback: parse key: value lines
        print("[!] PyYAML не установлен — используем упрощённый парсер. Установите: pip install pyyaml", file=sys.stderr)
        data: dict[str, Any] = {}
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if ":" not in line:
                    continue
                k, v = line.split(":", 1)
                data[k.strip()] = v.strip().strip('"').strip("'")
        return data


def validate_case(data: dict) -> list[str]:
    required = ["slug", "title", "device", "category", "date", "problem", "diagnosis", "solution", "result", "tags"]
    errors = []
    for f in required:
        if not data.get(f):
            errors.append(f"Поле '{f}' обязательно")
    # date format
    if data.get("date") and not re.match(r"^\d{4}-\d{2}-\d{2}$", str(data["date"])):
        errors.append("Поле 'date' должно быть в формате YYYY-MM-DD")
    if data.get("tags") and not isinstance(data["tags"], list):
        errors.append("Поле 'tags' должно быть списком")
    if data.get("keySpecs") and not isinstance(data["keySpecs"], list):
        errors.append("Поле 'keySpecs' должно быть списком объектов {label, value}")
    return errors


def validate_build(data: dict) -> list[str]:
    required = ["slug", "title", "purpose", "purposeLabel", "date", "description", "components", "price", "tags"]
    errors = []
    for f in required:
        if not data.get(f):
            errors.append(f"Поле '{f}' обязательно")
    if data.get("purpose") and data["purpose"] not in ("gaming", "ai-work", "office", "rendering"):
        errors.append("purpose должен быть gaming | ai-work | office | rendering")
    if data.get("date") and not re.match(r"^\d{4}-\d{2}-\d{2}$", str(data["date"])):
        errors.append("date должен быть YYYY-MM-DD")
    if data.get("tags") and not isinstance(data["tags"], list):
        errors.append("tags должен быть списком")
    if data.get("components") and not isinstance(data["components"], dict):
        errors.append("components должен быть объектом")
    return errors


# ---------------------------------------------------------------------------
# fetch-telegram
# ---------------------------------------------------------------------------

def cmd_fetch_telegram(args: argparse.Namespace) -> None:
    """
    Скачивает последние посты из Telegram-канала через Telethon.
    Требует env: TELEGRAM_API_ID, TELEGRAM_API_HASH
    Сессия сохраняется в scripts/laptopservice.session
    """
    try:
        from telethon import TelegramClient  # type: ignore
        from telethon.tl.types import Message  # type: ignore
    except ImportError:
        print("[ERROR] Telethon не установлен.", file=sys.stderr)
        print("  pip install telethon", file=sys.stderr)
        print("  Затем задайте env TELEGRAM_API_ID и TELEGRAM_API_HASH (см. https://my.telegram.org)", file=sys.stderr)
        sys.exit(1)

    import os
    api_id = os.environ.get("TELEGRAM_API_ID") or args.api_id
    api_hash = os.environ.get("TELEGRAM_API_HASH") or args.api_hash
    channel = args.channel or os.environ.get("TELEGRAM_CHANNEL") or "@laptopservice_uz"

    if not api_id or not api_hash:
        print("[ERROR] Нужны TELEGRAM_API_ID и TELEGRAM_API_HASH.", file=sys.stderr)
        print("  Экспорт: $env:TELEGRAM_API_ID='12345'; $env:TELEGRAM_API_HASH='abc...'", file=sys.stderr)
        sys.exit(1)

    api_id_int = int(api_id)
    session_path = Path(__file__).parent / "laptopservice"

    async def _fetch():
        async with TelegramClient(str(session_path), api_id_int, api_hash) as client:
            print(f"[fetch-telegram] Подключение к {channel} ...")
            entity = await client.get_entity(channel)
            count = 0
            async for message in client.iter_messages(entity, limit=args.limit):
                if not message.text:
                    continue
                # skip short announcements
                if len(message.text.split()) < 10 and count > 0:
                    # keep but mark? we save all, filter later via prompt
                    pass
                msg_id = message.id
                dest = RAW_TELEGRAM / str(msg_id)
                dest.mkdir(parents=True, exist_ok=True)
                raw = {
                    "id": msg_id,
                    "date": message.date.isoformat() if message.date else datetime.now().isoformat(),
                    "text": message.text,
                    "channel": channel,
                }
                with open(dest / "raw.json", "w", encoding="utf-8") as f:
                    json.dump(raw, f, ensure_ascii=False, indent=2)
                with open(dest / "text.txt", "w", encoding="utf-8") as f:
                    f.write(message.text)
                # try download media
                if message.media:
                    try:
                        await client.download_media(message, file=str(dest / "media"))
                        print(f"  [+] media saved for {msg_id}")
                    except Exception as e:
                        print(f"  [!] media download failed for {msg_id}: {e}")
                print(f"[+] Saved {msg_id} -> {dest}")
                count += 1
            print(f"[OK] Скачано {count} постов в {RAW_TELEGRAM}")

    import asyncio
    asyncio.run(_fetch())


# ---------------------------------------------------------------------------
# make-prompt
# ---------------------------------------------------------------------------

CASE_PROMPT_TEMPLATE = """Ты — помощник контент-менеджера сервисного центра laptopservice.uz (Ташкент, ул. Паркент 11).

Задача: преврати сырой пост из Telegram-канала в структурированный кейс ремонта для сайта. Пиши сухим инженерным языком, без маркетинга.

СЫРОЙ ПОСТ (id={post_id}, дата={post_date}):
\"\"\"
{raw_text}
\"\"\"

Верни ТОЛЬКО валидный YAML без markdown-обёртки, строго в формате:

slug: "<латиница, kebab-case, на основе устройства и проблемы>"
title: "<Человеческий заголовок кейса>"
device: "<Точная модель устройства, например: ASUS TUF Gaming A15 (FA506)>"
category: "<Одна из: Компонентный ремонт платы | BGA-пайка и реболлинг | Восстановление после залития | Ремонт петель и корпуса | Профилактика и охлаждение | Прошивка BIOS / EC | Разъемы и пайка>"
date: "{today}"
problem: "<1-2 предложения, симптомы со слов клиента>"
diagnosis: "<Что показала диагностика: замеры, тепловизор, осциллограф>"
solution: "<Нумерованный список шагов 1. ... 2. ... каждый с новой строки, используй \\n для переноса>"
result: "<Итог и тесты>"
keySpecs:
  - label: "<Параметр>"
    value: "<Значение>"
tags: ["<тег1>", "<тег2>", "<тег3>"]
schemaType: "HowTo"
summaryForSocial: "<Короткий текст для соцсетей 1-2 предложения>"

Правила:
- slug только латиницей, без пробелов.
- Не выдумывай детали, которых нет в посте; если чего-то нет — пиши обобщённо.
- solution каждый шаг начинай с "1. ", "2. " и т.д.
- tags 3-5 штук, без решётки.
- Верни только YAML.
"""

BUILD_PROMPT_TEMPLATE = """Ты — помощник контент-менеджера laptopservice.uz.

Задача: преврати сырой пост из Telegram-канала в карточку сборки ПК для раздела /builds.

СЫРОЙ ПОСТ (id={post_id}, дата={post_date}):
\"\"\"
{raw_text}
\"\"\"

Верни ТОЛЬКО валидный YAML:

slug: "<kebab-case, например gaming-rtx4060-r5-5600>"
title: "<Человеческий заголовок сборки>"
purpose: "<gaming | ai-work | office | rendering>"
purposeLabel: "<Подпись: Игры (Full HD / 144 Гц) | AI, нейросети и 3D-рендер | Офис и учёба | Рендер и монтаж>"
date: "{today}"
description: "<2-3 предложения, для кого сборка и какие задачи закрывает>"
components:
  cpu: "<модель CPU>"
  motherboard: "<плата>"
  ram: "<ОЗУ>"
  gpu: "<видеокарта или Встроенная ...>"
  storage: "<накопители>"
  psu: "<БП>"
  case: "<корпус>"
  cooler: "<охлаждение>"
price: "<от X сум>"
tags: ["<тег1>", "<тег2>"]

Правила: slug латиницей, purpose строго из списка, не выдумывай цены если нет в посте — пиши ориентир.
Верни только YAML.
"""


def cmd_make_prompt(args: argparse.Namespace) -> None:
    post_id = args.id
    raw_dir = RAW_TELEGRAM / str(post_id)
    raw_json = raw_dir / "raw.json"
    text_path = raw_dir / "text.txt"

    if not raw_json.exists() and not text_path.exists():
        print(f"[ERROR] Не найден пост {post_id} в {RAW_TELEGRAM}", file=sys.stderr)
        print("  Сначала выполните: python scripts/content_tool.py fetch-telegram", file=sys.stderr)
        # Fallback: try to find sample post from telegram_ingest SAMPLE?
        sys.exit(1)

    if raw_json.exists():
        with open(raw_json, encoding="utf-8") as f:
            data = json.load(f)
        raw_text = data.get("text", "")
        post_date = data.get("date", "")[:10]
    else:
        raw_text = text_path.read_text(encoding="utf-8")
        post_date = datetime.now().date().isoformat()

    today = datetime.now().date().isoformat()
    kind = args.type

    if kind == "case":
        prompt = CASE_PROMPT_TEMPLATE.format(post_id=post_id, post_date=post_date, raw_text=raw_text, today=today)
    elif kind == "build":
        prompt = BUILD_PROMPT_TEMPLATE.format(post_id=post_id, post_date=post_date, raw_text=raw_text, today=today)
    else:
        print(f"[ERROR] Неизвестный тип {kind}, ожидается case|build", file=sys.stderr)
        sys.exit(1)

    # Save prompt for reference
    out_prompt = raw_dir / f"prompt_{kind}.txt"
    out_prompt.write_text(prompt, encoding="utf-8")
    print(f"[make-prompt] Промпт сохранён: {out_prompt}")
    print("=" * 70)
    print(prompt)
    print("=" * 70)
    print("\n[Инструкция] Скопируйте промпт целиком в ChatGPT / Claude / локальную LLM,")
    print("полученный YAML сохраните в:", raw_dir / "result.yaml")
    print("Затем выполните: python scripts/content_tool.py import-result --id", post_id, f"--type {kind}")


# ---------------------------------------------------------------------------
# import-result
# ---------------------------------------------------------------------------

def cmd_import_result(args: argparse.Namespace) -> None:
    post_id = args.id
    raw_dir = RAW_TELEGRAM / str(post_id)
    # Determine result file: explicit --file or default result.yaml / result.yml
    if args.file:
        result_path = Path(args.file)
    else:
        candidates = [raw_dir / "result.yaml", raw_dir / "result.yml", raw_dir / "result.txt"]
        result_path = next((p for p in candidates if p.exists()), candidates[0])

    if not result_path.exists():
        print(f"[ERROR] Не найден файл результата: {result_path}", file=sys.stderr)
        print("  Сохраните YAML-ответ AI в этот файл и повторите.", file=sys.stderr)
        sys.exit(1)

    data = load_yaml(result_path)
    kind = args.type

    # Auto-detect if not specified: check presence of 'purpose' => build, else case
    if not kind:
        kind = "build" if "purpose" in data else "case"

    if kind == "case":
        errors = validate_case(data)
        if errors:
            print("[ERROR] Валидация кейса не пройдена:", file=sys.stderr)
            for e in errors:
                print(f"  - {e}", file=sys.stderr)
            sys.exit(1)
        # normalize fields
        out_slug = slugify(data["slug"])
        data["slug"] = out_slug
        # Ensure id
        data.setdefault("id", f"tg-case-{post_id}")
        data.setdefault("schemaType", "HowTo")
        # Write draft JSON
        dest = CASES_DRAFTS / f"{out_slug}.json"
        # Also write YAML for transparency
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        # Social snippet
        social = data.get("summaryForSocial") or data.get("social_snippet") or f"Новый кейс: {data['title']} — подробнее на laptopservice.uz/cases/{out_slug}"
        social_path = SOCIAL_DRAFTS / f"{out_slug}_social.txt"
        social_path.parent.mkdir(parents=True, exist_ok=True)
        social_path.write_text(social, encoding="utf-8")
        # Copy raw media hint if exists
        raw_media = raw_dir / "media"
        if raw_media.exists():
            print(f"[INFO] Найдена папка медиа: {raw_media} — скопируйте вручную в public/images/cases/ если нужно")

        print(f"[OK] Кейс импортирован в черновики: {dest}")
        print(f"     Социальный сниппет: {social_path}")

    elif kind == "build":
        errors = validate_build(data)
        if errors:
            print("[ERROR] Валидация сборки не пройдена:", file=sys.stderr)
            for e in errors:
                print(f"  - {e}", file=sys.stderr)
            sys.exit(1)
        out_slug = slugify(data["slug"])
        data["slug"] = out_slug
        data.setdefault("id", f"tg-build-{post_id}")
        dest = BUILDS_DRAFTS / f"{out_slug}.json"
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[OK] Сборка импортирована в черновики: {dest}")
    else:
        print(f"[ERROR] Неизвестный тип {kind}", file=sys.stderr)
        sys.exit(1)

    print("\n[Следующий шаг] Проверьте файл, затем опубликуйте:")
    print(f"  python scripts/content_tool.py publish --id {out_slug} --type {kind}")


# ---------------------------------------------------------------------------
# import-reviews
# ---------------------------------------------------------------------------

def cmd_import_reviews(args: argparse.Namespace) -> None:
    """
    Читает content/_raw/reviews/inbox.txt
    Формат: каждый отзыв отделён строкой "---" или "===".
            Внутри: свободный текст, первая строка может быть "Автор | Источник | Устройство"
    Пример:
      Азиз Каримов | Яндекс Карты | ASUS ROG Strix G15
      Текст отзыва...

      ---
      Сардор | Google Maps | Lenovo Legion 5
      Текст...
    """
    inbox = RAW_REVIEWS / "inbox.txt"
    if not inbox.exists():
        print(f"[ERROR] Не найден {inbox}", file=sys.stderr)
        print("  Создайте файл и вставьте отзывы (каждый отделён '---')", file=sys.stderr)
        inbox.parent.mkdir(parents=True, exist_ok=True)
        inbox.write_text("# Вставьте отзывы ниже, каждый отделён строкой '---'\n# Формат заголовка: Автор | Источник | Устройство | Дата (опционально)\n", encoding="utf-8")
        print(f"  Создан шаблон: {inbox}")
        sys.exit(1)

    content = inbox.read_text(encoding="utf-8")
    # split by --- or === or ***
    raw_blocks = re.split(r"\n\s*(?:---|===|\*\*\*)\s*\n", content)
    blocks = [b.strip() for b in raw_blocks if b.strip() and not b.strip().startswith("#")]

    if not blocks:
        print("[!] В inbox.txt нет отзывов для импорта", file=sys.stderr)
        sys.exit(0)

    count = 0
    for idx, block in enumerate(blocks, start=1):
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        if not lines:
            continue
        header = lines[0]
        # Try parse header with |
        if "|" in header:
            parts = [p.strip() for p in header.split("|")]
            author = parts[0] if len(parts) > 0 else f"Гость {idx}"
            source = parts[1] if len(parts) > 1 else "Яндекс Карты"
            device = parts[2] if len(parts) > 2 else "Ноутбук"
            date = parts[3] if len(parts) > 3 else datetime.now().date().isoformat()
            text = "\n".join(lines[1:]).strip()
        else:
            author = f"Гость {idx}"
            source = "Яндекс Карты"
            device = "Ноутбук"
            date = datetime.now().date().isoformat()
            text = block.strip()

        if not text:
            print(f"[SKIP] Блок {idx} пустой", file=sys.stderr)
            continue

        if source not in ("Яндекс Карты", "Google Maps", "2GIS"):
            source = "Яндекс Карты"

        rev_id = f"rev-{datetime.now().strftime('%Y%m%d')}-{idx}"
        slug = slugify(author + "-" + device)[:40]
        data = {
            "id": rev_id,
            "author": author,
            "source": source,
            "rating": 5,
            "date": date,
            "device": device,
            "text": text,
        }
        dest = REVIEWS_DRAFTS / f"{slug}.json"
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[+] Отзыв {rev_id} -> {dest}")
        count += 1

    print(f"\n[OK] Импортировано {count} отзывов в {REVIEWS_DRAFTS}")
    print("  Проверьте файлы и перенесите в src/data/reviews.ts или опубликуйте через publish --type review")

    # Optionally clear inbox if requested
    if args.clear:
        inbox.write_text("# inbox очищен после импорта\n", encoding="utf-8")
        print("[INFO] inbox.txt очищен")


# ---------------------------------------------------------------------------
# publish
# ---------------------------------------------------------------------------

def cmd_publish(args: argparse.Namespace) -> None:
    slug = args.id
    kind = args.type or "case"

    if kind == "case":
        src = CASES_DRAFTS / f"{slug}.json"
        dst = CASES_PUBLISHED / f"{slug}.json"
    elif kind == "build":
        src = BUILDS_DRAFTS / f"{slug}.json"
        dst = BUILDS_PUBLISHED / f"{slug}.json"
    elif kind == "review":
        src = REVIEWS_DRAFTS / f"{slug}.json"
        dst = REVIEWS_PUBLISHED / f"{slug}.json"
    else:
        print(f"[ERROR] Неизвестный тип {kind}", file=sys.stderr)
        sys.exit(1)

    if not src.exists():
        # Try without .json
        alt = Path(slug)
        if alt.exists():
            src = alt
        else:
            print(f"[ERROR] Черновик не найден: {src}", file=sys.stderr)
            sys.exit(1)

    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dst))
    print(f"[OK] Опубликовано: {dst}")

    # Try IndexNow ping
    if not args.no_ping:
        # Build URL
        base = "https://laptopservice.uz"
        if kind == "case":
            url = f"{base}/cases/{slug}"
        elif kind == "build":
            url = f"{base}/builds/{slug}"
        else:
            url = f"{base}/reviews"
        try:
            # Call existing script
            script = ROOT / "scripts" / "indexnow_ping.py"
            if script.exists():
                print(f"[IndexNow] Пинг для {url} ...")
                subprocess.run([sys.executable, str(script), url], check=False)
            else:
                print("[WARN] scripts/indexnow_ping.py не найден — пропустите пинг вручную")
        except Exception as e:
            print(f"[WARN] IndexNow пинг не удался: {e}")

    print("\n[Готово] Не забудьте:")
    print("  1. Скопировать данные из JSON в src/data/cases.ts / builds.ts если используете TS-файлы как источник")
    print("  2. git add + commit + push (деплой обновит сайт)")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Content Tool for laptopservice.uz")
    sub = parser.add_subparsers(dest="command", required=True)

    # fetch-telegram
    p_fetch = sub.add_parser("fetch-telegram", help="Скачать посты из Telegram-канала")
    p_fetch.add_argument("--limit", type=int, default=10, help="Сколько последних постов скачать (default: 10)")
    p_fetch.add_argument("--channel", type=str, default=None, help="Юзернейм канала, default @laptopservice_uz")
    p_fetch.add_argument("--api-id", type=str, default=None, help="Telegram api_id (или env TELEGRAM_API_ID)")
    p_fetch.add_argument("--api-hash", type=str, default=None, help="Telegram api_hash (или env TELEGRAM_API_HASH)")

    # make-prompt
    p_prompt = sub.add_parser("make-prompt", help="Сгенерировать промпт для AI")
    p_prompt.add_argument("--id", required=True, help="ID поста (папка в content/_raw/telegram/<id>)")
    p_prompt.add_argument("--type", choices=["case", "build"], default="case", help="Тип контента")

    # import-result
    p_import = sub.add_parser("import-result", help="Импортировать YAML-ответ AI в drafts")
    p_import.add_argument("--id", required=True, help="ID поста")
    p_import.add_argument("--type", choices=["case", "build"], default=None, help="Тип (auto-detect если не указан)")
    p_import.add_argument("--file", type=str, default=None, help="Путь к YAML файлу (default: content/_raw/telegram/<id>/result.yaml)")

    # import-reviews
    p_reviews = sub.add_parser("import-reviews", help="Разобрать inbox с отзывами")
    p_reviews.add_argument("--clear", action="store_true", help="Очистить inbox.txt после импорта")

    # publish
    p_pub = sub.add_parser("publish", help="Опубликовать черновик")
    p_pub.add_argument("--id", required=True, help="slug черновика (имя файла без .json)")
    p_pub.add_argument("--type", choices=["case", "build", "review"], default="case", help="Тип контента")
    p_pub.add_argument("--no-ping", action="store_true", help="Не вызывать IndexNow пинг")

    args = parser.parse_args()

    if args.command == "fetch-telegram":
        cmd_fetch_telegram(args)
    elif args.command == "make-prompt":
        cmd_make_prompt(args)
    elif args.command == "import-result":
        cmd_import_result(args)
    elif args.command == "import-reviews":
        cmd_import_reviews(args)
    elif args.command == "publish":
        cmd_publish(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
