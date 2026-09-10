#!/usr/bin/env bash
# ingest_images.sh — прозрачные фото услуг: контент content/services/<slug>/*.{png,jpg,jpeg} -> public/images/services/<slug>.png (isnet, без фона)
# Фон накладывается на сайте через CSS bg #171A20 на всю ширину, поэтому сохраняем именно прозрачный.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

for md in content/services/*/*.md; do
  [ -f "$md" ] || continue
  slug="$(basename "$(dirname "$md")")"
  dir="$(dirname "$md")"
  # источник: первый png/jpg/jpeg в папке (приоритет image.png, image-board-repair.png, image-videocard.jpg, любой)
  src=""
  for cand in "$dir/image.png" "$dir/image.jpg" "$dir/image.jpeg" "$dir/image-board-repair.png" "$dir/image-videocard.jpg" "$dir"/*.png "$dir"/*.jpg "$dir"/*.jpeg; do
    [ -f "$cand" ] || continue
    # пропускаем уже обработанные если вдруг лежат в content (не должны)
    src="$cand"
    break
  done
  if [[ -z "$src" ]]; then
    continue
  fi
  out="public/images/services/${slug}.png"
  if [[ -f "$out" && "$out" -nt "$src" ]]; then
    echo "[$slug] image up-to-date: $out — skip"
    continue
  fi
  echo "[$slug] image ingest: $src -> $out"
  bash "$SCRIPT_DIR/process_image.sh" "$slug" "$src"
done
echo "image ingest done"
