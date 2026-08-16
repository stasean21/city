<script setup>
import BaseButton from '../ui/BaseButton.vue'
import WorksGrid from './WorksGrid.vue'
</script>

<template>
  <section id="works" class="works">
    <div class="works__grid-wrap">
      <WorksGrid highlight-non-design />
    </div>
    <div class="container">
      <div class="works__cta">
        <BaseButton to="/works" variant="secondary" size="lg">Все работы</BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.works__grid-wrap {
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: 80px 6px 0;
}

.works__cta {
  display: flex;
  justify-content: center;
  margin-top: var(--gap-3xl);
}
</style>
