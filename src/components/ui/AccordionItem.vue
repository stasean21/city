<script setup>
import { ref } from 'vue'

defineProps({
  question: { type: String, required: true },
})

const isOpen = ref(false)
</script>

<template>
  <div class="accordion-item" :class="{ 'is-open': isOpen }">
    <button class="accordion-item__head" @click="isOpen = !isOpen">
      <span>{{ question }}</span>
      <svg class="accordion-item__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <div class="accordion-item__body">
      <div class="accordion-item__body-inner">
        <p><slot /></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-item {
  border-bottom: var(--hairline) solid var(--border-soft);
}

.accordion-item__head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-12);
  background: none;
  border: 0;
  padding: var(--s-20) 0;
  font: 500 var(--t-body) var(--f-body);
  color: var(--ink);
  text-align: left;
}

.accordion-item__chevron {
  flex-shrink: 0;
  transition: var(--ease);
}

.accordion-item.is-open .accordion-item__chevron {
  transform: rotate(180deg);
}

.accordion-item__body {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows var(--ease);
}

.accordion-item.is-open .accordion-item__body {
  grid-template-rows: 1fr;
}

.accordion-item__body-inner {
  min-height: 0;
  overflow: hidden;
}

.accordion-item__body-inner p {
  padding-bottom: var(--s-20);
  font: 400 var(--t-body)/1.667 var(--f-body);
  color: var(--text);
  max-width: none;
}
</style>
