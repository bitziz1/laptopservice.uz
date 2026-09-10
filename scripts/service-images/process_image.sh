#!/usr/bin/env bash
# process_image.sh — вырезает объект из фото услуги (isnet-general-use) и сохраняет прозрачный PNG
# Использование:
#   ./process_image.sh <slug> <src-image> [--size 512]
# Пример:
#   ./process_image.sh remont-materinskoy-platy-pk content/services/remont-materinskoy-platy-pk/image-board-repair.png
# Вывод: public/images/services/<slug>.png (прозрачный, без фона) + .webp
# Фон накладывается на сайте через CSS (bg #171A20 на всю ширину), поэтому сохраняем именно прозрачный.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <slug> <src-image> [--size 512|1024]"
  exit 1
fi

SLUG="$1"
SRC="$2"
shift 2
SIZE=""  # пусто = оригинальный размер, иначе ресайз до SIZE x SIZE

while [[ $# -gt 0 ]]; do
  case "$1" in
    --size) SIZE="$2"; shift 2 ;;
    --size=*) SIZE="${1#--size=}"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTDIR="public/images/services"
TMP_PNG="/tmp/${SLUG}_matte.png"
OUT_WEBP="$OUTDIR/${SLUG}.webp"

mkdir -p "$OUTDIR"

echo "==> [$SLUG] matte $SRC -> $OUT_WEBP (isnet, webp only)"
python3 "$SCRIPT_DIR/matte_image.py" "$SRC" "$TMP_PNG"

if [[ -n "$SIZE" ]]; then
  echo "  resize -> ${SIZE}x${SIZE}"
  ffmpeg -y -hide_banner -loglevel error -i "$TMP_PNG" -vf "scale=${SIZE}:${SIZE}:flags=lanczos" "$TMP_PNG"
fi

# cwebp webp only (png не сохраняется в public)
if command -v cwebp >/dev/null 2>&1; then
  cwebp -q 90 "$TMP_PNG" -o "$OUT_WEBP" >/dev/null 2>&1 && echo "  webp: $OUT_WEBP" || echo "  webp failed"
else
  echo "  cwebp not found"
  exit 1
fi

# QA: проверяем что есть альфа и объект не пропал
python3 -c "
from PIL import Image
from pathlib import Path
p = Path('$TMP_PNG')
im = Image.open(p)
assert im.mode == 'RGBA', f'no alpha: {im.mode}'
alpha = im.split()[-1]
hist = alpha.histogram()
total=sum(hist)
semi=sum(hist[5:250])/total*100
trans=sum(hist[0:5])/total*100
print(f'  QA: {trans:.1f}% trans {semi:.1f}% semi')
if semi > 15:
    print('  WARN: semi >15% — мягкая маска, проверьте контраст')
"
rm -f "$TMP_PNG"

echo "Done: $OUT_WEBP"
