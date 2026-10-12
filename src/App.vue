<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import TheHeader from './components/layout/TheHeader.vue'
import TheFooter from './components/layout/TheFooter.vue'
import TheLoader from './components/layout/TheLoader.vue'

// без этого vite-ssg ставит в пререндер lang="en" поверх index.html
useHead({ htmlAttrs: { lang: 'ru' } })

// 404 — полноэкранный тёмный экран, как загрузчик: без шапки и футера
const route = useRoute()
const chrome = computed(() => route.name !== 'not-found')
</script>

<template>
  <TheHeader v-if="chrome" />
  <RouterView />
  <TheFooter v-if="chrome" />
  <TheLoader />
</template>
