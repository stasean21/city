<script setup>
import { ref } from 'vue'

// разделы документа: номер, заголовок, абзацы, списки, реквизиты. Один источник вёрстки
// для страниц (LegalDocument) и для политики в окне согласия (ConsentGate).
// sections: [{ id, num, title, items?: [{ text, list? }], requisites? }].
// anchors — ссылки «#» и якоря; в окне их нет: адрес страницы там другой
defineProps({
  sections: { type: Array, required: true },
  anchors: { type: Boolean, default: true },
})

defineEmits(['select'])

const parts = ref([])
defineExpose({ parts })
</script>

<template>
  <div
    v-for="(section, i) in sections"
    :key="section.id"
    ref="parts"
    class="legal__part"
  >
    <h2 :id="anchors ? section.id : null" class="card-title legal__heading">
      <span class="body legal__num">{{ section.num }}</span>
      <span>
        {{ section.title }}
        <RouterLink
          v-if="anchors"
          :to="{ hash: `#${section.id}` }"
          class="body legal__anchor"
          :aria-label="`Ссылка на раздел ${section.num}`"
          active-class=""
          exact-active-class=""
          @click="$emit('select', i)"
        >#</RouterLink>
      </span>
    </h2>

    <template v-for="item in section.items" :key="item.text">
      <p>{{ item.text }}</p>
      <ul v-if="item.list" class="legal__list">
        <li v-for="line in item.list" :key="line">{{ line }}</li>
      </ul>
    </template>

    <div v-if="section.requisites" class="legal__requisites">
      <p v-for="line in section.requisites" :key="line">{{ line }}</p>
    </div>
  </div>
</template>

<style scoped>
.legal__part {
  display: flex;
  flex-direction: column;
  gap: var(--s-12);
  padding-bottom: var(--s-60);
}

.legal__part:last-of-type {
  padding-bottom: 0;
}

.legal__heading {
  display: flex;
  align-items: baseline;
  gap: var(--s-12);
  margin-bottom: var(--s-4);
}

.legal__num {
  flex: none;
  color: var(--accent);
}

.legal__anchor {
  margin-left: var(--s-4);
  color: var(--text-3);
  opacity: 0;
  transition: opacity var(--ease), color var(--ease);
}

.legal__heading:hover .legal__anchor,
.legal__anchor:focus-visible {
  opacity: 1;
}

.legal__anchor:hover {
  color: var(--ink);
}

/* ховера на таче нет — ссылка видна всегда */
@media (hover: none) {
  .legal__anchor {
    opacity: 1;
  }
}

.legal__list {
  display: grid;
  gap: var(--s-8);
}

.legal__list li {
  position: relative;
  max-width: var(--measure-paragraph);
  padding-left: var(--s-20);
}

.legal__list li::before {
  content: '/';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: 500;
}

.legal__requisites {
  padding: var(--s-24);
  border-radius: var(--r-card);
  background: var(--white);
  color: var(--ink);
}

.legal__anchor:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

@media (max-width: 767px) {
  .legal__part {
    padding-bottom: var(--s-40);
  }
}
</style>
