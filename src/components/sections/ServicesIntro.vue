<script setup>
import { RouterLink } from 'vue-router'
import RicochetArrow from '../ui/RicochetArrow.vue'
import StackMarquee from '../ui/StackMarquee.vue'
import services from '../../data/services.json'
import homeStack from '../../data/stack-home.json'
</script>

<template>
  <section id="services" class="services">
    <div class="container services__layout">
      <div class="services__intro once-in">
        <span class="pill">Что я делаю</span>
        <h2 class="display services__title">Услуги и решения</h2>
        <p class="services__lead">
          Собираю визуал, сайты и автоматизацию под одну задачу — чтобы товар продавался,
          а заявки доходили до вас.
        </p>
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

    <!-- строка стека — вне сетки с липкой вводной: sticky ограничен
         контейнером, и внутри сетки вводная наехала бы на строку -->
    <div class="container services__stack">
      <p class="caption">инструменты</p>
      <StackMarquee :items="homeStack" />
    </div>
  </section>
</template>

<style scoped>
.services__layout {
  display: grid;
  /* текст ~40%, карточки ~60% — иначе в мозаике не помещаются названия */
  grid-template-columns: 2fr 3fr;
  gap: var(--s-24);
}

/* обычный CSS sticky: без align-self: start колонка растянется
   на высоту сетки и прилипать будет нечему */
.services__intro {
  position: sticky;
  top: calc(var(--header-top) + var(--header-h) + var(--s-24));
  align-self: start;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.services__intro .pill {
  margin-bottom: var(--sec-pill);
}

.services__title {
  max-width: var(--measure-heading);
  margin-bottom: var(--sec-lead);
}

.services__lead {
  color: var(--text);
}

/* мозаика крест-накрест: высокая карточка — 3 ряда, низкая — 2;
   порядок в DOM 1…6 как в services.json, позиции заданы явно.
   колонки заканчиваются на разной высоте — так задумано */
.services__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: var(--mosaic-row);
  gap: var(--s-24);
}

.services__grid li {
  display: flex;
  min-width: 0;
}

.services__grid li:nth-child(1) { grid-column: 1; grid-row: 1 / span 3; }
.services__grid li:nth-child(2) { grid-column: 2; grid-row: 1 / span 2; }
.services__grid li:nth-child(3) { grid-column: 1; grid-row: 4 / span 2; }
.services__grid li:nth-child(4) { grid-column: 2; grid-row: 3 / span 3; }
.services__grid li:nth-child(5) { grid-column: 1; grid-row: 6 / span 3; }
.services__grid li:nth-child(6) { grid-column: 2; grid-row: 6 / span 2; }

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

.service-card__text {
  margin-top: var(--s-12);
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

.services__stack {
  margin-top: var(--s-60);
}

.services__stack .caption {
  margin-bottom: var(--s-8);
}

/* вводная уходит наверх, мозаика остаётся в две колонки */
@media (max-width: 991px) {
  .services__layout {
    grid-template-columns: 1fr;
  }

  .services__intro {
    position: static;
    margin-bottom: var(--s-60);
  }
}

/* мозаика выключается: один столбик, естественный порядок 1…6 */
@media (max-width: 767px) {
  .services__grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }

  .services__grid li:nth-child(n) {
    grid-column: auto;
    grid-row: auto;
  }

  .service-card {
    min-height: var(--service-card-h-mobile);
  }
}
</style>
