<script setup>
import VideoFeed from './VideoFeed.vue'
import VideoReel from './VideoReel.vue'

// блок примеров страницы видеообложек: «Заметна в выдаче» и «Работы» в одной
// секции, pill «Примеры» только у первого (как BannerExamples)
defineProps({
  works: { type: Array, required: true },
  feed: { type: Object, default: () => ({}) }, // { title, lead, query }
  reel: { type: Object, default: () => ({}) }, // { title, lead }
  serviceTitle: { type: String, default: '' },
})
</script>

<template>
  <section id="works" class="videos">
    <div class="container">
      <VideoFeed :works="works" :title="feed.title" :lead="feed.lead" :query="feed.query" />
      <VideoReel
        class="videos__reel"
        :works="works"
        :title="reel.title"
        :lead="reel.lead"
        :service-title="serviceTitle"
      />
    </div>
  </section>
</template>

<style scoped>
.videos__reel {
  margin-top: var(--s-120);
}
</style>
