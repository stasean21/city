<script setup>
import { useHead } from '@unhead/vue'
import LegalDocument from '../components/legal/LegalDocument.vue'
import { SITE_URL } from '../data/site.js'
import { PRIVACY_DATE, PRIVACY_DESCRIPTION, PRIVACY_SECTIONS, PRIVACY_TITLE } from '../data/legal/privacy.js'

const TITLE = 'Политика обработки персональных данных — m/design'
useHead({
  title: TITLE,
  meta: [
    { name: 'description', content: PRIVACY_DESCRIPTION },
    { property: 'og:title', content: TITLE },
    { property: 'og:description', content: PRIVACY_DESCRIPTION },
  ],
  link: [{ rel: 'canonical', href: `${SITE_URL}/privacy` }],
})
</script>

<template>
  <LegalDocument :title="PRIVACY_TITLE" :note="`Дата редакции: ${PRIVACY_DATE}`" :sections="PRIVACY_SECTIONS" />
</template>
