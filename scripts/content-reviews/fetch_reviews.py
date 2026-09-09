#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch Yandex Maps reviews -> content/reviews/*.md
Usage:
  python scripts/content-reviews/fetch_reviews.py                          # default org (yandex.uz)
  python scripts/content-reviews/fetch_reviews.py --url https://yandex.uz/maps/org/laptop_service/81659688745/reviews/
  python scripts/content-reviews/fetch_reviews.py --dry-run
  python scripts/content-reviews/fetch_reviews.py --device-map '{"Umid Iskandarov":"Lenovo"}'
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import re, html, os, urllib.request, datetime, json
from pathlib import Path

MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
MONTHS_PATTERN = "|".join(MONTHS)

DEFAULT_URL = "https://yandex.uz/maps/org/laptop_service/81659688745/reviews/"
# Optional device overrides for known authors (author exact -> device). Script also tries to infer from text.
DEVICE_OVERRIDES = {
    "Umid Iskandarov": "Lenovo",  # по просьбе: у Умида был Lenovo замена клавиатуры
}

def slugify(s: str) -> str:
    s = s.lower()
    trans = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
        'А':'a','Б':'b','В':'v','Г':'g','Д':'d','Е':'e','Ё':'yo','Ж':'zh','З':'z','И':'i','Й':'y','К':'k','Л':'l','М':'m','Н':'n','О':'o','П':'p','Р':'r','С':'s','Т':'t','У':'u','Ф':'f','Х':'h','Ц':'ts','Ч':'ch','Ш':'sh','Щ':'sch','Ъ':'','Ы':'y','Ь':'','Э':'e','Ю':'yu','Я':'ya',
    }
    for k,v in trans.items():
        s = s.replace(k, v)
    import unicodedata
    s = unicodedata.normalize('NFD', s)
    s = re.sub(r'[\u0300-\u036f]', '', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = re.sub(r'^-+|-+$','', s)
    s = re.sub(r'--+','-', s)
    return s[:80] or "untitled"

def strip_date_suffix(s: str) -> str:
    re_full = re.compile(rf"-\d{{2}}(?:{MONTHS_PATTERN})\d{{4}}$", re.I)
    re_month = re.compile(rf"-(?:{MONTHS_PATTERN})\d{{4}}$", re.I)
    s = re_full.sub("", s)
    s = re_month.sub("", s)
    s = re.sub(r"-\d{4}$","", s)
    s = re.sub(r"^\d{4}-\d{2}-\d{2}-","", s)
    return s

def date_suffix(date_val) -> str:
    if not date_val:
        return ""
    if isinstance(date_val, str):
        raw = date_val.strip()
        if re.match(r"^\d{4}$", raw):
            return f"-{raw}"
        if re.match(r"^\d{4}-\d{2}$", raw):
            y,m = raw.split("-")
            idx=int(m)-1
            if 0 <= idx <12:
                return f"-{MONTHS[idx]}{y}"
    try:
        if isinstance(date_val, str):
            d = datetime.datetime.fromisoformat(date_val.replace('Z','').replace('+00:00',''))
            # fallback YYYY-MM-DD
            if re.match(r"^\d{4}-\d{2}-\d{2}", date_val):
                d = datetime.datetime.strptime(date_val[:10], "%Y-%m-%d")
        else:
            d = date_val
        day = f"{d.day:02d}"
        mon = MONTHS[d.month-1]
        year = d.year
        return f"-{day}{mon}{year}"
    except:
        return ""

def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers={
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept':'text/html,application/xhtml+xml',
        'Accept-Language':'ru,en;q=0.9,uz;q=0.8'
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode('utf-8', errors='ignore')

def parse_yandex_reviews(html_data: str):
    """
    Parse yandex maps org reviews page.
    Returns list of dict: {author, date (ISO), date_display, text, avatar_url, rating}
    Uses regex on SSR HTML: business-review-view blocks
    """
    reviews = []
    # Find all author positions to slice per review
    author_positions = [(m.start(), m.group(1)) for m in re.finditer(r'itemProp="name" dir="auto">([^<]+)', html_data)]
    for idx, (pos, author) in enumerate(author_positions):
        start = max(0, pos - 1200)  # include header before author for date/rating
        end = author_positions[idx+1][0] if idx+1 < len(author_positions) else pos + 8000
        segment = html_data[start:end]
        # Avatar search: only in narrow window around author (400 chars before pos)
        avatar_win_start = max(0, pos - 500)
        avatar_win = html_data[avatar_win_start:pos+200]
        # datePublished
        m_date = re.search(r'meta itemProp="datePublished" content="([^"]+)"', segment)
        date_iso = m_date.group(1) if m_date else None
        # rating
        m_rating = re.search(r'meta itemProp="ratingValue" content="([^"]+)"', segment)
        rating = int(float(m_rating.group(1))) if m_rating else 5
        # reviewBody: spoiler text
        m_body = re.search(r'spoiler-view__text-container[^>]*>(.*?)</span>', segment, re.S)
        text = ""
        if m_body:
            text = re.sub(r'<[^>]+>', '', m_body.group(1)).strip()
            text = html.unescape(text)
        # avatar: look for meta image or background-image in narrow window
        avatar_url = None
        m_meta = re.search(r'<meta itemProp="image" content="([^"]+)"', avatar_win)
        if m_meta:
            avatar_url = m_meta.group(1)
        else:
            m_bg = re.search(r'background-image:url\(([^)]+)\)', avatar_win)
            if m_bg:
                url = m_bg.group(1).strip().strip('"').strip("'")
                if "get-yapic" in url or "get-altay" in url or "avatars.mds.yandex" in url:
                    avatar_url = url
                else:
                    avatar_url = None
            else:
                avatar_url = None
        # Normalize date to YYYY-MM-DD for frontmatter
        date_short = None
        if date_iso:
            try:
                d = datetime.datetime.fromisoformat(date_iso.replace('Z','+00:00'))
                date_short = d.strftime("%Y-%m-%d")
            except:
                date_short = date_iso[:10]
        reviews.append({
            "author": author.strip(),
            "date_iso": date_iso,
            "date": date_short or (date_iso[:10] if date_iso else datetime.datetime.now().strftime("%Y-%m-%d")),
            "text": text,
            "avatar_url": avatar_url,
            "rating": rating,
            "source": "Яндекс Карты",
        })
    return reviews

def infer_device(author: str, text: str) -> str:
    if author in DEVICE_OVERRIDES:
        return DEVICE_OVERRIDES[author]
    # heuristic: look for brand/model in text
    lower = text.lower()
    if "asus rog strix" in lower:
        # try to extract model
        m = re.search(r'asus rog strix[^\n]*', text, re.I)
        if m:
            return m.group(0).strip()[:60]
        return "Asus ROG Strix"
    if "asus" in lower:
        return "Asus"
    if "lenovo" in lower:
        return "Lenovo"
    if "acer" in lower:
        return "Acer"
    if "hp" in lower:
        # HP may be too generic, use Ноутбук fallback
        return "HP"
    if "dell" in lower:
        return "Dell"
    if "игров" in lower:
        return "Игровой ноутбук"
    if "компьютер" in lower or "системник" in lower or "стационар" in lower:
        return "Компьютер"
    return "Ноутбук"

def download_avatar(url: str, dest: Path):
    # yandex avatars support islands-200 for higher res; try to upgrade
    # islands-68 -> islands-200, islands-200 -> keep
    url200 = url.replace("islands-68", "islands-200").replace("islands-50", "islands-200")
    # remove protocol-relative //
    if url200.startswith("//"):
        url200 = "https:" + url200
    req = urllib.request.Request(url200, headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        data = r.read()
        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, 'wb') as f:
            f.write(data)
    return dest

def load_existing_reviews():
    existing = set()
    existing_slugs = set()
    # map author_lower -> list of (date, text_snippet)
    existing_by_author = {}
    for md in Path("content/reviews").rglob("*.md"):
        content = md.read_text(encoding='utf-8', errors='ignore')
        m_author = re.search(r'author:\s*"([^"]+)"', content) or re.search(r"author:\s*'([^']+)'", content) or re.search(r'author:\s*([^\n]+)', content)
        m_date = re.search(r'date:\s*([0-9\-T:Z\.]+)', content)
        author = m_author.group(1).strip().strip('"').strip("'") if m_author else None
        date = m_date.group(1).strip()[:10] if m_date else None
        # extract body first 80 chars for fuzzy text match
        body_match = re.search(r'---\s*\n.*?---\s*\n(.*)', content, re.S)
        body_snip = body_match.group(1).strip()[:80].lower() if body_match else ""
        if author and date:
            existing.add((author.lower().strip(), date))
            existing.add((author.strip(), date))  # exact case
            key = author.lower().strip()
            existing_by_author.setdefault(key, []).append((date, body_snip))
        # slug is filename without extension
        slug = md.stem
        existing_slugs.add(slug)
        # also consider folder name
        existing_slugs.add(md.parent.name)
    return existing, existing_slugs, existing_by_author

def create_review_md(review: dict, dry_run=False, force=False):
    author = review["author"]
    date_str = review["date"]  # YYYY-MM-DD
    text = review["text"].strip() or "Отличный сервис"
    # slug like tina/config.ts: rev-<slugified author>-DDmmmYYYY
    s = slugify(author)
    base = s if s.startswith("rev-") else f"rev-{s}"
    clean = strip_date_suffix(base)
    suffix = date_suffix(date_str)
    slug = clean + suffix
    # parse date for folder YYYY_MM
    try:
        d = datetime.datetime.strptime(date_str[:10], "%Y-%m-%d")
    except:
        d = datetime.datetime.now()
    month_folder = f"{d.year}_{d.month:02d}"
    dest_dir = Path(f"content/reviews/{month_folder}/{slug}")
    dest_md = dest_dir / f"{slug}.md"
    # handle collision: increment
    counter = 1
    orig_slug = slug
    orig_dir = dest_dir
    while dest_md.exists() and not force:
        counter += 1
        slug = f"{clean}-{counter}{suffix}"
        dest_dir = Path(f"content/reviews/{month_folder}/{slug}")
        dest_md = dest_dir / f"{slug}.md"
        if counter > 20:
            break
    device = infer_device(author, text)
    # allow override via env or extra map
    if author in DEVICE_OVERRIDES:
        device = DEVICE_OVERRIDES[author]
    print(f"\n[{author}] {date_str} -> slug={slug} device={device} avatar={'yes' if review['avatar_url'] else 'no'}")
    print(f"  text: {text[:120]!r}")
    if review["avatar_url"]:
        print(f"  avatar_url: {review['avatar_url'][:80]}")

    if dry_run:
        print(f"  DRY-RUN: would create {dest_md}")
        return dest_md, False

    # Download avatar if exists and not placeholder
    avatar_rel = None
    if review["avatar_url"]:
        # determine extension from content-type or url
        avatar_url = review["avatar_url"]
        # guess extension: yandex avatars are png/jpg, but we save as detected
        # try to detect after download; for now use .jpg for jpg, .png for png
        # We'll download to temp then rename correctly based on file header
        # For simplicity, use .png if url contains .png, else .jpg, but yandex url has no extension -> detect via file header after download
        # Save with author-based name like existing: "<Author>-DDmmmYYYY.<ext>"
        # We'll download first to temp and then move
        try:
            # download to tmp
            tmp_path = Path(f"/tmp/{slug}_avatar")
            download_avatar(avatar_url, tmp_path)
            # detect file type
            with open(tmp_path, 'rb') as f:
                header = f.read(20)
            ext = ".jpg"
            if header.startswith(b'\x89PNG'):
                ext = ".png"
            elif header[6:10] == b'JFIF' or header.startswith(b'\xff\xd8'):
                ext = ".jpg"
            elif header.startswith(b'RIFF') and b'WEBP' in header:
                ext = ".webp"
            avatar_name = f"{author}-{suffix.lstrip('-')}{ext}"  # e.g. Iroda-07jul2026.png
            # sanitize filename: keep as is but ensure not too long
            # Use slugify-safe? Keep original author with spaces as in existing (e.g. "Олег Маклаков-07jul2026.webp")
            avatar_name = f"{author}{suffix}{ext}"
            dest_avatar = dest_dir / avatar_name
            dest_dir.mkdir(parents=True, exist_ok=True)
            # move tmp to dest
            import shutil
            shutil.move(str(tmp_path), str(dest_avatar))
            # relative path for frontmatter (absolute /content/...)
            avatar_rel = f"/content/reviews/{month_folder}/{slug}/{avatar_name}"
            print(f"  avatar saved -> {dest_avatar} ({dest_avatar.stat().st_size} bytes)")
        except Exception as e:
            print(f"  avatar download failed: {e}")
            avatar_rel = None
    else:
        print(f"  no avatar (placeholder)")

    # Build frontmatter
    frontmatter = f"""---
author: "{author}"
source: "Яндекс Карты"
rating: {review['rating']}
date: {date_str}
device: "{device}"
"""
    if avatar_rel:
        frontmatter += f"avatar: {avatar_rel}\n"
    frontmatter += "---\n\n"
    frontmatter += text.strip() + "\n"

    dest_dir.mkdir(parents=True, exist_ok=True)
    with open(dest_md, 'w', encoding='utf-8') as f:
        f.write(frontmatter)
    print(f"  created {dest_md}")
    return dest_md, True

def main():
    import argparse
    p = argparse.ArgumentParser(description="Import Yandex Maps reviews to content/reviews")
    p.add_argument("--url", default=DEFAULT_URL, help="Yandex Maps reviews URL")
    p.add_argument("--dry-run", action="store_true", help="Do not write files")
    p.add_argument("--force", action="store_true", help="Overwrite existing slugs")
    p.add_argument("--limit", type=int, default=0, help="Limit number of new reviews to import (0=all)")
    args = p.parse_args()

    print(f"Fetching {args.url}")
    html_data = fetch_html(args.url)
    reviews = parse_yandex_reviews(html_data)
    print(f"Found {len(reviews)} reviews on Yandex page")
    for r in reviews:
        print(f" - {r['author']} {r['date']} rating={r['rating']} avatar={'yes' if r['avatar_url'] else 'no'} text={r['text'][:60]!r}")

    existing, existing_slugs, existing_by_author = load_existing_reviews()
    print(f"\nExisting local reviews: {len(existing)//2} unique author+date, {len(existing_slugs)} slugs")
    # Filter new: check exact author+date or fuzzy same author within 2 days / same text
    new_reviews = []
    for r in reviews:
        key = (r["author"].lower().strip(), r["date"][:10])
        key_exact = (r["author"].strip(), r["date"][:10])
        slug_candidate = (slugify(r["author"]) if slugify(r["author"]).startswith("rev-") else f"rev-{slugify(r['author'])}")
        clean = strip_date_suffix(slug_candidate)
        suffix = date_suffix(r["date"])
        slug = clean + suffix
        if key in existing or key_exact in existing or slug in existing_slugs:
            print(f" SKIP (already exists exact): {r['author']} {r['date']} slug={slug}")
            continue
        # fuzzy: same author already exists with nearby date or same text prefix
        author_key = r["author"].lower().strip()
        if author_key in existing_by_author:
            is_dup = False
            for exist_date, exist_snip in existing_by_author[author_key]:
                try:
                    d1 = datetime.datetime.strptime(exist_date[:10], "%Y-%m-%d")
                    d2 = datetime.datetime.strptime(r["date"][:10], "%Y-%m-%d")
                    diff = abs((d2 - d1).days)
                    if diff <= 2:
                        # also check text similarity to avoid false skip for different reviews same author
                        txt_snip = r["text"][:80].lower().strip()
                        if exist_snip and txt_snip and (exist_snip[:30] == txt_snip[:30] or exist_snip in txt_snip or txt_snip in exist_snip):
                            print(f" SKIP (fuzzy duplicate same author nearby date {diff}d): {r['author']} {r['date']} vs existing {exist_date} slug={slug}")
                            is_dup = True
                            break
                        elif diff <= 1:
                            # even without text match, treat ±1 day as same review (UTC vs Tashkent timezone)
                            print(f" SKIP (fuzzy duplicate timezone ±1d): {r['author']} {r['date']} vs existing {exist_date} slug={slug}")
                            is_dup = True
                            break
                except:
                    pass
            if is_dup:
                continue
        new_reviews.append(r)

    if not new_reviews:
        print("\nNo new reviews to import.")
        return

    print(f"\nNew reviews to import: {len(new_reviews)}")
    if args.limit:
        new_reviews = new_reviews[:args.limit]

    created = 0
    for r in new_reviews:
        try:
            _, ok = create_review_md(r, dry_run=args.dry_run, force=args.force)
            if ok:
                created += 1
        except Exception as e:
            import traceback; traceback.print_exc()
            print(f"FAILED {r['author']}: {e}")

    if args.dry_run:
        print(f"\nDRY-RUN done: {len(new_reviews)} would be created")
    else:
        print(f"\nDone: {created}/{len(new_reviews)} new reviews created")
        if created:
            print("Run: npm run build   # to verify")
            print("Then: git add content/reviews && git commit -m 'feat(reviews): import from Yandex' && git push")

if __name__ == "__main__":
    main()
