#!/usr/bin/env python3
"""
Single image background removal via rembg isnet-general-use.
Usage: python3 matte_image.py <src.png/jpg> <dst.png>
"""
import sys
from pathlib import Path
from rembg import remove, new_session

def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <src> <dst>")
        sys.exit(1)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    if not src.exists():
        print(f"src not found: {src}")
        sys.exit(1)
    dst.parent.mkdir(parents=True, exist_ok=True)
    session = new_session("isnet-general-use")
    data = src.read_bytes()
    out = remove(data, session=session)
    dst.write_bytes(out)
    print(f"Done: {src} -> {dst} ({len(out)} bytes)")

if __name__ == "__main__":
    main()
