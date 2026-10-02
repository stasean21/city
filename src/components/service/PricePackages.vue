<script setup>
import BaseButton from '../ui/BaseButton.vue'
import SectionHead from '../ui/SectionHead.vue'

defineProps({
  // { title, lead, items: [{ title, note, price, time, list, featured? }] }
  packages: { type: Object, required: true },
})
</script>

<template>
  <section id="prices" class="prices">
    <div class="container">
      <SectionHead pill="Стоимость" :title="packages.title" :lead="packages.lead" />
      <ul class="prices__grid">
        <!-- выделенный пакет тёмный; .on-dark переключает кнопку на светлую -->
        <li
          v-for="item in packages.items"
          :key="item.title"
          class="price"
          :class="{ 'is-featured on-dark': item.featured }"
        >
          <h3 class="card-title price__title">{{ item.title }}</h3>
          <p class="small price__note">{{ item.note }}</p>
          <p class="num-sm price__price">{{ item.price }}</p>
          <p class="small price__time">{{ item.time }}</p>
          <ul class="small price__list">
            <li v-for="line in item.list" :key="line">{{ line }}</li>
          </ul>
          <BaseButton to="#contact" :variant="item.featured ? 'primary' : 'secondary'" arrow class="price__cta">
            Обсудить
          </BaseButton>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* карточки одной высоты: сетка растягивает, кнопка прижата к низу */
.prices__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--s-16);
}

.price {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--s-32);
  background: var(--white);
  border-radius: var(--r-card);
}

.price__note {
  margin-top: var(--s-8);
}

.price__price {
  margin-top: var(--s-24);
}

.price__time {
  margin-top: var(--s-8);
}

.price__list {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
  align-self: stretch;
  margin-top: var(--s-24);
  padding-top: var(--s-24);
  border-top: var(--hairline) solid var(--border);
}

.price__list li {
  display: flex;
  align-items: baseline;
  gap: var(--s-12);
  color: var(--ink);
}

/* пустая точка встаёт низом на базовую линию — центр приходится
   на середину строчных букв первой строки */
.price__list li::before {
  content: "";
  flex: none;
  width: var(--dot);
  height: var(--dot);
  background: var(--accent);
  border-radius: var(--r-pill);
}

.price__cta {
  margin-top: auto;
}

/* отступ до кнопки, даже если список короткий */
.price__list {
  margin-bottom: var(--s-32);
}

.price.is-featured {
  background: var(--ink);
}

.is-featured .price__title,
.is-featured .price__price,
.is-featured .price__list li {
  color: var(--white);
}

.is-featured .price__note,
.is-featured .price__time {
  color: var(--dark-section-text);
}

.is-featured .price__list {
  border-top-color: var(--footer-border);
}

@media (max-width: 991px) {
  .prices__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 767px) {
  .prices__grid {
    grid-template-columns: 1fr;
  }
}
</style>
