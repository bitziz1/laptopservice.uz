#!/usr/bin/env bash
set -euo pipefail

# convert_to_sticker_emoji.sh — из готового видео (с однотонным фоном) делает
# Telegram Video Sticker (512px) и Video Emoji (100x100) с прозрачностью.
# Требования Telegram: WEBM, VP9, no audio, 30 FPS const, ≤3s, ≤256KB, looped.

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <input.mp4> [slug] [duration=3]"
  echo "  input.mp4 — исходник с ровным фоном (#808080 / #171A20 / #00FF00, 640x640)"
  echo "  slug      — имя без расширения (default: basename без .mp4, напр. remont-videokarty-kompyutera)"
  echo "  duration  — обрезка до ≤3s (default 3)"
  exit 1
fi

INPUT="$1"
SLUG="${2:-$(basename "${INPUT%.*}")}"
DUR="${3:-3}"

if [[ ! -f "$INPUT" ]]; then echo "Input not found: $INPUT" >&2; exit 1; fi

command -v ffmpeg >/dev/null || { echo "ffmpeg not found" >&2; exit 1; }
command -v python3 >/dev/null || { echo "python3 not found" >&2; exit 1; }

TMPDIR=$(mktemp -d)
FRAMES_IN="$TMPDIR/frames_in"
FRAMES_OUT="$TMPDIR/frames_out"
mkdir -p "$FRAMES_IN" "$FRAMES_OUT"

echo "[1/5] Extract frames 24fps -> $FRAMES_IN"
ffmpeg -y -hide_banner -loglevel error -i "$INPUT" -vsync 0 "$FRAMES_IN/%04d.png"

echo "[2/5] AI-matting isnet-general-use -> $FRAMES_OUT"
python3 -c "
import sys, glob, os, tqdm
from rembg import new_session, remove
from PIL import Image
session = new_session('isnet-general-use')
frames = sorted(glob.glob(os.path.join('$FRAMES_IN', '*.png')))
from tqdm import tqdm
for f in tqdm(frames):
    out = os.path.join('$FRAMES_OUT', os.path.basename(f))
    if os.path.exists(out): continue
    img = Image.open(f)
    Image.open(f)
    out_img = remove(img, session=session)
    out_img.save(out)
"
# Alternative: python3 scripts/matte_video_isnet.py (but inline above keeps deps)

ALPHA_MOV="$TMPDIR/alpha.mov"
echo "[3/5] Assemble alpha.mov ProRes4444 640x640 24fps"
ffmpeg -y -hide_banner -loglevel error -framerate 24 -i "$FRAMES_OUT/%04d.png" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le -vendor ap10 "$ALPHA_MOV"

OUT_STICKER="public/stickers/${SLUG}.webm"
OUT_EMOJI="public/emoji/${SLUG}.webm"
mkdir -p public/stickers public/emoji

encode() {
  local size_px="$1" out="$2" crf="$3"
  ffmpeg -y -hide_banner -loglevel error -ss 0 -t "$DUR" -i "$ALPHA_MOV" \
    -vf "scale=${size_px}:${size_px}:flags=lanczos,format=yuva420p" \
    -r 30 -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf "$crf" -auto-alt-ref 0 -an "$out"
  local sz=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")
  echo "  -> $out ${sz} bytes crf=$crf"
  echo "$sz"
}

echo "[4/5] Encode sticker 512x512 ≤256KB ( VP9, yuva420p, 30fps, no audio )"
for crf in 32 35 38 41 44; do
  sz=$(encode 512 "$OUT_STICKER" "$crf")
  if [[ "$sz" -le $((256*1024)) ]]; then
    echo "  sticker OK $sz <= 262144"
    break
  fi
  echo "  sticker too large $sz > 262144, retry crf $crf+"
done

echo "[5/5] Encode emoji 100x100 ≤256KB"
for crf in 32 35 38 41 44; do
  sz=$(encode 100 "$OUT_EMOJI" "$crf")
  if [[ "$sz" -le $((256*1024)) ]]; then
    echo "  emoji OK $sz <= 262144"
    break
  fi
  echo "  emoji too large $sz > 262144, retry"
done

echo "=== Validate ==="
for f in "$OUT_STICKER" "$OUT_EMOJI"; do
  echo "--- $f ---"
  ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,avg_frame_rate -of default=nw=1 "$f" | cat
  ffprobe -v error -show_entries stream_tags=alpha_mode -of default=nw=1 "$f" | cat || true
  ffprobe -v error -show_entries stream=codec_type -of csv "$f" | cat
  ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$f" | cat
  SZ=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f")
  if [[ "$SZ" -gt $((256*1024)) ]]; then echo "WARN size >256KB" >&2; fi
done

echo "Done: $OUT_STICKER + $OUT_EMOJI (from $INPUT, slug=$SLUG, dur=$DUR)"

rm -rf "$TMPDIR"
