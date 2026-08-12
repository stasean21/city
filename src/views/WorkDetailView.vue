<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="container">
    <h1>Кейс: {{ route.params.slug }}</h1>
  </main>
</template>
