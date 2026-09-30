<script setup>
import { computed } from 'vue'
import { messengers } from '../../utils/messengers.js'

const year = computed(() => new Date().getFullYear())

const navLinks = [
  { label: 'Работы', to: '/works' },
  { label: 'Процесс', to: '/#process' },
  { label: 'Обо мне', to: '/about' },
  { label: 'Вопросы', to: '/#faq' },
  { label: 'Контакты', to: '/contacts' },
]

function toTop() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
}
</script>

<template>
  <footer class="site-footer on-dark">
    <div class="container">
      <div class="site-footer__top">
        <RouterLink to="/" class="site-footer__logo">
          <img src="/logo/logo-dark.svg" alt="m/design" width="175" height="51" loading="lazy" />
        </RouterLink>

        <nav class="site-footer__nav" aria-label="Навигация в подвале">
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="small site-footer__link">
            {{ link.label }}
          </RouterLink>
        </nav>

        <ul class="site-footer__messengers">
          <li v-for="item in messengers" :key="item.id">
            <a
              :href="item.url"
              class="site-footer__messenger"
              target="_blank"
              rel="noopener"
              :aria-label="`Написать в ${item.name}`"
            >
              <span v-if="item.svg" class="site-footer__icon" v-html="item.svg"></span>
            </a>
          </li>
        </ul>
      </div>

      <div class="caption site-footer__bottom">
        <span>© {{ year }} m/design · работаю по всей России · физлица и юрлица — по договору · ИП [ФИО] · ИНН [—]</span>
        <div class="site-footer__meta">
          <RouterLink to="/privacy" class="site-footer__link">Политика конфиденциальности</RouterLink>
          <button type="button" class="site-footer__link site-footer__up" @click="toTop">Наверх ↑</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* плавающая тёмная карточка с отступом от краёв экрана */
.site-footer {
  margin: 0 var(--s-16) var(--s-16);
  padding: var(--s-32) var(--s-40) 0;
  background: var(--ink);
  border-radius: var(--r-footer);
  color: var(--footer-text);
}

/* ширина содержимого — как у контента страницы: поля даёт сама карточка,
   поэтому у контейнера внутри своих полей нет */
.site-footer .container {
  max-width: var(--container);
  padding-inline: 0;
}

/* строка 1: логотип · меню · мессенджеры */
.site-footer__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-24);
  padding-bottom: var(--s-32);
}

.site-footer__logo {
  display: block;
}

.site-footer__logo img {
  height: var(--logo-h);
  width: auto;
}

.site-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-8) var(--s-32);
}

.site-footer__link {
  color: var(--footer-link);
  transition: color var(--ease);
}

.site-footer__link:hover {
  color: var(--white);
}

.site-footer__messengers {
  display: flex;
  gap: var(--s-8);
}

.site-footer__messenger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--footer-icon-btn);
  height: var(--footer-icon-btn);
  background: var(--ink-soft);
  border-radius: var(--r-pill);
  transition: background-color var(--ease);
}

.site-footer__messenger:hover {
  background: var(--ink-hover);
}

.site-footer__icon {
  width: var(--footer-icon);
  height: var(--footer-icon);
}

.site-footer__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* строка 2: юрданные · политика · наверх */
.site-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--s-16) var(--s-24);
  padding: var(--s-20) 0 var(--s-32);
  border-top: var(--hairline) solid var(--footer-border);
  color: var(--footer-text);
}

.site-footer__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-16) var(--s-24);
}

.site-footer__up {
  padding: 0;
  border: 0;
  background: none;
}

.site-footer a:focus-visible,
.site-footer button:focus-visible {
  outline: var(--focus-ring) solid var(--white);
  outline-offset: var(--focus-ring);
}

@media (max-width: 767px) {
  .site-footer {
    margin: 0 var(--s-8) var(--s-8);
    padding: var(--s-24) var(--s-20) 0;
  }

  .site-footer__top {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--s-24);
  }

  .site-footer__bottom {
    flex-direction: column;
  }
}
</style>
