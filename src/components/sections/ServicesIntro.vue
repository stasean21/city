<script setup>
import ServiceCard from '../ui/ServiceCard.vue'
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
          <ServiceCard :service="service" />
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

/* три колонки, поток автоматический. шесть карточек зигзагом —
   в каждом ряду одна широкая: 1 + 2, 3 + 4, 5 + 6 */
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
.services__grid li:nth-child(4),
.services__grid li:nth-child(5) {
  grid-column: span 2;
}

.services__stack {
  margin-top: var(--s-60);
}

/* две колонки: широкие первая и последняя, четыре между ними — парами;
   шапка в один столбик */
@media (max-width: 991px) {
  .services__head {
    grid-template-columns: 1fr;
    gap: var(--sec-lead);
  }

  .services__grid {
    grid-template-columns: 1fr 1fr;
  }

  .services__grid li:nth-child(4),
  .services__grid li:nth-child(5) {
    grid-column: auto;
  }

  .services__grid li:nth-child(6) {
    grid-column: span 2;
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
