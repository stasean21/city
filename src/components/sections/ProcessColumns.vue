<script setup>
import ExpandColumns from '../ui/ExpandColumns.vue'
import SectionHead from '../ui/SectionHead.vue'
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
      <SectionHead pill="Процесс" title="Как работаем" lead="Шесть шагов от заявки до результата." />

      <ExpandColumns :items="items" aria-label="Этапы работы" />
    </div>
  </section>
</template>

<style scoped>
</style>
