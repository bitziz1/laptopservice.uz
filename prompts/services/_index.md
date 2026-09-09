# Services — animation prompts (Obsidian vault)

> Сгенерировано из `docs/service-animation/guide-final-v2.md` (2026-09-09). Откройте эту папку как vault в Obsidian.

## Сервисы (10)

- [[services/remont-posle-zalitiya/remont-posle-zalitiya|Ремонт ноутбука после залития]] — `remont-posle-zalitiya` — тёмный bucket
- [[services/remont-materinskoy-platy-pk/remont-materinskoy-platy-pk|Ремонт материнской платы]] — `remont-materinskoy-platy-pk` — светлый bucket
- [[services/remont-monobloka/remont-monobloka|Ремонт моноблока]] — `remont-monobloka` — тёмный bucket
- [[services/remont-videokarty-kompyutera/remont-videokarty-kompyutera|Ремонт видеокарты]] — `remont-videokarty-kompyutera` — тёмный bucket
- [[services/pereustanovka-windows/pereustanovka-windows|Переустановка Windows]] — `pereustanovka-windows` — светлый bucket
- [[services/zamena-akkumulyatora-noutbuka/zamena-akkumulyatora-noutbuka|Замена аккумулятора ноутбука]] — `zamena-akkumulyatora-noutbuka` — тёмный bucket
- [[services/chistka-noutbuka-ot-pyli/chistka-noutbuka-ot-pyli|Чистка ноутбука от пыли]] — `chistka-noutbuka-ot-pyli` — светлый bucket
- [[services/zamena-matritsy-ekrana/zamena-matritsy-ekrana|Замена матрицы экрана ноутбука]] — `zamena-matritsy-ekrana` — светлый bucket
- [[services/zamena-razema-pitaniya/zamena-razema-pitaniya|Замена разъёма питания на ноутбуке]] — `zamena-razema-pitaniya` — светлый bucket
- [[services/vosstanovlenie-dannyh-hdd/vosstanovlenie-dannyh-hdd|Восстановление данных HDD]] — `vosstanovlenie-dannyh-hdd` — тёмный bucket

## Использование (кратко)

1. Откройте `services/<slug>/<slug>.md` → скопируйте *Image prompt* → генерите картинку.
2. Скопируйте *Video prompt A* (или B) → генерите видео 4 сек.
3. Перетащите файлы в `Attachments/<slug>/` прямо в Obsidian.
4. Запустите `./scripts/service-animation/process_service.sh <slug> prompts/Attachments/<slug>/raw-video.mp4`
5. Проверьте `public/videos/services/<slug>.*` и добавьте в `animatedServices`.

См. `docs/service-animation/guide-final-v2.md` §3-5 для выбора фона и QA.
