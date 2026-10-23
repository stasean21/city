<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { OG_HOME } from './data/site.js'
import TheHeader from './components/layout/TheHeader.vue'
import TheFooter from './components/layout/TheFooter.vue'
import TheLoader from './components/layout/TheLoader.vue'
import GiftOffer from './components/layout/GiftOffer.vue'

// без этого vite-ssg ставит в пререндер lang="en" поверх index.html.
// og-теги — общие для всех страниц; og:image — запасная картинка превью,
// страница может заменить её своим тегом (unhead заменяет по property, не дублирует)
useHead({
  htmlAttrs: { lang: 'ru' },
  meta: [
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'm/design' },
    { property: 'og:locale', content: 'ru_RU' },
    { property: 'og:image', content: OG_HOME },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'm/design — дизайн, аналитика и ИИ-разработка для малого и среднего бизнеса' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})

// 404 — полноэкранный тёмный экран, как загрузчик: без шапки и футера
const route = useRoute()
const chrome = computed(() => route.name !== 'not-found')
// подарок к первому заказу — ни на 404, ни на служебном стайлгайде
const gift = computed(() => chrome.value && route.name !== 'styleguide')
</script>

<template>
  <TheHeader v-if="chrome" />
  <RouterView />
  <TheFooter v-if="chrome" />
  <GiftOffer v-if="gift" />
  <TheLoader />
</template>
