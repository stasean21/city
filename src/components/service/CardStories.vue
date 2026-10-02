<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import SectionHead from '../ui/SectionHead.vue'
import StackMarquee from '../ui/StackMarquee.vue'
import CardScenes from './stories/CardScenes.vue'
import BannerScenes from './stories/BannerScenes.vue'
import PhotoScenes from './stories/PhotoScenes.vue'

// «Как я делаю …»: сторис по этапам — утверждённый макет
// docs/mockups/card-stories.html. Слева кадр со сценой этапа, справа список.
// этапы — данные услуги, сцены — набор по имени (по одной на этап)
const props = defineProps({
  process: { type: Object, required: true }, // { title, lead, scenes: 'cards' | 'banners' | 'photo', steps: [{ title, text }] }
  stack: { type: Array, default: () => [] },
})

const SCENES = { cards: CardScenes, banners: BannerScenes, photo: PhotoScenes }
const sceneSet = computed(() => SCENES[props.process.scenes] ?? CardScenes)

const steps = computed(() => (props.process.steps ?? [])
  .map((step, i) => ({ ...step, num: String(i + 1).padStart(2, '0') })))

// ширина кадра в макете: геометрия сцен задана в его пикселях (--u в CSS)
const BASE_W = 494

const active = ref(0)
const blockEl = ref(null)
const frameEl = ref(null)
const scenesEl = ref(null)
const barEls = ref([])

let tl = null
let observer = null
let mqReduced = null
const state = { inView: false, hovering: false }

// 1 px макета в px экрана
const u = () => frameEl.value.clientWidth / BASE_W
const cssVar = (name) => getComputedStyle(frameEl.value).getPropertyValue(name).trim()
const stage = (i) => frameEl.value.querySelector(`.stage[data-index="${i}"]`)

function reducedMotion() {
  return mqReduced?.matches
}

function reset(s) {
  gsap.set(s.querySelectorAll('*'), { clearProps: 'all' })
  scenesEl.value.reset?.(s)
}

function go(i) {
  tl?.kill()
  const prev = stage(active.value)
  active.value = i
  if (prev) reset(prev)
  const s = stage(i)
  reset(s)
  gsap.set(barEls.value, { scaleX: 0 })

  // длительность сцены, с — своя у набора
  const dur = scenesEl.value.duration
  tl = gsap.timeline({ paused: true, onComplete: () => go((active.value + 1) % steps.value.length) })
  tl.add(scenesEl.value.scenes[i](s, { u, cssVar, dur }), 0)
  const bar = barEls.value.find((el) => Number(el.dataset.index) === i)
  tl.to(bar, { scaleX: 1, duration: dur, ease: 'none' }, 0)

  // reduced motion: сцена сразу в финальном кадре, без автолистания
  if (reducedMotion()) {
    tl.progress(1, true).pause()
    return
  }
  sync()
}

// играет, только когда блок в экране, вкладка видна и не наведено
function sync() {
  if (!tl || reducedMotion()) return
  if (state.inView && !state.hovering && !document.hidden) tl.play()
  else tl.pause()
}

function onEnter() {
  state.hovering = true
  sync()
}

function onLeave() {
  state.hovering = false
  sync()
}

onMounted(() => {
  mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  document.addEventListener('visibilitychange', sync)
  go(0)

  observer = new IntersectionObserver(([entry]) => {
    state.inView = entry.isIntersecting
    sync()
  }, { threshold: 0.3 })
  observer.observe(blockEl.value)
})

onUnmounted(() => {
  tl?.kill()
  observer?.disconnect()
  document.removeEventListener('visibilitychange', sync)
})
</script>

<template>
  <section id="process" class="stories">
    <div class="container">
      <SectionHead pill="Процесс" :title="process.title" :lead="process.lead" />

      <div ref="blockEl" class="stories__layout" @pointerenter="onEnter" @pointerleave="onLeave">
        <!-- кадр со сценой: иллюстрация, смысл несёт список этапов -->
        <div ref="frameEl" class="stories__frame" aria-hidden="true">
          <component :is="sceneSet" ref="scenesEl" :active="active" />

          <span class="caption stories__cap">этап {{ active + 1 }} из {{ steps.length }}</span>
        </div>

        <ol class="stories__steps">
          <li v-for="(step, i) in steps" :key="step.num" class="stories__step" :class="{ 'is-active': active === i }">
            <button type="button" class="stories__btn" :aria-current="active === i ? 'step' : undefined" @click="go(i)">
              <span class="caption stories__num">{{ step.num }}</span>
              <span class="h3 stories__title">{{ step.title }}</span>
              <span class="small stories__text">{{ step.text }}</span>
            </button>
            <span class="stories__bar" aria-hidden="true"><i ref="barEls" :data-index="i"></i></span>
          </li>
        </ol>
      </div>

      <StackMarquee v-if="stack.length" class="stories__stack" :items="stack" />
    </div>
  </section>
</template>

<style scoped>
.stories__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-60);
  align-items: center;
}

/* ---------- список этапов ---------- */
.stories__steps {
  border-top: var(--hairline) solid var(--border-soft);
}

.stories__step {
  border-bottom: var(--hairline) solid var(--border-soft);
}

.stories__btn {
  display: grid;
  grid-template-columns: var(--s-40) 1fr;
  align-items: baseline;
  width: 100%;
  padding: var(--s-16) 0;
  text-align: left;
  background: none;
  border: 0;
}

.stories__btn:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.stories__num,
.stories__title,
.stories__text {
  color: var(--text-4);
  transition: color var(--ease);
}

.stories__text {
  grid-column: 2;
  margin-top: var(--s-4);
}

.is-active .stories__num {
  color: var(--accent);
}

.is-active .stories__title,
.is-active .stories__text {
  color: var(--ink);
}

@media (hover: hover) {
  .stories__btn:hover .stories__title {
    color: var(--ink);
  }
}

/* полоска прогресса этапа — только у активного */
.stories__bar {
  display: block;
  height: var(--story-bar);
  margin: 0 0 var(--s-12) var(--s-40);
  overflow: hidden;
  background: var(--bg-3);
  border-radius: var(--r-pill);
  opacity: 0;
}

.is-active .stories__bar {
  opacity: 1;
}

.stories__bar i {
  display: block;
  height: 100%;
  background: var(--ink);
  transform: scaleX(0);
  transform-origin: left;
}

.stories__stack {
  margin-top: var(--s-60);
}

/* ---------- кадр ----------
   иллюстрация: координаты внутри сцен — пиксели макета card-stories.html
   при ширине кадра 494, пересчитанные через --u (как единицы внутри SVG),
   поэтому сцена масштабируется целиком */
.stories__frame {
  position: relative;
  justify-self: center;
  width: 100%;
  max-width: var(--story-w);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--white);
  border-radius: var(--r-stage);
  container-type: inline-size;
  --u: calc(100cqw / 494);
}

.stories__cap {
  position: absolute;
  left: var(--s-16);
  bottom: var(--s-16);
  z-index: 20;
  padding: var(--s-4) var(--s-12);
  color: var(--text-3);
  background: var(--white);
  border-radius: var(--r-pill);
}

@media (max-width: 767px) {
  .stories__layout {
    grid-template-columns: 1fr;
    gap: var(--s-32);
  }
}
</style>
