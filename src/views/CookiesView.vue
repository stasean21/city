<script setup>
import { useHead } from '@unhead/vue'
import LegalDocument from '../components/legal/LegalDocument.vue'
import { SITE_URL } from '../data/site.js'
import { COOKIES_DATE, COOKIES_DESCRIPTION, COOKIES_SECTIONS, COOKIES_TITLE } from '../data/legal/cookies.js'

const TITLE = 'Политика использования файлов cookie — m/design'
useHead({
  title: TITLE,
  meta: [
    { name: 'description', content: COOKIES_DESCRIPTION },
    { property: 'og:title', content: TITLE },
    { property: 'og:description', content: COOKIES_DESCRIPTION },
  ],
  link: [{ rel: 'canonical', href: `${SITE_URL}/cookies` }],
})
</script>

<template>
  <LegalDocument :title="COOKIES_TITLE" :note="`Дата редакции: ${COOKIES_DATE}`" :sections="COOKIES_SECTIONS" />
</template>
