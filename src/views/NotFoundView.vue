<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import BaseButton from '../components/ui/BaseButton.vue'

// 404 «в работе»: каждая цифра в своём состоянии, как в редакторе.
// первая 4 готова (заливается при входе), 0 доделывается по клику в 4 шага,
// вторую 4 обводит курсор «Станислав». Макет — docs/site/404-mockup/final.html
// (ветка claude/site-overview-setup-iskpz2). Шапка и футер скрыты в App.vue.
// Начальное состояние в разметке — финальный вид: так он попадает в пререндер
// и остаётся при reduced motion; вход — CSS-анимации from-кадрами
useHead({
  title: 'Страница не найдена — m/design',
  meta: [{ name: 'robots', content: 'noindex' }],
})

// ---------- ноль: каждый клик поднимает заливку на четверть ----------
const STEPS = 4
const level = ref(0)
const touched = ref(false)
const done = ref(false)
let doneTimer = null

function bump() {
  if (level.value >= STEPS) return
  level.value += 1
  touched.value = true
  if (level.value === STEPS) doneTimer = setTimeout(() => { done.value = true }, 500)
}

// ---------- вторая 4: курсор обводит контур ----------
// ломаная контура «4» в долях прямоугольника её span (Gilroy Bold)
const CONTOUR = [[0.744, -0.033], [0.318, 0.530], [0.648, 0.530], [0.648, 0.326], [0.909, 0.326], [0.909, 0.530], [1.049, 0.530], [1.049, 0.690], [0.909, 0.690], [0.909, 0.842], [0.648, 0.842], [0.648, 0.690], [0.037, 0.690], [0.037, 0.530], [0.459, -0.033], [0.744, -0.033]]
const DRAW = 4200 // мс — обводка
const HOLD = 1600 // мс — пауза «почти готово», курсор скрыт
const FADE = 300 // мс — линия гаснет в конце паузы
const START = 2200 // мс — первый старт после загрузки
// смещения плашки с именем от острия курсора, в базовых px (× масштаб rem)
const NAME_X = 22
const NAME_Y = 18
const NAME_GAP = 6
const EDGE = 8

// «в планах» до старта и при reduced motion, дальше «в работе» / «почти готово»
const fourState = ref('plan')
const motion = ref(false)
const fourEl = ref(null)
const lineEl = ref(null)
const cursorEl = ref(null)
const nameEl = ref(null)

let raf = 0
let t0 = 0

function frame(now) {
  raf = requestAnimationFrame(frame)
  const four = fourEl.value
  const line = lineEl.value
  const cursor = cursorEl.value
  const name = nameEl.value
  if (!four || !line || !cursor || !name) return
  const t = now - t0
  if (t < 0) return

  // точки — из текущего прямоугольника цифры: верно при любой ширине и после resize
  const r = four.getBoundingClientRect()
  const P = CONTOUR.map(([fx, fy]) => [r.left + fx * r.width, r.top + fy * r.height])
  const seg = P.slice(1).map((p, i) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1]))
  const total = seg.reduce((a, b) => a + b, 0)

  const k0 = t % (DRAW + HOLD)
  const drawn = k0 >= DRAW
  let d = Math.min(1, k0 / DRAW) * total
  let k = 0
  while (k < seg.length - 1 && d > seg[k]) { d -= seg[k]; k++ }
  const f = Math.min(1, d / seg[k])
  const x = P[k][0] + (P[k + 1][0] - P[k][0]) * f
  const y = P[k][1] + (P[k + 1][1] - P[k][1]) * f

  line.setAttribute('points', [...P.slice(0, k + 1), [x, y]].map((q) => q.join(',')).join(' '))
  line.style.opacity = k0 > DRAW + HOLD - FADE ? 0 : 1

  const scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16
  cursor.style.transform = `translate(${x}px, ${y}px)`
  // у правого края экрана плашка переезжает на левую сторону курсора
  const w = name.offsetWidth
  const flip = x + NAME_X * scale + w > window.innerWidth - EDGE * scale
  const nx = flip ? x - w - NAME_GAP * scale : x + NAME_X * scale
  name.style.transform = `translate(${nx}px, ${y + NAME_Y * scale}px)`
  cursor.style.opacity = name.style.opacity = drawn ? 0 : 1
  fourState.value = drawn ? 'almost' : 'work'
}

function run() {
  cancelAnimationFrame(raf)
  if (!document.hidden) raf = requestAnimationFrame(frame)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  motion.value = true
  // контур считается по метрикам Gilroy — ждём шрифт
  document.fonts.ready.then(() => {
    if (!motion.value) return
    t0 = performance.now() + START
    run()
  })
  document.addEventListener('visibilitychange', run)
})

onUnmounted(() => {
  motion.value = false
  cancelAnimationFrame(raf)
  clearTimeout(doneTimer)
  document.removeEventListener('visibilitychange', run)
})

const fourLabel = { plan: 'в планах', work: 'в работе', almost: 'почти готово' }
</script>

<template>
  <main class="nf">
    <div class="nf__top">
      <RouterLink to="/" class="nf__logo">
        <img src="/logo/logo-light.svg" alt="m/design — на главную" width="175" height="51" />
      </RouterLink>
      <span class="small nf__code">ошибка 404</span>
    </div>

    <div class="nf__stage">
      <span class="nf__guide is-top" aria-hidden="true"></span>
      <span class="nf__guide is-bottom" aria-hidden="true"></span>

      <!-- цифры — иллюстрация; для скринридера смысл несёт h1, доступна только кнопка нуля -->
      <div class="nf__digits">
        <span class="nf__d is-ready" aria-hidden="true">4<span class="nf__lbl is-blue">готово</span></span>
        <span
          class="nf__d is-zero"
          :class="{ 'is-full': level === STEPS }"
          :style="{ '--lvl': `${(level / STEPS) * 100}%` }"
          role="button"
          tabindex="0"
          aria-label="Доделать ноль"
          @click="bump"
          @keydown.enter.prevent="bump"
          @keydown.space.prevent="bump"
        >0<span class="nf__fill" aria-hidden="true">0</span><span class="nf__lbl" :class="level === STEPS ? 'is-blue' : 'is-accent'" aria-hidden="true">{{ level === STEPS ? 'готово' : 'в работе' }}</span></span>
        <span ref="fourEl" class="nf__d is-plan" aria-hidden="true">4<span class="nf__lbl" :class="fourState === 'plan' ? 'is-grey' : 'is-accent'">{{ fourLabel[fourState] }}</span></span>
      </div>

      <p class="small nf__hint" :class="{ 'is-gone': touched }" aria-hidden="true">нажмите на <b>0</b> — доделаем</p>
      <p class="ui nf__toast" :class="{ 'is-on': done }" aria-live="polite">{{ done ? 'Готово! Но этой страницы всё равно нет' : '' }}</p>
    </div>

    <div class="nf__msg">
      <h1 class="nf__rise" style="--d: 1.4s">Этой страницы нет. Или она ещё в работе</h1>
      <div>
        <p class="lead nf__lead nf__rise" style="--d: 1.5s">Ссылка могла устареть, а могла опередить события: часть страниц я ещё собираю. Всё готовое — на главной.</p>
        <div class="nf__acts nf__rise" style="--d: 1.6s">
          <BaseButton to="/" variant="primary" arrow :class="{ 'is-nudge': done }">На главную</BaseButton>
          <BaseButton :to="{ path: '/', hash: '#services' }" variant="secondary">Все услуги</BaseButton>
        </div>
      </div>
    </div>

    <!-- перо и курсор «Станислав»: только в браузере и без reduced motion -->
    <template v-if="motion">
      <svg class="nf__pen" aria-hidden="true"><polyline ref="lineEl" points="" /></svg>
      <svg ref="cursorEl" class="nf__cursor" viewBox="0 0 22 22" aria-hidden="true"><path d="M2 2 L20 9 L11 11 L9 20 Z" /></svg>
      <span ref="nameEl" class="caption nf__name" aria-hidden="true">Станислав</span>
    </template>
  </main>
</template>

<style scoped>
.nf {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  padding: var(--nf-pad-top) var(--nf-pad-x) var(--nf-pad-bottom);
  overflow-x: clip;
  background: var(--bg);
}

.nf__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nf__logo {
  display: block;
}

.nf__logo img {
  display: block;
  width: auto;
  height: var(--nf-logo-h);
}

.nf__code {
  font-weight: 500;
  color: var(--text-3);
}

/* ---------- цифры ---------- */
.nf__stage {
  position: relative;
  margin-top: var(--nf-stage-mt);
  padding: var(--nf-stage-pt) 0 var(--nf-stage-pb);
}

/* направляющие по верху и низу цифр — во всю ширину окна */
.nf__guide {
  position: absolute;
  left: calc(-1 * var(--nf-pad-x));
  right: calc(-1 * var(--nf-pad-x));
  height: var(--hairline);
  background: var(--nf-guide);
  opacity: .5;
  transform-origin: left;
  animation: nf-guide .9s cubic-bezier(.65, 0, .35, 1) both;
}

.nf__guide.is-top {
  top: var(--nf-stage-pt);
}

.nf__guide.is-bottom {
  bottom: var(--nf-stage-pb);
  animation-delay: .15s;
}

@keyframes nf-guide {
  from { transform: scaleX(0); }
}

/* огромная цифра — намеренно, как hero главной: это иллюстрация, а не заголовок */
.nf__digits {
  display: flex;
  justify-content: center;
  font: 700 var(--nf-digit)/0.8 var(--f-head);
  letter-spacing: -.04em;
  user-select: none;
}

.nf__d {
  position: relative;
  display: inline-block;
  color: transparent;
  -webkit-text-stroke: var(--nf-stroke) var(--ink);
}

/* первая 4 — готово: заливка снизу вверх при входе.
   поля шире глифа, чтобы фон с background-clip: text не обрезался по краям */
.nf__d.is-ready {
  padding: var(--nf-fill-pad) var(--nf-fill-pad) var(--nf-fill-pad-b) 0;
  margin: calc(-1 * var(--nf-fill-pad)) calc(-1 * var(--nf-fill-pad)) calc(-1 * var(--nf-fill-pad-b)) 0;
  background: linear-gradient(var(--ink), var(--ink)) bottom / 100% 100% no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  animation: nf-fill 1.2s cubic-bezier(.65, 0, .35, 1) .5s both;
}

@keyframes nf-fill {
  from { background-size: 100% 0%; }
}

/* 0 — в работе: штриховка-узор внутри цифры стоит, заливка поднимается по клику */
.nf__d.is-zero {
  cursor: pointer;
  background: repeating-linear-gradient(135deg, var(--nf-hatch) 0 var(--nf-hatch-line), transparent var(--nf-hatch-line) var(--nf-hatch-step));
  -webkit-background-clip: text;
  background-clip: text;
}

.nf__d.is-zero.is-full {
  cursor: default;
}

.nf__d.is-zero:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.nf__fill {
  position: absolute;
  top: calc(-1 * var(--nf-fill-pad));
  left: 0;
  padding-top: var(--nf-fill-pad);
  color: var(--ink);
  -webkit-text-stroke: 0;
  clip-path: inset(calc(100% - var(--lvl, 0%)) 0 0 0);
  transition: clip-path .6s cubic-bezier(.22, 1, .36, 1);
  pointer-events: none;
}

/* вторая 4 — в планах: только серый контур */
.nf__d.is-plan {
  -webkit-text-stroke-color: var(--nf-outline);
}

/* ярлыки над цифрами */
.nf__lbl {
  position: absolute;
  top: var(--nf-lbl-y);
  left: var(--nf-lbl-x);
  padding: 0 var(--nf-lbl-px);
  font: 500 var(--nf-lbl)/1.6667 var(--f-body);
  letter-spacing: 0;
  white-space: nowrap;
  -webkit-text-stroke: 0;
  border-radius: var(--r-sm);
  transition: background-color .3s, color .3s;
  animation: nf-pop .4s ease-out both;
}

/* у первой 4 поля шире глифа — ярлык сдвигаем на их высоту */
.is-ready .nf__lbl {
  top: calc(var(--nf-fill-pad) + var(--nf-lbl-y));
  animation-delay: 1.2s;
}

.is-zero .nf__lbl {
  animation-delay: 1.45s;
}

.is-plan .nf__lbl {
  animation-delay: 1.7s;
}

.nf__lbl.is-blue {
  color: var(--white);
  background: var(--nf-guide);
}

.nf__lbl.is-accent {
  color: var(--white);
  background: var(--accent);
}

.nf__lbl.is-grey {
  color: var(--text);
  background: var(--bg-3);
}

@keyframes nf-pop {
  from { opacity: 0; transform: translateY(.375rem); }
}

/* подсказка и плашка «готово» — в нижнем поле сцены */
.nf__hint,
.nf__toast {
  position: absolute;
  left: 50%;
  white-space: nowrap;
}

.nf__hint {
  bottom: var(--nf-hint-b);
  font-weight: 500;
  color: var(--text-3);
  transform: translateX(-50%);
  transition: opacity .3s;
  animation: nf-fade .4s ease-out 2.4s both;
}

.nf__hint b {
  font-weight: 500;
  color: var(--accent);
}

.nf__hint.is-gone {
  opacity: 0;
  animation: none;
}

@keyframes nf-fade {
  from { opacity: 0; }
}

.nf__toast {
  bottom: var(--nf-toast-b);
  padding: var(--s-8) var(--s-16);
  color: var(--ink);
  background: var(--white);
  border-radius: var(--r-lg);
  opacity: 0;
  transform: translate(-50%, var(--s-8));
  transition: opacity .4s, transform .4s;
  pointer-events: none;
}

.nf__toast.is-on {
  opacity: 1;
  transform: translate(-50%, 0);
}

/* ---------- перо и курсор ---------- */
.nf__pen {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.nf__pen polyline {
  fill: none;
  stroke: var(--accent);
  stroke-width: 3;
  stroke-linejoin: round;
  transition: opacity .3s;
}

.nf__cursor,
.nf__name {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity .3s;
}

/* острие стрелки — в точке пера */
.nf__cursor {
  width: var(--nf-cursor);
  height: var(--nf-cursor);
  margin: var(--nf-cursor-tip) 0 0 var(--nf-cursor-tip);
}

.nf__cursor path {
  fill: var(--accent);
  stroke: var(--white);
  stroke-width: 1.5;
}

.nf__name {
  padding: 0 var(--s-8);
  font-weight: 500;
  white-space: nowrap;
  color: var(--white);
  background: var(--accent);
  border-radius: var(--r-sm);
}

/* ---------- текст ---------- */
.nf__msg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-60);
  align-items: end;
  margin-top: auto;
  padding-top: var(--s-40);
}

.nf__lead {
  margin-bottom: var(--s-24);
}

.nf__acts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-12);
}

.nf__rise {
  animation: nf-rise .6s cubic-bezier(.22, 1, .36, 1) var(--d, 0s) both;
}

@keyframes nf-rise {
  from { opacity: 0; transform: translateY(var(--s-24)); }
}

/* «На главную» дважды пульсирует, когда ноль доделан */
.nf__acts .is-nudge {
  animation: nf-nudge .9s ease-in-out 2;
}

@keyframes nf-nudge {
  50% { transform: scale(1.06); }
}

@media (max-width: 767px) {
  .nf__msg {
    grid-template-columns: 1fr;
    gap: var(--s-16);
    margin-top: 0;
    padding-top: var(--s-24);
  }

  .nf__lead {
    margin-bottom: var(--s-20);
  }

  .nf__acts {
    flex-direction: column;
  }

  .nf__acts .btn {
    width: 100%;
    justify-content: center;
  }

  .nf__toast {
    padding: var(--s-4) var(--s-12);
    font-size: var(--t-small);
  }
}

/* reduced motion — сразу финальный вид: base.css гасит только длительность,
   а задержки оставили бы элементы скрытыми; переход заливки нуля тоже без анимации */
@media (prefers-reduced-motion: reduce) {
  .nf__guide,
  .nf__d.is-ready,
  .nf__lbl,
  .nf__hint,
  .nf__rise,
  .nf__acts .is-nudge {
    animation: none;
  }
}
</style>
