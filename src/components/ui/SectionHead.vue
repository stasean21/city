<script setup>
// шапка блока, как в ProcessColumns: слева pill и Display, справа lead по низу.
// без pill — второй заголовок внутри той же секции
defineProps({
  pill: { type: String, default: '' },
  title: { type: String, required: true },
  lead: { type: String, default: '' },
})
</script>

<template>
  <div class="section-head">
    <div class="section-head__intro">
      <span v-if="pill" class="pill">{{ pill }}</span>
      <h2 class="display">{{ title }}</h2>
    </div>
    <p v-if="lead" class="lead">{{ lead }}</p>
  </div>
</template>

<style scoped>
.section-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-24);
  align-items: end;
  margin-bottom: var(--sec-content);
}

.section-head__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sec-pill);
}

@media (max-width: 767px) {
  .section-head {
    grid-template-columns: 1fr;
    gap: var(--sec-lead);
  }
}
</style>
