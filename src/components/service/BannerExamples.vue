<script setup>
import BannerAdapt from './BannerAdapt.vue'
import BannerMosaic from './BannerMosaic.vue'

// блок примеров страницы баннеров: два заголовка в одной секции,
// pill «Примеры» только у первого
defineProps({
  campaigns: { type: Array, required: true },
})
</script>

<template>
  <section id="works" class="banners">
    <div class="container">
      <BannerAdapt :campaigns="campaigns" />
      <BannerMosaic class="banners__mosaic" :campaigns="campaigns" />
    </div>
  </section>
</template>

<style scoped>
.banners__mosaic {
  margin-top: var(--s-120);
}
</style>
