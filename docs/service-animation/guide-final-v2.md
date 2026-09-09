# Service Animations — финальный гайд (после тестов 08.09.2026, v2)

Матирование — **isnet-general-use** через `rembg`, не `u2net` (у него фликер на
градиенте: часть кадров центр объекта уходил в прозрачность). `colorkey` через
ffmpeg не используется вообще — см. `_archive` внизу файла.

**Фон — НЕ фиксированный цвет.** Единственное, что реально определяет качество
маски у isnet — это контраст яркости объект↔фон, а не конкретный оттенок. Тест
08.09: серый объект (~130) на сером `#808080` фоне (~129) — дельта яркости 1,
итог 14% полупрозрачных пикселей и объект местами становится прозрачным в
отдельных кадрах. Тот же принцип на тёмном фоне `#171A20` против светлого
объекта дал дельту 107 и острую маску. Поэтому фон выбирается **под конкретный
объект** по правилу из раздела 3, а не берётся одним универсальным на все 50
услуг.


---

## 1. Мастер-промпт для изображения

```
3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed
matte-graphite materials, the subject is lit by soft diffused studio lighting with
realistic highlights and shadow, single accent color #19BD9B (teal-green) used for
glowing highlights, energy lines, LED indicators and screen glow, neutral grey and
dark graphite base materials, isometric 3/4 perspective, centered composition,
no text, no logos, no watermarks.

BACKGROUND: [см. раздел «Как выбрать фон под объект» ниже — подставить один из
двух вариантов, не общий #808080]

single centered object, physically based rendering, high detail, sharp focus on
thin structures (fan blades, pins, cables, hinges), neutral reflections only,
playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges,
subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: [см. раздел услуги]

Negative prompt: colored background, green background, chroma key, gradient
background, vignette, color spill, green reflection, extra objects, hands,
people, text, watermark
```

## 2. Мастер-промпт для видео (image-to-video)

```
Seamless perfectly looping 4-second animation of the reference image, 24fps,
640x640, camera locked and completely static, no camera movement, no camera shake.

[MOTION]

Natural physics with realistic weight, momentum and secondary motion, smooth
non-linear easing (ease-in / ease-out, not constant speed), loop point matches
the first frame exactly so playback repeats infinitely with no visible seam or
jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion,
playful sticker-like appeal, background stays exactly as in the reference image
(flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: [то же самое, дословно]
```

> **Про 4 секунды вместо 3:** если у модели минимум 4 сек генерации — используйте
> это как есть, не обрезайте искусственно до 3. Лишняя секунда — это плюс, а не
> компромисс: у моушен-физики (anticipation, overshoot/settle, staggered-появление
> элементов в вариантах B) банально больше времени довернуться и чисто закрыть
> петлю, вместо того чтобы всё впихивать в 3 сек и рвать стык. Единственное, на что
> смотреть — итоговая длительность у моделей часто выходит не ровно 4.000, а с
> небольшим паддингом (в логах прошлого теста было `duration=4.041667` при 97
> кадрах на 24fps вместо ровных 96). Это не проблема — компонент `ServiceAnimation`
> зацикливает файл через нативный `loop`, ему всё равно, 96 кадров или 97, лишь бы
> первый и последний кадр совпадали. Если хотите ровно — обрежьте один лишний кадр
> явно при сборке alpha.mov: `ffmpeg -i alpha_raw.mov -vframes 96 -c copy alpha.mov`.

Каждая услуга ниже даёт **SUBJECT** (для фото) и **два варианта MOTION**:
- **A — базовый** — спокойный, безопасный, точно зациклится с первой попытки.
- **B — виральный** — с анимационной физикой (anticipation, overshoot/settle,
  вторичное движение, частицы), заметнее и «залипательнее», но сложнее для модели
  и с большей вероятностью потребует 2-3 генерации, чтобы стык луп-точки не дёргался.

Начинайте с **A** на каждую услугу для проверки бренда и стабильности, **B** пускайте
в прод только там, где хочется акцентную/шеринговую карточку (топ-5 самых частых
проблем — обычно это залитие, пыль, треснувший экран, батарея, видеокарта).

---

## 3. Как выбрать фон под объект (обязательный шаг перед генерацией)

### Правило

Не гадаем — оцениваем **до** платной генерации видео, на этапе дешёвой картинки.
Есть ровно два рабочих варианта фона, оба уже проверены практикой:

| Бакет | Цвет фона на генерации | Когда использовать |
|---|---|---|
| **Тёмный (default)** | `#171A20` (charcoal, совпадает с фоном карточки) | Объект **светлый/серебристый/светло-серый** (металл, светлый пластик) — большинство железа: GPU, HDD-корпус, батарея, моноблок. |
| **Светлый** | `#D1D5DB` (light grey) | Объект **тёмный/чёрный** — экраны (чёрная матрица), текстолит платы (тёмно-зелёный/чёрный), тёмный пластик разъёмов и вентиляторов. |

Логика простая: чем больше разница в яркости между объектом и фоном — тем
увереннее isnet отделяет один от другого. Тёмный фон выбираем не потому что он
«красивее», а потому что **у большинства ваших объектов светлая/металлическая
поверхность** — и тогда тёмный фон одновременно даёт лучший контраст **и**
совпадает с итоговым цветом карточки `#171A20`, то есть мелкие огрехи маски по
краю становятся не видны на глаз даже при неидеальном матировании. Светлый
бакет — это осознанное исключение только для объектов, у которых фон и так
светлый.

**Важно:** какой бы бакет вы ни взяли на генерации — на этапе «bake» (шаг 4 в
пайплайне) всё равно перекомпозируется на реальный `#171A20`. Рабочий фон для
генерации и финальный фон карточки — это разные, независимые вещи. Матирование
вырезает объект по альфа-каналу вне зависимости от того, на каком временном
фоне он был сгенерирован.

### Бакет по каждой из 10 услуг (первое приближение — проверяйте по факту)

| # | Услуга | Доминирующий тон объекта | Рекомендуемый бакет |
|---|---|---|---|
| 1 | Ремонт после залития | смешанный (светлый корпус + чёрные клавиши) | тёмный, но проверить контраст после первой генерации — если клавиши доминируют в кадре, переключить на светлый |
| 2 | Материнская плата | тёмный текстолит/чипы | **светлый** |
| 3 | Моноблок | светлый/белый корпус | тёмный |
| 4 | Видеокарта | светлый металл/пластик | тёмный |
| 5 | Переустановка Windows | экран преимущественно чёрный | **светлый** |
| 6 | Батарея ноутбука | светлый/серебристый корпус | тёмный |
| 7 | Чистка от пыли | вентилятор часто тёмный пластик | **светлый** |
| 8 | Замена матрицы экрана | экран чёрный | **светлый** |
| 9 | Замена разъёма питания | тёмный пластик порта | **светлый** |
| 10 | Восстановление данных HDD | светлый металл платтера/корпуса | тёмный |

Это не догма — это стартовая гипотеза по 10 услугам, чтобы не тратить
генерацию впустую. Финальное решение по каждой — по факту первой сгенерированной
картинки и QA-скрипту ниже.

### Как подставлять в промпт

В BACKGROUND-блок мастер-промпта (раздел 1) подставляете один из двух:

```
BACKGROUND: plain uncluttered dark charcoal studio background (#171A20), evenly
lit, minimal shadow, subject clearly separated from background, no other objects
in frame, no gradient, no vignette, no color spill from the subject onto the
background.
```

```
BACKGROUND: plain uncluttered light grey studio background (#D1D5DB), evenly lit,
minimal shadow, subject clearly separated from background, no other objects in
frame, no gradient, no vignette, no color spill from the subject onto the
background.
```

### Автоматический QA-гейт вместо проверки глазами

Ваш собственный метод (гистограмма альфа-канала: % transparent/semi/opaque) —
рабочий и достаточный признак качества маски, просто его стоит не гонять руками
в питоне каждый раз, а зашить в пайплайн как проверку с порогом. Найденные вами
пороги: ~1-2% semi — острая маска, ~14% semi — мягкая/плохая. Скрипт
`check_alpha_quality.py` (прикладываю отдельным файлом) делает это автоматически
на выборке кадров и возвращает ошибку, если маска мягкая — тогда сразу понятно,
что бакет фона выбран неверно и нужно перегенерировать на противоположном.

```bash
python3 check_alpha_quality.py /tmp/svc-anim/<slug>/frames_out --threshold 6
```

Это уже встроено в `process_service.sh` — шаг 2.5 останавливает пайплайн с
предупреждением, если маска мягкая, до того как вы потратите время на сборку и
запекание плохого результата.

---

## 4. Промпты по услугам

### 1. Ремонт ноутбука после залития — `remont-posle-zalitiya`

**SUBJECT:**
> An open laptop viewed from a slight top angle, keyboard visible, with a single
> stylized water droplet frozen mid-air above the keyboard and a thin teal
> protective energy shield/dome hovering just above the keys, deflecting the droplet.

**MOTION A:**
> The water droplet falls slowly toward the keyboard, hits the teal shield, ripples
> outward across the shield surface, and the droplet splashes away in a soft teal
> sparkle. The shield fades and a new droplet begins to fall, creating a perfect loop.

**MOTION B (виральный):**
> The droplet falls with a believable gravity acceleration, and right before impact
> there's a tiny anticipation beat — the shield brightens slightly as if bracing.
> On impact the shield flexes inward briefly like a trampoline (slight overshoot),
> then springs back with a soft bounce-and-settle, while the droplet shatters into
> several small teal droplet-shaped sparks that arc outward under gravity and fade
> like tiny fireworks. Shield glow fades to rest exactly as the next droplet begins
> to fall.

---

### 2. Ремонт материнской платы — `remont-materinskoy-platy-pk`

**SUBJECT:**
> A stylized 3D printed circuit board fragment with visible circuit traces, a
> soldering iron tip touching down on one chip, a small bright teal spark glowing
> at the contact point.

**MOTION A:**
> The soldering iron tip gently lowers onto the chip, a small teal spark flashes
> and pulses outward twice, then the iron lifts back up to its starting position —
> ending exactly where it began for a seamless loop.

**MOTION B (виральный):**
> The iron hovers and dips slightly just before contact (anticipation), touches
> down, and a bright teal spark bursts and races along the nearby circuit traces
> like a tiny lightning bolt travelling through the board's veins before fading
> out. The iron lifts with a light spring-back recoil, holds for a beat, then
> lowers again to restart the loop precisely.

---

### 3. Ремонт моноблока — `remont-monobloka`

**SUBJECT:**
> A stylized 3D all-in-one desktop computer (screen + base in one unit), front-facing,
> with the screen glowing a soft teal, and a small floating gear icon beside it
> hinting at internal repair.

**MOTION A:**
> The screen glow breathes gently brighter and dimmer in a slow pulse, and the small
> floating gear rotates one full smooth 360-degree turn in sync with the glow cycle,
> returning to its exact starting rotation for a perfect loop.

**MOTION B (виральный):**
> The screen glow builds up gradually like the machine is "waking up," brightness
> rising with a slight overshoot past its peak before settling back — like a soft
> flash. A thin teal scan-line sweeps once top-to-bottom across the screen exactly
> at the brightness peak. The gear spins with natural acceleration-then-deceleration
> (not constant speed), like a flywheel starting and coasting to a stop, resetting
> to the dim state to loop.

---

### 4. Ремонт видеокарты — `remont-videokarty-kompyutera`

**SUBJECT:**
> A stylized 3D graphics card viewed at an angle, cooling fan visible, a thin teal
> LED light strip along its edge.

**MOTION A:**
> The fan blades spin at a constant steady speed (naturally loopable rotation), the
> teal LED strip pulses gently in a slow breathing rhythm independent of the fan.

**MOTION B (виральный):**
> The fan blades spin with subtle natural momentum — a barely perceptible wobble
> in speed as if catching a light draft, while still looping cleanly over 3 seconds.
> The teal LED strip has a "chase" light effect: a brighter pulse of light travels
> along the strip once per loop like a heartbeat, and a small light flare glints
> off the metal fan hub as it catches the light at one point in the rotation.

---

### 5. Переустановка Windows — `pereustanovka-windows`

**SUBJECT:**
> A stylized 3D laptop with its screen showing a simple circular progress ring icon
> in teal, minimal and abstract, no real OS UI or logos.

**MOTION A:**
> The circular progress ring rotates one full smooth continuous 360-degree turn,
> looping seamlessly with no visible seam at the start/end point, teal glow trails
> softly behind the moving arc.

**MOTION B (виральный):**
> The progress ring rotates with a pendulum-like easing rhythm — accelerating then
> decelerating rather than constant speed. At the exact loop point, a soft teal
> pulse flashes outward from the center like a heartbeat or a checkmark blink,
> and a few small light particles drift along the ring's path trailing a faint glow.

---

### 6. Замена аккумулятора ноутбука — `zamena-akkumulyatora-noutbuka`

**SUBJECT:**
> A stylized 3D laptop battery icon (rounded rectangle cell) with a teal charging
> bolt symbol in its center, partially filled with a glowing teal liquid-like level
> indicator.

**MOTION A:**
> The teal fill level slowly rises from low to full like liquid filling a container,
> the charging bolt flickers softly once it reaches full, then the level resets
> and rises again — smooth loop, no sudden jump.

**MOTION B (виральный):**
> The teal liquid-like fill rises and, on reaching the top, briefly overshoots and
> settles back down like real liquid settling after being poured (a small bounce,
> not a hard stop). The charging bolt flickers twice with increasing brightness at
> the peak. A few tiny bubble-like light particles drift upward inside the fill.
> The level then drains smoothly back down to reset the loop.

---

### 7. Чистка ноутбука от пыли — `chistka-noutbuka-ot-pyli`

**SUBJECT:**
> A stylized 3D laptop cooling fan seen through a vent grille, a few small grey dust
> particle shapes near the blades, teal air-flow streak lines suggesting airflow.

**MOTION A:**
> The dust particles are blown away from the fan in a soft outward burst along the
> teal airflow streaks and fade out, the fan spins cleanly, then a couple of dust
> particles gently drift back into place to reset the loop.

**MOTION B (виральный):**
> The dust particles tremble slightly in place first, as if the fan is winding up
> (anticipation beat), then burst outward in a satisfying single "poof" that follows
> a natural gravity arc and scatter — not a straight blow — leaving a brief teal
> air-current swirl trailing behind. The particles then gently float back inward in
> slow motion to reset the loop, like a tiny playful cleanup gag.

---

### 8. Замена матрицы экрана ноутбука — `zamena-matritsy-ekrana`

**SUBJECT:**
> A stylized 3D laptop screen shown frontally with a visible crack line across the
> glass, a thin teal outline/scan-line overlay suggesting a replacement panel
> aligning into place.

**MOTION A:**
> A teal scan-line sweeps once from top to bottom across the cracked screen; behind
> the sweep the crack disappears leaving a clean glowing screen, then the crack
> softly fades back in before the scan-line starts again — seamless loop.

**MOTION B (виральный):**
> Just before the sweep, the crack lines briefly glow with a thin teal light tracing
> along them, like a circuit diagram lighting up. Then the teal scan-line wipes down
> in a satisfying squeegee-like motion, clearing the crack away. Right after the
> full reveal, the screen briefly flickers/blinks once like it's turning on for the
> first time, then the crack softly fades back in to reset.

---

### 9. Замена разъёма питания на ноутбуке — `zamena-razema-pitaniya`

**SUBJECT:**
> A stylized 3D laptop DC power port on the side of the laptop body with a charging
> plug positioned just in front of it, a thin teal glow ring around the port opening.

**MOTION A:**
> The plug slides smoothly into the port, the teal glow ring brightens with a soft
> pulse on contact, then the plug slides back out to its starting position —
> ending exactly where it began for a perfect loop.

**MOTION B (виральный):**
> The plug approaches slowly, then accelerates slightly in the final moment as if
> magnetically pulled into place — a satisfying "snap-in." The teal ring flashes
> bright on contact with a quick radiating pulse. The plug holds for a beat, then
> eases back out with a gentle wobble before resetting — mimicking the physical
> feeling of a connector clicking home.

---

### 10. Восстановление данных HDD — `vosstanovlenie-dannyh-hdd`

**SUBJECT:**
> A stylized 3D hard drive disk with the top cover removed showing a circular
> platter, a couple of small minimalist file/folder icons hovering just above it
> with a soft teal glow trail connecting them to the platter.

**MOTION A:**
> The platter spins steadily, the small file icons float slowly upward away from
> the drive trailing a soft teal glow, then fade out and reappear at the platter to
> restart the float — smooth continuous loop.

**MOTION B (виральный):**
> The platter starts spinning up gradually from rest to full speed, like a real
> disk spin-up. Small file icons "pop" out one at a time in a staggered sequence
> (not all together), each with a tiny bounce-and-settle as it floats upward,
> trailing a soft teal light streak like a data spark. The files fade near the top
> as the platter gently decelerates back to rest, resetting the loop — like a
> miniature rescue moment.

---

## 5. Продакшн-пайплайн (photo → video → matting → bake)

### Шаг 1 — фото
По таблице в разделе 3 берёте стартовый бакет фона для услуги, подставляете
соответствующий BACKGROUND-блок в мастер-промпт изображения (раздел 1) + SUBJECT
нужной услуги, генерируете. Проверяете глазами: фон ровный, без градиента по
углам, и на глаз оцениваете контраст объект/фон — если объект «сливается» с
фоном (как в тесте с mid-grey), сразу перегенерируйте с противоположным бакетом,
не идите дальше по пайплайну с плохим контрастом.

### Шаг 2 — видео (image-to-video)
Прогоняете фото через модель на Atlas Cloud с видео-промптом (раздел 2) + MOTION A
или B нужной услуги. Смотрите на стык петли (последний кадр vs первый) — если виден
рывок, перегенерируйте с явным добавлением в промпт: `the very last frame must be
pixel-identical to the very first frame`.

### Шаг 3 — обработка (matting + запекание)

Два файла ниже — `matte.py` и `process_service.sh` — делают всё за вас на любой
готовый видео-файл. Один раз ставите зависимости:

```bash
pip install "rembg[cpu]" onnxruntime
# (если есть Apple Silicon / GPU — rembg сам заберёт ускорение через onnxruntime)
chmod +x process_service.sh
```

Дальше на каждую услугу — одна команда:

```bash
./process_service.sh remont-videokarty-kompyutera /path/to/generated-video.mp4
```

Скрипт сам: вытащит кадры → прогонит через `isnet-general-use` → **проверит
качество маски через `check_alpha_quality.py`** (порог 6% semi-transparent
пикселей — если хуже, пайплайн остановится с предупреждением «перегенерируйте на
другом бакете фона», вместо того чтобы молча собрать плохой ролик) → соберёт
alpha ProRes 4444 → запечёт mp4 (h264) и webm (vp9) на `#171A20` → сделает
постер jpg+webp. Результат лежит в `public/videos/services/`.

`check_alpha_quality.py` можно так же вызвать отдельно на любую папку с
матированными кадрами:

```bash
python3 check_alpha_quality.py /tmp/svc-anim/<slug>/frames_out --threshold 6
```

### Шаг 4 — QA (глазами, не пиксель-сэмплингом)

Извлеките 3-4 кадра из `alpha.mov` и наложите на шахматку И на `#171A20`, проверьте:

- [ ] тонкие детали не обрублены (лопасти вентилятора, провода, штырьки)
- [ ] нет зелёной/серой каймы вокруг teal-glow элементов
- [ ] в отверстиях/дырках объекта не остался фон
- [ ] петля не дёргается на стыке последний→первый кадр
- [ ] на мобильном экране (реальном или DevTools throttling) анимация не тормозит

### Шаг 5 — интеграция

Добавить slug в обе карты:
- `src/components/ServiceCard.astro` → `animatedServices`
- `src/pages/services/[slug].astro` → `animatedServices`

---

## 6. _archive — что не использовать

**Один фиксированный фон-цвет на все услуги (например `#808080` mid-grey).**
Проверено 08.09: серый объект на сером фоне даёт дельту яркости ~1, 14%
полупрозрачных пикселей у isnet и видимое «исчезновение» объекта в части кадров
— вместо этого выбирайте бакет фона под конкретный объект по правилу из раздела 3.

`ffmpeg colorkey` по конкретному цвету фона — не использовать вообще. Проверено на
двух версиях ролика: magic-константы (`0x85b180:0.06:0.02` на градиентном v1,
`0x05EE0B:0.20:0.10` на ярком chroma v2) не переносятся между роликами, и даже
на идеально зелёном фоне spill в отражениях/дырках объекта остаётся, потому что
PBR-материалы отражают цвет фона как часть себя — а не только фон. `u2net` как
модель матирования — не использовать для видео с этим стилем рендера (фликер:
центр объекта в части кадров уходил в прозрачность). `isnet-general-use` — да.
