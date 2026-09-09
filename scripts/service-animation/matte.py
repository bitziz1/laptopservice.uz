#!/usr/bin/env python3
"""
Батч AI-матирование последовательности кадров через rembg (isnet-general-use).
Сессия модели переиспользуется на все кадры — быстрее, чем грузить модель заново
на каждый файл.

Usage:
    python3 matte.py <frames_in_dir> <frames_out_dir>
"""
import sys
from pathlib import Path

from rembg import remove, new_session


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: matte.py <frames_in_dir> <frames_out_dir>")
        sys.exit(1)

    src_dir = Path(sys.argv[1])
    dst_dir = Path(sys.argv[2])
    dst_dir.mkdir(parents=True, exist_ok=True)

    # isnet-general-use: стабильнее u2net на этом стиле рендера (проверено
    # 08.09.2026 — u2net давал фликер, 2/6 кадров центр объекта уходил в
    # прозрачность на градиентном фоне).
    session = new_session("isnet-general-use")

    frames = sorted(src_dir.glob("*.png"))
    if not frames:
        print(f"No frames found in {src_dir}")
        sys.exit(1)

    for i, frame in enumerate(frames, 1):
        data = frame.read_bytes()
        out = remove(data, session=session)
        (dst_dir / frame.name).write_bytes(out)
        if i % 10 == 0 or i == len(frames):
            print(f"  {i}/{len(frames)} frames matted")

    print(f"Done: {len(frames)} frames -> {dst_dir}")


if __name__ == "__main__":
    main()
