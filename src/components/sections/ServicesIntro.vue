<script setup>
const categories = [
  { label: 'Инфографика для маркетплейсов', slug: 'infografika-dlya-marketpleysov' },
  { label: 'AI-фотосессии', slug: 'ai-fotosessii' },
  { label: 'Предметная съёмка', slug: 'predmetnaya-syomka' },
  { label: 'Видеообложки', slug: 'videooblozhki' },
  { label: 'Лендинги и сайты', slug: 'lendingi-i-sayty' },
  { label: 'ИИ-агенты', slug: 'ii-agenty' },
]
</script>

<template>
  <section id="services" class="services-intro">
    <div class="container">
      <span class="pill once-in">Что я делаю</span>
      <h2 class="services-intro__title once-in">Услуги и решения</h2>
      <nav class="services-intro__tabs once-in">
        <RouterLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/services/${cat.slug}`"
          class="services-intro__tab"
          :aria-label="cat.label"
        >
          {{ cat.label }}
        </RouterLink>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.services-intro__title {
  margin: 24px 0 40px;
}

.services-intro__tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--gap-sm);
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-soft);
}

.services-intro__tab {
  font: 500 13px/20px var(--f-body);
  color: var(--ink);
  padding: 8px 16px;
  border-radius: var(--r-pill);
  background: var(--white);
  transition: color var(--ease), background-color var(--ease);
}

.services-intro__tab:hover,
.services-intro__tab:focus-visible {
  color: var(--white);
  background: var(--ink);
}

@media (max-width: 991px) {
  .services-intro__tabs {
    flex-wrap: wrap;
    gap: var(--gap-sm);
  }
}

@media (max-width: 767px) {
  .services-intro__tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    margin: 0 calc(var(--gutter) * -1);
    padding-left: var(--gutter);
    padding-right: var(--gutter);
  }

  .services-intro__tabs::-webkit-scrollbar {
    display: none;
  }
}
</style>
