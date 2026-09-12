#!/usr/bin/env python3
"""
matte_colorkey.py — fallback для isnet когда AI делает корпус ноутбука прозрачным.
Стандартный метод без скачивания моделей: цветовой ключ + заливка экстерьера.

Проблема: isnet-general-use на светлом фоне (#E8ECF0) с серым ноутбуком даёт
  80% transparent / 8% opaque / 11% semi — внутренность корпуса (крышка, боковина)
  становится дыркой (alpha 3-24), на тёмном сайте #171A20 выглядит как чёрная дыра.
  Причина — низкий контраст серого металла к светлому фону, AI путает.

Решение (без скачивания, только Pillow/scipy/numpy):
  1. Оценка bg — самый светлый из 4 углов 10x10 (210,214,222 для текущей партии).
  2. dist = euclidean RGB к bg, hard = dist < thresh (default 55).
     thresh 55 подобран: тень 19-35 → прозрачная, ореол 47 → прозрачный,
     хайлайт корпуса 120 → непрозрачный, тонкая белая кромка остаётся.
  3. Экстерьер = компоненты hard связанные с границей (scipy.ndimage.label).
     Только экстерьер → alpha 0, interior (в т.ч. изолированные светлые блики) → 255.
  4. Гаусс sigma 0.7 для антиалиаса края (1px), сохраняет чёткость хайлайта.

Использование:
  python3 matte_colorkey.py <src.png> <dst.png> [--thresh 55] [--sigma 0.7] [--bg 210,214,222]

В пайплайне process_image.sh вызывается автоматически как fallback если QA после
isnet показывает trans>75% или opaque<10% (ноутбук стал прозрачным).
Можно вызвать вручную:
  python3 scripts/service-images/matte_colorkey.py content/services/zamena-razema-pitaniya/image.png /tmp/fixed.png
  cwebp -q 90 /tmp/fixed.png -o public/images/services/zamena-razema-pitaniya.webp

Зависимости: Pillow, numpy, scipy (уже есть — rembg их тянет). Без скачивания.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

def estimate_bg(rgb, patch=10):
    h, w = rgb.shape[:2]
    corners = [
        rgb[0:patch, 0:patch].reshape(-1, 3).mean(axis=0),
        rgb[0:patch, w-patch:w].reshape(-1, 3).mean(axis=0),
        rgb[h-patch:h, 0:patch].reshape(-1, 3).mean(axis=0),
        rgb[h-patch:h, w-patch:w].reshape(-1, 3).mean(axis=0),
    ]
    # самый светлый угол = фон (ноутбук тёмный, занимает остальные углы)
    # яркость = mean RGB
    brightness = [c.mean() for c in corners]
    idx = int(np.argmax(brightness))
    return corners[idx]

def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <src> <dst> [--thresh 55] [--sigma 0.7] [--bg R,G,B]")
        sys.exit(1)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    thresh = 55
    sigma = 0.7
    bg_override = None
    i = 3
    while i < len(sys.argv):
        if sys.argv[i] == "--thresh":
            thresh = int(sys.argv[i+1]); i+=2
        elif sys.argv[i] == "--sigma":
            sigma = float(sys.argv[i+1]); i+=2
        elif sys.argv[i] == "--bg":
            bg_override = np.array([int(x) for x in sys.argv[i+1].split(",")], dtype=float); i+=2
        elif sys.argv[i].startswith("--thresh="):
            thresh = int(sys.argv[i].split("=")[1]); i+=1
        elif sys.argv[i].startswith("--sigma="):
            sigma = float(sys.argv[i].split("=")[1]); i+=1
        else:
            print(f"Unknown arg {sys.argv[i]}"); sys.exit(1)

    if not src.exists():
        print(f"src not found: {src}"); sys.exit(1)
    dst.parent.mkdir(parents=True, exist_ok=True)

    src_img = Image.open(src).convert("RGBA")
    arr = np.array(src_img)
    rgb = arr[:,:,:3].astype(float)

    bg = bg_override if bg_override is not None else estimate_bg(rgb)
    print(f"bg estimated {bg.astype(int).tolist()} thresh={thresh} sigma={sigma}")

    dist = np.sqrt(np.sum((rgb - bg)**2, axis=2))
    hard = dist < thresh
    labeled, _ = ndi.label(hard)
    border_labels = set(np.unique(labeled[0,:])) | set(np.unique(labeled[-1,:])) | set(np.unique(labeled[:,0])) | set(np.unique(labeled[:,-1]))
    border_labels.discard(0)
    exterior = np.isin(labeled, list(border_labels))
    alpha_hard = np.where(exterior, 0, 255).astype(np.uint8)

    if sigma and sigma > 0:
        alpha = ndi.gaussian_filter(alpha_hard.astype(float), sigma=sigma).astype(np.uint8)
    else:
        alpha = alpha_hard

    out = arr.copy()
    out[:,:,3] = alpha
    Image.fromarray(out).save(dst)
    # QA
    hist = np.bincount(alpha.flatten(), minlength=256)
    total = alpha.size
    trans = hist[0:5].sum()/total*100
    semi = hist[5:250].sum()/total*100
    opaque = hist[250:256].sum()/total*100 if 256 in hist else hist[255]/total*100
    print(f"Done: {src} -> {dst} ({dst.stat().st_size} bytes)")
    print(f"QA: {trans:.1f}% trans {semi:.1f}% semi {opaque:.1f}% opaque")

if __name__ == "__main__":
    main()
