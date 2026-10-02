<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import CoverImage from '../ui/CoverImage.vue'

defineProps({
  service: { type: Object, required: true },
  // первые работы услуги — обложки для веера (берутся три)
  works: { type: Array, default: () => [] },
  // на странице есть блок примеров #works — показываем кнопку к нему
  examples: { type: Boolean, default: false },
})
</script>

<template>
  <section id="hero" class="service-hero">
    <div class="container service-hero__layout">
      <div class="service-hero__text">
        <nav class="small service-hero__crumbs once-in" aria-label="Хлебные крошки">
          <ol>
            <li><RouterLink to="/" class="service-hero__crumb-link">Главная</RouterLink></li>
            <li>Услуги</li>
            <li aria-current="page" class="service-hero__crumb-current">{{ service.title }}</li>
          </ol>
        </nav>

        <h1 class="display service-hero__title once-in">{{ service.title }}</h1>
        <p v-if="service.page?.lead" class="lead service-hero__lead once-in">{{ service.page.lead }}</p>

        <div class="service-hero__actions once-in">
          <BaseButton to="#contact" variant="primary" arrow>Обсудим задачу?</BaseButton>
          <BaseButton v-if="examples" to="#works" variant="secondary">Смотреть примеры</BaseButton>
        </div>
      </div>

      <!-- веер обложек — графика первого экрана, без lazy.
           своя графика услуги (например, веер форматов баннеров) — слотом -->
      <slot name="fan">
        <div v-if="works.length" class="service-hero__fan once-in" aria-hidden="true">
          <CoverImage
            v-for="(work, i) in works.slice(0, 3)"
            :key="work.slug"
            class="service-hero__card"
            :class="`is-${['center', 'left', 'right'][i]}`"
            :src="work.cover"
            :lazy="false"
          />
        </div>
      </slot>
    </div>
  </section>
</template>

<style scoped>
/* main уже даёт клиренс под шапку; снизу — обычный ритм секции.
   раскрытый веер шире колонки — clip не даёт ему добавить горизонтальный скролл */
.service-hero {
  padding-top: var(--hero-top);
  overflow-x: clip;
}

.service-hero__layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--s-60);
  align-items: center;
}

.service-hero__crumbs ol {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-8);
  margin-bottom: var(--sec-pill);
  color: var(--text);
}

.service-hero__crumbs li + li::before {
  content: "/";
  margin-right: var(--s-8);
  color: var(--text-3);
}

.service-hero__crumb-link {
  transition: color var(--ease);
}

.service-hero__crumb-link:hover {
  color: var(--ink);
}

.service-hero__crumb-link:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.service-hero__crumb-current {
  color: var(--ink);
}

.service-hero__title {
  margin-bottom: var(--sec-lead);
}

.service-hero__lead {
  max-width: var(--measure-lead);
}

.service-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-12);
  margin-top: var(--s-32);
}

/* веер: центральная обложка сверху, крайние повёрнуты и сдвинуты;
   при наведении раскрывается шире */
.service-hero__fan {
  position: relative;
  height: calc(var(--fan-card-w) * 4 / 3 + var(--s-60));
}

.service-hero__card {
  position: absolute;
  top: var(--s-20);
  left: 50%;
  width: var(--fan-card-w);
  aspect-ratio: 3 / 4;
  border: var(--fan-border) solid var(--white);
  border-radius: var(--r-card);
  transform: translateX(-50%);
  transition: transform .8s var(--ease-out);
}

.service-hero__card.is-center {
  top: 0;
  z-index: 2;
}

.service-hero__card.is-left {
  transform: translateX(calc(-50% - var(--fan-shift))) rotate(calc(-1 * var(--fan-rot)));
}

.service-hero__card.is-right {
  transform: translateX(calc(-50% + var(--fan-shift))) rotate(var(--fan-rot));
}

@media (hover: hover) {
  .service-hero__fan:hover .is-left {
    transform: translateX(calc(-50% - var(--fan-shift-open))) rotate(calc(-1 * var(--fan-rot-open)));
  }

  .service-hero__fan:hover .is-right {
    transform: translateX(calc(-50% + var(--fan-shift-open))) rotate(var(--fan-rot-open));
  }
}

@media (max-width: 991px) {
  .service-hero__layout {
    grid-template-columns: 1fr;
  }
}
</style>
