# Threads Import — fetch from threads.com/share

Тянет текст/og:image/og:url из SSR `og:description` share-ссылки без API ключа и создаёт `content/threads/YYYY_MM/<slug>/<slug>.md` + фото.

**Файлы:** `fetch_threads.py`

```bash
python3 scripts/content-threads/fetch_threads.py https://www.threads.com/share/BBR4vE0M6h/ --date 2026-08-30
python3 scripts/content-threads/fetch_threads.py https://www.threads.com/share/XXX/ --date 2026-08-30 https://www.threads.com/share/YYY/ --date 2026-09-01
python3 scripts/content-threads/fetch_threads.py --file urls.txt
python3 scripts/content-threads/fetch_threads.py --dry-run
# npm alias: npm run threads:import -- https://www.threads.com/share/XXX/ --date 2026-08-30
```

---

См. также `docs/service-animation/guide-final-v2.md` и главный `scripts/README.md`.
