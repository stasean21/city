<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StackMarquee from '../components/ui/StackMarquee.vue'
import services from '../data/services.json'

const route = useRoute()
const service = computed(() => services.find((s) => s.slug === route.params.slug))
</script>

<template>
  <main class="container">
    <h1>Услуга: {{ route.params.slug }}</h1>
    <StackMarquee v-if="service?.stack?.length" :items="service.stack" />
  </main>
</template>
