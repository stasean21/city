<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { gsap } from 'gsap'
import CoverImage from '../ui/CoverImage.vue'
import { plural } from '../../utils/plural.js'

// бесконечная галерея всех работ услуги: полотно тянется в любую сторону,
// клик по работе — просмотр поверх. Макет — docs/mockups/works-gallery.html.
// монтируется родителем через <Teleport to="body"> и v-if только на время показа
const props = defineProps({
  // [{ title, niche, cover, slides?: [src | { src, note }], fit?: 'contain', video?, poster? }]
  items: { type: Array, required: true },
  title: { type: String, required: true }, // название услуги
  // открыть сразу просмотр этой работы (клик по ролику на странице);
  // тогда закрытие просмотра закрывает и галерею — человек возвращается на страницу
  start: { type: Number, default: -1 },
})

const emit = defineEmits(['close'])

// полотно — сетка работ, повторённая (REPEAT * 2 + 1)² раз; сдвиг берётся по
// модулю ширины сетки, поэтому края не видны никогда
const REPEAT = 2
// скорость полотна от стрелок клавиатуры, px за кадр
const KEY_SPEED = 14
// с какого сдвига нажатие считается перетаскиванием, а не кликом
const DRAG_THRESHOLD = 5

const n = computed(() => props.items.length)
const cols = computed(() => Math.ceil(Math.sqrt(n.value * 1.5)))
const rows = computed(() => Math.ceil(n.value / cols.value))
const totalCols = computed(() => cols.value * (REPEAT * 2 + 1))
const totalRows = computed(() => rows.value * (REPEAT * 2 + 1))

// ячейки полотна. Работа в ячейке — по модулю N; доступна с клавиатуры
// и скринридеру только центральная копия сетки и только без повторов внутри неё
const cells = computed(() => {
  const list = []
  for (let r = 0; r < totalRows.value; r += 1) {
    for (let c = 0; c < totalCols.value; c += 1) {
      const base = (r % rows.value) * cols.value + (c % cols.value)
      const center = Math.floor(r / rows.value) === REPEAT && Math.floor(c / cols.value) === REPEAT && base < n.value
      list.push({
        key: `${r}-${c}`,
        r,
        c,
        idx: base % n.value,
        center,
        // карточки у центра экрана — появляются волной от середины
        near: Math.abs(c - totalCols.value / 2) < 4 && Math.abs(r - totalRows.value / 2) < 3,
      })
    }
  }
  return list
})

const countLabel = computed(() => `${n.value} ${plural(n.value, ['работа', 'работы', 'работ'])}`)

const rootEl = ref(null)
const wrapEl = ref(null)
const canvasEl = ref(null)
const closeEl = ref(null)
const viewCardEl = ref(null)
const viewEl = ref(null)

const dragging = ref(false)
const hint = ref(true)

// ---------- полотно ----------
// геометрия в px — замеряется по отрисованным карточкам (размеры — токены)
const geo = { cw: 0, ch: 0, gw: 0, gh: 0, ox: 0, oy: 0 }
const pos = { x: 0, y: 0, scale: 1 }
let reduce = false

function measure() {
  const cards = canvasEl.value.children
  const first = cards[0]
  geo.cw = cards[1].offsetLeft - first.offsetLeft
  geo.ch = cards[totalCols.value].offsetTop - first.offsetTop
  geo.gw = cols.value * geo.cw
  geo.gh = rows.value * geo.ch
  const w = wrapEl.value.clientWidth
  const h = wrapEl.value.clientHeight
  geo.ox = w / 2 - (totalCols.value * geo.cw) / 2
  geo.oy = h / 2 - (totalRows.value * geo.ch) / 2
}

// сдвиг по модулю сетки: полотно всегда стоит центральной копией у экрана
function apply() {
  const rx = ((pos.x % geo.gw) + geo.gw) % geo.gw
  const ry = ((pos.y % geo.gh) + geo.gh) % geo.gh
  const tx = geo.ox + rx - geo.gw
  const ty = geo.oy + ry - geo.gh
  const el = canvasEl.value
  // масштаб — от центра экрана
  el.style.transformOrigin = `${wrapEl.value.clientWidth / 2 - tx}px ${wrapEl.value.clientHeight / 2 - ty}px`
  el.style.transform = `translate(${tx}px, ${ty}px) scale(${pos.scale})`
}

let zoomTween = null
function zoom(to) {
  zoomTween?.kill()
  if (reduce) {
    pos.scale = 1
    apply()
    return
  }
  zoomTween = gsap.to(pos, { scale: to, duration: 0.45, ease: to < 1 ? 'power3.out' : 'power3.inOut', onUpdate: apply })
}

// ---------- перетаскивание: мышь и тач одним кодом ----------
const drag = { moved: false, sx: 0, sy: 0, px: 0, py: 0 }

function onPointerDown(event) {
  if (viewShown.value || (event.pointerType === 'mouse' && event.button !== 0)) return
  dragging.value = true
  drag.moved = false
  drag.sx = event.clientX
  drag.sy = event.clientY
  drag.px = pos.x
  drag.py = pos.y
}

function onPointerMove(event) {
  if (!dragging.value) return
  const dx = event.clientX - drag.sx
  const dy = event.clientY - drag.sy
  if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
    drag.moved = true
    hint.value = false
    zoom(0.86)
  }
  if (drag.moved) {
    pos.x = drag.px + dx
    pos.y = drag.py + dy
    apply()
  }
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  if (pos.scale < 1) zoom(1)
}

function onWheel(event) {
  if (viewShown.value) return
  event.preventDefault()
  pos.x -= event.deltaX
  pos.y -= event.deltaY
  hint.value = false
  apply()
}

// стрелки клавиатуры двигают полотно плавно, пока зажаты
const keys = {}
function tick() {
  if (viewShown.value || dragging.value) return
  let moved = false
  if (keys.ArrowLeft) { pos.x += KEY_SPEED; moved = true }
  if (keys.ArrowRight) { pos.x -= KEY_SPEED; moved = true }
  if (keys.ArrowUp) { pos.y += KEY_SPEED; moved = true }
  if (keys.ArrowDown) { pos.y -= KEY_SPEED; moved = true }
  if (moved) apply()
}

// ---------- просмотр одной работы ----------
// рендерится только открытым (v-if): его × лежит ровно над главным ×,
// невидимый слой перехватывал бы клики
const viewShown = ref(false)
const viewClosing = ref(false)
const view = reactive({ i: 0, s: 0 })
let lastCard = null

const viewItem = computed(() => props.items[view.i])
const viewSlides = computed(() => viewItem.value?.slides ?? [])
// у работы есть слайды — листаем их; нет — листаем работы
const bySlides = computed(() => viewSlides.value.length > 0)

const viewImage = computed(() => {
  if (!bySlides.value) return { src: viewItem.value.cover, note: viewItem.value.niche }
  const slide = viewSlides.value[view.s]
  return typeof slide === 'string'
    ? { src: slide, note: viewItem.value.niche }
    : { src: slide.src, note: slide.note ?? viewItem.value.niche }
})

const viewCount = computed(() => (bySlides.value
  ? `${view.s + 1} / ${viewSlides.value.length}`
  : `${view.i + 1} / ${n.value}`))

const navLabel = (d) => (bySlides.value
  ? (d > 0 ? 'Следующий слайд' : 'Предыдущий слайд')
  : (d > 0 ? 'Следующая работа' : 'Предыдущая работа'))

async function openView(idx, event = null) {
  // клик после перетаскивания работу не открывает; клавиатурный (detail 0) — всегда
  if (event && drag.moved && event.detail !== 0) return
  const card = event?.currentTarget
  view.i = idx
  view.s = 0
  // фокус потом вернётся на эту же работу в центральной копии сетки
  lastCard = card?.tabIndex === 0
    ? card
    : canvasEl.value.querySelector(`.ig__card[data-i="${idx}"][tabindex="0"]`)
  viewShown.value = true
  await nextTick()
  if (!reduce) {
    gsap.fromTo(viewEl.value, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    gsap.fromTo(viewCardEl.value, { scale: 0.85, y: 24, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' })
  }
  viewEl.value.querySelector('.ig-view__arr.is-next')?.focus({ preventScroll: true })
}

function closeView() {
  if (!viewShown.value || viewClosing.value) return
  // открыли сразу просмотр — закрываем всё, возвращаемся на страницу
  if (props.start >= 0) {
    close()
    return
  }
  viewClosing.value = true
  const done = () => {
    viewShown.value = false
    viewClosing.value = false
    lastCard?.focus({ preventScroll: true })
  }
  if (reduce) done()
  else gsap.to(viewEl.value, { opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: done })
}

function step(d) {
  if (bySlides.value) {
    const len = viewSlides.value.length
    view.s = (((view.s + d) % len) + len) % len
  } else {
    view.i = (((view.i + d) % n.value) + n.value) % n.value
  }
}

// переход: старое уезжает и гаснет, новое въезжает с другой стороны
function nav(d) {
  if (reduce) {
    step(d)
    return
  }
  const card = viewCardEl.value
  gsap.killTweensOf(card)
  gsap.to(card, {
    x: -d * 60,
    opacity: 0,
    duration: 0.16,
    ease: 'power2.in',
    onComplete: () => {
      step(d)
      gsap.fromTo(card, { x: d * 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.24, ease: 'power2.out' })
    },
  })
}

// ---------- закрытие всей галереи ----------
const closing = ref(false)

function close() {
  if (closing.value) return
  closing.value = true
  if (reduce) emit('close')
  else gsap.to(rootEl.value, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => emit('close') })
}

// ---------- клавиатура ----------
function onKeydown(event) {
  const { key } = event
  if (key === 'Escape') {
    event.preventDefault()
    if (viewShown.value) closeView()
    else close()
    return
  }
  if (key === 'Tab') {
    // ловушка фокуса: в просмотре — его кнопки, иначе крестик и центральная копия
    const focusable = [...rootEl.value.querySelectorAll(viewShown.value
      ? '.ig-view button, .ig-view video'
      : '.ig__close, .ig__card[tabindex="0"]')]
    if (!focusable.length) return
    event.preventDefault()
    const i = focusable.indexOf(document.activeElement)
    const next = i < 0 ? 0 : (i + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length
    focusable[next].focus({ preventScroll: true })
    return
  }
  if (!key.startsWith('Arrow')) return
  event.preventDefault()
  if (viewShown.value) {
    if (key === 'ArrowRight') nav(1)
    if (key === 'ArrowLeft') nav(-1)
    return
  }
  keys[key] = true
}

function onKeyup(event) {
  keys[event.key] = false
}

function onResize() {
  measure()
  apply()
}

// ---------- жизненный цикл ----------
// фокус везде без прокрутки: полотно огромное, и браузер прокручивал бы к карточке
// и галерею, и страницу под ней
const html = typeof document !== 'undefined' ? document.documentElement : null
const saved = { paddingRight: '' }

onMounted(() => {
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // страница под галереей не прокручивается — классом, а не инлайн-стилем:
  // лоадер в конце заставки сбрасывает инлайн overflow у html.
  // ширину скроллбара компенсируем полем, чтобы контент не прыгал
  saved.paddingRight = html.style.paddingRight
  const scrollbar = window.innerWidth - html.clientWidth
  html.classList.add('is-scroll-locked')
  if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`

  measure()
  apply()

  wrapEl.value.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('keyup', onKeyup)
  window.addEventListener('resize', onResize)
  gsap.ticker.add(tick)

  if (!reduce) {
    gsap.fromTo(rootEl.value, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
    gsap.from(canvasEl.value.querySelectorAll('.ig__card.is-near'), {
      opacity: 0,
      scale: 0.85,
      duration: 0.6,
      stagger: { amount: 0.5, from: 'center' },
      ease: 'power3.out',
      delay: 0.15,
    })
  }
  closeEl.value.focus({ preventScroll: true })
  if (props.start >= 0) openView(props.start)
})

onUnmounted(() => {
  wrapEl.value?.removeEventListener('wheel', onWheel)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('keyup', onKeyup)
  window.removeEventListener('resize', onResize)
  gsap.ticker.remove(tick)
  zoomTween?.kill()
  gsap.killTweensOf([rootEl.value, viewEl.value, viewCardEl.value].filter(Boolean))
  html.classList.remove('is-scroll-locked')
  html.style.paddingRight = saved.paddingRight
})
</script>

<template>
  <div
    ref="rootEl"
    class="ig"
    :class="{ 'is-closing': closing }"
    role="dialog"
    aria-modal="true"
    :aria-label="`Все работы: ${title}`"
  >
    <div ref="wrapEl" class="ig__wrap" :class="{ 'is-drag': dragging }" @pointerdown="onPointerDown">
      <div
        ref="canvasEl"
        class="ig__canvas"
        :style="{ '--cols': totalCols, '--rows': totalRows }"
      >
        <button
          v-for="cell in cells"
          :key="cell.key"
          type="button"
          class="ig__card"
          :class="{ 'is-contain': items[cell.idx].fit === 'contain', 'is-near': cell.near }"
          :style="{ '--c': cell.c, '--r': cell.r }"
          :data-i="cell.idx"
          :tabindex="cell.center ? 0 : -1"
          :aria-hidden="cell.center ? undefined : 'true'"
          :aria-label="cell.center ? `${items[cell.idx].title}, ${items[cell.idx].niche}` : undefined"
          @click="openView(cell.idx, $event)"
        >
          <span class="ig__in">
            <CoverImage
              class="ig__img"
              :class="{ 'is-contain': items[cell.idx].fit === 'contain' }"
              :src="items[cell.idx].cover"
              :alt="cell.center ? `${items[cell.idx].title}, ${items[cell.idx].niche}` : ''"
              :width="600"
              :height="800"
            />
          </span>
          <span class="caption ig__tag" aria-hidden="true">
            {{ items[cell.idx].title }}<span class="ig__niche">{{ items[cell.idx].niche }}</span>
          </span>
        </button>
      </div>
    </div>

    <div class="ig__top">
      <p class="small ig__title">{{ title }}<span class="ig__count"> · {{ countLabel }}</span></p>
      <button ref="closeEl" type="button" class="ig__close" aria-label="Закрыть галерею" @click="close">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
      </button>
    </div>

    <p class="small ig__hint" :class="{ 'is-hidden': !hint }" aria-hidden="true"><i></i>тяните в любую сторону</p>

    <!-- просмотр одной работы -->
    <div
      v-if="viewShown"
      ref="viewEl"
      class="ig-view"
      :class="{ 'is-closing': viewClosing }"
      role="group"
      :aria-label="viewItem.title"
    >
      <div class="ig-view__back" @click="closeView"></div>
      <span class="small ig-view__esc">esc — закрыть</span>
      <button type="button" class="ig__close ig-view__x" aria-label="Закрыть работу" @click="closeView">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
      </button>
      <button type="button" class="ig-view__arr is-prev" :aria-label="navLabel(-1)" @click="nav(-1)">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
      </button>

      <div ref="viewCardEl" class="ig-view__card">
        <!-- ролик: с управлением, без звука по умолчанию -->
        <video
          v-if="viewItem.video"
          :key="viewItem.video"
          class="ig-view__img is-video"
          :src="viewItem.video"
          :poster="viewItem.poster || undefined"
          controls
          muted
          loop
          playsinline
          :autoplay="!reduce"
          :aria-label="`${viewItem.title}, ${viewItem.niche}`"
        ></video>
        <CoverImage
          v-else
          :key="viewImage.src"
          class="ig-view__img"
          :class="{ 'is-contain': viewItem.fit === 'contain' }"
          :src="viewImage.src"
          :alt="`${viewItem.title}, ${viewImage.note}`"
          :width="600"
          :height="800"
          :lazy="false"
        />
        <p class="ig-view__cap">{{ viewItem.title }}<span class="small ig-view__note">{{ viewImage.note }}</span></p>
      </div>

      <button type="button" class="ig-view__arr is-next" :aria-label="navLabel(1)" @click="nav(1)">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
      </button>
      <p class="small ig-view__count" aria-live="polite">{{ viewCount }}</p>
    </div>
  </div>
</template>

<style scoped>
/* ---------- галерея ---------- */
.ig {
  position: fixed;
  inset: 0;
  z-index: var(--z-gallery);
  overflow: hidden;
  background: var(--bg);
  touch-action: none;
  user-select: none;
}

/* во время закрытия клики уже не принимаются */
.ig.is-closing {
  pointer-events: none;
}

.ig__wrap {
  position: absolute;
  inset: 0;
  cursor: grab;
}

.ig__wrap.is-drag {
  cursor: grabbing;
}

.ig__canvas {
  --cell-w: calc(var(--gallery-tile-w) + var(--gallery-gap));
  --cell-h: calc(var(--gallery-tile-w) * 4 / 3 + var(--gallery-gap));
  position: absolute;
  left: 0;
  top: 0;
  width: calc(var(--cols) * var(--cell-w));
  height: calc(var(--rows) * var(--cell-h));
  will-change: transform;
}

/* плитка 3:4; положение — номер колонки и ряда */
.ig__card {
  position: absolute;
  left: calc(var(--c) * var(--cell-w));
  top: calc(var(--r) * var(--cell-h));
  width: var(--gallery-tile-w);
  aspect-ratio: 3 / 4;
  padding: 0;
  overflow: hidden;
  background: var(--white);
  border: 0;
  border-radius: var(--r-card);
}

.ig__card:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.ig__in {
  position: absolute;
  inset: 0;
  transition: transform .5s var(--ease-out);
}

@media (hover: hover) {
  .ig__card:hover .ig__in {
    transform: scale(1.03);
  }
}

.ig__img {
  width: 100%;
  height: 100%;
}

/* баннеры разных пропорций — целиком, на белом фоне плитки */
.ig__img.is-contain,
.ig-view__img.is-contain {
  background: var(--white);
}

.ig__img.is-contain :deep(.cover__img),
.ig-view__img.is-contain :deep(.cover__img) {
  object-fit: contain;
}

.ig__tag {
  position: absolute;
  left: var(--s-12);
  bottom: var(--s-12);
  display: flex;
  gap: var(--s-8);
  max-width: calc(100% - 2 * var(--s-12));
  padding: var(--s-4) var(--s-12);
  overflow: hidden;
  color: var(--ink);
  white-space: nowrap;
  background: var(--white);
  border-radius: var(--r-pill);
}

.ig__niche {
  color: var(--text-3);
}

/* ---------- шапка и подсказка ---------- */
.ig__top {
  position: absolute;
  top: var(--s-24);
  left: var(--s-24);
  right: var(--s-24);
  z-index: 5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--s-16);
  pointer-events: none;
}

.ig__title,
.ig__top .ig__close {
  pointer-events: auto;
}

.ig__title {
  padding: var(--s-8) var(--s-16);
  color: var(--ink);
  background: var(--white);
  border-radius: var(--r-pill);
}

.ig__count {
  color: var(--text-3);
}

.ig__close,
.ig-view__arr {
  display: grid;
  place-items: center;
  flex: none;
  padding: 0;
  color: var(--white);
  border: 0;
  border-radius: 50%;
  transition: background-color var(--ease);
}

.ig__close {
  width: var(--gallery-btn);
  height: var(--gallery-btn);
  background: var(--ink);
}

.ig__close:hover {
  background: var(--ink-hover);
}

.ig__close svg,
.ig-view__arr svg {
  width: var(--btn-icon);
  height: var(--btn-icon);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}

/* на тёмных кнопках кольцо фокуса акцентное */
.ig__close:focus-visible,
.ig-view__arr:focus-visible {
  outline: var(--focus-ring) solid var(--accent);
  outline-offset: var(--focus-ring);
}

.ig__hint {
  position: absolute;
  left: 50%;
  bottom: var(--s-24);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: var(--s-8);
  padding: var(--pill-py) var(--pill-px);
  color: var(--ink);
  white-space: nowrap;
  background: var(--white);
  border-radius: var(--r-pill);
  transform: translateX(-50%);
  pointer-events: none;
  transition: opacity .4s var(--ease-out);
}

.ig__hint i {
  width: var(--dot);
  height: var(--dot);
  background: var(--accent);
  border-radius: 50%;
}

.ig__hint.is-hidden {
  opacity: 0;
}

/* ---------- просмотр одной работы ---------- */
.ig-view {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
}

.ig-view.is-closing {
  pointer-events: none;
}

.ig-view__back {
  position: absolute;
  inset: 0;
  background: var(--gallery-backdrop);
}

.ig-view__card {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-12);
}

.ig-view__img {
  width: var(--gallery-view-w);
  aspect-ratio: 3 / 4;
  border-radius: var(--r-card);
}

/* вертикальный ролик 9:16 — по высоте экрана */
.ig-view__img.is-video {
  width: auto;
  height: var(--gallery-video-h);
  aspect-ratio: 9 / 16;
  object-fit: cover;
  background: var(--ink-soft);
}

.ig-view__img.is-video:focus-visible {
  outline: var(--focus-ring) solid var(--accent);
  outline-offset: var(--focus-ring);
}

.ig-view__cap {
  display: flex;
  align-items: baseline;
  gap: var(--s-12);
  max-width: var(--gallery-view-w);
  font: 600 var(--t-h3)/1.3 var(--f-head);
  letter-spacing: var(--ls-h3);
  color: var(--white);
}

.ig-view__note {
  letter-spacing: 0;
  color: var(--dark-section-text);
}

.ig-view__x {
  position: absolute;
  top: var(--s-24);
  right: var(--s-24);
  z-index: 3;
  background: var(--ink-soft);
}

.ig-view__arr {
  position: absolute;
  top: 50%;
  z-index: 3;
  width: var(--gallery-arrow);
  height: var(--gallery-arrow);
  background: var(--ink-soft);
  transform: translateY(-50%);
}

.ig-view__arr:hover {
  background: var(--ink-hover);
}

.ig-view__arr.is-prev {
  left: var(--s-32);
}

.ig-view__arr.is-next {
  right: var(--s-32);
}

.ig-view__esc {
  position: absolute;
  top: var(--s-32);
  left: var(--s-32);
  z-index: 3;
  color: var(--dark-section-text);
}

.ig-view__count {
  position: absolute;
  left: 50%;
  bottom: var(--s-24);
  z-index: 3;
  color: var(--dark-section-text);
  font-variant-numeric: tabular-nums;
  transform: translateX(-50%);
}

@media (max-width: 767px) {
  .ig__count {
    display: none;
  }

  .ig-view__esc {
    display: none;
  }

  .ig-view__arr.is-prev {
    left: var(--s-12);
  }

  .ig-view__arr.is-next {
    right: var(--s-12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ig__in,
  .ig__hint {
    transition: none;
  }
}
</style>
