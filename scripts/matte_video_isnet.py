#!/usr/bin/env python3
"""
AI-матирование видео по форме (isnet-general-use), а не по цвету.
Для градиентной виньетки #00FF00-подход хрупкий и конфликтует с teal #19BD9B.
Использование: python scripts/matte_video_isnet.py input.mp4 [/tmp/alpha.mov]
Или вручную: извлечь кадры в /tmp/frames_in, запустить скрипт, собрать alpha.mov
"""
import sys, os, glob, tqdm
from rembg import new_session, remove
from PIL import Image

session = new_session("isnet-general-use")

in_dir = sys.argv[3] if len(sys.argv) > 3 else "/tmp/frames_in"
out_dir = sys.argv[4] if len(sys.argv) > 4 else "/tmp/frames_out"
if len(sys.argv) > 1 and sys.argv[1].endswith(".mp4") and os.path.isfile(sys.argv[1]):
    # если передан input.mp4 как 1-й аргумент — извлечь кадры автоматически
    import subprocess as sp
    in_dir = "/tmp/frames_in"
    out_dir = "/tmp/frames_out"
    os.makedirs(in_dir, exist_ok=True)
    os.makedirs(out_dir, exist_ok=True)
    # очистить старые кадры
    for f in glob.glob(os.path.join(in_dir, "*.png")): os.remove(f)
    for f in glob.glob(os.path.join(out_dir, "*.png")): os.remove(f)
    sp.run(["ffmpeg","-y","-hide_banner","-loglevel","error","-i",sys.argv[1],"-vsync","0", os.path.join(in_dir,"%04d.png")], check=True)

os.makedirs(out_dir, exist_ok=True)
frames = sorted(glob.glob(os.path.join(in_dir, "*.png")))
print(f"found {len(frames)} frames, using isnet-general-use → {out_dir}")

for f in tqdm.tqdm(frames):
    out = os.path.join(out_dir, os.path.basename(f))
    if os.path.exists(out):
        continue
    img = Image.open(f)
    out_img = remove(img, session=session)
    out_img.save(out)

print("done → собрать: ffmpeg -framerate 24 -i /tmp/frames_out/%04d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le /tmp/alpha.mov")
