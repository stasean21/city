<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// точечная матрица первого экрана: точки у курсора (пальца) расходятся,
// растут и загораются акцентом; без курсора «пятно» гуляет само.
// Размеры — в px при корневом кегле 16 (ширина до 1440), выше растут вместе с ним,
// как всё в rem
const canvasEl = ref(null)

const STEP_PC = 22          // шаг сетки, px
const STEP_MOBILE = 16
const RADIUS_PC = 140       // радиус влияния курсора, px
const RADIUS_MOBILE = 90
const PUSH_PC = 22          // насколько точки расходятся, px
const PUSH_MOBILE = 14
const DOT = 1.6             // радиус точки в покое
const DOT_GROW = 3.4        // прибавка у курсора
const MOBILE_W = 700        // капсула уже — телефонная сетка
const FOLLOW = 6            // как быстро пятно перетекает от прогулки к курсору и обратно, 1/с
const TAU = Math.PI * 2

let ctx, host, w, h, mobile, dots = [], raf = 0, ro, io, mq
let k = 1                   // корневой кегль / 16
let colorIdle, colorHot
const ptr = { x: 0, y: 0, active: false }
let visible = true
// время прогулки идёт, только пока матрица анимируется: после паузы пятно
// продолжает с того же места. Старт — справа внизу, а не под заголовком
let clock = 2
let last = 0
let presence = 0            // 0 — пятно гуляет само, 1 — стоит под курсором

// цвета — из токенов; canvas сам приводит любую запись цвета к #rrggbb
function readColors() {
  const cs = getComputedStyle(canvasEl.value)
  colorIdle = cs.getPropertyValue('--hero-dot').trim()
  ctx.fillStyle = cs.getPropertyValue('--hero-dot-hot').trim()
  const c = ctx.fillStyle
  colorHot = c.startsWith('#')
    ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
    : c.match(/[\d.]+/g).slice(0, 3).map(Number)
}

function layout() {
  const el = canvasEl.value
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  k = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16
  w = el.clientWidth
  h = el.clientHeight
  el.width = Math.round(w * dpr)
  el.height = Math.round(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  mobile = w < MOBILE_W * k
  // сетка по центру капсулы: поля по краям одинаковые
  const step = (mobile ? STEP_MOBILE : STEP_PC) * k
  const cols = Math.floor(w / step)
  const rows = Math.floor(h / step)
  const x0 = (w - (cols - 1) * step) / 2
  const y0 = (h - (rows - 1) * step) / 2
  dots = []
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) dots.push(x0 + col * step, y0 + row * step)
  }
}

// px === null — ровная сетка без пятна
function paint(px, py) {
  ctx.clearRect(0, 0, w, h)
  const R = (mobile ? RADIUS_MOBILE : RADIUS_PC) * k
  const P = (mobile ? PUSH_MOBILE : PUSH_PC) * k
  const r = DOT * k
  const hot = []

  // точки в покое — одним путём и одной заливкой: их полторы тысячи
  ctx.beginPath()
  for (let i = 0; i < dots.length; i += 2) {
    const x = dots[i]
    const y = dots[i + 1]
    if (px !== null && Math.abs(x - px) < R && Math.abs(y - py) < R
      && Math.hypot(x - px, y - py) < R * 0.96) {
      hot.push(i)
      continue
    }
    ctx.moveTo(x + r, y)
    ctx.arc(x, y, r, 0, TAU)
  }
  ctx.fillStyle = colorIdle
  ctx.fill()

  // у пятна: расходятся, растут и загораются
  const [r0, g0, b0] = colorHot
  for (const i of hot) {
    const dx = dots[i] - px
    const dy = dots[i + 1] - py
    const d = Math.hypot(dx, dy)
    const near = 1 - d / R
    const push = near * near * P
    const x = dots[i] + (d ? (dx / d) * push : 0)
    const y = dots[i + 1] + (d ? (dy / d) * push : 0)
    ctx.fillStyle = `rgba(${r0},${g0},${b0},${0.25 + near * 0.75})`
    ctx.beginPath()
    ctx.arc(x, y, (DOT + near * DOT_GROW) * k, 0, TAU)
    ctx.fill()
  }
}

function draw(t, dt) {
  // пятно — под курсором или на прогулке по восьмёрке; между ними перетекает,
  // а не прыгает, когда курсор входит в капсулу и уходит
  presence += ((ptr.active ? 1 : 0) - presence) * (1 - Math.exp(-dt * FOLLOW))
  const wx = w * 0.5 + Math.sin(t * 0.5) * w * 0.4
  const wy = h * 0.5 + Math.sin(t * 0.9) * h * 0.38
  paint(wx + (ptr.x - wx) * presence, wy + (ptr.y - wy) * presence)
}

function still() {
  paint(null, null)
}

function loop(ms) {
  const dt = last ? Math.min((ms - last) / 1000, 0.1) : 0
  last = ms
  clock += dt
  draw(clock, dt)
  raf = requestAnimationFrame(loop)
}

function sync() {
  cancelAnimationFrame(raf)
  raf = 0
  last = 0
  if (mq.matches) { still(); return } // reduced motion: ровная сетка, курсор не трогает
  if (visible && !document.hidden) raf = requestAnimationFrame(loop)
}

function onMove(e) {
  const r = canvasEl.value.getBoundingClientRect()
  ptr.x = e.clientX - r.left
  ptr.y = e.clientY - r.top
  ptr.active = true
}

function onLeave() {
  ptr.active = false
}

// палец отпустили — пятно возвращается к прогулке; мышь уходит через pointerleave
function onUp(e) {
  if (e.pointerType !== 'mouse') onLeave()
}

onMounted(() => {
  const el = canvasEl.value
  ctx = el.getContext('2d')
  // в onUnmounted ref уже обнулён — родителя запоминаем, чтобы снять слушатели
  host = el.parentElement
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  readColors()
  layout()
  // pointerdown — касание пальцем отзывается сразу; pointercancel — палец
  // повёл страницу, и браузер забрал жест себе
  host.addEventListener('pointerdown', onMove)
  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerleave', onLeave)
  host.addEventListener('pointercancel', onLeave)
  host.addEventListener('pointerup', onUp)
  // смена размера очищает canvas — перерисовываем сразу, без пустого кадра
  ro = new ResizeObserver(() => {
    layout()
    if (raf) draw(clock, 0)
    else still()
  })
  ro.observe(el)
  io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    sync()
  })
  io.observe(el)
  document.addEventListener('visibilitychange', sync)
  mq.addEventListener('change', sync)
  sync()
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect()
  io?.disconnect()
  document.removeEventListener('visibilitychange', sync)
  mq?.removeEventListener('change', sync)
  host?.removeEventListener('pointerdown', onMove)
  host?.removeEventListener('pointermove', onMove)
  host?.removeEventListener('pointerleave', onLeave)
  host?.removeEventListener('pointercancel', onLeave)
  host?.removeEventListener('pointerup', onUp)
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
