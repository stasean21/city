<script setup>
import { computed } from 'vue'
import SectionHead from '../ui/SectionHead.vue'
import ServiceCard from '../ui/ServiceCard.vue'
import services from '../../data/services.json'

const props = defineProps({
  related: { type: Object, required: true }, // { title, lead, slugs }
})

const items = computed(() => props.related.slugs
  .map((slug) => services.find((s) => s.slug === slug))
  .filter(Boolean))
</script>

<template>
  <section id="related" class="related">
    <div class="container">
      <SectionHead pill="Вместе с этим" :title="related.title" :lead="related.lead" />
      <ul class="related__grid">
        <li v-for="service in items" :key="service.slug">
          <ServiceCard :service="service" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.related__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: minmax(var(--service-card-h), auto);
  gap: var(--s-16);
}

.related__grid li {
  display: flex;
  min-width: 0;
}

@media (max-width: 767px) {
  .related__grid {
    grid-template-columns: 1fr;
  }
}
</style>
