<script setup>
import { useHead } from '@unhead/vue'

const TITLE = 'Политика конфиденциальности — m/design'
useHead({ title: TITLE, meta: [{ property: 'og:title', content: TITLE }] })

// TODO: текст политики конфиденциальности пришлёт владелец — пока только заголовок.
// Страница открывается из футера («Политика конфиденциальности»), выдумывать текст нельзя
</script>

<template>
  <main class="container">
    <h1>Политика конфиденциальности</h1>
  </main>
</template>
