<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import reviews from '../../data/reviews.json'

// цифры утверждены владельцем; клиенты — первые пять из данных
const summary = reviews.summary
const clients = summary.clients.slice(0, 5)
// фоны кругов с буквой идут по кругу
const AVATAR_BG = ['var(--bg-3)', 'var(--bg-4)', 'var(--bg-2)']

const items = reviews.items

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
let ScrollTrigger = null
let unmounted = false
let mqMobile = null
let mqReduced = null
let refreshQueued = false

function syncMedia() {
  isMobile.value = mqMobile.matches
  reduced.value = mqReduced.matches
}

// высота лент зависит от шрифтов: когда они загрузятся — пересчитываем
function queueRefresh() {
  if (refreshQueued) return
  refreshQueued = true
  requestAnimationFrame(() => {
    refreshQueued = false
    ScrollTrigger?.refresh()
  })
}

onMounted(async () => {
  mqMobile = window.matchMedia('(max-width: 767px)')
  mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMedia()
  mqMobile.addEventListener('change', syncMedia)
  mqReduced.addEventListener('change', syncMedia)

  window.addEventListener('load', queueRefresh)

  // gsap — только в браузере: страница пререндерится
  const [{ gsap }, st] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  if (unmounted) return
  ScrollTrigger = st.ScrollTrigger
  gsap.registerPlugin(ScrollTrigger)

  // параллакс только на планшете и десктопе и без reduced motion;
  // matchMedia сам снимает твины, когда условие перестаёт выполняться
  mm = gsap.matchMedia()
  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    // элемент — в замыкании: revert при уходе со страницы пересчитывает
    // функциональные значения, когда ссылка шаблона может быть уже пустой
    const wall = wallEl.value
    const [left, right] = wall.querySelectorAll('.reviews__lane')
    if (!left || !right) return

    const travel = (lane) => -Math.max(0, lane.offsetHeight - wall.clientHeight) * PARALLAX
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

// до размонтирования: ссылки шаблона ещё живы, снятие слушателей срабатывает
onBeforeUnmount(() => {
  unmounted = true
  // revert убивает и твины, и их ScrollTrigger'ы, возвращает transform
  mm?.revert()
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
            <li v-for="item in lane" :key="item.text" class="reviews__card">
              <span v-if="item.service" class="pill reviews__service">{{ item.service }}</span>
              <p>{{ item.text }}</p>
              <div class="reviews__author">
                <!-- имя рядом прочитается текстом -->
                <span class="reviews__author-mark" aria-hidden="true">
                  <span v-if="item.initial" class="h3">{{ item.initial }}</span>
                  <svg v-else class="reviews__person" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="9" cy="6" r="3.25" stroke="currentColor" stroke-width="1.5" />
                    <path d="M3 15.5c.6-3 3-4.5 6-4.5s5.400 1.500 6 4.500" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </span>
                <span class="reviews__who">
                  <span class="ui reviews__name">{{ item.name }}</span>
                  <span class="caption reviews__source">{{ item.source }} · {{ item.date }}</span>
                </span>
              </div>
            </li>
          </ul>
        </div>
        <p class="caption reviews__swipe" aria-hidden="true">листайте →</p>
      </div>

      <!-- обычный CSS sticky, как в ServicesIntro: без align-self: start
           колонка растянется на высоту сетки и прилипать будет нечему -->
      <div class="reviews__text">
        <span class="pill reviews__pill">Отзывы</span>
        <h2 class="display reviews__title">Что говорят клиенты</h2>
        <p class="lead">Лучшее подтверждение — слова тех, кто уже получил результат.</p>

        <div class="reviews__summary">
          <!-- стопка аватаров — графика; смысл дублирует легенда -->
          <div class="reviews__avatars" aria-hidden="true">
            <!-- внешний слой — разделитель цвета фона, внутренний — сам круг;
                 кольцо «повторный заказ» внутри разделителя -->
            <span
              v-for="(client, i) in clients"
              :key="i"
              class="reviews__avatar"
              :class="{ 'is-repeat': client.repeat }"
            >
              <img
                v-if="client.photo"
                class="reviews__avatar-in"
                :src="client.photo"
                alt=""
                aria-hidden="true"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
              />
              <span
                v-else
                class="h3 reviews__avatar-in"
                :style="{ background: AVATAR_BG[i % AVATAR_BG.length] }"
              >{{ client.initial }}</span>
            </span>
            <span class="reviews__count">
              <span class="h3 reviews__count-in">{{ summary.reviews }}</span>
            </span>
          </div>

          <p class="visually-hidden">{{ summary.reviews }} отзывов, {{ summary.repeat }} повторных заказов</p>
          <ul class="small reviews__legend">
            <li><i class="reviews__mark"></i><b>{{ summary.reviews }}</b>&nbsp;отзывов</li>
            <li><i class="reviews__mark is-ring"></i><b>{{ summary.repeat }}</b>&nbsp;повторных заказов</li>
          </ul>
        </div>
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

/* карточка: метка услуги, текст отзыва, автор */
.reviews__card {
  display: flex;
  flex-direction: column;
  gap: var(--s-16);
  padding: var(--s-24);
  background: var(--white);
  border-radius: var(--r-card);
}

.reviews__service {
  align-self: flex-start;
}

.reviews__author {
  display: flex;
  align-items: center;
  gap: var(--s-12);
  margin-top: var(--s-8);
}

.reviews__author-mark {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--reviews-avatar);
  height: var(--reviews-avatar);
  background: var(--bg-3);
  border-radius: var(--r-pill);
  color: var(--ink);
}

.reviews__person {
  width: var(--reviews-person);
  height: var(--reviews-person);
}

.reviews__who {
  min-width: 0;
}

.reviews__name,
.reviews__source {
  display: block;
}

.reviews__source {
  white-space: nowrap;
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

/* блок цифр: стопка аватаров с отметками */
.reviews__summary {
  margin-top: var(--s-40);
}

.reviews__avatars {
  display: flex;
  align-items: center;
}

/* наложение — естественное: каждый следующий круг лежит на предыдущем.
   внешний слой цвета фона даёт тонкую полоску-разделитель между кругами */
.reviews__avatar,
.reviews__count {
  flex: none;
  display: flex;
  height: var(--avatar);
  padding: 3px;
  background: var(--bg);
  border-radius: var(--r-pill);
}

.reviews__avatar {
  width: var(--avatar);
}

.reviews__avatar + .reviews__avatar,
.reviews__count {
  margin-left: var(--avatar-overlap);
}

.reviews__avatar-in,
.reviews__count-in {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: var(--r-pill);
}

.reviews__avatar-in {
  font-weight: 600;
  color: var(--ink);
}

img.reviews__avatar-in {
  object-fit: cover;
}

/* кольцо «возвращался с новым заказом» — внутри разделителя */
.reviews__avatar.is-repeat .reviews__avatar-in {
  border: 2px solid var(--accent);
}

.reviews__count-in {
  padding: 0 var(--s-16);
  font-weight: 600;
  color: var(--white);
  background: var(--ink);
}

.reviews__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-24);
  margin-top: var(--s-12);
}

.reviews__legend li {
  display: flex;
  align-items: center;
  color: var(--text);
}

.reviews__legend b {
  font-weight: 500;
  color: var(--ink);
}

.reviews__mark {
  flex: none;
  width: var(--s-12);
  height: var(--s-12);
  margin-right: var(--s-8);
  background: var(--bg-3);
  border-radius: var(--r-pill);
}

.reviews__mark.is-ring {
  background: transparent;
  border: 2px solid var(--accent);
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
