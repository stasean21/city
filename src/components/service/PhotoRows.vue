<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import CoverImage from '../ui/CoverImage.vue'
import SectionHead from '../ui/SectionHead.vue'
import WorksGallery from './WorksGallery.vue'
import { useWorksGallery } from '../../composables/useWorksGallery.js'

// «Работы» на странице съёмки: два ряда кадров на всю ширину экрана.
// при прокрутке верхний ряд едет влево, нижний вправо — от скролла,
// без pin (механика ReviewsWall). Макет — docs/mockups/service-photo.html
const props = defineProps({
  works: { type: Array, required: true }, // работы услуги по order: { slug, cover, shape, caption }
  title: { type: String, default: 'Работы' },
  lead: { type: String, default: '' },
  serviceTitle: { type: String, default: '' }, // название услуги — для галереи
})

// «Смотреть все работы»: все кадры; слайдов у кадров нет — в просмотре листаются работы
const { galleryOpen, openGallery, closeGallery } = useWorksGallery()
const galleryItems = computed(() => props.works.map(({ title, niche, cover, slides }) => ({ title, niche, cover, slides })))

// в ряду минимум столько кадров — иначе ряд не шире экрана и ехать ему некуда
const MIN_PER_ROW = 9
// доля лишней ширины ряда, на которую он сдвигается за проход блока
const TRAVEL = 0.6
// пропорции кадров по форме; размеры — для атрибутов width/height
const SHAPES = {
  portrait: { w: 800, h: 1000 },
  landscape: { w: 1000, h: 800 },
  square: { w: 1000, h: 1000 },
}

// работы по рядам поочерёдно; короткий ряд дополняется повтором —
// повторы декоративные, скринридер видит каждую работу один раз
const rows = computed(() => [0, 1].map((row) => {
  const own = props.works.filter((_, i) => i % 2 === row)
  if (!own.length) return []
  const count = Math.max(own.length, MIN_PER_ROW)
  return Array.from({ length: count }, (_, k) => ({
    work: own[k % own.length],
    repeat: k >= own.length,
  }))
}).filter((row) => row.length))

const size = (work) => SHAPES[work.shape] ?? SHAPES.portrait

const sectionEl = ref(null)
const rowsEl = ref(null)
let mm = null
let ScrollTrigger = null
let unmounted = false
let refreshQueued = false

// кадры догружаются лениво — ширина рядов меняется, пересчитываем разом
function queueRefresh() {
  if (refreshQueued) return
  refreshQueued = true
  requestAnimationFrame(() => {
    refreshQueued = false
    ScrollTrigger?.refresh()
  })
}

function onImageLoad(event) {
  if (event.target.tagName === 'IMG') queueRefresh()
}

onMounted(async () => {
  // load не всплывает — ловим на погружении
  sectionEl.value.addEventListener('load', onImageLoad, true)

  // gsap — только в браузере: страница пререндерится
  const [{ gsap }, st] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  if (unmounted) return
  ScrollTrigger = st.ScrollTrigger
  gsap.registerPlugin(ScrollTrigger)

  // движение на всех ширинах, кроме reduced motion — там ряды листаются пальцем
  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const box = rowsEl.value
    if (!box) return
    const lines = [...box.querySelectorAll('.photo-rows__row')]
    const travel = (line) => Math.max(0, line.scrollWidth - box.clientWidth) * TRAVEL
    const trigger = () => ({
      trigger: box,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    })
    lines.forEach((line, i) => {
      // верхний влево, нижний вправо
      if (i % 2 === 0) {
        gsap.fromTo(line, { x: 0 }, { x: () => -travel(line), ease: 'none', scrollTrigger: trigger() })
      } else {
        gsap.fromTo(line, { x: () => -travel(line) }, { x: 0, ease: 'none', scrollTrigger: trigger() })
      }
    })
  })
})

// до размонтирования: ссылки шаблона ещё живы, снятие слушателей срабатывает
onBeforeUnmount(() => {
  unmounted = true
  // revert убивает и твины, и их ScrollTrigger'ы, возвращает transform
  mm?.revert()
  sectionEl.value?.removeEventListener('load', onImageLoad, true)
})
</script>

<template>
  <section id="works" ref="sectionEl" class="photo-rows">
    <div class="container">
      <SectionHead pill="Примеры" :title="title" :lead="lead" />
    </div>

    <!-- ряды на всю ширину экрана, вне контейнера -->
    <div ref="rowsEl" class="photo-rows__box">
      <ul v-for="(row, r) in rows" :key="r" class="photo-rows__row">
        <li
          v-for="({ work, repeat }, k) in row"
          :key="`${work.slug}-${k}`"
          class="photo-rows__item"
          :class="[`is-${work.shape ?? 'portrait'}`, { 'is-repeat': repeat }]"
          :aria-hidden="repeat ? 'true' : undefined"
        >
          <CoverImage
            class="photo-rows__img"
            :src="work.cover"
            :alt="repeat ? '' : work.caption"
            :width="size(work).w"
            :height="size(work).h"
          />
          <span v-if="work.caption" class="caption photo-rows__tag" aria-hidden="true">{{ work.caption }}</span>
        </li>
      </ul>
    </div>

    <div class="container photo-rows__more">
      <BaseButton type="button" variant="primary" arrow aria-haspopup="dialog" @click="openGallery">Смотреть все работы</BaseButton>
    </div>

    <!-- бесконечная галерея всех работ — монтируется только на время показа -->
    <Teleport to="body">
      <WorksGallery v-if="galleryOpen" :items="galleryItems" :title="serviceTitle" @close="closeGallery" />
    </Teleport>
  </section>
</template>

<style scoped>
/* ряды шире экрана: лишнее срезается, горизонтального скролла у страницы нет */
.photo-rows__box {
  display: flex;
  flex-direction: column;
  gap: var(--s-16);
  overflow: hidden;
}

.photo-rows__row {
  display: flex;
  gap: var(--s-16);
  width: max-content;
  will-change: transform;
}

.photo-rows__item {
  position: relative;
  flex: none;
  height: var(--photo-row-h);
}

.is-portrait { aspect-ratio: 4 / 5; }
.is-landscape { aspect-ratio: 5 / 4; }
.is-square { aspect-ratio: 1; }

.photo-rows__img {
  width: 100%;
  height: 100%;
  border-radius: var(--r-card);
}

/* подпись кадра; alt картинки несёт тот же текст */
.photo-rows__tag {
  position: absolute;
  left: var(--s-12);
  bottom: var(--s-12);
  padding: var(--s-4) var(--s-12);
  color: var(--ink);
  white-space: nowrap;
  background: var(--photo-tag-bg);
  border-radius: var(--r-pill);
}

.photo-rows__more {
  display: flex;
  justify-content: center;
  margin-top: var(--s-40);
}

/* reduced motion: ряды стоят, каждый листается пальцем; повторы не нужны */
@media (prefers-reduced-motion: reduce) {
  .photo-rows__row {
    width: auto;
    padding-inline: var(--gutter);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--gutter);
    scrollbar-width: none;
    will-change: auto;
  }

  .photo-rows__row::-webkit-scrollbar {
    display: none;
  }

  .photo-rows__item {
    scroll-snap-align: start;
  }

  .is-repeat {
    display: none;
  }
}
</style>
