#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch Threads share URLs -> content/threads/*.md
Usage:
  python scripts/fetch_threads.py https://www.threads.com/share/BBR4vE0M6h/ --date 2026-08-30
  python scripts/fetch_threads.py --file urls.txt  # each line: URL [date]
  python scripts/fetch_threads.py https://www.threads.com/share/_eq_ppozf/ --date 2026-09-01 --dry-run
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import re, html, os, urllib.request, urllib.parse, json, hashlib, datetime
from pathlib import Path

MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
MONTHS_PATTERN = "|".join(MONTHS)

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
            d = datetime.datetime.fromisoformat(date_val.replace('Z',''))
        else:
            d = date_val
        # if string YYYY-MM-DD
        if isinstance(date_val, str) and re.match(r"^\d{4}-\d{2}-\d{2}", date_val):
            d = datetime.datetime.strptime(date_val[:10], "%Y-%m-%d")
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
        'Accept-Language':'ru,en;q=0.9'
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode('utf-8', errors='ignore')

def parse_threads_html(data: str, share_url: str):
    tags={}
    for m in re.finditer(r'<meta property="og:([^"]+)" content="([^"]+)', data):
        tags[m.group(1)] = html.unescape(m.group(2))
    # fallback title
    m = re.search(r'<title>(.*?)</title>', data, re.DOTALL)
    title_raw = html.unescape(m.group(1)).strip() if m else ""
    description = tags.get('description','').strip() or title_raw
    # og:title often is generic, prefer description
    body = description
    # og:url is canonical threads post url
    canonical = tags.get('url','') or share_url
    og_image = tags.get('image','')
    # find all fbcdn/scontent images - capture all distinct jpg urls (including og:image)
    # pattern for cdn urls
    raw_imgs = re.findall(r'https://[^"]*?\.fbcdn\.net[^"]*?\.jpg[^"]*', data)
    raw_imgs += re.findall(r'https://scontent[^"]*?\.jpg[^"]*', data)
    # also try json escaped urls: https:\/\/scontent...
    raw_imgs2 = re.findall(r'https:\\/\\/[^"]*?\.fbcdn\.net[^"]*?\.jpg', data)
    raw_imgs += [u.replace(r'\/','/') for u in raw_imgs2]
    # unescape and dedup
    cleaned=[]
    seen=set()
    for u in raw_imgs:
        u = html.unescape(u).replace('&amp;','&')
        # remove trailing params like \">, but we already cut at "
        # strip trailing \ and "
        u = u.strip().rstrip('\\').rstrip('"')
        base = u.split('?')[0]
        if base not in seen and 'rsrc.php' not in base:  # filter static assets
            seen.add(base)
            cleaned.append(u)
    # ensure og_image first, keep only reliable images
    # Threads SSR page only reliably exposes og:image for single-image posts.
    # Extra fbcdn URLs are often profile/avatar duplicates, so we keep only og:image
    # unless carousel detection indicates multiple distinct post images.
    # For now return single-image gallery to avoid spurious downloads.
    if og_image:
        og_clean = html.unescape(og_image).replace('&amp;','&')
        # Prefer single og_image; ignore other fbcdn noise
        cleaned = [og_clean]
    # try to find published time
    pub=None
    for pat in [r'property="article:published_time" content="([^"]+)"', r'"published_time"[^>]*content="([^"]+)"', r'"taken_at":(\d+)', r'"publish_time":(\d+)']:
        mm=re.search(pat, data)
        if mm:
            pub=mm.group(1)
            break
    return {
        'body': body,
        'canonical': canonical,
        'og_image': og_image,
        'all_images': cleaned[:5],
        'published': pub,
        'title_raw': title_raw,
        'tags': tags,
    }

def download_image(url: str, dest: Path):
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0','Referer':'https://www.threads.com/'})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read()
        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest,'wb') as f:
            f.write(data)
    return dest

def create_thread_md(share_url: str, date_str: str = None, dry_run=False):
    print(f"\n=== {share_url} date={date_str}")
    html_data = fetch_html(share_url)
    parsed = parse_threads_html(html_data, share_url)
    body = parsed['body'].strip()
    # fallback if body is generic title
    if body == "Laptop Service (@laptopservice_uz) в приложении Threads" or not body:
        # try to extract from JSON script containing post text? use description fallback
        body = parsed['tags'].get('description','').strip()
    if not body:
        body = "Пост из Threads"
    canonical = parsed['canonical']
    all_images = parsed['all_images']
    pub = parsed['published']
    # determine date
    if date_str:
        date_obj = datetime.datetime.strptime(date_str[:10], "%Y-%m-%d")
    elif pub:
        try:
            if pub.isdigit():
                date_obj = datetime.datetime.utcfromtimestamp(int(pub))
            else:
                date_obj = datetime.datetime.fromisoformat(pub.replace('Z','+00:00'))
        except:
            date_obj = datetime.datetime.now()
    else:
        date_obj = datetime.datetime.now()
    date_iso = date_obj.strftime("%Y-%m-%d")
    suffix = date_suffix(date_iso)
    # slug from body first 80 chars
    raw_slug_src = body[:80].strip() or "post"
    s = slugify(raw_slug_src)
    clean = strip_date_suffix(s) or "post"
    if clean == "laptopservice-uz":
        clean = "post"
    base = clean
    slug = base + suffix
    # handle collision: if file exists, add -1, -2
    dest_md = Path(f"content/threads/{slug}.md")
    counter=1
    orig_slug=slug
    while dest_md.exists() and not dry_run:
        counter+=1
        slug = f"{base}-{counter}{suffix}"
        dest_md = Path(f"content/threads/{slug}.md")
    print(f" parsed body: {body[:120]!r}")
    print(f" canonical: {canonical}")
    print(f" date: {date_iso} -> slug: {slug}")
    print(f" images found: {len(all_images)}")
    for im in all_images[:3]:
        print(f"  img: {im[:100]}...")

    # download images
    gallery=[]
    alts=[]
    if all_images:
        for idx, img_url in enumerate(all_images[:2]):  # limit 2 for threads (single og:image in practice)
            ext = ".jpg"
            if ".png" in img_url.lower():
                ext=".png"
            elif ".webp" in img_url.lower():
                ext=".webp"
            if len(all_images)==1:
                img_name = f"{slug}{ext}"
            else:
                img_name = f"{slug}-{idx+1:02d}{ext}"
            dest_img = Path(f"content/threads/{img_name}")
            gallery.append(f"/content/threads/{img_name}")
            alts.append(body[:80] if idx==0 else "")
            if not dry_run:
                try:
                    download_image(img_url, dest_img)
                    print(f"  downloaded -> {dest_img}")
                except Exception as e:
                    print(f"  download failed {img_url}: {e}")
                    gallery.pop()
                    alts.pop()
    else:
        print("  no images found, gallery will be empty")

    frontmatter = f"""---
handle: "laptopservice_uz"
date: {date_iso}
"""
    if gallery:
        frontmatter += "gallery:\n"
        for g in gallery:
            frontmatter += f"  - {g}\n"
        frontmatter += "alts:\n"
        for a in alts:
            # escape quotes
            a_esc = a.replace('"','\\"')
            frontmatter += f'  - "{a_esc}"\n'
    if canonical and canonical != share_url:
        frontmatter += f"url: '{canonical}'\n"
    else:
        frontmatter += f"url: '{share_url}'\n"
    frontmatter += "---\n\n"
    frontmatter += body + "\n"

    if dry_run:
        print("--- DRY RUN frontmatter ---")
        print(frontmatter[:1000])
        return slug, dest_md, frontmatter

    dest_md.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_md, 'w', encoding='utf-8') as f:
        f.write(frontmatter)
    print(f"  created {dest_md}")
    return slug, dest_md, frontmatter

if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser()
    p.add_argument("urls", nargs="*")
    p.add_argument("--date", help="YYYY-MM-DD for single URL")
    p.add_argument("--file", help="file with lines: URL [date]")
    p.add_argument("--dry-run", action="store_true")
    args=p.parse_args()
    targets=[]
    if args.file:
        for line in open(args.file, encoding='utf-8'):
            line=line.strip()
            if not line or line.startswith('#'): continue
            parts=line.split()
            u=parts[0]
            d=parts[1] if len(parts)>1 else None
            targets.append((u,d))
    for u in args.urls:
        targets.append((u, args.date))
    if not targets:
        # default demo 3
        targets=[
            ("https://www.threads.com/share/BBR4vE0M6h/", "2026-08-30"),
            ("https://www.threads.com/share/BAh1FFA_8M/", "2026-08-30"),
            ("https://www.threads.com/share/_eq_ppozf/", "2026-09-01"),
        ]
        print("No URLs given, using demo 3")
    for url, d in targets:
        try:
            create_thread_md(url, d, dry_run=args.dry_run)
        except Exception as e:
            import traceback; traceback.print_exc()
            print(f"FAILED {url}: {e}")
