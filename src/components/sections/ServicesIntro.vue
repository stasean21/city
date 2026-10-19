<script setup>
import SectionHead from '../ui/SectionHead.vue'
import ServiceCard from '../ui/ServiceCard.vue'
import StackMarquee from '../ui/StackMarquee.vue'
import { publishedServices as services } from '../../data/published.js'
import homeStack from '../../data/stack-home.json'
</script>

<template>
  <section id="services" class="services">
    <div class="container">
      <SectionHead
        class="once-in"
        pill="Что я делаю"
        title="Услуги и решения"
        lead="Собираю визуал, сайты и автоматизацию под одну задачу — чтобы товар продавался, а заявки доходили до вас."
      />

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
/* три колонки, поток автоматический, в каждом ряду одна широкая — зигзаг.
   шесть карточек: 1 + 2, 3 + 4, 5 + 6; четыре (пока баннеры и сайты
   в черновиках): 1 + 2, 3 + 4 — правило для 5-й просто не срабатывает.
   ≤991 две колонки: 1 широкая, дальше парами, последняя широкая —
   6-я из шести или 4-я из четырёх (li:last-child:nth-child(4)) */
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
  .services__grid {
    grid-template-columns: 1fr 1fr;
  }

  .services__grid li:nth-child(4),
  .services__grid li:nth-child(5) {
    grid-column: auto;
  }

  .services__grid li:nth-child(6),
  .services__grid li:last-child:nth-child(4) {
    grid-column: span 2;
  }
}

/* один столбик, естественный порядок */
@media (max-width: 767px) {
  .services__grid {
    grid-template-columns: 1fr;
  }

  .services__grid li:nth-child(n),
  .services__grid li:last-child:nth-child(4) {
    grid-column: auto;
  }
}
</style>
