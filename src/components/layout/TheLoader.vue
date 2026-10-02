<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { gsap } from 'gsap'
import { useAssetsReady } from '../../composables/useAssetsReady'
import worksData from '../../data/works.json'
import servicesData from '../../data/services.json'

const WORDS = ['design', 'cards', 'infographic', 'photo', 'ai', 'motion', 'web', 'agents', 'data', 'design']
const FULL_SEQUENCE = WORDS.map((_, i) => i)

const ROUTE_LABELS = {
  home: 'Главная',
  works: 'Работы',
  about: 'Обо мне',
  contacts: 'Контакты',
  privacy: 'Политика конфиденциальности',
  styleguide: 'Styleguide',
}

const router = useRouter()
const route = useRoute()

const pageLabel = ref('')

let loaderEl = null
let topCurtainEl = null
let bottomCurtainEl = null
let wordsEl = null
let pageLabelEl = null
const wordEls = []

function setLoaderRef(el) { loaderEl = el }
function setTopCurtainRef(el) { topCurtainEl = el }
function setBottomCurtainRef(el) { bottomCurtainEl = el }
function setWordsRef(el) { wordsEl = el }
function setPageLabelRef(el) { pageLabelEl = el }
function setWordRef(el, i) { wordEls[i] = el }

// на переходах между страницами загрузчик пишет название раздела назначения,
// а не случайное слово из бренд-перебора — это отдельная задача от первой загрузки
function getRouteLabel(to) {
  if (to.name === 'work-detail') {
    const work = worksData.find((w) => w.slug === to.params.slug)
    return work?.title ?? 'Работы'
  }
  if (to.name === 'service-detail') {
    const service = servicesData.find((s) => s.slug === to.params.slug)
    return service?.title ?? 'Услуги'
  }
  return ROUTE_LABELS[to.name] ?? ''
}

let masterTl = null
let enterTween = null
let lastVisibleIndex = null
let navToken = 0
// момент, когда шторка начинает уезжать вверх: с него стартует выезд контента,
// как на первой загрузке, — иначе экран уже открыт, а контент ещё сдвинут
let screenRevealStart = Promise.resolve()

function isMobile() {
  return window.innerWidth <= 540
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// страницы без разметки .once-in ещё не имеют собственных блоков первого экрана —
// для них прячем main целиком крупным сдвигом. Как только .once-in расставлен
// (сейчас так на главной), каждый блок выезжает отдельно небольшим сдвигом
function getOnceInTargets() {
  const explicit = document.querySelectorAll('main .once-in')
  if (explicit.length) return { targets: explicit, explicit: true }
  return { targets: document.querySelectorAll('main'), explicit: false }
}

// explicit-режим (каждый блок сам по себе, .once-in расставлен) всегда
// использует один и тот же небольшой сдвиг — vh нужен только запасному
// варианту, где сдвигается весь main целиком, и там он разный для интро/перехода
function setOnceInHidden(targets, explicit, fallbackMobileVh, fallbackVh) {
  if (explicit) {
    gsap.set(targets, { y: 40, opacity: 0 })
  } else {
    gsap.set(targets, { y: isMobile() ? fallbackMobileVh : fallbackVh })
  }
}

// в проекте нет Lenis/locomotive-scroll — блокируем нативный скролл на время заставки,
// чтобы человек не прокрутил страницу под загрузчиком
function stopScroll() {
  document.documentElement.style.overflow = 'hidden'
}
function startScroll() {
  document.documentElement.style.overflow = ''
}
function setCursorWait() {
  document.documentElement.style.cursor = 'wait'
}
function setCursorAuto() {
  document.documentElement.style.cursor = 'auto'
}

function tlPromise(tl) {
  return new Promise((resolve) => tl.eventCallback('onComplete', resolve))
}

// каждое слово держится ровно 150мс: включаем текущее и в тот же момент
// гасим предыдущее — совпадает по времени с моментом появления следующего
function appendCycleSteps(tl, indices, startPos) {
  indices.forEach((idx, step) => {
    const pos = startPos + step * 0.15
    if (lastVisibleIndex !== null && lastVisibleIndex !== idx) {
      tl.to(wordEls[lastVisibleIndex], { opacity: 0, duration: 0.01, ease: 'none' }, pos)
    }
    tl.to(wordEls[idx], { opacity: 1, duration: 0.01, ease: 'none' }, pos)
    lastVisibleIndex = idx
  })
}

function playExitSequence(onceInTargets, { duration, stagger, screenDelay, explicit }) {
  return new Promise((resolve) => {
    masterTl?.kill()
    const tl = gsap.timeline({
      onComplete: () => {
        setCursorAuto()
        startScroll()
        resolve()
      },
    })
    masterTl = tl
    tl.to(loaderEl, { top: '-100%', duration: 0.8, ease: 'Power4.easeInOut', delay: screenDelay })
      .to(bottomCurtainEl, { height: '0vh', duration: 1, ease: 'Power4.easeInOut' }, '-=0.8')
      .to(wordsEl, { opacity: 0, duration: 0.3, ease: 'linear' }, '-=0.8')
      // экран уезжает вверх «шторкой»: снизу видно раньше, чем сверху (top у .the-loader
      // растёт последним). Контент должен успеть доехать ДО того, как шторка обнажит его
      // область, а не просто до полного ухода экрана — поэтому старт максимально ранний,
      // ещё до задержки самого экрана (это даёт больше запаса, чем требуемые -=0.8),
      // пока тот полностью непрозрачен
      .to(onceInTargets, {
        y: 0,
        ...(explicit ? { opacity: 1 } : {}),
        duration,
        stagger,
        ease: 'Expo.easeOut',
        clearProps: explicit ? 'y,opacity' : 'y',
      }, 0)
  })
}

function handleVisibilityChange() {
  if (!document.hidden && masterTl && masterTl.progress() < 1) {
    masterTl.progress(1)
  }
}

// === первая загрузка: главная (полный перебор десяти слов) ===
async function playHomeIntro() {
  if (document.hidden || prefersReducedMotion()) {
    masterTl?.kill()
    gsap.set(loaderEl, { top: '-100%' })
    return
  }

  gsap.set(loaderEl, { top: '0%' })
  const { targets: onceInTargets, explicit } = getOnceInTargets()
  setOnceInHidden(onceInTargets, explicit, '10vh', '50vh')
  gsap.set(wordsEl, { opacity: 0, y: -50 })
  gsap.set(bottomCurtainEl, { height: isMobile() ? '5vh' : '10vh' })
  setCursorWait()
  stopScroll()

  const readyPromise = useAssetsReady()
  let ready = false
  readyPromise.then(() => { ready = true })

  masterTl?.kill()
  const tl = gsap.timeline()
  masterTl = tl
  tl.to(wordsEl, { opacity: 1, y: -50, duration: 0.8, ease: 'Power4.easeOut' }, 0.5)
  appendCycleSteps(tl, FULL_SEQUENCE, 1.3)
  await tlPromise(tl)

  while (!ready) {
    masterTl?.kill()
    const loopTl = gsap.timeline()
    masterTl = loopTl
    appendCycleSteps(loopTl, FULL_SEQUENCE, 0)
    await tlPromise(loopTl)
  }

  await playExitSequence(onceInTargets, { duration: 1, stagger: 0.07, screenDelay: 0.2, explicit })
}

// === первая загрузка: прямой заход на внутреннюю страницу (без перебора) ===
async function playDirectLoadIntro() {
  if (document.hidden || prefersReducedMotion()) {
    masterTl?.kill()
    gsap.set(loaderEl, { top: '-100%' })
    return
  }

  gsap.set(loaderEl, { top: '0%' })
  const { targets: onceInTargets, explicit } = getOnceInTargets()
  setOnceInHidden(onceInTargets, explicit, '10vh', '50vh')
  gsap.set(bottomCurtainEl, { height: isMobile() ? '5vh' : '10vh' })
  gsap.set(wordsEl, { opacity: 1, y: -50 })
  gsap.set(wordEls[0], { opacity: 1 })
  lastVisibleIndex = 0
  setCursorWait()
  stopScroll()

  await useAssetsReady()

  await playExitSequence(onceInTargets, { duration: 1, stagger: 0.05, screenDelay: 0.5, explicit })
}

// === переход между страницами: уход со старой ===
async function leaveTransition(to) {
  navToken++
  pageLabel.value = getRouteLabel(to)

  if (document.hidden || prefersReducedMotion()) {
    masterTl?.kill()
    gsap.set(loaderEl, { top: '0%' })
    screenRevealStart = Promise.resolve()
    return true
  }

  gsap.set(loaderEl, { top: '100%' })
  gsap.set(pageLabelEl, { opacity: 0, y: 0 })
  gsap.set(bottomCurtainEl, { height: isMobile() ? '5vh' : '10vh' })
  setCursorWait()
  stopScroll()

  masterTl?.kill()
  const tl = gsap.timeline()
  masterTl = tl

  let allowNav
  const navAllowed = new Promise((resolve) => { allowNav = resolve })
  let revealStarted
  screenRevealStart = new Promise((resolve) => { revealStarted = resolve })

  tl.to(loaderEl, { top: '0%', duration: 0.5, ease: 'Power4.easeIn' }, 0)
    .to(topCurtainEl, { height: '10vh', duration: 0.4, ease: 'Power4.easeIn' }, '-=0.5')
    .call(() => allowNav(), null, 0.5)
    .to(pageLabelEl, { opacity: 1, y: -50, duration: 0.8, ease: 'Power4.easeOut' }, 0.55)
    .to(topCurtainEl, { height: '0vh', duration: 0.4, ease: 'Power4.easeIn' }, 0.55)

  tl.addLabel('reveal', '-=0.2')
    .call(() => revealStarted(), null, 'reveal')
    .to(loaderEl, { top: '-100%', duration: 0.8, ease: 'Power3.easeInOut' }, 'reveal')
    .to(pageLabelEl, { opacity: 0, duration: 0.6, ease: 'linear' }, '-=0.8')
    .to(bottomCurtainEl, { height: '0vh', duration: 0.85, ease: 'Power3.easeInOut' }, '-=0.6')
    .call(() => { setCursorAuto(); startScroll() })

  await navAllowed
  return true
}

// === переход между страницами: приход на новую ===
async function enterTransition() {
  const token = navToken
  await nextTick()
  if (token !== navToken) return

  const { targets: onceInTargets, explicit } = getOnceInTargets()

  if (document.hidden || prefersReducedMotion()) {
    masterTl?.kill()
    gsap.set(loaderEl, { top: '-100%' })
    gsap.set(onceInTargets, { clearProps: explicit ? 'y,opacity' : 'y' })
    setCursorAuto()
    startScroll()
    return
  }

  setOnceInHidden(onceInTargets, explicit, '20vh', '50vh')
  startScroll()

  // минимальную паузу здесь даёт сама шторка — отдельный minTime не нужен
  const readyPromise = useAssetsReady({ minTime: 0 })
  await Promise.all([readyPromise, screenRevealStart])
  if (token !== navToken) return

  // шторка в masterTl ещё уезжает — выезд контента идёт своим твином параллельно
  enterTween?.kill()
  enterTween = gsap.to(onceInTargets, {
    y: 0,
    ...(explicit ? { opacity: 1 } : {}),
    duration: 1,
    stagger: explicit ? 0.07 : 0.05,
    ease: 'Expo.easeOut',
    clearProps: explicit ? 'y,opacity' : 'y',
  })
}

let removeBeforeGuard = null
let removeAfterGuard = null

onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange)

  removeBeforeGuard = router.beforeEach((to, from) => {
    if (from.matched.length === 0) return true
    return leaveTransition(to)
  })
  removeAfterGuard = router.afterEach((to, from) => {
    if (from.matched.length === 0) return
    enterTransition()
  })

  await router.isReady()
  await nextTick()

  if (route.name === 'home') {
    await playHomeIntro()
  } else {
    await playDirectLoadIntro()
  }
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  removeBeforeGuard?.()
  removeAfterGuard?.()
  masterTl?.kill()
  enterTween?.kill()
})
</script>

<template>
  <div class="the-loader" aria-hidden="true" :ref="setLoaderRef">
    <div class="the-loader__curtain the-loader__curtain--top" :ref="setTopCurtainRef"></div>
    <div class="the-loader__curtain the-loader__curtain--bottom" :ref="setBottomCurtainRef"></div>
    <div class="the-loader__words">
      <div class="the-loader__words-inner" :ref="setWordsRef">
        <span class="the-loader__stack">
          <span
            v-for="(word, i) in WORDS"
            :key="i"
            class="the-loader__word"
            :ref="(el) => setWordRef(el, i)"
          >m<span class="the-loader__slash">/</span>{{ word }}</span>
        </span>
      </div>
    </div>
    <div class="the-loader__page-label-wrap">
      <div class="the-loader__page-label" :ref="setPageLabelRef">{{ pageLabel }}</div>
    </div>
  </div>
</template>

<style scoped>
.the-loader {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  z-index: 800;
  background: var(--ink);
}

.the-loader__curtain {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  background: var(--ink);
}

.the-loader__curtain--top {
  top: 0;
  transform: translateY(-100%);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
}

.the-loader__curtain--bottom {
  bottom: 0;
  transform: translateY(100%);
  border-radius: 0 0 50% 50% / 0 0 100% 100%;
}

.the-loader__words {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.the-loader__words-inner {
  display: flex;
  align-items: center;
  opacity: 0;
}

.the-loader__word {
  font: 600 clamp(1.75rem, 5vw, 4rem) / 1 var(--f-head);
  letter-spacing: -.0625rem;
  color: #F1EFEC;
  white-space: nowrap;
}

.the-loader__slash {
  color: var(--accent);
}

.the-loader__stack {
  display: grid;
  justify-items: center;
}

.the-loader__page-label-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.the-loader__page-label {
  font: 600 clamp(1.75rem, 5vw, 4rem) / 1 var(--f-head);
  letter-spacing: -.0625rem;
  color: #F1EFEC;
  white-space: nowrap;
  opacity: 0;
}

.the-loader__word {
  grid-area: 1 / 1;
  opacity: 0;
}
</style>
