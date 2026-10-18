<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CoverImage from '../ui/CoverImage.vue'
import VideoLoop from '../ui/VideoLoop.vue'

// Заметна в выдаче: тёмная плашка, лента из обложек инфографики плывёт вверх,
// соседние карточки размыты, видеообложки цветные. Макет — docs/site/video-feed-mockup (v5)
const props = defineProps({
  works: { type: Array, required: true }, // ролики услуги по order
  covers: { type: Array, default: () => [] }, // работы инфографики по order — статичные соседи
  title: { type: String, default: '' },
  lead: { type: String, default: '' },
})

// половина ленты — 4 ряда × 3, вторая половина — её копия для бесшовного круга
const HALF = 12
// позиции карточек с видеообложкой в половине
const VIDEO_AT = [4, 10]

const half = computed(() => {
  const videos = props.works.slice(0, VIDEO_AT.length)
  // товар ролика не повторяем статичной карточкой рядом с ним
  const taken = new Set(videos.map((work) => work.title))
  const statics = props.covers.filter((work) => !taken.has(work.title))
  let s = 0
  return Array.from({ length: HALF }, (_, i) => {
    const v = VIDEO_AT.indexOf(i)
    if (v !== -1 && videos[v]) return { key: `v${i}`, video: true, work: videos[v] }
    const work = statics[s++ % Math.max(statics.length, 1)]
    return work ? { key: `s${i}`, video: false, work } : null
  }).filter(Boolean)
})

// лента плывёт, только пока блок в экране и вкладка активна
const blockEl = ref(null)
const playing = ref(false)
let inView = false
let observer = null

function update() {
  playing.value = inView && !document.hidden
}

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    update()
  })
  observer.observe(blockEl.value)
  document.addEventListener('visibilitychange', update)
})

onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', update)
})
</script>

<template>
  <div ref="blockEl" class="vfeed" :class="{ 'is-playing': playing }">
    <div class="vfeed__text">
      <span class="pill vfeed__pill">Примеры</span>
      <h2 class="h2 vfeed__title">{{ title }}</h2>
      <p class="lead vfeed__lead">{{ lead }}</p>
      <ul class="small vfeed__legend">
        <li><i aria-hidden="true"></i>статичные карточки</li>
        <li><i class="is-video" aria-hidden="true"></i>с видеообложкой</li>
      </ul>
    </div>

    <!-- лента — иллюстрация, смысл несёт текст слева -->
    <div class="vfeed__wall" aria-hidden="true">
      <div class="vfeed__track">
        <template v-for="copy in 2" :key="copy">
          <div v-for="card in half" :key="`${copy}-${card.key}`" class="vfeed__card" :class="{ 'is-video': card.video }">
            <div class="vfeed__img">
              <template v-if="card.video">
                <span class="caption vfeed__tag"><i></i>видео</span>
                <VideoLoop class="vfeed__media" :src="card.work.video" :poster="card.work.poster" />
              </template>
              <CoverImage v-else class="vfeed__media" :src="card.work.cover" :width="300" :height="400" />
            </div>
            <p class="small vfeed__price">— ₽</p>
            <span class="vfeed__line"></span>
            <span class="vfeed__line is-short"></span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* тёмная плашка: текст слева, лента справа */
.vfeed {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: var(--feed-gap);
  align-items: center;
  padding: var(--feed-pad);
  overflow: hidden;
  background: var(--ink);
  border-radius: var(--r-hero);
}

/* ---------- текст ---------- */
.vfeed__pill {
  color: var(--dark-section-text);
  background: var(--ink-soft);
}

.vfeed__title {
  margin-top: var(--sec-pill);
  color: var(--white);
}

.vfeed__lead {
  margin-top: var(--s-20);
  color: var(--text-3);
}

.vfeed__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-8) var(--s-24);
  margin-top: var(--s-32);
  color: var(--white);
}

.vfeed__legend li {
  display: flex;
  align-items: center;
  gap: var(--s-8);
}

.vfeed__legend i {
  width: var(--feed-swatch-w);
  height: var(--feed-swatch-h);
  background: var(--feed-dim-swatch);
  border-radius: var(--r-sm);
}

.vfeed__legend i.is-video {
  background: none;
  outline: var(--feed-mark) solid var(--accent);
  outline-offset: calc(-1 * var(--feed-mark));
}

/* ---------- лента: края растворяются маской (обрезка, не декор) ---------- */
.vfeed__wall {
  height: var(--feed-wall-h);
  overflow: hidden;
  mask-image: linear-gradient(transparent, #000 14%, #000 86%, transparent);
}

/* половины одинаковые — сдвиг на −50% замыкает круг без шва */
.vfeed__track {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--feed-track-gap);
  animation: vfeed-up var(--feed-wall-dur) linear infinite;
  animation-play-state: paused;
}

.vfeed.is-playing .vfeed__track {
  animation-play-state: running;
}

@keyframes vfeed-up {
  to { transform: translateY(-50%); }
}

.vfeed__img {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--feed-card-r);
}

.vfeed__media {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--feed-card-r);
}

/* статичные соседи — серые и размытые */
.vfeed__card:not(.is-video) .vfeed__media {
  filter: var(--feed-dim-filter);
}

/* карточка с видеообложкой — цветная, обведена акцентом */
.vfeed__card.is-video .vfeed__img {
  outline: var(--feed-mark) solid var(--accent);
  outline-offset: var(--feed-mark);
}

.vfeed__tag {
  position: absolute;
  top: var(--s-8);
  left: var(--s-8);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: var(--s-4);
  padding: 0 var(--s-8);
  white-space: nowrap;
  color: var(--white);
  background: var(--ink);
  border-radius: var(--r-pill);
}

/* мигающая точка «запись» */
.vfeed__tag i {
  width: var(--dot);
  height: var(--dot);
  background: var(--accent);
  border-radius: 50%;
  animation: vfeed-rec 1.2s steps(1) infinite;
}

@keyframes vfeed-rec {
  50% { opacity: .2; }
}

.vfeed__price {
  margin-top: var(--s-8);
  font-weight: 600;
  color: var(--text-3);
}

.is-video .vfeed__price {
  color: var(--white);
}

.vfeed__line {
  display: block;
  height: var(--s-8);
  margin-top: var(--s-4);
  background: var(--ink-soft);
  border-radius: var(--r-pill);
}

.is-video .vfeed__line {
  background: var(--bg-3);
}

.vfeed__line.is-short {
  width: 60%;
}

/* reduced motion: лента стоит, VideoLoop показывает постер */
@media (prefers-reduced-motion: reduce) {
  .vfeed__track,
  .vfeed__tag i {
    animation: none;
  }
}

@media (max-width: 767px) {
  .vfeed {
    grid-template-columns: 1fr;
  }

  .vfeed__legend {
    flex-direction: column;
  }
}
</style>
