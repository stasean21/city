<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import reviews from '../../data/reviews.json'

// цифры утверждены владельцем; пустое значение не выводим
const stats = reviews.stats.filter((stat) => stat.value)

const items = reviews.items.map((item) => ({
  ...item,
  caption: [item.name, item.niche, item.service].filter(Boolean).join(' · '),
}))

// на мобилке стена — одна горизонтальная лента в естественном порядке;
// до монтирования (и в пререндере) — две вертикальные
const isMobile = ref(false)
const reduced = ref(false)

// чётные — в левую ленту, нечётные — в правую
const lanes = computed(() => {
  if (isMobile.value) return [items]
  return [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)]
})

// стену можно листать вручную при reduced motion и на мобилке — тогда ей нужен фокус
const scrollable = computed(() => reduced.value || isMobile.value)

const PARALLAX = 0.6

const sectionEl = ref(null)
const wallEl = ref(null)
let mm = null
let mqMobile = null
let mqReduced = null
let refreshQueued = false

function syncMedia() {
  isMobile.value = mqMobile.matches
  reduced.value = mqReduced.matches
}

// картинки догружаются лениво и меняют высоту лент — пересчитываем
// разом, а не на каждую картинку
function queueRefresh() {
  if (refreshQueued) return
  refreshQueued = true
  requestAnimationFrame(() => {
    refreshQueued = false
    ScrollTrigger.refresh()
  })
}

function onImageLoad(event) {
  if (event.target.tagName === 'IMG') queueRefresh()
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  mqMobile = window.matchMedia('(max-width: 767px)')
  mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMedia()
  mqMobile.addEventListener('change', syncMedia)
  mqReduced.addEventListener('change', syncMedia)

  // load не всплывает — ловим на погружении
  wallEl.value.addEventListener('load', onImageLoad, true)
  window.addEventListener('load', queueRefresh)

  // параллакс только на планшете и десктопе и без reduced motion;
  // matchMedia сам снимает твины, когда условие перестаёт выполняться
  mm = gsap.matchMedia()
  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const [left, right] = wallEl.value.querySelectorAll('.reviews__lane')
    if (!left || !right) return

    const travel = (lane) => -Math.max(0, lane.offsetHeight - wallEl.value.clientHeight) * PARALLAX
    const scrollTrigger = () => ({
      trigger: sectionEl.value,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    })

    // ленты едут навстречу: левая вверх, правая вниз
    gsap.fromTo(left, { y: 0 }, { y: () => travel(left), ease: 'none', scrollTrigger: scrollTrigger() })
    gsap.fromTo(right, { y: () => travel(right) }, { y: 0, ease: 'none', scrollTrigger: scrollTrigger() })
  })
})

onUnmounted(() => {
  // revert убивает и твины, и их ScrollTrigger'ы, возвращает transform
  mm?.revert()
  wallEl.value?.removeEventListener('load', onImageLoad, true)
  window.removeEventListener('load', queueRefresh)
  mqMobile?.removeEventListener('change', syncMedia)
  mqReduced?.removeEventListener('change', syncMedia)
})
</script>

<template>
  <section id="reviews" ref="sectionEl" class="reviews">
    <div class="container reviews__layout">
      <div class="reviews__stage">
        <div
          ref="wallEl"
          class="reviews__wall"
          :tabindex="scrollable ? 0 : undefined"
          :role="scrollable ? 'region' : undefined"
          :aria-label="scrollable ? 'Отзывы клиентов' : undefined"
        >
          <ul
            v-for="(lane, laneIndex) in lanes"
            :key="`${lanes.length}-${laneIndex}`"
            class="reviews__lane"
            :aria-label="laneIndex === 0 ? 'Отзывы клиентов' : null"
          >
            <li v-for="item in lane" :key="item.alt" class="reviews__card">
              <img
                v-if="item.image"
                class="reviews__img"
                :src="item.image"
                :width="item.width"
                :height="item.height"
                :alt="item.alt"
                loading="lazy"
                decoding="async"
              />
              <div
                v-else
                class="reviews__placeholder"
                role="img"
                :aria-label="item.alt"
                :style="{ aspectRatio: `${item.width} / ${item.height}` }"
              >
                <span class="caption" aria-hidden="true">скрин отзыва</span>
              </div>
              <p v-if="item.caption" class="caption reviews__caption">{{ item.caption }}</p>
            </li>
          </ul>
        </div>
        <p class="caption reviews__swipe" aria-hidden="true">листайте →</p>
      </div>

      <!-- обычный CSS sticky, как в ServicesIntro: без align-self: start
           колонка растянется на высоту сетки и прилипать будет нечему -->
      <div class="reviews__text">
        <span class="pill reviews__pill">Отзывы</span>
        <h2 class="display reviews__title">Что говорят клиенты</h2>
        <p class="lead">Лучшее подтверждение — слова тех, кто уже получил результат.</p>

        <dl v-if="stats.length" class="reviews__stats">
          <div v-for="stat in stats" :key="stat.label">
            <dt class="caption reviews__stat-label">{{ stat.label }}</dt>
            <dd class="h2">{{ stat.value }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reviews__layout {
  display: grid;
  grid-template-columns: 1.9fr 1fr;
  gap: var(--s-60);
}

.reviews__stage {
  min-width: 0;
}

.reviews__text {
  position: sticky;
  top: calc(var(--header-top) + var(--header-h) + var(--s-24));
  align-self: start;
}

/* окно стены: края гаснут маской — это обрезка, не декоративный
   градиент; цвет в маске не важен, важна только непрозрачность */
.reviews__wall {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-24);
  height: var(--reviews-h);
  overflow: hidden;
  -webkit-mask-image: linear-gradient(transparent, var(--ink) var(--reviews-fade), var(--ink) calc(100% - var(--reviews-fade)), transparent);
  mask-image: linear-gradient(transparent, var(--ink) var(--reviews-fade), var(--ink) calc(100% - var(--reviews-fade)), transparent);
}

.reviews__wall:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

/* align-self: start — лента своей высоты, а не растянутая сеткой:
   от её высоты считается ход параллакса */
.reviews__lane {
  display: flex;
  flex-direction: column;
  gap: var(--s-24);
  align-self: start;
  min-width: 0;
  will-change: transform;
}

/* карточка-скрин */
.reviews__card {
  padding: var(--s-12);
  background: var(--white);
  border-radius: var(--r-card);
}

.reviews__img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--r-lg);
}

.reviews__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: var(--bg-2);
  border-radius: var(--r-lg);
}

.reviews__caption {
  margin-top: var(--s-8);
  color: var(--text-3);
}

.reviews__swipe {
  display: none;
  margin-top: var(--s-12);
}

/* текст справа */
.reviews__pill {
  margin-bottom: var(--sec-pill);
}

.reviews__title {
  margin-bottom: var(--sec-lead);
}

.reviews__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-40);
  margin: var(--s-40) 0 0;
}

.reviews__stats dd {
  margin: 0;
}

/* подпись в разметке идёт первой (dt перед dd), а на экране — под числом */
.reviews__stats div {
  display: flex;
  flex-direction: column-reverse;
}

.reviews__stat-label {
  color: var(--text-3);
}

/* reduced motion: ленты стоят, окно стены листается само по себе */
@media (prefers-reduced-motion: reduce) {
  .reviews__wall {
    overflow-y: auto;
  }
}

@media (max-width: 991px) {
  .reviews__layout {
    grid-template-columns: 1fr;
    gap: var(--sec-content);
  }

  .reviews__text {
    position: static;
    order: -1;
  }
}

/* мобилка: горизонтальная лента со свайпом, без параллакса и маски.
   листается сама стена; после монтирования в ней одна лента в
   естественном порядке, до него (пререндер) — две подряд */
@media (max-width: 767px) {
  .reviews__wall {
    display: flex;
    gap: var(--s-24);
    height: auto;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    -webkit-mask-image: none;
    mask-image: none;
  }

  .reviews__lane {
    flex: none;
    flex-direction: row;
    align-items: flex-start;
    will-change: auto;
  }

  .reviews__card {
    flex: 0 0 var(--reviews-card-w);
    scroll-snap-align: start;
  }

  .reviews__swipe {
    display: block;
  }
}
</style>
