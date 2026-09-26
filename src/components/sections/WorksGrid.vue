<script setup>
import { computed } from 'vue'
import works from '../../data/works.json'

const props = defineProps({
  limit: { type: Number, default: 0 },
  highlightNonDesign: { type: Boolean, default: false },
})

const accentNiches = ['Автоматизация', 'Аналитика', 'ИИ-генерация', 'Веб']

const displayedWorks = computed(() =>
  props.limit > 0 ? works.slice(0, props.limit) : works,
)
</script>

<template>
  <ul class="works-grid">
    <li v-for="work in displayedWorks" :key="work.slug">
      <RouterLink
        :to="`/works/${work.slug}`"
        class="tile"
        :aria-label="`${work.title}. Ниша: ${work.niche}. Услуга: ${work.service}`"
      >
        <span class="tile__niche" aria-hidden="true">{{ work.niche }}</span>
        <span class="tile__title">{{ work.title }}</span>
        <span
          class="tile__service"
          :class="{ 'tile__service--accent': highlightNonDesign && accentNiches.includes(work.niche) }"
          aria-hidden="true"
        >{{ work.service }}</span>
      </RouterLink>
    </li>
  </ul>
</template>

<style scoped>
.works-grid {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(7, 1fr);
  max-width: 1716px;
  margin: 0 auto;
  list-style: none;
  padding: 0;
}

.works-grid > li {
  display: contents;
}

.tile {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  text-align: center;
  height: 175px;
  padding: 15px 30px;
  background: var(--white);
  border-radius: var(--r-sm);
  text-decoration: none;
  transition: transform var(--ease);
}

.tile__niche {
  font: 400 12px/28px var(--f-body);
  color: var(--text);
  opacity: 0;
  transition: opacity var(--ease);
}

.tile__title {
  font: 600 14px/19px var(--f-body);
  letter-spacing: -0.15px;
  color: var(--ink);
  transition: opacity var(--ease);
}

.tile__service {
  font: 500 12px/18px var(--f-body);
  color: var(--ink);
  opacity: 0;
  transition: opacity var(--ease);
}

.tile__service--accent {
  color: var(--accent);
}

.tile:hover,
.tile:focus-visible {
  transform: translateY(-2px);
}

.tile:hover .tile__title,
.tile:focus-visible .tile__title {
  opacity: 0.35;
}

.tile:hover .tile__niche,
.tile:hover .tile__service,
.tile:focus-visible .tile__niche,
.tile:focus-visible .tile__service {
  opacity: 1;
}

.tile:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

@media (max-width: 1199px) {
  .works-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1023px) {
  .works-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 767px) {
  .works-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 479px) {
  .works-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (hover: none), (max-width: 767px) {
  .tile__niche,
  .tile__service {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .tile:hover,
  .tile:focus-visible,
  .tile__title,
  .tile__niche,
  .tile__service {
    transition: none;
    transform: none;
  }
}
</style>
