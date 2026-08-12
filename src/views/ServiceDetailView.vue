<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="container">
    <h1>Услуга: {{ route.params.slug }}</h1>
  </main>
</template>
