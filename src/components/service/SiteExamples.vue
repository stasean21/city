<script setup>
import SiteLive from './SiteLive.vue'
import SiteXray from './SiteXray.vue'

// блок примеров страницы сайтов: «Вы уже на моём сайте» и «Под капотом»
// в одной секции, pill «Примеры» только у первого. Кнопки «все работы» нет
defineProps({
  site: { type: Object, required: true },
  xray: { type: Object, required: true },
})
</script>

<template>
  <section id="works" class="sites">
    <div class="container">
      <SiteLive :site="site" />
      <SiteXray class="sites__xray" :site="site" :xray="xray" />
    </div>
  </section>
</template>

<style scoped>
.sites__xray {
  margin-top: var(--s-120);
}
</style>
