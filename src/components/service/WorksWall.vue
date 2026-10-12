<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import CoverImage from '../ui/CoverImage.vue'
import SectionHead from '../ui/SectionHead.vue'
import SlidesLightbox from './SlidesLightbox.vue'
import WorksGallery from './WorksGallery.vue'
import { useWorksGallery } from '../../composables/useWorksGallery.js'

const props = defineProps({
  works: { type: Array, required: true }, // работы услуги, уже отсортированы по order
  serviceTitle: { type: String, default: '' }, // название услуги — для галереи
})

// «Смотреть все работы»: все работы услуги, в просмотре листаются слайды работы
const { galleryOpen, openGallery, closeGallery } = useWorksGallery()
const galleryItems = computed(() => props.works.map(({ title, niche, cover, slides }) => ({ title, niche, cover, slides })))

const LANES = 4
// в колонке минимум столько разных работ — иначе при малом числе работ
// лента короче окна и ехать ей некуда
const MIN_PER_LANE = 3
const MOBILE_LIMIT = 6
// скорость и направление колонок: две едут вверх, две вниз
const SPEED = [0.32, 0.22, 0.38, 0.26]
// сглаживание: колонки догоняют скролл за столько секунд — колесо не даёт ступенек
const SCRUB = 1.2

// на мобилке — простая сетка первых работ; до монтирования (и в пререндере) — стена
const isMobile = ref(false)

// колонка i берёт работы i, i+4, i+8… по кругу; каждая работа доступна
// с клавиатуры и скринридеру один раз — остальные вхождения декоративные
const lanes = computed(() => {
  const list = props.works
  if (!list.length) return []
  const perLane = Math.max(Math.ceil(list.length / LANES), MIN_PER_LANE)
  const seen = new Set()
  return Array.from({ length: LANES }, (_, lane) => {
    const set = Array.from({ length: perLane }, (_, k) => list[(lane + k * LANES) % list.length])
    const first = set.map((work) => {
      const primary = !seen.has(work.slug)
      seen.add(work.slug)
      return { work, primary }
    })
    // второй набор — для непрерывности ленты, всегда декоративный
    return [...first, ...set.map((work) => ({ work, primary: false }))]
  })
})

const mobileWorks = computed(() => props.works.slice(0, MOBILE_LIMIT))

const sectionEl = ref(null)
const wallEl = ref(null)
const lightbox = ref(null)
let mm = null
let ScrollTrigger = null
let unmounted = false
let mqMobile = null

function openWork(work, event) {
  lightbox.value.open(work, event.currentTarget)
}

function syncMedia() {
  isMobile.value = mqMobile.matches
}

// у обложек aspect-ratio 3:4 — высота колонок известна до загрузки картинок,
// пересчёт на каждую картинку не нужен (он и дёргал колонки посреди скролла).
// Один раз — после загрузки страницы: шрифты могли поменять высоту подписей
function onWindowLoad() {
  ScrollTrigger?.refresh()
}

onMounted(async () => {
  mqMobile = window.matchMedia('(max-width: 767px)')
  syncMedia()
  mqMobile.addEventListener('change', syncMedia)
  // при переходе внутри сайта load окна давно прошёл — тогда и ждать нечего
  if (document.readyState !== 'complete') window.addEventListener('load', onWindowLoad, { once: true })

  // gsap — только в браузере: страница пререндерится
  const [{ gsap }, st] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  if (unmounted) return
  ScrollTrigger = st.ScrollTrigger
  gsap.registerPlugin(ScrollTrigger)

  // параллакс только от 768px и без reduced motion;
  // matchMedia сам снимает твины, когда условие перестаёт выполняться
  mm = gsap.matchMedia()
  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    // при переходе с мобилки стена может быть ещё не отрисована
    const wall = wallEl.value
    if (!wall) return
    // элемент — в замыкании: revert при уходе со страницы пересчитывает
    // функциональные значения, когда ссылка шаблона может быть уже пустой
    const cols = [...wall.querySelectorAll('.wall__lane')]
    // потолок хода — не больше высоты окна стены, иначе с десятками работ колонки
    // «пролетают». Потолок до умножения на скорость: самая быстрая колонка проходит
    // не больше окна, остальные меньше — разные скорости сохраняются
    const maxSpeed = Math.max(...SPEED)
    const travel = (lane, i) => -Math.min(
      Math.max(0, lane.offsetHeight - wall.clientHeight),
      wall.clientHeight / maxSpeed,
    ) * SPEED[i]
    const trigger = () => ({
      trigger: sectionEl.value,
      start: 'top bottom',
      end: 'bottom top',
      scrub: SCRUB,
      invalidateOnRefresh: true,
    })
    cols.forEach((lane, i) => {
      // чётные едут вверх, нечётные — вниз
      if (i % 2 === 0) {
        gsap.fromTo(lane, { y: 0 }, { y: () => travel(lane, i), ease: 'none', force3D: true, scrollTrigger: trigger() })
      } else {
        gsap.fromTo(lane, { y: () => travel(lane, i) }, { y: 0, ease: 'none', force3D: true, scrollTrigger: trigger() })
      }
    })
  })
})

// до размонтирования: ссылки шаблона ещё живы, снятие слушателей срабатывает
onBeforeUnmount(() => {
  unmounted = true
  // revert убивает и твины, и их ScrollTrigger'ы, возвращает transform
  mm?.revert()
  window.removeEventListener('load', onWindowLoad)
  mqMobile?.removeEventListener('change', syncMedia)
})
</script>

<template>
  <section id="works" ref="sectionEl" class="wall">
    <div class="container">
      <SectionHead pill="Примеры" title="Работы" lead="Нажмите на карточку, чтобы посмотреть все слайды." />

      <!-- мобилка: сетка первых работ без параллакса -->
      <ul v-if="isMobile" class="wall__grid">
        <li v-for="work in mobileWorks" :key="work.slug">
          <button type="button" class="wall__card" aria-haspopup="dialog" @click="openWork(work, $event)">
            <CoverImage class="wall__cover" :src="work.cover" :alt="work.title" />
            <span class="wall__title">{{ work.title }}</span>
            <span class="caption wall__niche">{{ work.niche }}</span>
          </button>
        </li>
      </ul>

      <!-- стена: колонки едут от скролла, края гаснут маской -->
      <div v-else ref="wallEl" class="wall__window">
        <ul v-for="(lane, laneIndex) in lanes" :key="laneIndex" class="wall__lane">
          <li
            v-for="({ work, primary }, k) in lane"
            :key="`${work.slug}-${k}`"
            :aria-hidden="primary ? undefined : 'true'"
          >
            <button
              type="button"
              class="wall__card"
              aria-haspopup="dialog"
              :tabindex="primary ? undefined : -1"
              @click="openWork(work, $event)"
            >
              <CoverImage class="wall__cover" :src="work.cover" :alt="primary ? work.title : ''" />
              <span class="wall__title">{{ work.title }}</span>
              <span class="caption wall__niche">{{ work.niche }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="wall__more">
        <BaseButton type="button" variant="primary" arrow aria-haspopup="dialog" @click="openGallery">Смотреть все работы</BaseButton>
      </div>
    </div>

    <SlidesLightbox ref="lightbox" />

    <!-- бесконечная галерея всех работ — монтируется только на время показа -->
    <Teleport to="body">
      <WorksGallery v-if="galleryOpen" :items="galleryItems" :title="serviceTitle" @close="closeGallery" />
    </Teleport>
  </section>
</template>

<style scoped>
/* окно стены: края гаснут маской — это обрезка, не декоративный
   градиент; цвет в маске не важен, важна только непрозрачность */
.wall__window {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s-16);
  height: var(--works-wall-h);
  overflow: hidden;
  -webkit-mask-image: linear-gradient(transparent, var(--ink) var(--reviews-fade), var(--ink) calc(100% - var(--reviews-fade)), transparent);
  mask-image: linear-gradient(transparent, var(--ink) var(--reviews-fade), var(--ink) calc(100% - var(--reviews-fade)), transparent);
}

/* align-self: start — колонка своей высоты: от неё считается ход параллакса */
.wall__lane {
  display: flex;
  flex-direction: column;
  gap: var(--s-16);
  align-self: start;
  min-width: 0;
  will-change: transform;
}

.wall__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-16);
}

.wall__card {
  display: block;
  width: 100%;
  padding: 0;
  text-align: left;
  background: none;
  border: 0;
}

.wall__card:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.wall__cover {
  aspect-ratio: 3 / 4;
  border-radius: var(--r-lg);
  transition: transform .5s var(--ease-out);
}

.wall__title {
  display: block;
  margin-top: var(--s-12);
  font: 600 var(--t-ui)/1.375 var(--f-head);
  color: var(--ink);
}

.wall__niche {
  display: block;
  color: var(--text-3);
}

@media (hover: hover) {
  .wall__card:hover .wall__cover {
    transform: translateY(calc(-1 * var(--lift)));
  }
}

.wall__more {
  display: flex;
  justify-content: center;
  margin-top: var(--s-40);
}

/* reduced motion: колонки стоят, окно стены листается само по себе */
@media (prefers-reduced-motion: reduce) {
  .wall__window {
    overflow-y: auto;
  }
}

/* до монтирования на мобилке — стена в две колонки */
@media (max-width: 767px) {
  .wall__window {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
