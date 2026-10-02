<script setup>
import { computed, nextTick, onUnmounted, ref } from 'vue'
import CoverImage from '../ui/CoverImage.vue'
import { dims, sizeAlt } from '../../utils/banners.js'

// просмотр слайдов работы: нативный <dialog> + showModal().
// открывает родитель: lightbox.open(work, кнопка) — на неё вернётся фокус.
// режим «набор»: open(кампания баннеров) — все её размеры одной лентой,
// каждый в своей пропорции, одинаковой высоты
const dialogEl = ref(null)
const trackEl = ref(null)
const work = ref(null)
const index = ref(0)
let returnEl = null

// набор размеров — у кампании есть sizes, у работы — slides
const isSet = computed(() => Boolean(work.value?.sizes))

const slides = computed(() => {
  const item = work.value
  if (!item) return []
  if (isSet.value) {
    return item.sizes.map((size) => ({
      src: size.src,
      alt: sizeAlt(item, size),
      caption: `${size.label} · ${dims(size)}`,
      w: size.w,
      h: size.h,
    }))
  }
  return item.slides.map((src, i) => ({
    src,
    alt: `${item.title}, слайд ${i + 1}`,
    caption: `${i + 1} / ${item.slides.length}`,
  }))
})

// «1 размер», «3 размера», «6 размеров»
function plural(n, [one, few, many]) {
  const d = n % 10
  const dd = n % 100
  if (d === 1 && dd !== 11) return one
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few
  return many
}

const meta = computed(() => {
  const n = slides.value.length
  if (isSet.value) return `${n} ${plural(n, ['размер', 'размера', 'размеров'])}`
  return `${work.value.niche} · ${n} слайдов`
})

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

async function open(item, opener) {
  work.value = item
  index.value = 0
  returnEl = opener ?? null
  await nextTick()
  trackEl.value.scrollLeft = 0
  dialogEl.value.showModal()
  // страница под модалкой не прокручивается
  document.documentElement.style.overflow = 'hidden'
}

function close() {
  dialogEl.value?.close()
}

// close приходит и от Esc (нативный cancel), и от кнопки, и от клика по фону
function onClose() {
  document.documentElement.style.overflow = ''
  returnEl?.focus()
  returnEl = null
}

function go(step) {
  const slides = trackEl.value.children
  const next = Math.min(Math.max(index.value + step, 0), slides.length - 1)
  slides[next]?.scrollIntoView({
    behavior: reducedMotion() ? 'auto' : 'smooth',
    block: 'nearest',
    inline: 'center',
  })
  index.value = next
}

// текущий слайд — ближайший к центру ленты
function onScroll() {
  const track = trackEl.value
  const center = track.scrollLeft + track.clientWidth / 2
  let best = 0
  let bestDist = Infinity
  ;[...track.children].forEach((slide, i) => {
    const dist = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center)
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  })
  index.value = best
}

function onKeydown(event) {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    go(1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    go(-1)
  }
}

// клик по фону — по самому диалогу или пустому месту ленты, не по слайду
function onBackdrop(event) {
  if (event.target === dialogEl.value || event.target === trackEl.value) close()
}

onUnmounted(() => {
  if (dialogEl.value?.open) document.documentElement.style.overflow = ''
})

defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialogEl"
    class="lightbox on-dark"
    :aria-label="work ? `${work.title} — ${isSet ? 'все размеры' : 'слайды'}` : 'Слайды работы'"
    @close="onClose"
    @keydown="onKeydown"
    @click="onBackdrop"
  >
    <template v-if="work">
      <div class="lightbox__head">
        <div>
          <p class="lightbox__title">{{ work.title }}</p>
          <p class="small lightbox__meta">{{ meta }}</p>
        </div>
        <button type="button" class="lightbox__btn" aria-label="Закрыть" @click="close">×</button>
      </div>

      <ol ref="trackEl" class="lightbox__track" :class="{ 'is-set': isSet }" @scroll.passive="onScroll">
        <li v-for="slide in slides" :key="slide.src" class="lightbox__slide">
          <CoverImage
            v-if="isSet"
            class="lightbox__img lightbox__img--set"
            :style="{ '--ratio': slide.w / slide.h }"
            :src="slide.src"
            :alt="slide.alt"
            :width="slide.w"
            :height="slide.h"
          />
          <CoverImage v-else class="lightbox__img" :src="slide.src" :alt="slide.alt" />
          <span class="caption lightbox__num">{{ slide.caption }}</span>
        </li>
      </ol>

      <div class="lightbox__nav">
        <button type="button" class="lightbox__btn" :aria-label="isSet ? 'Предыдущий размер' : 'Предыдущий слайд'" :disabled="index === 0" @click="go(-1)">←</button>
        <button
          type="button"
          class="lightbox__btn"
          :aria-label="isSet ? 'Следующий размер' : 'Следующий слайд'"
          :disabled="index === slides.length - 1"
          @click="go(1)"
        >→</button>
      </div>
    </template>
  </dialog>
</template>

<style scoped>
/* диалог на весь экран: затемнение — его собственный фон, а не ::backdrop,
   чтобы клик по нему ловился обычным click */
.lightbox {
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: var(--s-32) 0;
  border: 0;
  color: var(--white);
  background: var(--lightbox-backdrop);
}

.lightbox[open] {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--s-32);
}

.lightbox::backdrop {
  background: transparent;
}

.lightbox__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s-24);
  width: 100%;
  max-width: calc(var(--container) + 2 * var(--gutter));
  margin: 0 auto;
  padding-inline: var(--gutter);
}

.lightbox__title {
  font: 600 var(--t-card)/1.25 var(--f-head);
  letter-spacing: var(--ls-card);
  color: var(--white);
}

.lightbox__meta {
  color: var(--dark-section-text);
}

.lightbox__btn {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--lightbox-btn);
  height: var(--lightbox-btn);
  padding: 0;
  font: 500 var(--t-ui) var(--f-body);
  color: var(--white);
  background: var(--ink-soft);
  border: 0;
  border-radius: var(--r-pill);
  transition: background-color var(--ease), opacity var(--ease);
}

.lightbox__btn:hover {
  background: var(--ink-hover);
}

.lightbox__btn:disabled {
  opacity: .4;
  cursor: default;
}

.lightbox__btn:focus-visible {
  outline: var(--focus-ring) solid var(--white);
  outline-offset: var(--focus-ring);
}

/* лента слайдов со свайпом; поля по краям — чтобы крайний слайд
   мог встать по центру */
.lightbox__track {
  display: flex;
  gap: var(--s-16);
  padding: 0 calc(50% - var(--slide-w) / 2);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.lightbox__track::-webkit-scrollbar {
  display: none;
}

.lightbox__slide {
  flex: 0 0 var(--slide-w);
  scroll-snap-align: center;
}

.lightbox__img {
  aspect-ratio: 3 / 4;
  border-radius: var(--r-lg);
}

.lightbox__num {
  display: block;
  margin-top: var(--s-8);
  text-align: center;
  color: var(--dark-section-text);
}

/* набор: ширина слайда — по пропорции баннера при высоте --set-h;
   слишком широкие ограничены --set-max-w и становятся ниже */
.lightbox__track.is-set {
  align-items: center;
  padding-inline: var(--gutter);
}

.is-set .lightbox__slide {
  flex: 0 0 auto;
}

.lightbox__img--set {
  width: min(calc(var(--set-h) * var(--ratio)), var(--set-max-w));
  aspect-ratio: var(--ratio);
}

.lightbox__nav {
  display: flex;
  justify-content: center;
  gap: var(--s-12);
}
</style>
