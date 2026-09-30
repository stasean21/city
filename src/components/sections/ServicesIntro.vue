<script setup>
import { RouterLink } from 'vue-router'
import RicochetArrow from '../ui/RicochetArrow.vue'
import StackMarquee from '../ui/StackMarquee.vue'
import services from '../../data/services.json'
import homeStack from '../../data/stack-home.json'
</script>

<template>
  <section id="services" class="services">
    <div class="container">
      <div class="services__head once-in">
        <div class="services__intro">
          <span class="pill">Что я делаю</span>
          <h2 class="display">Услуги и решения</h2>
        </div>
        <p class="lead">
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

    <div class="container services__stack">
      <StackMarquee :items="homeStack" />
    </div>
  </section>
</template>

<style scoped>
/* шапка — как в ProcessColumns: слева pill и заголовок, справа лид по низу */
.services__head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-24);
  align-items: end;
  margin-bottom: var(--sec-content);
}

.services__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sec-pill);
}

/* три колонки, поток автоматический; первая и последняя карточки широкие */
.services__grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: minmax(var(--service-card-h), auto);
  gap: var(--s-16);
}

.services__grid li {
  display: flex;
  min-width: 0;
}

.services__grid li:nth-child(1),
.services__grid li:nth-child(7) {
  grid-column: span 2;
}

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

.services__stack {
  margin-top: var(--s-60);
}

/* две колонки: широкая только первая, иначе последняя
   осталась бы одна в ряду; шапка в один столбик */
@media (max-width: 991px) {
  .services__head {
    grid-template-columns: 1fr;
    gap: var(--sec-lead);
  }

  .services__grid {
    grid-template-columns: 1fr 1fr;
  }

  .services__grid li:nth-child(7) {
    grid-column: auto;
  }
}

/* один столбик, естественный порядок */
@media (max-width: 767px) {
  .services__grid {
    grid-template-columns: 1fr;
  }

  .services__grid li:nth-child(n) {
    grid-column: auto;
  }
}
</style>
