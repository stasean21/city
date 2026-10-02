<script setup>
import ExpandColumns from '../ui/ExpandColumns.vue'
import steps from '../../data/process.json'

// svg встраиваем строкой, чтобы иконки попали в пререндеренный html
const icons = import.meta.glob('../../assets/icons/process/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const items = steps.map((step) => ({
  ...step,
  svg: icons[`../../assets/icons/process/${step.icon}.svg`],
}))
</script>

<template>
  <section id="process" class="process">
    <div class="container">
      <div class="process__head">
        <div class="process__intro">
          <span class="pill">Процесс</span>
          <h2 class="display">Как работаем</h2>
        </div>
        <p class="lead">Шесть шагов от заявки до результата.</p>
      </div>

      <ExpandColumns :items="items" aria-label="Этапы работы" />
    </div>
  </section>
</template>

<style scoped>
.process__head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-24);
  align-items: end;
  margin-bottom: var(--sec-content);
}

.process__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sec-pill);
}

@media (max-width: 767px) {
  .process__head {
    grid-template-columns: 1fr;
    gap: var(--sec-lead);
  }
}
</style>
