# Convert to Telegram Sticker/Emoji

Из готового видео с ровным фоном делает Video Sticker (512×512) и Video Emoji (100×100) — VP9, yuv420p+alpha, 30fps, ≤256KB.

**Файлы:** `convert_to_sticker_emoji.sh`

```bash
./scripts/convert-sticker/convert_to_sticker_emoji.sh public/videos/services/remont-videokarty-kompyutera.mp4
# или:
./scripts/convert-sticker/convert_to_sticker_emoji.sh input.mp4 custom-slug 3
# выход: public/stickers/<slug>.webm 177KB + public/emoji/<slug>.webm 26KB
ffprobe -v error -show_entries stream=codec_name,width,height -of default=nw=1 public/stickers/<slug>.webm
```

---

См. также `docs/service-animation/guide-final-v2.md` и главный `scripts/README.md`.
