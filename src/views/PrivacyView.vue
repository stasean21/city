<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import LegalHead from '../components/legal/LegalHead.vue'
import { SITE_URL } from '../data/site.js'
import { PRIVACY_DATE, PRIVACY_DESCRIPTION, PRIVACY_SECTIONS, PRIVACY_TITLE } from '../data/legal/privacy.js'
import { scrollToSameAnchor } from '../utils/headerOffset.js'

const TITLE = 'Политика обработки персональных данных — m/design'
useHead({
  title: TITLE,
  meta: [
    { name: 'description', content: PRIVACY_DESCRIPTION },
    { property: 'og:title', content: TITLE },
    { property: 'og:description', content: PRIVACY_DESCRIPTION },
  ],
  link: [{ rel: 'canonical', href: `${SITE_URL}/privacy` }],
})

const route = useRoute()
const partEls = ref([])
const endEl = ref(null)
const activeIndex = ref(0)
const tocOpen = ref(false)

// активный раздел — тот, что пересекает линию на трети окна, как в шапке главной.
// Последний короткий раздел до этой линии может не доехать (ниже только подвал),
// поэтому в конце текста активным становится он
let partObserver = null
let endObserver = null
const crossing = new Set()
let atEnd = false

function updateActive() {
  if (atEnd) activeIndex.value = PRIVACY_SECTIONS.length - 1
  else if (crossing.size) activeIndex.value = Math.max(...crossing)
}

onMounted(() => {
  partObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const index = partEls.value.indexOf(entry.target)
      if (entry.isIntersecting) crossing.add(index)
      else crossing.delete(index)
    }
    updateActive()
  }, { rootMargin: '-33% 0px -66% 0px' })
  partEls.value.forEach((el) => partObserver.observe(el))

  endObserver = new IntersectionObserver(([entry]) => {
    atEnd = entry.isIntersecting
    updateActive()
  })
  endObserver.observe(endEl.value)
})

onUnmounted(() => {
  partObserver?.disconnect()
  endObserver?.disconnect()
})
</script>

<template>
  <main>
    <section class="legal">
      <div class="container">
        <LegalHead :title="PRIVACY_TITLE" :date="PRIVACY_DATE" />

        <div class="legal__grid">
          <nav class="legal-toc" :class="{ 'is-collapsed': !tocOpen }" aria-label="Содержание">
            <p class="small legal-toc__label">Содержание</p>
            <ul id="legal-toc-list">
              <li v-for="(section, i) in PRIVACY_SECTIONS" :key="section.id">
                <RouterLink
                  :to="{ hash: `#${section.id}` }"
                  class="small legal-toc__link"
                  :class="{ 'is-active': activeIndex === i }"
                  :aria-current="activeIndex === i ? 'location' : null"
                  active-class=""
                  exact-active-class=""
                  @click="scrollToSameAnchor(route, `#${section.id}`, route.path)"
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
            <div
              v-for="section in PRIVACY_SECTIONS"
              :key="section.id"
              ref="partEls"
              class="legal__part"
            >
              <h2 :id="section.id" class="card-title legal__heading">
                <span class="body legal__num">{{ section.num }}</span>
                <span>
                  {{ section.title }}
                  <RouterLink
                    :to="{ hash: `#${section.id}` }"
                    class="body legal__anchor"
                    :aria-label="`Ссылка на раздел ${section.num}`"
                    active-class=""
                    exact-active-class=""
                    @click="scrollToSameAnchor(route, `#${section.id}`, route.path)"
                  >#</RouterLink>
                </span>
              </h2>

              <template v-for="item in section.items" :key="item.text">
                <p>{{ item.text }}</p>
                <ul v-if="item.list" class="legal__list">
                  <li v-for="line in item.list" :key="line">{{ line }}</li>
                </ul>
              </template>

              <div v-if="section.requisites" class="legal__requisites">
                <p v-for="line in section.requisites" :key="line">{{ line }}</p>
              </div>
            </div>
            <span ref="endEl" aria-hidden="true"></span>
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
.legal-toc__more:focus-visible,
.legal__anchor:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

/* ---------- текст ---------- */
/* разделы встык, с полем снизу, а не зазором: линия активного раздела всегда в каком-то из них */
.legal__part {
  display: flex;
  flex-direction: column;
  gap: var(--s-12);
  padding-bottom: var(--s-60);
}

.legal__part:last-of-type {
  padding-bottom: 0;
}

.legal__heading {
  display: flex;
  align-items: baseline;
  gap: var(--s-12);
  margin-bottom: var(--s-4);
}

.legal__num {
  flex: none;
  color: var(--accent);
}

.legal__anchor {
  margin-left: var(--s-4);
  color: var(--text-3);
  opacity: 0;
  transition: opacity var(--ease), color var(--ease);
}

.legal__heading:hover .legal__anchor,
.legal__anchor:focus-visible {
  opacity: 1;
}

.legal__anchor:hover {
  color: var(--ink);
}

/* ховера на таче нет — ссылка видна всегда */
@media (hover: none) {
  .legal__anchor {
    opacity: 1;
  }
}

.legal__list {
  display: grid;
  gap: var(--s-8);
}

.legal__list li {
  position: relative;
  max-width: var(--measure-paragraph);
  padding-left: var(--s-20);
}

.legal__list li::before {
  content: '/';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: 500;
}

.legal__requisites {
  padding: var(--s-24);
  border-radius: var(--r-card);
  background: var(--white);
  color: var(--ink);
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

  .legal__part {
    padding-bottom: var(--s-40);
  }
}
</style>
