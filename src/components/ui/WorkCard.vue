<script setup>
defineProps({
  slug: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  cover: { type: String, default: null },
})
</script>

<template>
  <RouterLink :to="`/works/${slug}`" class="work-card">
    <img v-if="cover" :src="cover" :alt="title" width="400" height="300" loading="lazy" class="work-card__image" />
    <div v-else class="work-card__image work-card__image--placeholder" />
    <span class="caption">{{ category }}</span>
    <span class="work-card__title">{{ title }}</span>
  </RouterLink>
</template>

<style scoped>
.work-card {
  display: block;
}

.work-card__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--r-sm);
  margin-bottom: var(--s-12);
}

.work-card__image--placeholder {
  background: var(--bg-3);
}

.work-card__title {
  display: block;
  font: 400 var(--t-body) var(--f-body);
  color: var(--ink);
}
</style>
