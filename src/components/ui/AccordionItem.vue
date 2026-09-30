<script setup>
import { useId } from 'vue'

// управляемый: какой пункт открыт, решает родитель
defineProps({
  question: { type: String, required: true },
  open: { type: Boolean, default: false },
})

defineEmits(['toggle'])

// useId стабилен между пререндером и гидрацией
const id = useId()
const headId = `${id}-head`
const bodyId = `${id}-body`
</script>

<template>
  <div class="accordion-item" :class="{ 'is-open': open }">
    <h3 class="accordion-item__heading">
      <button
        :id="headId"
        type="button"
        class="accordion-item__head"
        :aria-expanded="open"
        :aria-controls="bodyId"
        @click="$emit('toggle')"
      >
        <span class="h3 accordion-item__question">{{ question }}</span>
        <span class="accordion-item__toggle" aria-hidden="true"></span>
      </button>
    </h3>

    <!-- текст ответа всегда в DOM (пререндер и поиск), свёрнут строкой сетки -->
    <div :id="bodyId" class="accordion-item__body" role="region" :aria-labelledby="headId">
      <div class="accordion-item__body-inner">
        <p class="body accordion-item__answer"><slot /></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-item {
  background-color: var(--white);
  border-radius: var(--r-card);
  transition: background-color .35s var(--ease-out);
}

.accordion-item.is-open {
  background-color: var(--ink);
}

/* кольцо фокуса — на карточке: на тёмной открытой карточке
   кольцо цвета --ink вокруг кнопки было бы не видно */
.accordion-item:has(.accordion-item__head:focus-visible) {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.accordion-item__heading {
  margin: 0;
}

.accordion-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-16);
  width: 100%;
  padding: var(--s-24);
  border: 0;
  background: none;
  text-align: left;
}

.accordion-item__head:focus-visible {
  outline: none;
}

.accordion-item__question {
  transition: color .35s var(--ease-out);
}

.accordion-item.is-open .accordion-item__question {
  color: var(--white);
}

/* круг с плюсом; при открытии поворачивается в крестик */
.accordion-item__toggle {
  position: relative;
  flex: none;
  width: var(--faq-toggle);
  height: var(--faq-toggle);
  background-color: var(--bg-3);
  border-radius: var(--r-pill);
  transition:
    transform .45s var(--ease-out),
    background-color .35s var(--ease-out);
}

.accordion-item__toggle::before,
.accordion-item__toggle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--faq-plus);
  height: var(--faq-plus-w);
  background-color: var(--ink);
  transform: translate(-50%, -50%);
  transition: background-color .35s var(--ease-out);
}

.accordion-item__toggle::after {
  transform: translate(-50%, -50%) rotate(90deg);
}

.accordion-item.is-open .accordion-item__toggle {
  background-color: var(--ink-soft);
  transform: rotate(45deg);
}

.accordion-item.is-open .accordion-item__toggle::before,
.accordion-item.is-open .accordion-item__toggle::after {
  background-color: var(--accent);
}

/* раскрытие строкой сетки 0fr → 1fr; закрытый ответ скрыт и от
   скринридера, и от фокуса — visibility переключается после сворачивания */
.accordion-item__body {
  display: grid;
  grid-template-rows: 0fr;
  visibility: hidden;
  transition:
    grid-template-rows .45s var(--ease-out),
    visibility 0s .45s;
}

.accordion-item.is-open .accordion-item__body {
  grid-template-rows: 1fr;
  visibility: visible;
  transition:
    grid-template-rows .45s var(--ease-out),
    visibility 0s;
}

.accordion-item__body-inner {
  min-height: 0;
  overflow: hidden;
}

.accordion-item__answer {
  padding: 0 var(--s-24) var(--s-24);
  color: var(--dark-section-text);
}

@media (max-width: 767px) {
  .accordion-item__head {
    padding: var(--s-20);
  }

  .accordion-item__answer {
    padding: 0 var(--s-20) var(--s-20);
  }
}
</style>
