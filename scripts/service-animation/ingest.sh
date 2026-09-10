#!/usr/bin/env bash
# ingest.sh — unified: источник видео это файл content/services/<slug>/video.mp4 (или любой *.mp4 в папке)
# НЕ читает frontmatter `video:` (поле удалено для унификации).
# Вывод: только public/videos/services/<slug>.webm + poster.webp (прозрачный фон вырезан, без mp4/png/jpg)
# Повторный запуск идемпотентен: пропускает если public webm новее исходника и с теми же параметрами (size/boomerang).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

DEFAULT_SIZE=256
BOOMERANG_SLUGS=("pereustanovka-windows")

contains_boomerang() {
  local slug="$1"
  for s in "${BOOMERANG_SLUGS[@]}"; do
    if [[ "$s" == "$slug" ]]; then return 0; fi
  done
  return 1
}

for md in content/services/*/*.md; do
  [ -f "$md" ] || continue
  slug="$(basename "$(dirname "$md")")"
  dir="$(dirname "$md")"

  # --- источник видео: файл в папке услуги, не frontmatter ---
  src=""
  if [[ -f "$dir/video.mp4" ]]; then
    src="$dir/video.mp4"
  else
    # fallback: первый mp4/mov/webm в папке (на случай если закинули с другим именем)
    for cand in "$dir"/*.mp4 "$dir"/*.mov "$dir"/*.webm; do
      [ -e "$cand" ] || continue
      # пропускаем уже обработанные файлы если они почему-то лежат в content (не должны)
      src="$cand"
      break
    done
  fi

  if [[ -z "$src" ]]; then
    # нет исходника — нет анимации для этой услуги (штатно, не ошибка)
    continue
  fi

  # --- per-service options (frontmatter videoSize/videoBoomerang если вдруг добавят, иначе defaults) ---
  SIZE="$DEFAULT_SIZE"
  BOOMERANG=0
  size_line="$(grep -E '^[[:space:]]*videoSize:' "$md" | head -1 || true)"
  if [[ -n "$size_line" ]]; then
    sv="$(echo "$size_line" | sed -E 's/^[[:space:]]*videoSize:[[:space:]]*//; s/[[:space:]]*#.*$//' | xargs || true)"
    sv="$(echo "$sv" | tr -d '"'\''')"
    if [[ "$sv" =~ ^[0-9]+$ ]]; then SIZE="$sv"; fi
  fi
  boom_line="$(grep -E '^[[:space:]]*videoBoomerang:' "$md" | head -1 || true)"
  if [[ -z "$boom_line" ]]; then boom_line="$(grep -E '^[[:space:]]*boomerang:' "$md" | head -1 || true)"; fi
  if [[ -n "$boom_line" ]]; then
    bv="$(echo "$boom_line" | sed -E 's/^[[:space:]]*[^:]+:[[:space:]]*//; s/[[:space:]]*#.*$//' | xargs || true)"
    bv="$(echo "$bv" | tr '[:upper:]' '[:lower:]')"
    if [[ "$bv" == "true" || "$bv" == "1" || "$bv" == "yes" ]]; then BOOMERANG=1; else BOOMERANG=0; fi
  else
    if contains_boomerang "$slug"; then BOOMERANG=1; fi
  fi

  out="public/videos/services/${slug}.webm"
  meta="public/videos/services/${slug}.meta"
  args=()
  if [[ "$BOOMERANG" == "1" ]]; then args+=(--boomerang); fi
  args+=(--size "$SIZE")

  if [[ -f "$out" && "$out" -nt "$src" ]]; then
    if [[ -f "$meta" ]]; then
      old="$(cat "$meta" 2>/dev/null || true)"
      cur="size=$SIZE boomerang=$BOOMERANG"
      if [[ "$old" == "$cur" ]]; then
        echo "[$slug] up-to-date: $out (size $SIZE$( [[ $BOOMERANG == 1 ]] && echo ", boomerang")) — skip"
        continue
      else
        echo "[$slug] params changed: $old -> $cur — re-run"
      fi
    else
      echo "[$slug] legacy output (no meta) — re-run with size $SIZE$( [[ $BOOMERANG == 1 ]] && echo " boomerang")"
    fi
  fi

  echo "[$slug] ingest: $src -> $out (size $SIZE$( [[ $BOOMERANG == 1 ]] && echo ", boomerang"))"
  "$SCRIPT_DIR/process_service.sh" "$slug" "$src" "${args[@]}"
  echo "size=$SIZE boomerang=$BOOMERANG" > "$meta"
done

echo "ingest done"
