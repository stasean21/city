<script setup>
import { RouterLink } from 'vue-router'
import RicochetArrow from './RicochetArrow.vue'

// карточка услуги: мозаика на главной и «С этим часто берут» на странице услуги
defineProps({
  service: { type: Object, required: true }, // { slug, title, description }
})
</script>

<template>
  <RouterLink :to="`/services/${service.slug}`" class="service-card">
    <span class="service-card__mark" aria-hidden="true"></span>
    <h3 class="card-title service-card__title">{{ service.title }}</h3>
    <p class="service-card__text">{{ service.description }}</p>
    <RicochetArrow class="service-card__arrow" size="var(--arrow-card)" />
  </RouterLink>
</template>

<style scoped>
.service-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--s-24);
  background-color: var(--white);
  border-radius: var(--r-card);
  color: var(--text);
  transition: background-color var(--ease), color var(--ease);
}

.service-card__mark {
  display: block;
  width: var(--card-mark-w);
  height: var(--hairline);
  margin-bottom: var(--s-24);
  background-color: var(--ink);
  transition: background-color var(--ease);
}

.service-card__title {
  transition: color var(--ease);
}

/* в широкой карточке текст не растягивается на всю ширину */
.service-card__text {
  max-width: var(--measure-card-head);
  margin-top: var(--s-12);
  /* минимальный зазор до стрелки: длинный текст растит карточку, а не упирается */
  margin-bottom: var(--s-16);
  color: var(--text);
  transition: color var(--ease);
}

.service-card__arrow {
  align-self: flex-end;
  margin-top: auto;
  color: var(--ink);
  transition: color var(--ease);
}

/* «загоревшаяся» карточка: ховер на мыши, :active на тач, фокус с клавиатуры */
.service-card:focus-visible {
  --ricochet-p: 1;
  background-color: var(--ink);
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.service-card:focus-visible .service-card__title {
  color: var(--white);
}

.service-card:focus-visible .service-card__text {
  color: var(--dark-section-text);
}

.service-card:focus-visible .service-card__mark {
  background-color: var(--dark-section-text);
}

.service-card:focus-visible .service-card__arrow {
  color: var(--accent);
}

@media (hover: hover) {
  .service-card:hover {
    --ricochet-p: 1;
    background-color: var(--ink);
  }

  .service-card:hover .service-card__title {
    color: var(--white);
  }

  .service-card:hover .service-card__text {
    color: var(--dark-section-text);
  }

  .service-card:hover .service-card__mark {
    background-color: var(--dark-section-text);
  }

  .service-card:hover .service-card__arrow {
    color: var(--accent);
  }
}

@media (hover: none) {
  .service-card:active {
    --ricochet-p: 1;
    background-color: var(--ink);
  }

  .service-card:active .service-card__title {
    color: var(--white);
  }

  .service-card:active .service-card__text {
    color: var(--dark-section-text);
  }

  .service-card:active .service-card__mark {
    background-color: var(--dark-section-text);
  }

  .service-card:active .service-card__arrow {
    color: var(--accent);
  }
}
</style>
