<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import ServiceHero from '../components/service/ServiceHero.vue'
import BannerFan from '../components/service/BannerFan.vue'
import BannerExamples from '../components/service/BannerExamples.vue'
import PhotoFan from '../components/service/PhotoFan.vue'
import PhotoRows from '../components/service/PhotoRows.vue'
import WorksWall from '../components/service/WorksWall.vue'
import PartsColumns from '../components/service/PartsColumns.vue'
import CardStories from '../components/service/CardStories.vue'
import PricePackages from '../components/service/PricePackages.vue'
import RelatedServices from '../components/service/RelatedServices.vue'
import ServiceFaq from '../components/service/ServiceFaq.vue'
import ContactCta from '../components/sections/ContactCta.vue'
import StackMarquee from '../components/ui/StackMarquee.vue'
import services from '../data/services.json'
import worksData from '../data/works.json'
import { campaigns } from '../utils/banners.js'

// шаблон для всех услуг: блок выводится, только если у услуги есть для него данные
const route = useRoute()
const service = computed(() => services.find((s) => s.slug === route.params.slug))
const page = computed(() => service.value?.page ?? {})

// работы этой услуги по порядку показа
const works = computed(() => worksData
  .filter((work) => work.services.includes(route.params.slug))
  .sort((a, b) => a.order - b.order))

// свой блок примеров вместо стены работ: page.examples — его имя
// (banners — кампании из banners.json, photo — ряды кадров из работ)
const banners = computed(() => (page.value.examples === 'banners' ? campaigns : []))
const photo = computed(() => page.value.examples === 'photo' && works.value.length > 0)
const hasExamples = computed(() => banners.value.length > 0 || works.value.length > 0)

useHead(() => ({
  title: service.value ? `${service.value.title} — m/design` : 'm/design',
  meta: [{ name: 'description', content: page.value.lead ?? service.value?.description ?? '' }],
}))
</script>

<template>
  <main v-if="service">
    <ServiceHero :service="service" :works="works" :examples="hasExamples">
      <template v-if="banners.length" #fan>
        <BannerFan :campaign="banners[0]" />
      </template>
      <template v-else-if="photo" #fan>
        <PhotoFan :works="works" />
      </template>
    </ServiceHero>
    <BannerExamples v-if="banners.length" :campaigns="banners" />
    <PhotoRows v-else-if="photo" :works="works" :title="page.works?.title" :lead="page.works?.lead" />
    <WorksWall v-else-if="works.length" :works="works" />
    <PartsColumns v-if="page.parts" :parts="page.parts" />
    <CardStories v-if="page.process" :process="page.process" :stack="service.stack" />
    <!-- без блока процесса стек стоит отдельно -->
    <section v-else-if="service.stack?.length" class="service-stack">
      <div class="container">
        <StackMarquee :items="service.stack" />
      </div>
    </section>
    <PricePackages v-if="page.packages" :packages="page.packages" />
    <RelatedServices v-if="page.related" :related="page.related" />
    <ServiceFaq v-if="page.faq" :faq="page.faq" />
    <ContactCta />
  </main>
</template>
