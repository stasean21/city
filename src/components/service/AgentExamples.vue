<script setup>
import AgentDemo from './AgentDemo.vue'
import AgentThink from './AgentThink.vue'

// блок примеров страницы ИИ-агентов: демо-чат и «как агент думает» в одной
// секции, pill «Примеры» только у первого. Работ нет — это демо, так и подписано
defineProps({
  demo: { type: Object, required: true },
  think: { type: Object, required: true },
})
</script>

<template>
  <section id="works" class="agents">
    <div class="container">
      <AgentDemo :demo="demo" />
      <AgentThink class="agents__think" :think="think" />
    </div>
  </section>
</template>

<style scoped>
.agents__think {
  margin-top: var(--s-120);
}
</style>
