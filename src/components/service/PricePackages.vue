<script setup>
import BaseButton from '../ui/BaseButton.vue'
import SectionHead from '../ui/SectionHead.vue'

defineProps({
  // { title, lead, items: [{ title, note, price, time, list, featured? }],
  //   addons?: { title, lead, items: [{ title, text, price, featured? }] } }
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

      <!-- дополнительные услуги — плитки под тарифами; кнопок нет: «Обсудить» есть выше -->
      <div v-if="packages.addons" class="addons">
        <div class="addons__head">
          <h3 class="card-title">{{ packages.addons.title }}</h3>
          <p class="lead addons__lead">{{ packages.addons.lead }}</p>
        </div>
        <ul class="addons__grid">
          <li
            v-for="(item, i) in packages.addons.items"
            :key="item.title"
            class="addon"
            :class="{ 'is-featured on-dark': item.featured }"
          >
            <span class="caption addon__num">{{ String(i + 1).padStart(2, '0') }}</span>
            <h4 class="h3 addon__title">{{ item.title }}</h4>
            <p class="small addon__text">{{ item.text }}</p>
            <p class="h3 addon__price">{{ item.price }}</p>
          </li>
        </ul>
      </div>
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

/* ---------- дополнительные услуги ---------- */
.addons {
  margin-top: var(--s-60);
  container-type: inline-size;
}

/* шапка — как у секций (SectionHead): заголовок слева, lead справа, по низу */
.addons__head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-24);
  align-items: end;
  margin-bottom: var(--s-24);
}

/* minmax(0, 1fr): длинное слово не раздвигает свою колонку — плитки равные */
.addons__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--s-16);
}

/* пять в ряд — только когда блок почти во всю ширину контейнера:
   уже — «Дополнительный» не помещается в плитку */
@container (min-width: 64rem) {
  .addons__grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.addon {
  display: flex;
  flex-direction: column;
  min-height: var(--addon-h);
  padding: var(--s-24);
  background: var(--white);
  border-radius: var(--r-card);
}

.addon__num {
  color: var(--text-3);
}

/* роль H3, но кегль меньше: 22 в узкую плитку не помещается */
.addon__title {
  margin-top: var(--s-24);
  font-size: var(--t-addon);
}

.addon__text {
  flex: 1;
  margin-top: var(--s-8);
}

.addon__price {
  margin-top: var(--s-16);
  font-size: var(--t-addon);
}

/* «Срочно»: тёмная плитка, номер — единственная оранжевая отметка */
.addon.is-featured {
  background: var(--ink);
}

.addon.is-featured .addon__title,
.addon.is-featured .addon__price {
  color: var(--white);
}

.addon.is-featured .addon__text {
  color: var(--dark-section-text);
}

.addon.is-featured .addon__num {
  color: var(--accent);
}

@media (max-width: 991px) {
  .prices__grid {
    grid-template-columns: 1fr 1fr;
  }

  .addons__head {
    grid-template-columns: 1fr;
    gap: var(--sec-lead);
  }
}

@media (max-width: 767px) {
  .prices__grid {
    grid-template-columns: 1fr;
  }

  .addons__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* поля меньше: в две колонки на 360 иначе не помещается «Дополнительный» */
  .addon {
    min-height: auto;
    padding: var(--s-12);
  }

  /* «Срочно» — на всю ширину */
  .addon.is-featured {
    grid-column: 1 / -1;
  }
}
</style>
