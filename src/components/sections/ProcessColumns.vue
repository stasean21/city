<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import steps from '../../data/process.json'

// svg встраиваем строкой, чтобы иконки попали в пререндеренный html
const icons = import.meta.glob('../../assets/icons/process/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const items = steps.map((step, i) => ({
  ...step,
  num: String(i + 1).padStart(2, '0'),
  svg: icons[`../../assets/icons/process/${step.icon}.svg`],
}))

const AUTOPLAY_MS = 3000
const CLICK_PAUSE_MS = 8000

const active = ref(0)
const rowEl = ref(null)

// автоплей идёт, только когда ничто ему не мешает: блок в экране,
// вкладка видна, не наведено, не в фокусе, не пауза после клика,
// не мобилка и не reduced motion
const state = { inView: false, hovering: false, focused: false, clickPaused: false }
let interval = null
let clickTimer = null
let observer = null
let mqMobile = null
let mqReduced = null

function canPlay() {
  return state.inView
    && !document.hidden
    && !state.hovering
    && !state.focused
    && !state.clickPaused
    && !mqMobile?.matches
    && !mqReduced?.matches
}

function sync() {
  if (canPlay()) {
    if (!interval) {
      interval = setInterval(() => {
        active.value = (active.value + 1) % items.length
      }, AUTOPLAY_MS)
    }
  } else if (interval) {
    clearInterval(interval)
    interval = null
  }
}

// тач-устройства тоже шлют pointerenter при тапе — ховером считаем только мышь
function onEnter(i, event) {
  if (event.pointerType !== 'mouse') return
  state.hovering = true
  active.value = i
  sync()
}

function onRowLeave(event) {
  if (event.pointerType !== 'mouse') return
  state.hovering = false
  sync()
}

function onFocus(i) {
  state.focused = true
  active.value = i
  sync()
}

function onBlur() {
  state.focused = false
  sync()
}

function onClick(i) {
  active.value = i
  state.clickPaused = true
  clearTimeout(clickTimer)
  clickTimer = setTimeout(() => {
    state.clickPaused = false
    sync()
  }, CLICK_PAUSE_MS)
  sync()
}

onMounted(() => {
  mqMobile = window.matchMedia('(max-width: 767px)')
  mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  mqMobile.addEventListener('change', sync)
  mqReduced.addEventListener('change', sync)
  document.addEventListener('visibilitychange', sync)

  observer = new IntersectionObserver(([entry]) => {
    state.inView = entry.isIntersecting
    sync()
  }, { threshold: 0.4 })
  observer.observe(rowEl.value)
})

onUnmounted(() => {
  clearInterval(interval)
  clearTimeout(clickTimer)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', sync)
  mqMobile?.removeEventListener('change', sync)
  mqReduced?.removeEventListener('change', sync)
})
</script>

<template>
  <section id="process" class="process">
    <div class="container">
      <div class="process__head">
        <div class="process__intro">
          <span class="pill">Процесс</span>
          <h2 class="display">Как работаем</h2>
        </div>
        <p class="lead process__hint">
          <span class="process__hint--hover">Наведите на этап, чтобы узнать подробнее.</span>
          <span class="process__hint--touch">Нажмите на этап, чтобы узнать подробнее.</span>
        </p>
      </div>

      <ol ref="rowEl" class="process__row" @pointerleave="onRowLeave">
        <li
          v-for="(item, i) in items"
          :key="item.num"
          class="process__col"
          :class="{ 'is-active': active === i }"
          @pointerenter="onEnter(i, $event)"
        >
          <!-- кнопка накрывает колонку целиком; содержимое — соседний блок,
               а не потомок: заголовок и абзац внутри <button> недопустимы -->
          <button
            type="button"
            class="process__trigger"
            :aria-expanded="active === i"
            :aria-controls="`process-step-${i}`"
            :aria-label="`${item.num}. ${item.title}`"
            @focus="onFocus(i)"
            @blur="onBlur"
            @click="onClick(i)"
          >
            <span class="num-sm process__num" aria-hidden="true">{{ item.num }}</span>
            <span class="h3 process__label" aria-hidden="true">{{ item.title }}</span>
            <span class="process__icon" aria-hidden="true" v-html="item.svg"></span>
          </button>

          <div :id="`process-step-${i}`" class="process__content">
            <div class="process__content-inner">
              <h3 class="card-title process__title">{{ item.title }}</h3>
              <p class="process__text">{{ item.text }}</p>
              <span class="caption process__result">{{ item.result }}</span>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.process__head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-24);
  align-items: end;
  margin-bottom: var(--sec-content);
}

.process__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sec-pill);
}

.process__hint--touch {
  display: none;
}

@media (hover: none) {
  .process__hint--hover {
    display: none;
  }

  .process__hint--touch {
    display: inline;
  }
}

/* ряд колонок */
.process__row {
  display: flex;
  gap: var(--s-12);
  height: var(--process-h);
}

.process__col {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 0;
  padding: var(--s-24);
  overflow: hidden;
  background: var(--white);
  border-radius: var(--r-card);
  transition:
    flex-grow .6s cubic-bezier(.22, 1, .36, 1),
    background-color var(--ease);
}

.process__col.is-active {
  flex-grow: var(--process-grow);
  background: var(--ink);
}

.process__trigger {
  position: absolute;
  inset: 0;
  z-index: 1;
  /* flex, а не block: браузер центрирует содержимое <button> по вертикали,
     номер должен стоять сверху */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: var(--s-24);
  text-align: left;
  color: var(--ink);
  background: transparent;
  border: 0;
  border-radius: var(--r-card);
}

.process__trigger:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.is-active .process__trigger:focus-visible {
  outline-color: var(--accent);
}

.process__num {
  display: block;
  color: var(--bg-4);
  transition: color var(--ease);
}

.is-active .process__num {
  color: var(--accent);
}

/* вертикальное название у левого нижнего края */
.process__label {
  position: absolute;
  left: var(--s-24);
  bottom: var(--s-24);
  white-space: nowrap;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  color: var(--ink);
  transition: opacity var(--ease);
}

.is-active .process__label {
  opacity: 0;
}

.process__icon {
  position: absolute;
  top: var(--s-24);
  right: var(--s-24);
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--process-icon-box);
  height: var(--process-icon-box);
  color: var(--accent);
  background: var(--ink-soft);
  border-radius: var(--process-icon-r);
  opacity: 0;
  transition: opacity var(--ease);
}

.is-active .process__icon {
  opacity: 1;
  transition-delay: .3s;
}

.process__icon :deep(svg) {
  display: block;
  width: var(--process-icon);
  height: var(--process-icon);
}

/* содержимое прижато к низу; скрыто прозрачностью, но в html и
   доступно скринридеру. min-width — чтобы во время раскрытия текст
   не переносился посимвольно */
.process__content {
  margin-top: auto;
  width: 100%;
  min-width: var(--process-content-min);
  opacity: 0;
  transform: translateY(var(--s-16));
  transition:
    opacity var(--ease),
    transform .5s cubic-bezier(.22, 1, .36, 1);
}

.is-active .process__content {
  opacity: 1;
  transform: none;
  transition-delay: .25s;
}

.process__title {
  color: var(--white);
  margin-bottom: var(--s-12);
}

.process__text {
  color: var(--dark-section-text);
  margin-bottom: var(--s-20);
}

.process__result {
  display: inline-flex;
  align-items: center;
  gap: var(--s-8);
  padding: var(--s-4) var(--s-12);
  color: var(--white);
  background: var(--ink-soft);
  border-radius: var(--r-pill);
}

.process__result::before {
  content: "";
  flex: none;
  width: var(--dot);
  height: var(--dot);
  border-radius: 50%;
  background: var(--accent);
}

/* мобилка — вертикальный аккордеон */
@media (max-width: 767px) {
  .process__head {
    grid-template-columns: 1fr;
    gap: var(--sec-lead);
  }

  .process__row {
    flex-direction: column;
    height: auto;
  }

  .process__col {
    flex: none;
    padding: 0;
  }

  .process__col.is-active {
    flex-grow: 0;
  }

  .process__trigger {
    position: static;
    flex-direction: row;
    align-items: center;
    gap: var(--s-16);
    width: 100%;
    min-height: var(--process-row-h);
    padding: var(--s-12) var(--s-24);
  }

  .process__label {
    position: static;
    writing-mode: horizontal-tb;
    transform: none;
    white-space: normal;
  }

  .is-active .process__label {
    opacity: 1;
    color: var(--white);
  }

  .process__icon {
    position: static;
    margin-left: auto;
  }

  .process__icon :deep(svg) {
    width: var(--s-20);
    height: var(--s-20);
  }

  /* раскрытие по высоте: 0fr → 1fr */
  .process__content {
    display: grid;
    grid-template-rows: 0fr;
    min-width: 0;
    margin-top: 0;
    transform: none;
    transition:
      grid-template-rows .5s cubic-bezier(.22, 1, .36, 1),
      opacity var(--ease);
  }

  .is-active .process__content {
    grid-template-rows: 1fr;
    transition-delay: 0s;
  }

  /* паддинг по вертикали здесь не ставим — он не схлопнулся бы в 0fr;
     нижний отступ даёт margin плашки, его обрезает overflow */
  .process__content-inner {
    min-height: 0;
    overflow: hidden;
    padding: 0 var(--s-24);
  }

  .process__result {
    margin-bottom: var(--s-24);
  }

  /* название уже есть в строке-заголовке */
  .process__title {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .process__col,
  .process__num,
  .process__label,
  .process__icon,
  .process__content {
    transition: none;
  }
}
</style>
