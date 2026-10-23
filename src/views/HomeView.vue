<script setup>
import { useHead } from '@unhead/vue'
import { OG_HOME, SITE_URL } from '../data/site.js'
import services from '../data/services.json'
import contacts from '../data/contacts.json'
import JsonLd from '../components/ui/JsonLd.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import ServicesIntro from '../components/sections/ServicesIntro.vue'
import ProcessColumns from '../components/sections/ProcessColumns.vue'
import ReviewsWall from '../components/sections/ReviewsWall.vue'
import AboutSwitch from '../components/sections/AboutSwitch.vue'
import FaqSection from '../components/sections/FaqSection.vue'
import ContactCta from '../components/sections/ContactCta.vue'
import { plain } from '../utils/typo.js'

const TITLE = 'm/design — дизайн, автоматизация и ИИ для бизнеса'
const DESCRIPTION = 'Инфографика и карточки для Wildberries, Ozon и Авито, ИИ-фото товаров, видеообложки и ИИ-агенты для бизнеса. Работаю удалённо по всей России.'

// профили, а не номер телефона: WhatsApp в sameAs не кладём
const PROFILES = contacts.filter((contact) => contact.id !== 'whatsapp').map((contact) => contact.url)

// разметка «кто я» для поиска: только то, что есть на сайте — без цен, рейтингов и адреса;
// в каталоге — опубликованные услуги (без draft)
const organization = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'm/design',
  url: `${SITE_URL}/`,
  image: OG_HOME,
  description: DESCRIPTION,
  founder: { '@type': 'Person', name: 'Станислав Мунтяну' },
  areaServed: { '@type': 'Country', name: 'Россия' },
  sameAs: PROFILES,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Услуги',
    itemListElement: services
      .filter((service) => !service.draft)
      .map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: plain(service.title), url: `${SITE_URL}/services/${service.slug}` },
      })),
  },
}

// og:description — короткая фраза для превью в мессенджерах,
// description — описание для Яндекса и Google; разные намеренно
useHead({
  title: TITLE,
  meta: [
    {
      name: 'description',
      content: DESCRIPTION,
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
    <JsonLd :data="organization" />
    <HeroSection />
    <ServicesIntro />
    <ProcessColumns />
    <ReviewsWall />
    <AboutSwitch />
    <FaqSection />
    <ContactCta />
  </main>
</template>
