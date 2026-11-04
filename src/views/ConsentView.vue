<script setup>
import { useHead } from '@unhead/vue'
import LegalHead from '../components/legal/LegalHead.vue'
import { SITE_URL } from '../data/site.js'
import { CONSENT_PARAGRAPHS, CONSENT_TITLE } from '../data/legal/consent.js'

const TITLE = 'Согласие на обработку персональных данных — m/design'
useHead({
  title: TITLE,
  meta: [{ property: 'og:title', content: TITLE }],
  link: [{ rel: 'canonical', href: `${SITE_URL}/consent` }],
})
</script>

<template>
  <main>
    <section class="legal">
      <div class="container">
        <LegalHead :title="CONSENT_TITLE" />
        <div class="legal__text">
          <p v-for="paragraph in CONSENT_PARAGRAPHS" :key="paragraph">{{ paragraph }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.legal {
  padding-top: var(--legal-top);
}

.legal__text {
  display: flex;
  flex-direction: column;
  gap: var(--s-12);
  max-width: var(--measure-paragraph);
  margin-top: var(--s-40);
}
</style>
