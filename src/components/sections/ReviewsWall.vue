<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import reviews from '../../data/reviews.json'

// цифры показываем, только если они реальные — пустые не рендерим
const stats = reviews.stats.filter((stat) => stat.value)

const items = reviews.items.map((item) => ({
  ...item,
  caption: [item.name, item.niche, item.service].filter(Boolean).join(' · '),
}))

const isMobile = ref(false)
const reduced = ref(false)
const userPaused = ref(false)
const offscreen = ref(false)

// чётные — в левую ленту, нечётные — в правую; на мобилке одна лента
const lanes = computed(() => {
  if (isMobile.value) return [items]
  return [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)]
})

const rootEl = ref(null)
let observer = null
let mqMobile = null
let mqReduced = null

function syncMedia() {
  isMobile.value = mqMobile.matches
  reduced.value = mqReduced.matches
}

onMounted(() => {
  mqMobile = window.matchMedia('(max-width: 767px)')
  mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMedia()
  mqMobile.addEventListener('change', syncMedia)
  mqReduced.addEventListener('change', syncMedia)

  // вне экрана ленты стоят
  observer = new IntersectionObserver(([entry]) => {
    offscreen.value = !entry.isIntersecting
  })
  observer.observe(rootEl.value)
})

onUnmounted(() => {
  observer?.disconnect()
  mqMobile?.removeEventListener('change', syncMedia)
  mqReduced?.removeEventListener('change', syncMedia)
})
</script>

<template>
  <section
    id="reviews"
    ref="rootEl"
    class="reviews"
    :class="{ 'is-paused': userPaused || offscreen, 'is-reduced': reduced }"
  >
    <div class="container reviews__layout">
      <div class="reviews__stage">
        <!-- при reduced motion стена прокручивается — тогда ей нужен фокус -->
        <div
          class="reviews__wall"
          :class="{ 'is-single': lanes.length === 1 }"
          :tabindex="reduced ? 0 : undefined"
          :role="reduced ? 'region' : undefined"
          :aria-label="reduced ? 'Отзывы клиентов' : undefined"
        >
          <div
            v-for="(lane, laneIndex) in lanes"
            :key="laneIndex"
            class="reviews__lane"
            :class="laneIndex === 1 ? 'is-down' : 'is-up'"
          >
            <!-- первая копия — список для скринридера -->
            <ul class="reviews__copy" :aria-label="laneIndex === 0 ? 'Отзывы клиентов' : null">
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

            <!-- вторая копия — для бесшовной петли, скрыта от скринридера -->
            <div v-if="!reduced" class="reviews__copy" aria-hidden="true">
              <div v-for="item in lane" :key="item.alt" class="reviews__card">
                <img
                  v-if="item.image"
                  class="reviews__img"
                  :src="item.image"
                  :width="item.width"
                  :height="item.height"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <div
                  v-else
                  class="reviews__placeholder"
                  :style="{ aspectRatio: `${item.width} / ${item.height}` }"
                >
                  <span class="caption">скрин отзыва</span>
                </div>
                <p v-if="item.caption" class="caption reviews__caption">{{ item.caption }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- вне маски, иначе кнопка растворялась бы вместе с краем стены -->
        <button
          v-if="!reduced"
          type="button"
          class="reviews__toggle"
          :aria-pressed="userPaused"
          :aria-label="userPaused ? 'Продолжить прокрутку отзывов' : 'Поставить отзывы на паузу'"
          @click="userPaused = !userPaused"
        >
          <svg v-if="userPaused" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5 3.5v9l7-4.5z" fill="currentColor" />
          </svg>
          <svg v-else viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5.5 3.5v9M10.5 3.5v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="reviews__text">
        <span class="pill reviews__pill">Отзывы</span>
        <h2 class="display reviews__title">Что говорят клиенты</h2>
        <p class="lead">Настоящие переписки — как есть, без редактуры.</p>

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
  align-items: center;
}

.reviews__stage {
  position: relative;
  min-width: 0;
}

/* стена: края растворяются маской — это обрезка, не декоративный
   градиент; цвет в маске роли не играет, важна только непрозрачность */
.reviews__wall {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-24);
  height: var(--reviews-h);
  overflow: hidden;
  -webkit-mask-image: linear-gradient(transparent, var(--ink) var(--reviews-fade), var(--ink) calc(100% - var(--reviews-fade)), transparent);
  mask-image: linear-gradient(transparent, var(--ink) var(--reviews-fade), var(--ink) calc(100% - var(--reviews-fade)), transparent);
}

.reviews__wall.is-single {
  grid-template-columns: 1fr;
}

.reviews__wall:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

/* лента = две одинаковые копии; зазор после последней карточки задан
   внутри копии (padding), а не между копиями — тогда −50% ровно одна копия
   и стыка при зацикливании нет */
.reviews__lane {
  display: flex;
  flex-direction: column;
  /* без start сетка растянет короткую ленту до высоты длинной,
     и −50% перестанет совпадать с одной копией */
  align-self: start;
  min-width: 0;
  animation: reviews-up var(--reviews-speed) linear infinite;
}

.reviews__lane.is-down {
  animation-name: reviews-down;
}

.reviews__copy {
  display: flex;
  flex-direction: column;
  gap: var(--s-24);
  padding-bottom: var(--s-24);
}

@keyframes reviews-up {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}

@keyframes reviews-down {
  from { transform: translateY(-50%); }
  to { transform: translateY(0); }
}

.is-paused .reviews__lane {
  animation-play-state: paused;
}

@media (hover: hover) {
  .reviews__wall:hover .reviews__lane {
    animation-play-state: paused;
  }
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

/* пауза: видна при фокусе с клавиатуры и на тач-устройствах */
.reviews__toggle {
  position: absolute;
  top: var(--s-12);
  right: var(--s-12);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s-8);
  color: var(--ink);
  background: var(--white);
  border: var(--hairline) solid var(--border);
  border-radius: var(--r-btn);
  opacity: 0;
  transition: opacity var(--ease), border-color var(--ease);
}

.reviews__toggle svg {
  display: block;
  width: var(--btn-icon);
  height: var(--btn-icon);
}

.reviews__toggle:focus-visible {
  opacity: 1;
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

@media (hover: none) {
  .reviews__toggle {
    opacity: 1;
  }
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

/* reduced motion: без движения, вторая копия не рендерится,
   стена прокручивается вручную; маска остаётся */
.is-reduced .reviews__lane {
  animation: none;
}

.is-reduced .reviews__wall {
  overflow-y: auto;
}

@media (prefers-reduced-motion: reduce) {
  .reviews__lane {
    animation: none;
  }

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
    order: -1;
  }
}
</style>
