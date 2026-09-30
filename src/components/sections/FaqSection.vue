<script setup>
import { h, ref } from 'vue'
import AccordionItem from '../ui/AccordionItem.vue'
import BaseButton from '../ui/BaseButton.vue'
import faq from '../../data/faq.json'
import contacts from '../../data/contacts.json'

// адрес — из общего списка мессенджеров, заполняется там
const TELEGRAM = contacts.find((c) => c.id === 'telegram').url

// открыт один вопрос; клик по открытому закрывает его
const openIndex = ref(0)

function toggle(i) {
  openIndex.value = openIndex.value === i ? -1 : i
}

// разметка FAQPage для поиска. Не через useHead: vite-ssg 28 рендерит head
// через @unhead 2, а в проекте @unhead/vue 3 — теги из useHead в пререндер
// не попадают. JSON-LD валиден и в body, поэтому выводим его в секции.
// «<» экранируем, чтобы текст не мог закрыть тег script
const faqJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}).replace(/</g, '\\u003c')

// <script> в шаблоне Vue запрещён — отдаём его render-функцией
const JsonLd = () => h('script', { type: 'application/ld+json', innerHTML: faqJsonLd })
</script>

<template>
  <section id="faq" class="faq">
    <JsonLd />
    <div class="container faq__layout">
      <!-- обычный CSS sticky, как в ReviewsWall: без align-self: start
           колонка растянется на высоту сетки и прилипать будет нечему -->
      <div class="faq__intro">
        <span class="pill faq__pill">Вопросы</span>
        <h2 class="display faq__title">Частые вопросы</h2>
        <p class="lead">Не нашли ответ — напишите, отвечу лично.</p>
        <div class="faq__cta">
          <BaseButton :href="TELEGRAM" target="_blank" rel="noopener" variant="primary" arrow>
            Написать в Telegram
          </BaseButton>
        </div>
      </div>

      <div class="faq__list">
        <AccordionItem
          v-for="(item, i) in faq"
          :key="item.question"
          :question="item.question"
          :open="openIndex === i"
          @toggle="toggle(i)"
        >
          {{ item.answer }}
        </AccordionItem>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq__layout {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: var(--s-60);
  align-items: start;
}

.faq__intro {
  position: sticky;
  top: calc(var(--header-top) + var(--header-h) + var(--s-24));
  align-self: start;
}

.faq__pill {
  margin-bottom: var(--sec-pill);
}

.faq__title {
  margin-bottom: var(--sec-lead);
}

.faq__cta {
  margin-top: var(--s-32);
}

.faq__list {
  display: flex;
  flex-direction: column;
  gap: var(--s-12);
  min-width: 0;
}

@media (max-width: 991px) {
  .faq__layout {
    grid-template-columns: 1fr;
  }

  .faq__intro {
    position: static;
  }
}
</style>
