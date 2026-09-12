#!/usr/bin/env python3
"""
Батч AI-матирование последовательности кадров через rembg (isnet-general-use).
Сессия модели переиспользуется на все кадры — быстрее, чем грузить модель заново
на каждый файл.

Usage:
    python3 matte.py <frames_in_dir> <frames_out_dir> [--alpha-matting] [--fg 240] [--bg 10] [--erode 10]
    --alpha-matting включает alpha matting для смягчения/уплотнения маски.
    Для pereustanovka-windows (светло-серый #D1D5DB + голубой #19BD9B) без alpha_matting semi 27% и дырки;
    с --alpha-matting --erode 10 semi 17% opaque 24% — объект плотнее.
    Подбирайте через параметры, без хардкода slug.
"""
import argparse
import sys
from pathlib import Path

from rembg import remove, new_session


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("src_dir", help="Папка с входящими PNG кадрами")
    ap.add_argument("dst_dir", help="Папка для матированных PNG (RGBA)")
    ap.add_argument("--alpha-matting", action="store_true", help="Включить alpha_matting (мягче/плотнее, медленнее)")
    ap.add_argument("--fg", type=int, default=240, help="alpha_matting_foreground_threshold (default 240)")
    ap.add_argument("--bg", type=int, default=10, help="alpha_matting_background_threshold (default 10)")
    ap.add_argument("--erode", type=int, default=10, help="alpha_matting_erode_size (default 10)")
    args = ap.parse_args()

    src_dir = Path(args.src_dir)
    dst_dir = Path(args.dst_dir)
    dst_dir.mkdir(parents=True, exist_ok=True)

    # isnet-general-use: стабильнее u2net на этом стиле рендера (проверено
    # 08.09.2026 — u2net давал фликер, 2/6 кадров центр объекта уходил в
    # прозрачность на градиентном фоне).
    session = new_session("isnet-general-use")

    frames = sorted(src_dir.glob("*.png"))
    if not frames:
        print(f"No frames found in {src_dir}")
        sys.exit(1)

    mode = f"alpha_matting fg={args.fg} bg={args.bg} erode={args.erode}" if args.alpha_matting else "default"
    print(f"matte mode: {mode}")

    for i, frame in enumerate(frames, 1):
        data = frame.read_bytes()
        if args.alpha_matting:
            out = remove(
                data,
                session=session,
                alpha_matting=True,
                alpha_matting_foreground_threshold=args.fg,
                alpha_matting_background_threshold=args.bg,
                alpha_matting_erode_size=args.erode,
            )
        else:
            out = remove(data, session=session)
        (dst_dir / frame.name).write_bytes(out)
        if i % 10 == 0 or i == len(frames):
            print(f"  {i}/{len(frames)} frames matted")

    print(f"Done: {len(frames)} frames -> {dst_dir}")


if __name__ == "__main__":
    main()
