<script setup>
import { useHead } from '@unhead/vue'
import LegalDocument from '../components/legal/LegalDocument.vue'
import { SITE_URL } from '../data/site.js'
import { CONSENT_INTRO, CONSENT_SECTIONS, CONSENT_TITLE } from '../data/legal/consent.js'

const TITLE = 'Согласие на обработку персональных данных — m/design'
useHead({
  title: TITLE,
  meta: [{ property: 'og:title', content: TITLE }],
  link: [{ rel: 'canonical', href: `${SITE_URL}/consent` }],
})
</script>

<template>
  <LegalDocument :title="CONSENT_TITLE" :intro="CONSENT_INTRO" :sections="CONSENT_SECTIONS" />
</template>
