<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import gift from '../../data/gift.json'
import { scrollToSameAnchor } from '../../utils/headerOffset.js'

// подарок к первому заказу: hidden → open (окно) → tab (ярлык в углу).
// Окно само всплывает один раз, через 10 с после первой загрузки в этой вкладке;
// после закрытия — только ярлык, и в следующих визитах тоже (localStorage)
const DELAY = 10000
const STATE_KEY = 'gift-state'
const START_KEY = 'gift-start'
// пока открыты галерея, просмотр слайдов или мобильное меню — ждём их закрытия
const BUSY_POLL = 500

// «оживление» ярлыка: покачивание подарка и подсмотр выгоды по очереди
const GIFT_NUDGE_MS = 15000 // между оживлениями
const NUDGE_FIRST_MS = 3000 // первое — через столько после появления ярлыка
const NUDGE_MAX = 6 // за визит, потом ярлык просто стоит
const SHAKE_MS = 700 // длительность покачивания (= @keyframes)
const PEEK_MS = 3000 // сколько видна выгода вместо «Ваш подарок»
const NUDGE_RETRY_MS = 1000 // на паузе — проверяем снова, без накопления

const route = useRoute()
const router = useRouter()

const ready = ref(false) // до гидрации не выводим ничего — в пререндере компонента нет
const state = ref('hidden')
const fromTab = ref(false) // открытие из ярлыка — окно вылетает из угла
const panelEl = ref(null)
const ctaEl = ref(null)
const tabEl = ref(null)

let timer = 0
let busyTimer = 0

// ---------- оживление ярлыка ----------
const shorts = gift.items.map((item) => item.short)
const label = ref(gift.tab)
const labelW = ref(0)
const measureEl = ref(null)
const shaking = ref(false)
const tabHover = ref(false)
let nudges = 0
let nextPeek = false
let peekIndex = 0
let nudgeTimer = 0
let fxTimer = 0

function scheduleNudge(ms) {
  clearTimeout(nudgeTimer)
  nudgeTimer = window.setTimeout(nudge, ms)
}

function stopNudges() {
  clearTimeout(nudgeTimer)
  clearTimeout(fxTimer)
  shaking.value = false
  label.value = gift.tab
}

// пауза: курсор или фокус на ярлыке, окно/галерея/меню открыты, вкладка в фоне
function nudgePaused() {
  return tabHover.value
    || document.activeElement === tabEl.value
    || document.visibilityState !== 'visible'
    || isBusy()
}

function nudge() {
  if (state.value !== 'tab' || nudges >= NUDGE_MAX) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (nudgePaused()) {
    scheduleNudge(NUDGE_RETRY_MS)
    return
  }
  nudges += 1
  if (nextPeek) {
    label.value = shorts[peekIndex % shorts.length]
    peekIndex += 1
    fxTimer = window.setTimeout(() => { label.value = gift.tab }, PEEK_MS)
  } else {
    shaking.value = true
    fxTimer = window.setTimeout(() => { shaking.value = false }, SHAKE_MS)
  }
  nextPeek = !nextPeek
  scheduleNudge(GIFT_NUDGE_MS)
}

// ширина подписи — по скрытому измерителю, чтобы ярлык менял ширину плавно
async function measureLabel() {
  await nextTick()
  if (measureEl.value) labelW.value = measureEl.value.offsetWidth
}

watch(label, measureLabel)
watch(state, (value) => {
  if (value === 'tab') {
    measureLabel()
    scheduleNudge(NUDGE_FIRST_MS)
  } else {
    stopNudges()
  }
})

function read(storage, key) {
  try {
    return window[storage].getItem(key)
  } catch {
    return null
  }
}

function write(storage, key, value) {
  try {
    window[storage].setItem(key, value)
  } catch {
    // хранилище недоступно — ведём себя как при первом визите
  }
}

function isBusy() {
  return document.documentElement.classList.contains('is-scroll-locked')
    || Boolean(document.querySelector('dialog[open]'))
    || document.body.style.overflow === 'hidden'
}

function showWhenFree() {
  if (state.value !== 'hidden') return
  if (isBusy()) {
    busyTimer = window.setTimeout(showWhenFree, BUSY_POLL)
    return
  }
  open(false)
}

function open(byTab) {
  // ярлык исчезнет без mouseleave — иначе оживления встали бы на паузу навсегда
  tabHover.value = false
  fromTab.value = byTab
  state.value = 'open'
  document.body.style.overflow = 'hidden'
}

function onOpened() {
  ctaEl.value?.$el?.focus({ preventScroll: true })
}

function close() {
  if (state.value !== 'open') return
  state.value = 'tab'
  document.body.style.overflow = ''
  write('localStorage', STATE_KEY, 'tab')
  nextTick(() => tabEl.value?.focus({ preventScroll: true }))
}

function take() {
  close()
  const hash = '#contact'
  if (!scrollToSameAnchor(route, hash, route.path)) router.push({ path: route.path, hash })
}

// фокус не выходит из окна; Esc — свернуть в ярлык
function onKeydown(event) {
  if (state.value !== 'open') return
  if (event.key === 'Escape') {
    close()
    return
  }
  if (event.key !== 'Tab' || !panelEl.value) return
  const items = [...panelEl.value.querySelectorAll('a[href], button:not([disabled])')]
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  ready.value = true
  window.addEventListener('keydown', onKeydown)
  if (read('localStorage', STATE_KEY) === 'tab') {
    state.value = 'tab'
    return
  }
  // отсчёт — от первой загрузки в этой вкладке: переходы его не сбрасывают
  let start = Number(read('sessionStorage', START_KEY))
  if (!start) {
    start = Date.now()
    write('sessionStorage', START_KEY, String(start))
  }
  timer = window.setTimeout(showWhenFree, Math.max(0, start + DELAY - Date.now()))
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(timer)
  clearTimeout(busyTimer)
  stopNudges()
  if (state.value === 'open') document.body.style.overflow = ''
})
</script>

<template>
  <template v-if="ready">
    <Transition name="gift-dim">
      <div v-if="state === 'open'" class="gift-dim" aria-hidden="true" @click="close"></div>
    </Transition>

    <Transition :name="fromTab ? 'gift-corner-in' : 'gift-rise'" @after-enter="onOpened">
      <div
        v-if="state === 'open'"
        ref="panelEl"
        class="gift"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-title"
      >
        <button type="button" class="gift__x" aria-label="Закрыть" @click="close">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.7" />
          </svg>
        </button>

        <span class="pill gift__pill">
          <svg class="gift__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="8.5" width="17" height="4" rx="1.2" stroke="currentColor" stroke-width="1.6" />
            <path d="M5 12.5v7.5h14v-7.5M12 8.5V20" stroke="currentColor" stroke-width="1.6" />
            <path d="M12 8.5c-1.2-3.5-5.5-4-5.5-1.5 0 1.5 2.5 1.5 5.5 1.5zM12 8.5c1.2-3.5 5.5-4 5.5-1.5 0 1.5-2.5 1.5-5.5 1.5z" stroke="currentColor" stroke-width="1.6" />
          </svg>
          {{ gift.pill }}
        </span>

        <h2 id="gift-title" class="h2 gift__title">{{ gift.title }}</h2>
        <p class="lead gift__lead">{{ gift.lead }}</p>

        <ul class="gift__grid">
          <li v-for="item in gift.items" :key="item.text" class="gift__tile">
            <span class="card-title gift__value">{{ item.value }}</span>
            <span class="small gift__text">{{ item.text }}</span>
          </li>
        </ul>

        <div class="gift__actions">
          <BaseButton ref="ctaEl" variant="primary" arrow @click="take">{{ gift.cta }}</BaseButton>
          <button type="button" class="ui gift__later" @click="close">{{ gift.later }}</button>
          <span class="caption gift__note">{{ gift.note }}</span>
        </div>
      </div>
    </Transition>

    <Transition name="gift-tab">
      <button
        v-if="state === 'tab'"
        ref="tabEl"
        type="button"
        class="ui gift-tab"
        aria-label="Ваш подарок: открыть"
        aria-haspopup="dialog"
        :class="{ 'is-shaking': shaking }"
        @click="open(true)"
        @mouseenter="tabHover = true"
        @mouseleave="tabHover = false"
      >
        <svg class="gift__icon gift-tab__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="8.5" width="17" height="4" rx="1.2" stroke="currentColor" stroke-width="1.6" />
          <path d="M5 12.5v7.5h14v-7.5M12 8.5V20" stroke="currentColor" stroke-width="1.6" />
          <path d="M12 8.5c-1.2-3.5-5.5-4-5.5-1.5 0 1.5 2.5 1.5 5.5 1.5zM12 8.5c1.2-3.5 5.5-4 5.5-1.5 0 1.5-2.5 1.5-5.5 1.5z" stroke="currentColor" stroke-width="1.6" />
        </svg>
        <!-- подпись меняется («подсмотр выгоды») — скринридеру хватает aria-label -->
        <span class="gift-tab__label" :style="labelW ? { width: `${labelW}px` } : null" aria-hidden="true">
          <Transition name="gift-roll">
            <span :key="label" class="gift-tab__text">{{ label }}</span>
          </Transition>
        </span>
        <span ref="measureEl" class="gift-tab__measure" aria-hidden="true">{{ label }}</span>
        <span class="caption gift-tab__count" aria-hidden="true">{{ gift.items.length }}</span>
      </button>
    </Transition>
  </template>
</template>

<style scoped>
/* ---------- окно ---------- */
.gift-dim {
  position: fixed;
  inset: 0;
  z-index: var(--z-gift);
  background: var(--overlay);
}

.gift {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: var(--z-gift);
  width: var(--gift-w);
  max-height: calc(100dvh - 2 * var(--gutter));
  overflow-y: auto;
  padding: var(--s-40);
  background: var(--white);
  border-radius: var(--r-footer);
  transform: translate(-50%, -50%);
}

.gift__x {
  position: absolute;
  top: var(--s-16);
  right: var(--s-16);
  display: grid;
  place-items: center;
  width: var(--gift-x);
  height: var(--gift-x);
  padding: 0;
  border: 0;
  border-radius: var(--r-lg);
  background: var(--bg);
  color: var(--ink);
  cursor: pointer;
}

.gift__x svg {
  width: var(--s-16);
  height: var(--s-16);
}

.gift__pill {
  gap: var(--s-8);
  color: var(--ink);
}

.gift__icon {
  flex: none;
  width: var(--gift-icon);
  height: var(--gift-icon);
  color: var(--accent);
}

.gift__title {
  margin-top: var(--s-16);
  /* место под крестик */
  padding-right: var(--s-40);
}

.gift__lead {
  margin-top: var(--s-12);
  max-width: var(--measure-paragraph);
}

.gift__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--s-8);
  margin-top: var(--s-24);
}

.gift__tile {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--s-16);
  min-height: var(--gift-tile-h);
  padding: var(--s-16);
  border-radius: var(--r-btn);
  background: var(--bg);
}

/* первая выгода — тёмная плитка */
.gift__tile:first-child {
  background: var(--ink);
}

.gift__tile:first-child .gift__value {
  color: var(--white);
}

.gift__tile:first-child .gift__text {
  color: var(--dark-section-text);
}

.gift__actions {
  display: flex;
  align-items: center;
  gap: var(--s-12);
  margin-top: var(--s-24);
}

.gift__later {
  padding: var(--s-8) var(--s-16);
  border: 0;
  border-radius: var(--r-btn);
  background: none;
  color: var(--text);
  cursor: pointer;
  transition: color var(--ease);
}

.gift__later:hover {
  color: var(--ink);
}

.gift__note {
  margin-left: auto;
}

.gift__x:focus-visible,
.gift__later:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

/* ---------- ярлык ---------- */
.gift-tab {
  position: fixed;
  right: var(--s-24);
  bottom: var(--s-24);
  z-index: var(--z-gift-tab);
  display: inline-flex;
  align-items: center;
  gap: var(--s-8);
  height: var(--gift-tab-h);
  padding: 0 var(--s-16) 0 var(--s-12);
  border: 0;
  border-radius: var(--r-btn);
  background: var(--ink);
  color: var(--white);
  cursor: pointer;
}

.gift-tab__count {
  padding: 0 var(--s-8);
  border-radius: var(--r-pill);
  background: var(--accent);
  color: var(--ink);
}

/* наведение: плашка чуть приподнимается, без тени */
@media (hover: hover) {
  .gift-tab {
    transition: transform var(--ease), background-color var(--ease);
  }

  .gift-tab:hover {
    background: var(--ink-hover);
    transform: translateY(calc(-1 * var(--s-4) / 2));
  }
}

/* подпись: окно в одну строку, ширина — по измерителю, текст прокручивается */
.gift-tab__label {
  position: relative;
  display: inline-block;
  height: 1.375em;
  overflow: hidden;
  white-space: nowrap;
  transition: width var(--ease);
}

.gift-tab__text {
  display: block;
}

.gift-tab__measure {
  position: absolute;
  visibility: hidden;
  white-space: nowrap;
  pointer-events: none;
}

.gift-roll-enter-active,
.gift-roll-leave-active {
  transition: transform .35s ease, opacity .35s ease;
}

.gift-roll-leave-active {
  position: absolute;
  top: 0;
  left: 0;
}

.gift-roll-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.gift-roll-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* «встряхнуть подарок»: иконка качается, счётчик делает вдох; плашка стоит */
.gift-tab.is-shaking .gift-tab__icon {
  transform-origin: 50% 80%;
  animation: gift-shake .7s ease-in-out;
}

.gift-tab.is-shaking .gift-tab__count {
  animation: gift-breath .7s ease-in-out;
}

@keyframes gift-shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-12deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-6deg); }
}

@keyframes gift-breath {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.18); }
}

.gift-tab:focus-visible {
  outline: var(--focus-ring) solid var(--white);
  outline-offset: var(--focus-ring);
}

/* ---------- анимации: появление, сворачивание в угол, ярлык ---------- */
.gift-dim-enter-active,
.gift-dim-leave-active {
  transition: opacity .4s var(--ease-out);
}

.gift-dim-enter-from,
.gift-dim-leave-to {
  opacity: 0;
}

.gift-rise-enter-active,
.gift-corner-in-enter-active,
.gift-rise-leave-active,
.gift-corner-in-leave-active {
  transform-origin: bottom right;
  transition: opacity .4s var(--ease-out), transform .4s var(--ease-out);
}

.gift-rise-enter-from {
  opacity: 0;
  transform: translate(-50%, calc(-50% + var(--s-24)));
}

/* из угла и в угол: окно сжимается к ярлыку в правом нижнем углу */
.gift-corner-in-enter-from,
.gift-rise-leave-to,
.gift-corner-in-leave-to {
  opacity: 0;
  transform: translate(calc(-50% + 50vw - var(--s-24)), calc(-50% + 50vh - var(--s-24))) scale(.2);
}

.gift-tab-enter-active {
  transition: opacity .4s var(--ease-out), transform .4s var(--ease-out);
}

.gift-tab-enter-from {
  opacity: 0;
  transform: translateY(var(--s-16));
}

@media (max-width: 767px) {
  .gift {
    padding: var(--s-24);
  }

  .gift__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gift__tile {
    min-height: auto;
  }

  .gift__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .gift__actions .btn {
    justify-content: center;
  }

  .gift__note {
    margin-left: 0;
    text-align: center;
  }

  /* над нижней панелью шапки */
  .gift-tab {
    right: var(--s-12);
    bottom: calc(var(--dock-h) + var(--s-16) + var(--s-12) + env(safe-area-inset-bottom));
  }
}
</style>
