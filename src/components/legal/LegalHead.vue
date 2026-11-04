<script setup>
// шапка юридической страницы: «← На главную», h1, дата редакции (если есть)
defineProps({
  title: { type: String, required: true },
  date: { type: String, default: '' },
})
</script>

<template>
  <RouterLink to="/" class="pill legal-head__back"><span aria-hidden="true">←</span> На главную</RouterLink>
  <h1 class="legal-head__title">{{ title }}</h1>
  <p v-if="date" class="small legal-head__date">Дата редакции: {{ date }}</p>
</template>

<style scoped>
.legal-head__back {
  gap: var(--s-8);
  color: var(--ink);
  transition: background-color var(--ease);
}

.legal-head__back:hover {
  background: var(--bg-4);
}

.legal-head__back:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.legal-head__title {
  max-width: var(--measure-paragraph);
  margin-top: var(--sec-pill);
}

.legal-head__date {
  margin-top: var(--s-16);
  color: var(--text-3);
}
</style>
