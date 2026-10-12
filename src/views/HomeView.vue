<script setup>
import { useHead } from '@unhead/vue'
import HeroSection from '../components/sections/HeroSection.vue'
import ServicesIntro from '../components/sections/ServicesIntro.vue'
import ProcessColumns from '../components/sections/ProcessColumns.vue'
import ReviewsWall from '../components/sections/ReviewsWall.vue'
import AboutSwitch from '../components/sections/AboutSwitch.vue'
import FaqSection from '../components/sections/FaqSection.vue'
import ContactCta from '../components/sections/ContactCta.vue'

useHead({
  title: 'm/design — инфографика и ИИ-фото для маркетплейсов',
  meta: [{
    name: 'description',
    content: 'Инфографика, ИИ-фото, видеообложки, баннеры, сайты и ИИ-агенты для малого и среднего бизнеса. Визуал и автоматизация, которые работают вместе — от первого показа в выдаче до первого заказа.',
  }],
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
