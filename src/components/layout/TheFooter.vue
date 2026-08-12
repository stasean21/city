<script setup>
import { computed } from 'vue'

const year = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__grid">
      <div class="site-footer__col">
        <RouterLink to="/" class="site-footer__logo">Портфолио</RouterLink>
        <p class="site-footer__meta">[Город] · ИП · ИНН [уточнить]</p>
      </div>

      <div class="site-footer__col">
        <span class="site-footer__heading">Услуги</span>
        <RouterLink to="/#services" class="site-footer__link">Все услуги</RouterLink>
      </div>

      <div class="site-footer__col">
        <span class="site-footer__heading">Навигация</span>
        <RouterLink to="/works" class="site-footer__link">Работы</RouterLink>
        <RouterLink to="/#process" class="site-footer__link">Процесс</RouterLink>
        <RouterLink to="/about" class="site-footer__link">Обо мне</RouterLink>
        <RouterLink to="/contacts" class="site-footer__link">Контакты</RouterLink>
      </div>

      <div class="site-footer__col">
        <span class="site-footer__heading">Связь</span>
        <a href="[telegram]" class="site-footer__link" target="_blank" rel="noopener">Telegram</a>
        <a href="[vk]" class="site-footer__link" target="_blank" rel="noopener">VK</a>
        <a href="mailto:[email]" class="site-footer__link">[email]</a>
      </div>
    </div>

    <div class="container site-footer__bottom">
      <span>© {{ year }} Портфолио</span>
      <RouterLink to="/privacy">Политика конфиденциальности</RouterLink>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--ink);
  color: var(--footer-text);
  padding: 80px 0 0;
  font-size: 13px;
}

.site-footer__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-2xl);
}

.site-footer__col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.site-footer__logo {
  color: var(--white);
  font: 500 15px var(--f-head);
  margin-bottom: var(--gap-sm);
}

.site-footer__meta {
  max-width: none;
  color: var(--footer-text);
}

.site-footer__heading {
  color: var(--white);
  font-size: 13px;
  margin-bottom: var(--gap-md);
}

.site-footer__link {
  display: block;
  width: fit-content;
  color: var(--footer-text);
  padding: 3px 0;
  transition: var(--ease);
}

.site-footer__link:hover {
  color: var(--white);
}

.site-footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-md);
  margin-top: 24px;
  padding: 24px 0;
  border-top: 1px solid var(--footer-border);
}

.site-footer__bottom a {
  color: var(--footer-text);
  transition: var(--ease);
}

.site-footer__bottom a:hover {
  color: var(--white);
}

@media (max-width: 991px) {
  .site-footer__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .site-footer__grid {
    grid-template-columns: 1fr;
  }

  .site-footer__bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
