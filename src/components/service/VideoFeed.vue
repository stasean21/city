<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CoverImage from '../ui/CoverImage.vue'
import SectionHead from '../ui/SectionHead.vue'
import VideoLoop from '../ui/VideoLoop.vue'

// «Заметна в выдаче»: телефон с выдачей маркетплейса — обычные карточки стоят,
// карточка с видеообложкой двигается. Макет — docs/mockups/service-video-examples.html (A).
// лента — настоящий прокручиваемый блок: колесо и свайп работают нативно, у края
// прокрутка сама уходит странице; автопрокрутка двигает его scrollTop
const props = defineProps({
  works: { type: Array, required: true }, // ролики услуги по order
  title: { type: String, default: 'Заметна в выдаче' },
  lead: { type: String, default: '' },
  query: { type: String, default: '' }, // строка поиска в телефоне
})

const CARDS = 16
// карточки с видеообложкой
const MINE = new Set([3, 10])
// автопрокрутка, px в секунду
const SPEED = 20
// пауза автопрокрутки после ручного действия, мс
const RESUME_AFTER = 2500

// обычные карточки — постеры остальных работ по кругу, ваши — ролик первой
const cards = computed(() => {
  const [mine, ...rest] = props.works
  const others = rest.length ? rest : props.works
  return Array.from({ length: CARDS }, (_, i) => (MINE.has(i)
    ? { key: i, mine: true, work: mine }
    : { key: i, mine: false, work: others[(i * 3) % others.length] }))
})

const blockEl = ref(null)
const feedEl = ref(null)

let raf = 0
let last = 0
let y = 0
let dir = 1
let inView = false
let userUntil = 0

function tick(now) {
  raf = requestAnimationFrame(tick)
  const dt = last ? (now - last) / 1000 : 0
  last = now
  const feed = feedEl.value
  if (!feed || !inView || document.hidden || now < userUntil) return
  const max = feed.scrollHeight - feed.clientHeight
  if (max <= 0) return
  // своё число, а не scrollTop: дробный сдвиг за кадр браузер округлил бы
  y += SPEED * dt * dir
  if (y >= max) { y = max; dir = -1 }
  if (y <= 0) { y = 0; dir = 1 }
  feed.scrollTop = y
}

// ручная прокрутка: автопрокрутка ждёт и продолжает с нового места
function onUser() {
  userUntil = performance.now() + RESUME_AFTER
  requestAnimationFrame(() => { y = feedEl.value?.scrollTop ?? y })
}

let observer = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting }, { threshold: 0.2 })
  observer.observe(blockEl.value)
  raf = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  observer?.disconnect()
})
</script>

<template>
  <div class="vfeed-block">
    <SectionHead pill="Примеры" :title="title" :lead="lead" />

    <div ref="blockEl" class="vfeed">
      <!-- телефон — иллюстрация, смысл передаёт текст рядом -->
      <div class="vfeed__phone" aria-hidden="true">
        <div class="vfeed__screen">
          <div class="small vfeed__search">{{ query }}</div>
          <div
            ref="feedEl"
            class="vfeed__feed"
            @wheel.passive="onUser"
            @touchstart.passive="onUser"
            @touchmove.passive="onUser"
            @pointerdown="onUser"
          >
            <div v-for="card in cards" :key="card.key" class="vfeed__card" :class="{ 'is-mine': card.mine }">
              <div class="vfeed__img">
                <template v-if="card.mine">
                  <span class="caption vfeed__tag">видео</span>
                  <VideoLoop class="vfeed__media" :src="card.work.video" :poster="card.work.poster" />
                </template>
                <CoverImage v-else class="vfeed__media" :src="card.work.poster" :width="300" :height="400" />
              </div>
              <p class="small vfeed__price">[—] ₽</p>
              <span class="vfeed__line"></span>
              <span class="vfeed__line is-short"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="vfeed__text">
        <h3 class="card-title">Покупатель листает выдачу за секунды</h3>
        <p class="vfeed__body">
          Видеообложка двигается прямо в результатах поиска — глаз цепляется за неё раньше,
          чем за соседние карточки. Покрутите ленту в телефоне: ваша карточка обведена.
        </p>
        <ul class="small vfeed__legend">
          <li><i aria-hidden="true"></i>обычная карточка</li>
          <li><i class="is-mine" aria-hidden="true"></i>с видеообложкой</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vfeed {
  display: grid;
  grid-template-columns: minmax(var(--phone-col-min), var(--phone-col-max)) 1fr;
  gap: var(--s-60);
  align-items: center;
}

/* корпус: радиус экрана + отступ — вложенное скругление */
.vfeed__phone {
  padding: var(--s-12);
  background: var(--ink);
  border-radius: var(--phone-r);
}

.vfeed__screen {
  display: flex;
  flex-direction: column;
  height: var(--phone-screen-h);
  overflow: hidden;
  background: var(--white);
  border-radius: var(--phone-screen-r);
}

.vfeed__search {
  flex: none;
  margin: var(--s-12) var(--s-12) var(--s-8);
  padding: var(--s-8) var(--s-12);
  color: var(--ink);
  background: var(--bg-3);
  border-radius: var(--r-lg);
}

.vfeed__feed {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-content: start;
  gap: var(--s-12) var(--s-8);
  padding: var(--s-4) var(--s-12) var(--s-12);
  overflow-y: auto;
  scrollbar-width: none;
}

.vfeed__feed::-webkit-scrollbar {
  display: none;
}

.vfeed__img {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--r-lg);
}

.vfeed__media {
  width: 100%;
  height: 100%;
  border-radius: var(--r-lg);
}

/* ваша карточка — обведена акцентом */
.is-mine .vfeed__img {
  outline: var(--feed-mark) solid var(--accent);
  outline-offset: var(--feed-mark);
}

.vfeed__tag {
  position: absolute;
  top: var(--s-8);
  left: var(--s-8);
  z-index: 2;
  padding: 0 var(--s-8);
  color: var(--white);
  background: var(--ink);
  border-radius: var(--r-pill);
}

.vfeed__price {
  margin-top: var(--s-4);
  font-weight: 600;
  color: var(--ink);
}

.vfeed__line {
  display: block;
  height: var(--s-8);
  margin-top: var(--s-4);
  background: var(--bg-3);
  border-radius: var(--r-pill);
}

.vfeed__line.is-short {
  width: 60%;
}

/* ---------- текст ---------- */
.vfeed__body {
  margin: var(--s-12) 0 var(--s-24);
}

.vfeed__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-8) var(--s-20);
  color: var(--ink);
}

.vfeed__legend li {
  display: flex;
  align-items: center;
  gap: var(--s-8);
}

.vfeed__legend i {
  width: var(--legend-swatch-w);
  height: var(--legend-swatch-h);
  background: var(--bg-3);
  border-radius: var(--r-sm);
}

.vfeed__legend i.is-mine {
  background: var(--white);
  outline: var(--feed-mark) solid var(--accent);
}

@media (max-width: 767px) {
  .vfeed {
    grid-template-columns: 1fr;
    gap: var(--s-32);
  }

  .vfeed__phone {
    justify-self: center;
    width: 100%;
    max-width: var(--phone-w-mobile);
  }
}
</style>
