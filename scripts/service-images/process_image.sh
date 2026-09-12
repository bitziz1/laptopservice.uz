#!/usr/bin/env bash
# process_image.sh — вырезает объект из фото услуги и сохраняет прозрачный webp
# Основной метод: rembg isnet-general-use (matte_image.py). Fallback: цветовой ключ (matte_colorkey.py) без скачивания.
# Использование:
#   ./process_image.sh <slug> <src-image> [--size 512] [--method colorkey]
# Примеры:
#   ./process_image.sh remont-materinskoy-platy-pk content/services/remont-materinskoy-platy-pk/image.png
#   ./process_image.sh zamena-razema-pitaniya content/services/zamena-razema-pitaniya/image.png --method colorkey
# Вывод: public/images/services/<slug>.webp (прозрачный, bg накладывается CSS #171A20)
# Логика: isnet → QA (trans/semi/opaque). Если trans>75% или opaque<15% (корпус стал прозрачным) → автопереключение на colorkey.
# Кейс 2026-09: razem-pitaniya isnet дал 80.2% trans / 7.6% opaque → fallback colorkey 53.9% trans / 44.4% opaque.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <slug> <src-image> [--size 512|1024]"
  exit 1
fi

SLUG="$1"
SRC="$2"
shift 2
SIZE=""  # пусто = оригинальный размер, иначе ресайз до SIZE x SIZE

# Выбор метода: isnet по умолчанию, colorkey как fallback когда корпус становится прозрачным.
# Можно принудительно: ./process_image.sh <slug> <src> --method colorkey  или --colorkey
METHOD="isnet"
for arg in "$@"; do
  if [[ "$arg" == *colorkey* ]]; then METHOD="colorkey"; fi
done

while [[ $# -gt 0 ]]; do
  case "$1" in
    --size) SIZE="$2"; shift 2 ;;
    --size=*) SIZE="${1#--size=}"; shift ;;
    --method=*) shift ;; # уже учтён выше
    --colorkey) shift ;;
    --method) shift 2 ;; # --method colorkey
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTDIR="public/images/services"
TMP_PNG="/tmp/${SLUG}_matte.png"
OUT_WEBP="$OUTDIR/${SLUG}.webp"

mkdir -p "$OUTDIR"

if [[ "$METHOD" == "colorkey" ]]; then
  echo "==> [$SLUG] matte $SRC -> $OUT_WEBP (colorkey fallback, no download)"
  python3 "$SCRIPT_DIR/matte_colorkey.py" "$SRC" "$TMP_PNG" --thresh 55 --sigma 0.7
else
  echo "==> [$SLUG] matte $SRC -> $OUT_WEBP (isnet, webp only)"
  python3 "$SCRIPT_DIR/matte_image.py" "$SRC" "$TMP_PNG"

  # QA сразу после matte: если ноутбук стал прозрачным — автo-fallback на colorkey
  # Критерий из кейса zamena-razema-pitaniya: isnet дал 80% trans / 8% opaque / 11% semi
  # Норма для isnet: ~45-60% trans, >35% opaque. Порог: trans>75 или opaque<15 → fallback
  QA_RESULT=$(python3 -c "
from PIL import Image
from pathlib import Path
p = Path('$TMP_PNG')
im = Image.open(p)
alpha = im.split()[-1]
hist = alpha.histogram()
total=sum(hist)
semi=sum(hist[5:250])/total*100
trans=sum(hist[0:5])/total*100
opaque=sum(hist[250:256])/total*100
print(f'{trans:.1f} {semi:.1f} {opaque:.1f}')
if trans>75 or opaque<15:
    print('FALLBACK')
")
  if [[ "$QA_RESULT" == *FALLBACK* ]]; then
    echo "  WARN: isnet QA bad — laptop стал прозрачным (trans>75% или opaque<15%), переключаюсь на colorkey"
    echo "  QA: $QA_RESULT"
    python3 "$SCRIPT_DIR/matte_colorkey.py" "$SRC" "$TMP_PNG" --thresh 55 --sigma 0.7
  else
    echo "  QA isnet: $QA_RESULT"
  fi
fi

echo "  autocrop transparent borders (side edges especially)"
python3 -c "
from PIL import Image
from pathlib import Path
p = Path('$TMP_PNG')
im = Image.open(p).convert('RGBA')
# bbox where alpha > 15 (non-transparent)
alpha = im.split()[-1]
mask = alpha.point(lambda x: 255 if x > 15 else 0, mode='1')
bbox = mask.getbbox()
if not bbox:
    bbox = im.getbbox()
if bbox:
    pad = 16
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    w, h = r-l, b-t
    # keep at least 10px margin for side edges already handled, but ensure not too tight
    im2 = im.crop((l, t, r, b))
    im2.save(p)
    print(f'  crop {im.width}x{im.height} -> {im2.width}x{im2.height} bbox {bbox} pad {pad}')
else:
    print('  no bbox, skip crop')
"

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
