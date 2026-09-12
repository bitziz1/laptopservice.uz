#!/usr/bin/env bash
#
# Полный пайплайн обработки одного сгенерированного ролика услуги:
# извлечение кадров -> AI-матирование (isnet) -> [опционально boomerang реверс] -> [масштаб до SIZE] -> сборка альфа-видео ->
# запекание на цвет карточки #171A20 (mp4 + webm) -> постер.
#
# Использование:
#   ./process_service.sh <slug> <путь-к-сырому-видео> [--boomerang] [--size 256] [--threshold 6] [--alpha-matting] [--fg 240] [--bg 10] [--erode 10] [--force-qa] [--colorkey 0xD1D5DB] [--similarity 0.10] [--blend 0.10]
#   --colorkey удаляет ТОЛЬКО указанный серый фон (colorkey), всё остальное (голубой/синий объект) остаётся непрозрачным.
#
# Примеры:
#   ./process_service.sh remont-videokarty-kompyutera ~/Desktop/gpu-raw.mp4
#   ./process_service.sh pereustanovka-windows ./content/services/pereustanovka-windows/video.mp4 --alpha-matting --erode 10 --threshold 20
#   ./process_service.sh pereustanovka-windows ./content/services/pereustanovka-windows/video.mp4 --alpha-matting --fg 200 --bg 20 --erode 15 --threshold 5 --force-qa  # экспериментально пропустить QA
#   ./process_service.sh pereustanovka-windows ./content/services/pereustanovka-windows/video.mp4 --colorkey 0xD1D5DB --similarity 0.10 --blend 0.10 --threshold 15  # только серый фон удалится
#
# Зависимости: ffmpeg, python3 + rembg ("pip install 'rembg[cpu]' onnxruntime"),
# cwebp (для постера в webp; опционально).
#
# Идемпотентно: исходник в content/services/<slug>/ не трогается, вывод в public/videos/services/<slug>.*

set -euo pipefail

# --- parse args ---
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <slug> <path-to-raw-video> [--boomerang] [--size 256|512|640] [--threshold 6] [--alpha-matting] [--fg 240] [--bg 10] [--erode 10] [--force-qa] [--colorkey 0xD1D5DB] [--similarity 0.10] [--blend 0.10]"
  exit 1
fi

SLUG="$1"
SRC="$2"
shift 2

BOOMERANG=0
SIZE=256
THRESHOLD=""
ALPHA_MATTING=0
FG=240
BG=10
ERODE=10
FORCE_QA=0
COLORKEY=""
SIMILARITY="0.10"
BLEND="0.10"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --boomerang) BOOMERANG=1; shift ;;
    --size) SIZE="$2"; shift 2 ;;
    --size=*) SIZE="${1#--size=}"; shift ;;
    --threshold) THRESHOLD="$2"; shift 2 ;;
    --threshold=*) THRESHOLD="${1#--threshold=}"; shift ;;
    --alpha-matting) ALPHA_MATTING=1; shift ;;
    --fg) FG="$2"; shift 2 ;;
    --fg=*) FG="${1#--fg=}"; shift ;;
    --bg) BG="$2"; shift 2 ;;
    --bg=*) BG="${1#--bg=}"; shift ;;
    --erode) ERODE="$2"; shift 2 ;;
    --erode=*) ERODE="${1#--erode=}"; shift ;;
    --force-qa) FORCE_QA=1; shift ;;
    --colorkey) COLORKEY="$2"; shift 2 ;;
    --colorkey=*) COLORKEY="${1#--colorkey=}"; shift ;;
    --similarity) SIMILARITY="$2"; shift 2 ;;
    --similarity=*) SIMILARITY="${1#--similarity=}"; shift ;;
    --blend) BLEND="$2"; shift 2 ;;
    --blend=*) BLEND="${1#--blend=}"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

OUTDIR="public/videos/services"
TMP="/tmp/svc-anim/${SLUG}"
BG_COLOR="0x171A20"
FPS=24
EXTRACT_SIZE=640
SIZE_PARAM="${SIZE}x${SIZE}"
EXTRACT_PARAM="${EXTRACT_SIZE}x${EXTRACT_SIZE}"

mkdir -p "$OUTDIR" "$TMP/frames_in" "$TMP/frames_out"
rm -f "$TMP/frames_in"/*.png 2>/dev/null || true
rm -f "$TMP/frames_out"/*.png 2>/dev/null || true
rm -rf "$TMP/frames_combined" "$TMP/frames_scaled" 2>/dev/null || true

echo "==> [1/7] Извлечение кадров из ${SRC} (extract ${EXTRACT_PARAM} -> output ${SIZE_PARAM}, fps ${FPS}${BOOMERANG:+ boomerang})"
ffmpeg -y -hide_banner -loglevel error \
  -i "$SRC" \
  -vf "fps=${FPS},scale=${EXTRACT_SIZE}:${EXTRACT_SIZE}:flags=lanczos" \
  "$TMP/frames_in/%04d.png"

if [[ -n "$COLORKEY" ]]; then
  # Режим colorkey: удаляется ТОЛЬКО указанный серый фон, всё остальное (голубой/синий объект) остаётся непрозрачным.
  # Нормализуем цвет: #D1D5DB -> 0xD1D5DB
  CK="${COLORKEY/#\#/0x}"
  if [[ "$CK" != 0x* ]]; then CK="0x$CK"; fi
  echo "==> [2/7] Colorkey-матирование (только серый фон ${CK} sim=${SIMILARITY} blend=${BLEND}) на ${EXTRACT_PARAM}"
  for f in "$TMP/frames_in"/*.png; do
    base=$(basename "$f")
    ffmpeg -y -hide_banner -loglevel error -i "$f" -vf "colorkey=${CK}:${SIMILARITY}:${BLEND},format=rgba" "$TMP/frames_out/$base"
  done
  echo "  Colorkey done: $(ls "$TMP/frames_out"/*.png | wc -l) frames -> ${CK}"
else
  echo "==> [2/7] AI-матирование (isnet-general-use) на ${EXTRACT_PARAM} ${ALPHA_MATTING:+alpha_matting fg=$FG bg=$BG erode=$ERODE}"
  if [[ "$ALPHA_MATTING" == "1" ]]; then
    python3 "$SCRIPT_DIR/matte.py" "$TMP/frames_in" "$TMP/frames_out" --alpha-matting --fg "$FG" --bg "$BG" --erode "$ERODE"
  else
    python3 "$SCRIPT_DIR/matte.py" "$TMP/frames_in" "$TMP/frames_out"
  fi
fi

if [[ -z "$THRESHOLD" ]]; then
  THRESHOLD=6
  if [[ "$BOOMERANG" == "1" ]]; then THRESHOLD=30; fi
fi
echo "==> [2.5/7] QA: проверка качества маски по альфа-каналу (порог ${THRESHOLD}%) ${FORCE_QA:+[force-qa]}"
if ! python3 "$SCRIPT_DIR/check_alpha_quality.py" "$TMP/frames_out" --threshold "$THRESHOLD"; then
  if [[ "$FORCE_QA" == "1" ]]; then
    echo "WARN: QA провален, но --force-qa включён — продолжаю запекание экспериментально."
  else
    echo ""
    echo "СТОП: маска мягкая (низкий контраст объект/фон)."
    echo "Попробуйте: --alpha-matting --erode 5..15 --threshold 20..30 или перегенерируйте на другом бакете (тёмный <-> светлый, guide-final-v2 раздел 3)"
    echo "Пример: $0 $SLUG $SRC --alpha-matting --erode 15 --threshold 25"
    echo "Или экспериментально: $0 $SLUG $SRC --threshold 5 --force-qa"
    exit 2
  fi
fi

if [[ "$BOOMERANG" == "1" ]]; then
  echo "==> [2.7/7] Boomerang: склейка вперед + реверс (~8s из 4s)"
  N=$(ls "$TMP/frames_out"/*.png | wc -l)
  if [[ "$N" -lt 3 ]]; then
    echo "Boomerang: слишком мало кадров ($N), пропускаю"
  else
    TMP_COMB="$TMP/frames_combined"
    mkdir -p "$TMP_COMB"
    for f in "$TMP/frames_out"/*.png; do
      cp "$f" "$TMP_COMB/$(basename "$f")"
    done
    idx=$((N+1))
    for f in $(ls "$TMP/frames_out"/*.png | sort -r); do
      base=$(basename "$f")
      if [[ "$base" == "0001.png" ]] || [[ "$base" == "$(printf "%04d.png" "$N")" ]]; then
        continue
      fi
      printf -v newname "%04d.png" "$idx"
      cp "$f" "$TMP_COMB/$newname"
      idx=$((idx+1))
    done
    rm -rf "$TMP/frames_out"
    mv "$TMP_COMB" "$TMP/frames_out"
    FINAL_N=$(ls "$TMP/frames_out"/*.png | wc -l)
    DUR=$(awk -v n="$FINAL_N" -v fps="$FPS" 'BEGIN{printf "%.2f", n/fps}')
    echo "  Boomerang done: $N -> $FINAL_N frames ($FINAL_N / $FPS = ${DUR}s)"
  fi
fi

if [[ "$SIZE" != "$EXTRACT_SIZE" ]]; then
  echo "==> [2.8/7] Даунскейл матированных кадров ${EXTRACT_PARAM} -> ${SIZE_PARAM} (сохраняем качество маски)"
  TMP_SCALED="$TMP/frames_scaled"
  mkdir -p "$TMP_SCALED"
  for f in "$TMP/frames_out"/*.png; do
    base=$(basename "$f")
    ffmpeg -y -hide_banner -loglevel error -i "$f" -vf "scale=${SIZE}:${SIZE}:flags=lanczos" "$TMP_SCALED/$base"
  done
  rm -rf "$TMP/frames_out"
  mv "$TMP_SCALED" "$TMP/frames_out"
  echo "  Даунскейл done: $(ls "$TMP/frames_out"/*.png | wc -l) frames -> ${SIZE_PARAM}"
fi

echo "==> [3/7] Сборка альфа-видео (ProRes 4444) ${SIZE_PARAM}"
ffmpeg -y -hide_banner -loglevel error \
  -framerate "$FPS" -i "$TMP/frames_out/%04d.png" \
  -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le \
  "$TMP/alpha.mov"

echo "==> [4/7] Запекание на #171A20 -> webm (vp9) ${SIZE_PARAM} (только webm, mp4 не нужен)"
ffmpeg -y -hide_banner -loglevel error \
  -i "$TMP/alpha.mov" \
  -f lavfi -i "color=color=${BG_COLOR}:s=${SIZE_PARAM}:r=${FPS}" \
  -filter_complex "[0:v]format=yuva420p[fg];[1:v][fg]overlay=shortest=1:format=yuv420,format=yuv420p[out]" \
  -map "[out]" -c:v libvpx-vp9 -b:v 0 -crf 32 -auto-alt-ref 0 -an \
  "$OUTDIR/${SLUG}.webm"

echo "==> [5/7] Постер webp ${SIZE_PARAM} (только webp)"
ffmpeg -y -hide_banner -loglevel error \
  -ss 1.5 -i "$OUTDIR/${SLUG}.webm" -frames:v 1 -q:v 2 \
  "$TMP/poster.jpg"
cwebp -q 85 "$TMP/poster.jpg" -o "$OUTDIR/${SLUG}-poster.webp" >/dev/null
rm -f "$TMP/poster.jpg"

echo ""
echo "Готово: ${OUTDIR}/${SLUG}.webm + ${SLUG}-poster.webp (${SIZE_PARAM}$( [[ $BOOMERANG == 1 ]] && echo ", boomerang" ))"
echo "Исходник ${SRC} цел, вывод перезаписан."
