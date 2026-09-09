#!/usr/bin/env python3
"""
Sync vault resources to frontend: checks prompts/Attachments/<slug>/raw-video.mp4
and built public/videos/services/<slug>.* Exists, reports links status.

Usage:
  python scripts/sync_prompts_to_frontend.py            # check
  python scripts/sync_prompts_to_frontend.py --sync     # copy raw-video -> process_service.sh automatically? manual
"""
import pathlib, sys

PROMPTS = pathlib.Path("prompts/services")
PUBLIC = pathlib.Path("public/videos/services")
ATTACH = pathlib.Path("prompts/Attachments")

if not PROMPTS.exists():
    print("no prompts/services")
    sys.exit(0)

for d in sorted(PROMPTS.iterdir()):
    if d.name.startswith("_"): continue
    slug = d.name
    md = d / f"{slug}.md"
    raw_vid = ATTACH / slug / "raw-video.mp4"
    raw_img = ATTACH / slug / "raw-image.png"
    built_mp4 = PUBLIC / f"{slug}.mp4"
    built_webm = PUBLIC / f"{slug}.webm"
    built_poster = PUBLIC / f"{slug}-poster.webp"
    print(f"\n{slug}:")
    print(f"  prompt: {md.exists()} -> {md}")
    print(f"  raw-image: {raw_img.exists()} {'✓' if raw_img.exists() else '—'}")
    print(f"  raw-video: {raw_vid.exists()} {'✓' if raw_vid.exists() else '—'}")
    print(f"  public/mp4: {built_mp4.exists()} {'✓' if built_mp4.exists() else '—'} {built_mp4.stat().st_size if built_mp4.exists() else ''}")
    print(f"  public/webm: {built_webm.exists()} {'✓' if built_webm.exists() else '—'}")
    print(f"  public/poster: {built_poster.exists()} {'✓' if built_poster.exists() else '—'}")
    if raw_vid.exists() and not built_mp4.exists():
        print(f"  → run: ./scripts/process_service.sh {slug} {raw_vid}")
print("\nDone. To build missing: ./scripts/process_service.sh <slug> prompts/Attachments/<slug>/raw-video.mp4")
