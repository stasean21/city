<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import RicochetArrow from '../ui/RicochetArrow.vue'
import services from '../../data/services.json'
</script>

<template>
  <section id="services" class="services">
    <div class="container services__layout">
      <div class="services__intro once-in">
        <span class="pill">Что я делаю</span>
        <h2 class="h2 services__title">Услуги и решения</h2>
        <p class="services__lead">
          Собираю визуал, сайты и автоматизацию под одну задачу — чтобы товар продавался,
          а заявки доходили до вас.
        </p>
        <BaseButton variant="primary" arrow to="/contacts">Обсудить задачу</BaseButton>
      </div>

      <ul class="services__grid once-in">
        <li v-for="service in services" :key="service.slug">
          <RouterLink :to="`/services/${service.slug}`" class="service-card">
            <span class="service-card__mark" aria-hidden="true"></span>
            <h3 class="card-title service-card__title">{{ service.title }}</h3>
            <p class="service-card__text">{{ service.description }}</p>
            <RicochetArrow class="service-card__arrow" size="var(--arrow-card)" />
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.services__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap-lg);
}

/* обычный CSS sticky: без align-self: start колонка растянется
   на высоту сетки и прилипать будет нечему */
.services__intro {
  position: sticky;
  top: calc(var(--header-top) + var(--header-h) + var(--gap-lg));
  align-self: start;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.services__intro .pill {
  margin-bottom: var(--gap-lg);
}

.services__title {
  max-width: var(--measure-heading);
}

.services__lead {
  color: var(--text);
  margin-bottom: var(--gap-xl);
}

.services__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 1fr;
  gap: var(--gap-lg);
}

.services__grid li {
  display: flex;
  min-width: 0;
}

.service-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: var(--service-card-h);
  padding: var(--gap-lg);
  background-color: var(--white);
  border-radius: var(--r-xl);
  color: var(--text);
  transition: background-color var(--ease), color var(--ease);
}

.service-card__mark {
  display: block;
  width: var(--card-mark-w);
  height: var(--hairline);
  margin-bottom: var(--gap-lg);
  background-color: var(--ink);
  transition: background-color var(--ease);
}

.service-card__title {
  overflow-wrap: break-word;
  transition: color var(--ease);
}

.service-card__text {
  margin-top: var(--gap-md);
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

/* на 1024–1279 карточка в две колонки уже 32-пиксельного заголовка —
   «маркетплейсов» рвётся посреди слова; ставим карточки в столбик рядом
   с липкой вводной, на ≤1023 вводная уходит наверх и место возвращается */
@media (max-width: 1279px) {
  .services__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1023px) {
  .services__grid {
    grid-template-columns: 1fr 1fr;
  }

  .services__layout {
    grid-template-columns: 1fr;
  }

  .services__intro {
    position: static;
    margin-bottom: var(--gap-2xl);
  }
}

@media (max-width: 767px) {
  .services__grid {
    grid-template-columns: 1fr;
  }
}
</style>
