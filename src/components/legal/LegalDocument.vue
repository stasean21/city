<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import LegalBody from './LegalBody.vue'
import { scrollToSameAnchor } from '../../utils/headerOffset.js'

// юридический документ: «← На главную», h1, «Содержание» и разделы.
// note — строка под заголовком, intro — абзац над первым разделом, без номера и без
// пункта в содержании. sections: [{ id, num, title, items?: [{ text, list? }], requisites? }]
const props = defineProps({
  title: { type: String, required: true },
  note: { type: String, default: '' },
  intro: { type: String, default: '' },
  sections: { type: Array, required: true },
})

const LINE = 0.33 // линия чтения: на трети окна
const HOLD_MS = 200 // прокрутка после клика затихла столько — выбор кликом отпускаем

const route = useRoute()
const bodyEl = ref(null)
const activeIndex = ref(0)
const tocOpen = ref(false)

let frame = 0
let holding = false // выбрали кликом: пока страница докручивается, подсветку не трогаем
let holdTimer = 0

// активный раздел — последний, чей верх выше линии чтения. Конец страницы может
// не дать разделам доехать до трети окна (ниже только подвал; в коротком документе —
// сразу несколько разделов), поэтому линия по мере прокрутки опускается ровно
// настолько, чтобы к концу страницы её пересёк последний: своя очередь есть у каждого
function updateActive() {
  frame = 0
  if (holding) return
  const tops = bodyEl.value.parts.map((el) => el.getBoundingClientRect().top)
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  const lastAtEnd = tops[tops.length - 1] + window.scrollY - maxScroll
  const base = window.innerHeight * LINE
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 1
  const line = base + Math.max(0, lastAtEnd - base + 2) * progress
  activeIndex.value = Math.max(0, tops.findLastIndex((top) => top <= line))
}

function holdFor() {
  clearTimeout(holdTimer)
  holdTimer = window.setTimeout(() => { holding = false }, HOLD_MS)
}

function onScroll() {
  if (holding) {
    holdFor()
    return
  }
  if (!frame) frame = requestAnimationFrame(updateActive)
}

// клик ведёт к разделу и подсвечивает именно его, даже если страница дальше
// не докручивается: подсветка снова следует за прокруткой со следующего движения
function select(index) {
  activeIndex.value = index
  holding = true
  holdFor()
  scrollToSameAnchor(route, `#${props.sections[index].id}`, route.path)
}

onMounted(() => {
  updateActive()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(frame)
  clearTimeout(holdTimer)
})
</script>

<template>
  <main>
    <section class="legal">
      <div class="container">
        <RouterLink to="/" class="pill legal__back"><span aria-hidden="true">←</span> На главную</RouterLink>
        <h1 class="legal__title">{{ title }}</h1>
        <p v-if="note" class="small legal__note">{{ note }}</p>

        <div class="legal__grid">
          <nav class="legal-toc" :class="{ 'is-collapsed': !tocOpen }" aria-label="Содержание">
            <p class="small legal-toc__label">Содержание</p>
            <ul id="legal-toc-list">
              <li v-for="(section, i) in sections" :key="section.id">
                <RouterLink
                  :to="{ hash: `#${section.id}` }"
                  class="small legal-toc__link"
                  :class="{ 'is-active': activeIndex === i }"
                  :aria-current="activeIndex === i ? 'location' : null"
                  active-class=""
                  exact-active-class=""
                  @click="select(i)"
                >
                  <span class="legal-toc__num">{{ section.num }}</span> {{ section.title }}
                </RouterLink>
              </li>
            </ul>
            <button
              type="button"
              class="small legal-toc__more"
              aria-controls="legal-toc-list"
              :aria-expanded="tocOpen"
              @click="tocOpen = !tocOpen"
            >
              {{ tocOpen ? 'Свернуть' : 'Показать все' }}
            </button>
          </nav>

          <div class="legal__text">
            <p v-if="intro" class="legal__intro">{{ intro }}</p>

            <LegalBody ref="bodyEl" :sections="sections" @select="select" />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.legal {
  padding-top: var(--legal-top);
}

.legal__back {
  gap: var(--s-8);
  color: var(--ink);
  transition: background-color var(--ease);
}

.legal__back:hover {
  background: var(--bg-4);
}

.legal__back:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.legal__title {
  max-width: var(--measure-paragraph);
  margin-top: var(--sec-pill);
}

.legal__note {
  margin-top: var(--s-16);
  color: var(--text-3);
}

.legal__grid {
  display: grid;
  grid-template-columns: var(--legal-toc-w) minmax(0, var(--measure-paragraph));
  gap: var(--s-60);
  align-items: start;
  margin-top: var(--s-60);
}

/* ---------- содержание ---------- */
.legal-toc {
  position: sticky;
  top: calc(var(--header-top) + var(--header-h) + var(--s-24));
  max-height: calc(100vh - var(--header-top) - var(--header-h) - 2 * var(--s-24));
  overflow-y: auto;
  padding: var(--s-20);
  border-radius: var(--r-card);
  background: var(--white);
}

.legal-toc__label {
  margin-bottom: var(--s-8);
  color: var(--text-3);
}

.legal-toc__link {
  display: block;
  padding: var(--s-8) var(--s-12);
  border-radius: var(--r-lg);
  transition: background-color var(--ease), color var(--ease);
}

.legal-toc__link:hover {
  color: var(--ink);
}

.legal-toc__link.is-active {
  background: var(--bg-3);
  color: var(--ink);
}

.legal-toc__num {
  margin-right: var(--s-4);
  color: var(--accent);
}

/* кнопка только на телефоне: на ПК видно весь список */
.legal-toc__more {
  display: none;
  margin-top: var(--s-4);
  padding: var(--s-8) var(--s-12);
  border: 0;
  border-radius: var(--r-lg);
  background: none;
  color: var(--ink);
}

.legal-toc__link:focus-visible,
.legal-toc__more:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

/* ---------- текст ---------- */
.legal__intro {
  margin-bottom: var(--s-60);
}

@media (max-width: 767px) {
  .legal__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--s-40);
    margin-top: var(--s-40);
  }

  .legal-toc {
    position: static;
    max-height: none;
    overflow: visible;
    padding: var(--s-16);
  }

  .legal-toc.is-collapsed li:nth-child(n+5) {
    display: none;
  }

  .legal-toc__more {
    display: block;
  }

  .legal__intro {
    margin-bottom: var(--s-40);
  }
}
</style>
