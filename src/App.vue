<script setup>
import TheHeader from './components/layout/TheHeader.vue'
import TheFooter from './components/layout/TheFooter.vue'
import TheLoader from './components/layout/TheLoader.vue'
</script>

<template>
  <TheHeader />
  <RouterView />
  <TheFooter />
  <TheLoader />
</template>
