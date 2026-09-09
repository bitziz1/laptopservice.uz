#!/usr/bin/env bash
#
# Полный пайплайн обработки одного сгенерированного ролика услуги:
# извлечение кадров -> AI-матирование (isnet) -> сборка альфа-видео ->
# запекание на цвет карточки #171A20 (mp4 + webm) -> постер.
#
# Использование:
#   ./process_service.sh <slug> <путь-к-сырому-видео>
#
# Пример:
#   ./process_service.sh remont-videokarty-kompyutera ~/Desktop/gpu-raw.mp4
#
# Зависимости: ffmpeg, python3 + rembg ("pip install 'rembg[cpu]' onnxruntime"),
# cwebp (для постера в webp; опционально — если нет, просто закомментируйте строку).

set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <slug> <path-to-raw-video>"
  exit 1
fi

SLUG="$1"
SRC="$2"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

OUTDIR="public/videos/services"
TMP="/tmp/svc-anim/${SLUG}"
BG="0x171A20"
FPS=24
SIZE=640x640

mkdir -p "$OUTDIR" "$TMP/frames_in" "$TMP/frames_out"

echo "==> [1/7] Извлечение кадров из ${SRC}"
ffmpeg -y -hide_banner -loglevel error \
  -i "$SRC" \
  -vf "fps=${FPS},scale=${SIZE%x*}:${SIZE#*x}" \
  "$TMP/frames_in/%04d.png"

echo "==> [2/7] AI-матирование (isnet-general-use)"
python3 "$SCRIPT_DIR/matte.py" "$TMP/frames_in" "$TMP/frames_out"

echo "==> [2.5/7] QA: проверка качества маски по альфа-каналу"
if ! python3 "$SCRIPT_DIR/check_alpha_quality.py" "$TMP/frames_out" --threshold 6; then
  echo ""
  echo "СТОП: маска мягкая (низкий контраст объект/фон)."
  echo "Не собираю дальше плохой результат — перегенерируйте картинку/видео на"
  echo "противоположном фоновом бакете (см. раздел 3 гайда: тёмный <-> светлый)"
  echo "и запустите скрипт заново."
  exit 2
fi

echo "==> [3/7] Сборка альфа-видео (ProRes 4444)"
ffmpeg -y -hide_banner -loglevel error \
  -framerate "$FPS" -i "$TMP/frames_out/%04d.png" \
  -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le \
  "$TMP/alpha.mov"

echo "==> [4/7] Запекание на #171A20 -> mp4 (h264)"
ffmpeg -y -hide_banner -loglevel error \
  -i "$TMP/alpha.mov" \
  -f lavfi -i "color=color=${BG}:s=${SIZE}:r=${FPS}" \
  -filter_complex "[0:v]format=yuva420p[fg];[1:v][fg]overlay=shortest=1:format=yuv420,format=yuv420p[out]" \
  -map "[out]" -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p -movflags +faststart -an \
  "$OUTDIR/${SLUG}.mp4"

echo "==> [5/7] Запекание на #171A20 -> webm (vp9)"
ffmpeg -y -hide_banner -loglevel error \
  -i "$TMP/alpha.mov" \
  -f lavfi -i "color=color=${BG}:s=${SIZE}:r=${FPS}" \
  -filter_complex "[0:v]format=yuva420p[fg];[1:v][fg]overlay=shortest=1:format=yuv420,format=yuv420p[out]" \
  -map "[out]" -c:v libvpx-vp9 -b:v 0 -crf 32 -auto-alt-ref 0 -an \
  "$OUTDIR/${SLUG}.webm"

echo "==> [6/7] Постер (jpg + webp)"
ffmpeg -y -hide_banner -loglevel error \
  -ss 1.5 -i "$OUTDIR/${SLUG}.mp4" -frames:v 1 -q:v 2 \
  "$OUTDIR/${SLUG}-poster.jpg"

if command -v cwebp >/dev/null 2>&1; then
  cwebp -q 85 "$OUTDIR/${SLUG}-poster.jpg" -o "$OUTDIR/${SLUG}-poster.webp" >/dev/null
else
  echo "  (cwebp не найден — пропускаю .webp постер, jpg достаточно как fallback)"
fi

echo ""
echo "Готово: ${OUTDIR}/${SLUG}.{mp4,webm} + постер"
echo "Не забудьте добавить '${SLUG}' в animatedServices в:"
echo "  src/components/ServiceCard.astro"
echo "  src/pages/services/[slug].astro"
