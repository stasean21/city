<script setup>
import RicochetArrow from '../ui/RicochetArrow.vue'
import { messengers as items } from '../../utils/messengers.js'
</script>

<template>
  <section id="contact" class="contact">
    <div class="container">
      <div class="contact__head">
        <div class="contact__intro">
          <span class="pill">Связаться</span>
          <h2 class="display">Обсудим задачу?</h2>
        </div>
        <p class="lead">Расскажите, что продаёте и где, — предложу, с чего начать.</p>
      </div>

      <ul class="contact__list">
        <li v-for="item in items" :key="item.id">
          <a
            :href="item.url"
            class="contact__row"
            target="_blank"
            rel="noopener"
            :aria-label="`Написать в ${item.name}`"
          >
            <span class="contact__label">
              <span v-if="item.svg" class="contact__icon" v-html="item.svg"></span>
              <span v-else class="contact__icon is-empty"></span>
              <span class="contact__name">{{ item.name }}</span>
            </span>
            <RicochetArrow class="contact__arrow" size="var(--contact-arrow)" />
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* шапка — как в ProcessColumns: слева pill и заголовок, справа лид по низу */
.contact__head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-24);
  align-items: end;
  margin-bottom: var(--s-40);
}

.contact__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sec-pill);
}

/* список: линия сверху у списка и снизу у каждой строки */
.contact__list {
  border-top: var(--hairline) solid var(--ink);
}

.contact__row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-24);
  padding: var(--s-24) 0;
  overflow: hidden;
  color: var(--ink);
  border-bottom: var(--hairline) solid var(--ink);
}

/* заливка поднимается снизу */
.contact__row::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--ink);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform .5s var(--ease-out);
}

.contact__label,
.contact__arrow {
  position: relative;
  z-index: 1;
}

/* в «горящей» строке стрелка отходит от края заливки на столько же,
   на сколько сдвигается название, — поля слева и справа равны */
.contact__arrow {
  transition: transform .45s var(--ease-out);
}

.contact__label {
  display: flex;
  align-items: center;
  gap: var(--s-20);
  min-width: 0;
  transition: transform .45s var(--ease-out);
}

.contact__icon {
  flex: none;
  width: var(--contact-icon);
  height: var(--contact-icon);
}

.contact__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.contact__icon.is-empty {
  background-color: var(--bg-3);
  border-radius: var(--r-pill);
}

.contact__name {
  font: 700 var(--t-contact)/1 var(--f-head);
  letter-spacing: var(--ls-contact);
  white-space: nowrap;
  transition: color .45s var(--ease-out);
}

/* «горящая» строка: фокус с клавиатуры, ховер мышью, :active на тач */
.contact__row:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.contact__row:focus-visible::before {
  transform: scaleY(1);
}

.contact__row:focus-visible .contact__label {
  transform: translateX(var(--s-16));
}

.contact__row:focus-visible .contact__name {
  color: var(--white);
}

.contact__row:focus-visible .contact__arrow {
  --ricochet-p: 1;
  --ricochet-second: var(--accent);
  transform: translateX(calc(-1 * var(--s-16)));
}

@media (hover: hover) {
  .contact__row:hover::before {
    transform: scaleY(1);
  }

  .contact__row:hover .contact__label {
    transform: translateX(var(--s-16));
  }

  .contact__row:hover .contact__name {
    color: var(--white);
  }

  .contact__row:hover .contact__arrow {
    --ricochet-p: 1;
    --ricochet-second: var(--accent);
    transform: translateX(calc(-1 * var(--s-16)));
  }
}

@media (hover: none) {
  .contact__row:active::before {
    transform: scaleY(1);
  }

  .contact__row:active .contact__label {
    transform: translateX(var(--s-16));
  }

  .contact__row:active .contact__name {
    color: var(--white);
  }

  .contact__row:active .contact__arrow {
    --ricochet-p: 1;
    --ricochet-second: var(--accent);
    transform: translateX(calc(-1 * var(--s-16)));
  }
}

@media (max-width: 767px) {
  .contact__head {
    grid-template-columns: 1fr;
    gap: var(--sec-lead);
  }
}
</style>
