<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { SITE_URL } from '../data/site.js'
import ServiceHero from '../components/service/ServiceHero.vue'
import BannerFan from '../components/service/BannerFan.vue'
import BannerExamples from '../components/service/BannerExamples.vue'
import PhotoFan from '../components/service/PhotoFan.vue'
import PhotoRows from '../components/service/PhotoRows.vue'
import VideoFan from '../components/service/VideoFan.vue'
import VideoExamples from '../components/service/VideoExamples.vue'
import SiteDevices from '../components/service/SiteDevices.vue'
import SiteExamples from '../components/service/SiteExamples.vue'
import AgentBubbles from '../components/service/AgentBubbles.vue'
import AgentExamples from '../components/service/AgentExamples.vue'
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
// video — лента в выдаче и стена роликов из работ с полем video
const video = computed(() => page.value.examples === 'video' && works.value.length > 0)
// соседи в ленте «Заметна в выдаче» — обложки инфографики
const feedCovers = worksData
  .filter((work) => work.services.includes('infographics'))
  .sort((a, b) => a.order - b.order)
// веер первого экрана: page.fan — слаги работ слева направо, без него — первые по order
const fanWorks = computed(() => {
  const slugs = page.value.fan || []
  const picked = slugs.map((slug) => works.value.find((work) => work.slug === slug)).filter(Boolean)
  return picked.length ? picked : works.value
})
// site — сам этот сайт: скриншоты главной и разметка её блоков
const site = computed(() => page.value.examples === 'site' && page.value.site && page.value.xray)
// agent — демо-переписка и «как агент думает», работ нет
const agent = computed(() => page.value.examples === 'agent' && page.value.demo && page.value.think)
const hasExamples = computed(() => banners.value.length > 0 || works.value.length > 0 || Boolean(site.value) || Boolean(agent.value))

// og:image не задаём — берётся общая из App.vue, пока у услуг нет своих картинок
useHead(() => {
  const title = service.value ? `${service.value.title} — m/design` : 'm/design'
  const description = page.value.lead ?? service.value?.description ?? ''
  const url = `${SITE_URL}/services/${route.params.slug}`
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
    ],
    link: [{ rel: 'canonical', href: url }],
  }
})
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
      <template v-else-if="video" #fan>
        <VideoFan :works="fanWorks" />
      </template>
      <template v-else-if="site" #fan>
        <SiteDevices :site="page.site" />
      </template>
      <template v-else-if="agent" #fan>
        <AgentBubbles />
      </template>
    </ServiceHero>
    <BannerExamples v-if="banners.length" :campaigns="banners" :service-title="service.title" />
    <PhotoRows v-else-if="photo" :works="works" :title="page.works?.title" :lead="page.works?.lead" :service-title="service.title" />
    <SiteExamples v-else-if="site" :site="page.site" :xray="page.xray" />
    <AgentExamples v-else-if="agent" :demo="page.demo" :think="page.think" />
    <VideoExamples
      v-else-if="video"
      :works="works"
      :covers="feedCovers"
      :feed="page.feed"
      :reel="page.works"
      :service-title="service.title"
    />
    <WorksWall v-else-if="works.length" :works="works" :service-title="service.title" />
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
