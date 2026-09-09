#!/usr/bin/env python3
"""
QA-гейт для матированных кадров: считает % полностью прозрачных / полупрозрачных /
непрозрачных пикселей по альфа-каналу на выборке кадров и флагует мягкую маску.

Пороги найдены эмпирически 08.09.2026 на реальных тестах:
  - высокий контраст объект/фон (напр. светлый металл на #171A20) -> ~1-2% semi
  - низкий контраст (напр. серый объект на сером #808080 фоне)    -> ~14% semi,
    объект местами становится полупрозрачным/пропадает в отдельных кадрах.

Usage:
    python3 check_alpha_quality.py <frames_out_dir> [--threshold 6.0] [--sample 6]

Exit codes:
    0 - маска в норме
    1 - в папке нет кадров / ошибка
    2 - маска мягкая (хуже порога) - перегенерируйте на другом фоновом бакете
"""
import argparse
import sys
from pathlib import Path

from PIL import Image


def alpha_breakdown(png_path: Path) -> tuple[float, float, float]:
    im = Image.open(png_path)
    if im.mode != "RGBA":
        raise ValueError(f"{png_path} has no alpha channel (mode={im.mode})")
    alpha = im.split()[-1]
    hist = alpha.histogram()
    total = sum(hist)
    trans = sum(hist[0:5]) / total * 100
    semi = sum(hist[5:250]) / total * 100
    opaque = sum(hist[250:256]) / total * 100
    return trans, semi, opaque


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("frames_dir", help="Папка с матированными PNG-кадрами (RGBA)")
    ap.add_argument(
        "--threshold",
        type=float,
        default=6.0,
        help="Максимально допустимый %% semi-transparent пикселей на кадр (default: 6.0)",
    )
    ap.add_argument(
        "--sample",
        type=int,
        default=6,
        help="Сколько кадров равномерно взять на проверку (default: 6)",
    )
    args = ap.parse_args()

    frames_dir = Path(args.frames_dir)
    frames = sorted(frames_dir.glob("*.png"))
    if not frames:
        print(f"No frames in {frames_dir}", file=sys.stderr)
        sys.exit(1)

    step = max(1, len(frames) // args.sample)
    sampled = frames[::step][: args.sample]

    worst_semi = 0.0
    print(f"{'frame':20} {'trans%':>8} {'semi%':>8} {'opaque%':>8}")
    for f in sampled:
        try:
            trans, semi, opaque = alpha_breakdown(f)
        except ValueError as e:
            print(f"  skip {f.name}: {e}", file=sys.stderr)
            continue
        worst_semi = max(worst_semi, semi)
        flag = "  <-- МЯГКАЯ МАСКА" if semi > args.threshold else ""
        print(f"{f.name:20} {trans:7.1f}% {semi:7.1f}% {opaque:7.1f}%{flag}")

    print()
    if worst_semi > args.threshold:
        print(f"ПРОВАЛ: худший кадр {worst_semi:.1f}% semi > порога {args.threshold}%.")
        print("Низкий контраст объект/фон — перегенерируйте картинку на противоположном")
        print("фоновом бакете (тёмный <-> светлый, см. раздел 3 гайда) и прогоните заново.")
        sys.exit(2)

    print(f"OK: худший кадр {worst_semi:.1f}% semi <= порога {args.threshold}%.")
    sys.exit(0)


if __name__ == "__main__":
    main()
