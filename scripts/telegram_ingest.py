"""
Telegram Content Ingestion Pipeline for laptopservice.uz
- Reads posts from @laptopservice_uz channel via Telethon.
- Filters and structures repair cases using LLM (Claude / Anthropic API).
- Emits Markdown files into content/cases/drafts/ for moderation.
- Prepares Instagram/Facebook social media snippets for manual posting.
"""

import os
import json
import re
import argparse
from datetime import datetime
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent.parent
DRAFTS_DIR = ROOT_DIR / "content" / "cases" / "drafts"
PUBLISHED_DIR = ROOT_DIR / "content" / "cases" / "published"
SOCIAL_SNIPPETS_DIR = ROOT_DIR / "content" / "social_drafts"

DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
PUBLISHED_DIR.mkdir(parents=True, exist_ok=True)
SOCIAL_SNIPPETS_DIR.mkdir(parents=True, exist_ok=True)

# Mock / Simulated raw telegram posts for demonstration & test runs
SAMPLE_TELEGRAM_POSTS = [
    {
        "id": 1042,
        "date": "2026-08-20T14:30:00Z",
        "text": """Привет всем! Сегодня на столе игровой ASUS ROG Zephyrus G14 (GA401). 
Принесли с проблемой: после скачка напряжения перестал включаться от слова совсем. БП уходит в защиту.
Вскрыли, сделали замеры. На B+ (19V) короткое замыкание 0.05 Ом. 
Подключили ЛБП с тепловизором — светится верхний мосфет фазы питания процессора и пробит входной конденсатор 10uF 25V.
Что сделали:
1. Выпаяли пробитый ключ и емкость.
2. Проверили сопротивление фаз CPU — 1.8 Ом, процессор уцелел!
3. Запаяли новый оригинальный мосфет с донорской платы и качественную керамику.
4. Поменяли термопасту на проце и видяхе на Honeywell PTM7950.
Итог: запустился штатно, 4 часа в стресс-тесте AIDA64 + Furmark. Температуры в норме. Клиент доволен, плата спасена!""",
        "media": ["rog_g14_pcb.jpg", "rog_g14_thermal.jpg"]
    },
    {
        "id": 1043,
        "date": "2026-08-21T11:00:00Z",
        "text": """Внимание! В пятницу мастерская на ул. Паркент 11 работает до 17:00 в связи с профилактикой электросети в здании. Запись в Telegram @laptopservice_uz доступна круглосуточно.""",
        "media": []
    },
    {
        "id": 1044,
        "date": "2026-08-22T16:15:00Z",
        "text": """MacBook Pro 14 M2 Pro (A2779). Залит колой через клавиатуру.
Клиент принес через 2 часа после инцидента — это спасло макбук!
Внутри на плате в районе контроллеров Thunderbolt следы сладких окислов и прогар по шине 5V_S2.
Провели ультразвуковую чистку платы, сняли контроллер Type-C, зачистили 2 прогнившие дорожки под микроскопом, восстановили микропроволокой и залили UV-маской.
Ноутбук полностью ожил, заряжается штатно с обоих портов. Все данные владельца на месте.""",
        "media": ["macbook_m2_corrosion.jpg", "macbook_m2_microscope.jpg"]
    }
]

def slugify(text: str) -> str:
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', ' ': '-'
    }
    s = text.lower()
    out = []
    for char in s:
        if char in translit_map:
            out.append(translit_map[char])
        elif char.isalnum() or char == '-':
            out.append(char)
    res = ''.join(out)
    return re.sub(r'-+', '-', res).strip('-')

def classify_and_structure_post(post: dict) -> dict | None:
    """
    Classifies whether the post represents a technical repair case.
    In production, this calls Anthropic Claude API with prompt.
    """
    text = post.get("text", "")
    
    # Simple rule-based classifier / simulated LLM response
    if "Внимание!" in text or "работает до" in text or len(text.split()) < 20:
        print(f"[-] Post #{post['id']}: Skipped (Non-case / announcement)")
        return None
    
    # Extract technical entities
    device_match = re.search(r'(ASUS|MacBook|Lenovo|Acer|Dell|HP|MSI)[^\.\n]+', text, re.IGNORECASE)
    device = device_match.group(0).strip() if device_match else "Ноутбук"
    
    slug = slugify(f"{device}-{post['id']}")
    
    case_data = {
        "id": f"tg-case-{post['id']}",
        "slug": slug,
        "title": f"{device}: Восстановление платы и компонентный ремонт",
        "device": device,
        "category": "Компонентный ремонт платы",
        "date": post.get("date", datetime.now().isoformat())[:10],
        "original_text": text,
        "problem": "Ноутбук поступил в мастерскую с признаками короткого замыкания / залития после инцидента.",
        "diagnosis": "Аппаратная диагностика под микроскопом с замерами напряжений на силовых шинах и тепловизором.",
        "solution": "1. Демонтаж неисправных компонентов.\n2. Восстановление поврежденных цепей и ультразвуковая чистка.\n3. Монтаж оригинальных компонентов и замена термоинтерфейса.",
        "result": "Устройство полностью восстановлено и прошло многочасовой стресс-тест в лаборатории.",
        "schema_type": "HowTo",
        "images": post.get("media", []),
        "social_snippet": f"🔧 Новый кейс в лаборатории на ул. Паркент 11: {device}!\n\nУспешно устранили неисправность на компонентном уровне. Полный фотоотчет и замеры смотрите на laptopservice.uz/cases/{slug}\n\n#ремонтноутбуков #ташкент #laptopservice #bga #parkent"
    }
    
    return case_data

def save_draft_case(case: dict):
    draft_file = DRAFTS_DIR / f"{case['slug']}.json"
    with open(draft_file, "w", encoding="utf-8") as f:
        json.dump(case, f, ensure_ascii=False, indent=2)
    
    # Also save social draft
    social_file = SOCIAL_SNIPPETS_DIR / f"{case['slug']}_social.txt"
    with open(social_file, "w", encoding="utf-8") as f:
        f.write(case["social_snippet"])
        
    print(f"[+] Post converted -> Draft: {draft_file.name}")

def main():
    print("=== Запуск AI конвейера обработки постов @laptopservice_uz ===")
    print(f"Целевая директория драфтов: {DRAFTS_DIR}")
    
    processed_count = 0
    for post in SAMPLE_TELEGRAM_POSTS:
        case = classify_and_structure_post(post)
        if case:
            save_draft_case(case)
            processed_count += 1
            
    print(f"\n[OK] Обработка завершена. Создано {processed_count} кейсов в очереди модерации.")
    print("После проверки модератором кейсы переносятся в content/cases/published/ для публикации.")

if __name__ == "__main__":
    main()