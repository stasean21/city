<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { gsap } from 'gsap'
import BaseButton from '../components/ui/BaseButton.vue'
import services from '../data/services.json'

// 404: продолжение загрузчика — тёмный экран, «m/» с перебором слов, полоса
// «загрузки» застревает на 99%, а цифры крутятся барабаном и встают на 4·0·4.
// макет — docs/mockups/page-404.html. Шапка и футер скрыты в App.vue
useHead({
  title: 'Страница не найдена — m/design',
  meta: [{ name: 'robots', content: 'noindex' }],
})

const FINAL = [4, 0, 4]
// длина ленты и время прокрутки колонок: встают по очереди слева направо
const SPIN = [{ n: 18, dur: 1.4 }, { n: 26, dur: 1.85 }, { n: 34, dur: 2.3 }]
// «загрузка»: перебор слов, как в TheLoader
const WORDS = ['design', 'cards', 'photo', 'motion', 'web', 'agents', 'data', '...']
const WORD_EVERY = 150 // мс
const INTRO = 1.5 // с
const STUCK_AT = 99 // %
// барабан сам крутится заново через столько после каждой остановки
const AUTO_SPIN = 12000 // мс

// до монтирования (и в пререндере) — сразу 404, без лент
const strips = ref(FINAL.map((d) => [d]))
const word = ref('design')
const percent = ref(0)
const stuck = ref(false)
const landed = ref(false)
// «страница готова» — текст и ссылки видны и больше не прячутся
const ready = ref(false)
// барабан кликабелен только с анимацией
const interactive = ref(false)

const stripEls = ref([])

let reduce = false
let wordTimer = null
let autoTimer = null
let autoPending = false
let introTween = null
let spinTl = null

function randomStrip(final, n) {
  return [...Array.from({ length: n }, () => Math.floor(Math.random() * 10)), final]
}

// каждая колонка — лента из случайных цифр, последняя нужная;
// лента едет вверх на всю свою длину минус одну цифру
async function spin() {
  clearTimeout(autoTimer)
  autoPending = false
  spinTl?.kill()
  landed.value = false
  strips.value = FINAL.map((d, i) => randomStrip(d, SPIN[i].n))
  await nextTick()
  spinTl = gsap.timeline({ onComplete: onLanded })
  stripEls.value.forEach((el, i) => {
    const { n, dur } = SPIN[i]
    spinTl.fromTo(el, { yPercent: 0 }, { yPercent: (-n / (n + 1)) * 100, duration: dur, ease: 'power4.out' }, 0)
  })
}

function onLanded() {
  landed.value = true
  ready.value = true
  schedule()
}

// автоповтор через 12 с; в фоновой вкладке — отложить до возвращения
function schedule() {
  clearTimeout(autoTimer)
  if (reduce) return
  autoTimer = setTimeout(() => {
    if (document.hidden) autoPending = true
    else spin()
  }, AUTO_SPIN)
}

function onVisibility() {
  if (!document.hidden && autoPending) spin()
}

function onDrumClick() {
  if (!interactive.value) return
  spin()
}

// «загрузка»: слова меняются, полоса и проценты растут и застревают на 99%
function intro() {
  let i = 0
  wordTimer = setInterval(() => {
    word.value = WORDS[i % WORDS.length]
    i += 1
  }, WORD_EVERY)
  const state = { p: 0 }
  introTween = gsap.to(state, {
    p: STUCK_AT,
    duration: INTRO,
    ease: 'power3.out',
    onUpdate: () => { percent.value = Math.round(state.p) },
    onComplete: () => {
      clearInterval(wordTimer)
      word.value = '404'
      stuck.value = true
    },
  })
}

onMounted(() => {
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // reduced motion: сразу 404 со слэшем, полоса на 99%, весь текст виден
  if (reduce) {
    word.value = '404'
    percent.value = STUCK_AT
    stuck.value = true
    landed.value = true
    ready.value = true
    return
  }
  interactive.value = true
  document.addEventListener('visibilitychange', onVisibility)
  // барабан крутится уже во время «загрузки» и встаёт сразу после неё
  intro()
  spin()
})

onUnmounted(() => {
  clearInterval(wordTimer)
  clearTimeout(autoTimer)
  introTween?.kill()
  spinTl?.kill()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <div class="nf">
    <div class="nf__page">
      <div class="nf__top">
        <RouterLink to="/" class="nf__brand" aria-label="m/design — на главную">
          m<span class="nf__slash-char">/</span><span class="nf__word">{{ word }}</span>
        </RouterLink>
        <span class="small nf__status" :class="{ 'is-done': ready }">
          <i aria-hidden="true"></i>
          <span aria-hidden="true">{{ ready ? 'ошибка 404 · страница не найдена' : `загружаю страницу · ${percent}%` }}</span>
          <!-- вслух — только итог, без перебора процентов -->
          <span class="visually-hidden" aria-live="polite">{{ ready ? 'Ошибка 404: страница не найдена' : '' }}</span>
        </span>
      </div>

      <div class="nf__bar" :class="{ 'is-stuck': stuck }" aria-hidden="true">
        <i :style="{ width: `${percent}%` }"></i>
      </div>

      <main class="nf__stage">
        <component
          :is="interactive ? 'button' : 'div'"
          :type="interactive ? 'button' : undefined"
          class="nf__drum"
          :class="{ 'is-landed': landed }"
          :role="interactive ? undefined : 'img'"
          :aria-label="interactive ? 'Прокрутить цифры ещё раз' : 'Ошибка 404'"
          @click="onDrumClick"
        >
          <span
            v-for="(digits, i) in strips"
            :key="i"
            class="nf__col"
            :class="{ 'is-zero': i === 1 }"
            aria-hidden="true"
          >
            <span class="nf__clip">
              <span ref="stripEls" class="nf__strip">
                <span v-for="(d, k) in digits" :key="k" class="nf__digit">{{ d }}</span>
              </span>
            </span>
            <!-- слэш через ноль, как в логотипе; не обрезается окном колонки -->
            <span v-if="i === 1" class="nf__slash"></span>
          </span>
        </component>

        <div class="nf__msg" :class="{ 'is-ready': ready }">
          <h1 class="nf__title">Такой страницы нет</h1>
          <p class="nf__text">Ссылка устарела или в ней опечатка. Всё остальное на месте.</p>
          <div class="nf__acts on-dark">
            <BaseButton to="/" variant="primary" arrow>На главную</BaseButton>
            <BaseButton to="/#services" variant="secondary" class="nf__secondary">Все услуги</BaseButton>
          </div>
          <p v-if="interactive" class="small nf__hint">Нажмите на цифры — крутанём ещё раз</p>
        </div>
      </main>

      <nav class="nf__links" :class="{ 'is-ready': ready }" aria-label="Услуги">
        <span class="nf__links-label">Возможно, вы искали</span>
        <ul class="nf__list">
          <li v-for="service in services" :key="service.slug">
            <RouterLink :to="`/services/${service.slug}`" class="nf__link">{{ service.title }}</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.nf {
  min-height: 100svh;
  color: var(--dark-section-text);
  background: var(--ink);
}

.nf__page {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  max-width: calc(var(--container) + 2 * var(--gutter));
  margin: 0 auto;
  padding: var(--s-40) var(--s-24) var(--s-32);
}

/* ---------- верхняя строка и полоса ---------- */
.nf__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--s-16);
}

.nf__brand {
  display: flex;
  align-items: baseline;
  font: 600 var(--t-h3)/1 var(--f-head);
  letter-spacing: var(--ls-h3);
  color: var(--white);
}

.nf__slash-char {
  color: var(--accent);
}

/* ширина под самое длинное слово — «m/» не дёргается при переборе */
.nf__word {
  display: inline-block;
  min-width: 6ch;
}

.nf__status {
  display: flex;
  align-items: center;
  gap: var(--s-8);
  color: var(--footer-text);
  font-variant-numeric: tabular-nums;
}

.nf__status i {
  flex: none;
  width: var(--dot);
  height: var(--dot);
  background: var(--accent);
  border-radius: 50%;
  animation: nf-blink 1s infinite;
}

.nf__status.is-done i {
  animation: none;
}

@keyframes nf-blink {
  50% { opacity: .2; }
}

.nf__bar {
  height: var(--bar-404);
  margin-top: var(--s-20);
  overflow: hidden;
  background: var(--footer-border);
  border-radius: var(--r-pill);
}

.nf__bar i {
  display: block;
  height: 100%;
  background: var(--white);
  transition: background-color .4s;
}

.nf__bar.is-stuck i {
  background: var(--accent);
}

/* ---------- барабан ---------- */
/* main здесь без клиренса под шапку: шапки на этой странице нет */
.nf__stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--s-40) 0;
}

.nf__drum {
  display: flex;
  gap: var(--gap-404);
  padding: 0;
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

button.nf__drum {
  cursor: pointer;
}

.nf__drum:focus-visible,
.nf__link:focus-visible,
.nf__brand:focus-visible {
  outline: var(--focus-ring) solid var(--accent);
  outline-offset: var(--focus-ring);
}

.nf__col {
  position: relative;
  display: block;
  height: var(--t-404);
}

/* окно в одну цифру; у нуля окно внутри, чтобы слэш не обрезался */
.nf__clip {
  display: block;
  height: 100%;
  overflow: hidden;
}

.nf__strip {
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.nf__digit {
  display: block;
  height: var(--t-404);
  font: 700 var(--t-404)/1 var(--f-head);
  letter-spacing: var(--ls-404);
  color: var(--white);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.nf__slash {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12%;
  height: 118%;
  background: var(--accent);
  border-radius: var(--r-pill);
  transform: translate(-50%, -50%) rotate(var(--slash-rot)) scaleY(0);
  transition: transform .7s var(--ease-out);
  pointer-events: none;
}

.nf__drum.is-landed .nf__slash {
  transform: translate(-50%, -50%) rotate(var(--slash-rot)) scaleY(1);
}

/* ---------- текст и кнопки ---------- */
.nf__msg {
  margin-top: var(--s-32);
  text-align: center;
  opacity: 0;
  transform: translateY(var(--s-16));
  transition: opacity .6s var(--ease-out), transform .8s var(--ease-out);
}

.nf__msg.is-ready {
  opacity: 1;
  transform: none;
}

.nf__title {
  font: 700 var(--t-404-title)/1.15 var(--f-head);
  letter-spacing: var(--ls-404-title);
  color: var(--white);
}

.nf__text {
  max-width: var(--measure-404);
  margin: var(--s-12) auto var(--s-24);
}

.nf__acts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--s-12);
}

/* вторичная кнопка здесь — тёмная заливка, а не обводка */
.nf__acts .nf__secondary {
  background: var(--ink-soft);
  border-color: transparent;
}

.nf__acts .nf__secondary:hover {
  background: var(--ink-hover);
  border-color: transparent;
}

.nf__hint {
  margin-top: var(--s-20);
  color: var(--footer-text);
}

/* ---------- ссылки на услуги ---------- */
.nf__links {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--s-12) var(--s-24);
  padding-top: var(--s-20);
  border-top: var(--hairline) solid var(--footer-border);
  opacity: 0;
  transition: opacity .6s var(--ease-out) .3s;
}

.nf__links.is-ready {
  opacity: 1;
}

.nf__links-label {
  color: var(--footer-text);
}

.nf__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-8) var(--s-24);
}

.nf__link {
  color: var(--dark-section-text);
  transition: color var(--ease);
}

.nf__link:hover {
  color: var(--white);
}

@media (max-width: 767px) {
  .nf__page {
    padding: var(--s-24) var(--s-16);
  }

  .nf__links {
    flex-direction: column;
  }
}
</style>
