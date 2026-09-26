<script setup>
import { computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import services from '../../data/services.json'

const year = computed(() => new Date().getFullYear())

const navLinks = [
  { label: 'Работы', to: '/works' },
  { label: 'Процесс', to: '/#process' },
  { label: 'Обо мне', to: '/about' },
  { label: 'Контакты', to: '/contacts' },
]
</script>

<template>
  <footer class="site-footer on-dark">
    <div class="container">
      <div class="site-footer__cta">
        <p class="display site-footer__title">Есть задача? Обсудим</p>
        <BaseButton href="[telegram]" variant="primary" arrow>Написать в Telegram</BaseButton>
      </div>

      <div class="site-footer__cols">
        <div class="site-footer__col">
          <RouterLink to="/" class="site-footer__logo">
            <img src="/logo/logo-dark.svg" alt="m/design" width="175" height="51" loading="lazy" />
          </RouterLink>
          <p class="small site-footer__about">Дизайн, сайты и ИИ-автоматизация для малого и среднего бизнеса.</p>
        </div>

        <div class="site-footer__col">
          <h4 class="caption site-footer__heading">Услуги</h4>
          <RouterLink
            v-for="service in services"
            :key="service.slug"
            :to="`/services/${service.slug}`"
            class="site-footer__link"
          >
            {{ service.title }}
          </RouterLink>
        </div>

        <div class="site-footer__col">
          <h4 class="caption site-footer__heading">Навигация</h4>
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="site-footer__link">
            {{ link.label }}
          </RouterLink>
        </div>

        <div class="site-footer__col">
          <h4 class="caption site-footer__heading">Связь</h4>
          <a href="[telegram]" class="site-footer__link" target="_blank" rel="noopener">Telegram</a>
          <a href="[vk]" class="site-footer__link" target="_blank" rel="noopener">VK</a>
          <a href="mailto:[email]" class="site-footer__link">[email]</a>
        </div>
      </div>

      <div class="caption site-footer__bottom">
        <span>© {{ year }} m/design · [Город] · ИП [ФИО] · ИНН [—]</span>
        <RouterLink to="/privacy" class="site-footer__legal">Политика конфиденциальности</RouterLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--ink);
  color: var(--footer-text);
  padding: var(--s-120) 0 var(--s-40);
}

.site-footer__cta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--s-24);
  padding-bottom: var(--s-80);
  margin-bottom: var(--s-60);
  border-bottom: var(--hairline) solid var(--footer-border);
}

.site-footer__title {
  color: var(--white);
  max-width: var(--measure-title);
}

.site-footer__cols {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: var(--s-40);
}

.site-footer__logo {
  display: block;
  width: fit-content;
  margin-bottom: var(--s-16);
}

.site-footer__logo img {
  height: var(--logo-h);
  width: auto;
}

.site-footer__about {
  color: var(--footer-text);
  max-width: var(--measure-note);
}

.site-footer__heading {
  color: var(--footer-text);
  margin-bottom: var(--s-16);
}

.site-footer__link {
  display: block;
  width: fit-content;
  padding: var(--s-4) 0;
  color: var(--footer-link);
  transition: color var(--ease);
}

.site-footer__link:hover {
  color: var(--white);
}

.site-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--s-16);
  margin-top: var(--s-80);
  padding-top: var(--s-24);
  border-top: var(--hairline) solid var(--footer-border);
  color: var(--footer-text);
}

.site-footer__legal {
  transition: color var(--ease);
}

.site-footer__legal:hover {
  color: var(--white);
}

.site-footer a:focus-visible {
  outline: var(--focus-ring) solid var(--white);
  outline-offset: var(--focus-ring);
}

@media (max-width: 991px) {
  .site-footer__cols {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 767px) {
  .site-footer {
    padding-top: var(--s-80);
  }

  .site-footer__cols {
    gap: var(--s-32);
  }

  .site-footer__cols > :first-child {
    grid-column: 1 / -1;
  }

  .site-footer__bottom {
    flex-direction: column;
  }
}
</style>
