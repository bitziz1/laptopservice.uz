# Reviews Import — Yandex Maps

Парсит `https://yandex.uz/maps/org/laptop_service/81659688745/reviews/` → `content/reviews/YYYY_MM/<slug>/<slug>.md` с аватаром. Дедупликация, device inference.

**Файлы:** `fetch_reviews.py`

```bash
python3 scripts/content-reviews/fetch_reviews.py
python3 scripts/content-reviews/fetch_reviews.py --dry-run
python3 scripts/content-reviews/fetch_reviews.py --url https://yandex.uz/maps/org/laptop_service/81659688745/reviews/
# npm alias: npm run reviews:import
```

---

См. также `docs/service-animation/guide-final-v2.md` и главный `scripts/README.md`.
