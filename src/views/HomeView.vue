<script setup>
import { useHead } from '@unhead/vue'
import { OG_HOME, SITE_URL } from '../data/site.js'
import HeroSection from '../components/sections/HeroSection.vue'
import ServicesIntro from '../components/sections/ServicesIntro.vue'
import ProcessColumns from '../components/sections/ProcessColumns.vue'
import ReviewsWall from '../components/sections/ReviewsWall.vue'
import AboutSwitch from '../components/sections/AboutSwitch.vue'
import FaqSection from '../components/sections/FaqSection.vue'
import ContactCta from '../components/sections/ContactCta.vue'

const TITLE = 'm/design — дизайн, автоматизация и ИИ для бизнеса'

// og:description — короткая фраза для превью в мессенджерах,
// description — описание для Яндекса и Google; разные намеренно
useHead({
  title: TITLE,
  meta: [
    {
      name: 'description',
      content: 'Инфографика, ИИ-фото, видеообложки, баннеры, сайты и ИИ-агенты для малого и среднего бизнеса. Визуал и автоматизация, которые работают вместе — от первого показа в выдаче до первого заказа.',
    },
    { property: 'og:title', content: TITLE },
    { property: 'og:description', content: 'Конкуренты уже это сделали. Ваша очередь.' },
    { property: 'og:image', content: OG_HOME },
    { property: 'og:url', content: `${SITE_URL}/` },
  ],
  link: [{ rel: 'canonical', href: `${SITE_URL}/` }],
})
</script>

<template>
  <main>
    <HeroSection />
    <ServicesIntro />
    <ProcessColumns />
    <ReviewsWall />
    <AboutSwitch />
    <FaqSection />
    <ContactCta />
  </main>
</template>
