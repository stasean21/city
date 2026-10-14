# Главная, первый экран: тёмная капсула с живой точечной матрицей

Прочитай `CLAUDE.md`. Файлы:
- `src/components/sections/HeroSection.vue` — переписать;
- `src/components/sections/HeroDots.vue` — новый;
- `src/components/layout/GiftOffer.vue` — ярлык подарка светлеет над тёмной капсулой;
- `src/styles/tokens.css` — токены;
- `CLAUDE.md` — обновить описание hero.

Утверждённый макет в ветке `claude/site-overview-setup-iskpz2`:
- `docs/site/hero-mockup/center-2-pc.png`, `center-2-mobile.png`;
- живая версия `matrix-center.html?v=2`.

## Что получается

Первый экран — большая тёмная капсула (`--ink`) со скруглением. На ПК её края совпадают с краями белой панели шапки, на телефоне она занимает весь экран между логотипом и нижней панелью. По всей капсуле, в том числе под текстом, идёт сетка мелких тёмно-серых точек. Точки рядом с курсором (или пальцем) расходятся в стороны, увеличиваются и загораются оранжевым. Когда курсора над капсулой нет, «пятно» само медленно плавает по капсуле.

Содержимое строго по центру:
1. Заголовок `h1` — текст тот же, белый, в две строки на ПК.
2. Белая строка задачи: стрелка, поле ввода, внутри справа кнопка `Обсудить задачу` (primary, оранжевая). На телефоне вместо кнопки — квадратная тёмная кнопка-стрелка «↑».
3. Под строкой — кнопка `Услуги и решения ↓`: прозрачная, с обводкой, белый текст, той же высоты, что primary. На телефоне — на всю ширину.

Подзаголовок «Собираю визуал…» в hero больше не выводится: он дублирует блок «Услуги и решения» ниже.

## 1. Токены — `tokens.css`

```css
/* hero: тёмная капсула с точечной матрицей */
--hero-stage-bg:  var(--ink);
--hero-dot:       #303136;            /* точка в покое — чуть светлее фона капсулы */
--hero-dot-hot:   var(--accent);      /* точка у курсора */
--r-hero:         2.5rem;             /* 40 — радиус капсулы на ПК */
--hero-bar-w:     47.5rem;            /* 760 — строка задачи */
--hero-outline:   #4A4B50;            /* обводка вторичной кнопки на тёмном */
```

На ≤ 767px: `--r-hero: var(--r-stage)` (27).

Вложенные скругления: белая строка = кнопка внутри (`--r-btn` 15) + отступ 10px → у строки `calc(var(--r-btn) + var(--s-12))` (27). Отступ внутри строки `var(--s-12)` сверху, справа и снизу, слева `var(--s-24)`.

## 2. `HeroDots.vue` — матрица на canvas

Отдельный компонент: `<canvas>` на всю площадь родителя, `aria-hidden="true"`, `pointer-events: none`. Слушатели указателя вешаются на родителя (капсулу). Всё в `onMounted`, очистка в `onUnmounted`.

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// точечная матрица первого экрана: точки у курсора расходятся,
// растут и загораются акцентом; без курсора «пятно» гуляет само
const canvasEl = ref(null)

const STEP_PC = 22          // шаг сетки, px
const STEP_MOBILE = 16
const RADIUS_PC = 140       // радиус влияния курсора, px
const RADIUS_MOBILE = 90
const PUSH_PC = 22          // насколько точки расходятся, px
const PUSH_MOBILE = 14
const DOT = 1.6             // радиус точки в покое
const DOT_GROW = 3.4        // прибавка у курсора

let ctx, w, h, mobile, dots = [], raf = 0, ro, io, mq
let colorIdle = '#303136', colorHot = [245, 153, 88]
const ptr = { x: 0, y: 0, active: false }
let visible = true

function readColors() {
  const cs = getComputedStyle(canvasEl.value)
  colorIdle = cs.getPropertyValue('--hero-dot').trim() || colorIdle
  const hot = cs.getPropertyValue('--hero-dot-hot').trim()
  const m = hot.match(/^#([0-9a-f]{6})$/i)
  if (m) colorHot = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
}

function layout() {
  const el = canvasEl.value
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = el.clientWidth; h = el.clientHeight
  el.width = w * dpr; el.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  mobile = w < 700
  const step = mobile ? STEP_MOBILE : STEP_PC
  dots = []
  for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) dots.push(x, y)
}

function draw(t) {
  ctx.clearRect(0, 0, w, h)
  let px = ptr.x, py = ptr.y
  if (!ptr.active) {
    // «пятно» по восьмёрке, медленно
    px = w * 0.5 + Math.sin(t * 0.5) * w * 0.4
    py = h * 0.5 + Math.sin(t * 0.9) * h * 0.38
  }
  const R = mobile ? RADIUS_MOBILE : RADIUS_PC
  const P = mobile ? PUSH_MOBILE : PUSH_PC
  const [r0, g0, b0] = colorHot
  for (let i = 0; i < dots.length; i += 2) {
    const dx = dots[i] - px, dy = dots[i + 1] - py, d = Math.hypot(dx, dy)
    const near = Math.max(0, 1 - d / R)
    const push = near * near * P
    const x = dots[i] + (d ? (dx / d) * push : 0)
    const y = dots[i + 1] + (d ? (dy / d) * push : 0)
    ctx.fillStyle = near > 0.04 ? `rgba(${r0},${g0},${b0},${0.25 + near * 0.75})` : colorIdle
    ctx.beginPath(); ctx.arc(x, y, DOT + near * DOT_GROW, 0, Math.PI * 2); ctx.fill()
  }
}

function loop(ms) {
  draw(ms / 1000)
  raf = requestAnimationFrame(loop)
}

function sync() {
  cancelAnimationFrame(raf); raf = 0
  if (mq.matches) { ptr.active = false; draw(0); return } // reduced motion: статичная сетка
  if (visible && !document.hidden) raf = requestAnimationFrame(loop)
}

function onMove(e) {
  const r = canvasEl.value.getBoundingClientRect()
  ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.active = true
}
function onLeave() { ptr.active = false }

onMounted(() => {
  ctx = canvasEl.value.getContext('2d')
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  readColors(); layout()
  const host = canvasEl.value.parentElement
  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerleave', onLeave)
  host.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') onLeave() })
  ro = new ResizeObserver(() => { layout(); if (!raf) draw(0) })
  ro.observe(canvasEl.value)
  io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync() })
  io.observe(canvasEl.value)
  document.addEventListener('visibilitychange', sync)
  mq.addEventListener('change', sync)
  sync()
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect(); io?.disconnect()
  document.removeEventListener('visibilitychange', sync)
  mq?.removeEventListener('change', sync)
  const host = canvasEl.value?.parentElement
  host?.removeEventListener('pointermove', onMove)
  host?.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <canvas ref="canvasEl" class="hero-dots" aria-hidden="true"></canvas>
</template>

<style scoped>
.hero-dots {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
```

Слушатель `pointerup` в `onMounted` вынеси в именованную функцию и сними в `onUnmounted`, как остальные.

## 3. `HeroSection.vue`

```vue
<template>
  <section id="hero" class="hero">
    <div class="hero__stage" data-dark-zone>
      <HeroDots />
      <div class="hero__content">
        <h1 class="display hero__title once-in">Дизайн, аналитика и ИИ-разработка<br class="hero__br"> для малого и среднего бизнеса</h1>

        <form class="hero__bar once-in" @submit.prevent="send">
          <span class="hero__bar-arrow" aria-hidden="true">→</span>
          <label class="visually-hidden" for="hero-task">Опишите задачу</label>
          <input id="hero-task" v-model="task" class="hero__input" type="text" :placeholder="placeholder" autocomplete="off">
          <BaseButton class="hero__send-pc" variant="primary" arrow type="submit">Обсудить задачу</BaseButton>
          <button class="hero__send-mobile" type="submit" aria-label="Отправить задачу">↑</button>
        </form>

        <BaseButton class="hero__services once-in" :to="{ path: '/', hash: '#services' }" variant="ghost" @click="scrollToSameAnchor(route, '#services')">
          Услуги и решения ↓
        </BaseButton>
      </div>
    </div>
  </section>
</template>
```

Поведение строки задачи:
- **Плейсхолдер** сменяется каждые 4 секунды по кругу: «Конкуренты дороже, а покупают у них», «Продажи упали после смены обложки», «Нужен сайт, но нет времени разбираться». Пока поле в фокусе или в нём есть текст — не меняется. При `prefers-reduced-motion` стоит первый вариант. Таймер в `onMounted`, очистка в `onUnmounted`.
- **Отправка** (Enter или кнопка):
  - если поле пустое — плавный переход к `#contact`, как у кнопок сейчас (`scrollToSameAnchor`);
  - если есть текст — скопировать его в буфер обмена (в `try/catch`), открыть в новой вкладке Telegram `https://t.me/muntyanu_design?text=` + `encodeURIComponent(текст)`. Ссылку на Telegram брать из `src/data/contacts.json`, не хардкодить. Под строкой на 3 секунды показать короткую подпись `.caption` «Текст скопирован — вставьте его в чат», цвет `--dark-text`.
- **Кнопка отправки.** Если `BaseButton` не прокидывает `type`, добавь проп `type` (по умолчанию `button`), чтобы `type="submit"` работал внутри формы.
- **Вторичная кнопка.** Если у `BaseButton` нет варианта для тёмного фона, добавь модификатор только в hero: фон прозрачный, `border: 1.5px solid var(--hero-outline)`, текст `--white`, ховер — фон `--ink-soft`. Высота как у primary.

Стили:

```css
.hero { padding: 0 0 var(--hero-bottom); }

/* капсула: края совпадают с краями белой панели шапки — возьми тот же токен
   горизонтального отступа, что у .site-header__inner */
.hero__stage {
  position: relative;
  margin-inline: <тот же отступ, что у панели шапки>;
  height: min(45rem, calc(100svh - var(--header-top) - var(--header-h) - var(--s-40)));
  min-height: 35rem;
  overflow: hidden;
  border-radius: var(--r-hero);
  background: var(--hero-stage-bg);
}

.hero__content {
  position: relative;      /* над canvas */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--s-40);
  text-align: center;
}

.hero__title { color: var(--white); margin-bottom: var(--s-40); }
.hero__bar { display: flex; align-items: center; gap: var(--s-12); width: 100%; max-width: var(--hero-bar-w); background: var(--white); … }
.hero__services { margin-top: var(--s-16); }
.hero__send-mobile { display: none; }
```

Типографику заголовка (`.display`, вес и размер) оставить как сейчас, менять только цвет. Это решение владельца, см. `CLAUDE.md`.

### ≤ 767px

- Капсула на весь экран между логотипом и нижней панелью:
  `margin-inline: var(--s-12)`;
  `height: calc(100svh - var(--header-top) - var(--header-h) - var(--s-12) - var(--dock-h) - var(--s-16) - var(--s-12) - env(safe-area-inset-bottom))`;
  `min-height: 32.5rem`.
- `.hero__br` скрыть, заголовок переносится сам.
- В строке задачи `.hero__send-pc` скрыть, `.hero__send-mobile` показать: 46×46, фон `--ink`, белая стрелка, радиус `--r-btn`. «Обсудить задачу» уже есть в нижней панели, второй раз на экране не нужна.
- `Услуги и решения ↓` — на всю ширину.

## 4. Ярлык подарка над тёмной капсулой — `GiftOffer.vue`

Ярлык `.gift-tab` тёмный и сливается с капсулой. Нужно: пока ярлык находится над элементом с атрибутом `data-dark-zone`, он светлый.

- В `onMounted` подписаться на `scroll` и `resize` (`passive: true`, через `requestAnimationFrame`). Проверять, пересекается ли прямоугольник ярлыка (`tabEl`) с любым `[data-dark-zone]` → `onDark = true/false`.
- Проверять заново при смене маршрута и при появлении ярлыка (`state === 'tab'`).
- Класс `is-on-dark`: `background: var(--white); color: var(--ink);` ховер — `var(--bg-3)`. Счётчик остаётся оранжевым. Переход цвета через `transition: background-color var(--ease), color var(--ease)`.
- Слушатели снимать в `onUnmounted`.

Атрибут `data-dark-zone` пригодится и другим тёмным блокам, поэтому сделать проверку общей, а не привязанной к hero.

## 5. `CLAUDE.md`

В «Текущем состоянии» заменить пункт про `HeroSection.vue`: hero — тёмная капсула с точечной матрицей (`HeroDots.vue`), подзаголовок убран, строка задачи + кнопка `Услуги и решения`. Типографика заголовка прежняя (решение владельца). Акцент используется на точках у курсора — это сознательное исключение из правила «акцент ≈ 1%».

## 6. Проверка

1. 1440: капсула по краям совпадает с панелью шапки, заголовок в две строки, белая строка задачи, под ней видимая кнопка с обводкой. Точки по всей капсуле, под текстом тоже. Курсор раздвигает точки и подсвечивает их оранжевым, увёл курсор — пятно гуляет само.
2. Текст читается поверх точек. Кнопки и поле кликаются (canvas не перехватывает клики).
3. Пустая строка + Enter → плавный переход к «Обсудим задачу?». С текстом → открывается Telegram, текст в буфере, подпись появилась и пропала.
4. 390×844: капсула между логотипом и нижней панелью, в строке кнопка-стрелка, «Услуги и решения» на всю ширину. Палец раздвигает точки, отпустил — пятно гуляет.
5. Ярлык «Ваш подарок» над капсулой белый, после прокрутки на светлый фон снова тёмный.
6. `prefers-reduced-motion`: точки статичны, плейсхолдер не меняется.
7. Уйти на страницу услуги и вернуться — нет ошибок, нет двойной анимации, нагрузка не растёт.
8. `npm run build` без ошибок, в `dist/index.html` есть текст заголовка.
9. Коммит: «Hero: тёмная капсула с точечной матрицей и строкой задачи». Потом `git push`.
