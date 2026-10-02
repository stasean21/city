<script setup>
import ExpandColumns from '../ui/ExpandColumns.vue'
import SectionHead from '../ui/SectionHead.vue'

// «Из чего состоит карточка» — те же раскрывающиеся колонки, что «Как работаем»
defineProps({
  parts: { type: Object, required: true }, // { title, lead, items: [{ title, text, result }] }
})
</script>

<template>
  <section id="parts" class="parts">
    <div class="container">
      <SectionHead pill="Что входит" :title="parts.title" :lead="parts.lead" />
      <ExpandColumns :items="parts.items" :aria-label="parts.title" />
    </div>
  </section>
</template>
