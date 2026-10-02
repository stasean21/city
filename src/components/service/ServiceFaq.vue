<script setup>
import FaqSection from '../sections/FaqSection.vue'

// вопросы услуги — тот же блок, что на главной, со своим JSON-LD
defineProps({
  faq: { type: Object, required: true }, // { title, lead, items: [{ question, answer }] }
})
</script>

<template>
  <FaqSection :title="faq.title" :lead="faq.lead" :items="faq.items" />
</template>
