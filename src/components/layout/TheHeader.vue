<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BaseButton from '../ui/BaseButton.vue'

// «Услуги» и «Процесс» временно убраны — вели на /#services и /#process,
// а этих секций на главной пока нет
const navLinks = [
  { label: 'Работы', to: '/works' },
  { label: 'Обо мне', to: '/about' },
  { label: 'Контакты', to: '/contacts' },
]

const isMenuOpen = ref(false)
const isHidden = ref(false)
const isScrolled = ref(false)

function openMenu() {
  isMenuOpen.value = true
  isHidden.value = false
}

function closeMenu() {
  isMenuOpen.value = false
}

// 66 = --header-h из tokens.css
let lastScrollY = 0

function handleScroll() {
  const currentScrollY = window.scrollY
  isScrolled.value = currentScrollY > 66

  if (isMenuOpen.value || currentScrollY <= 66) {
    isHidden.value = false
  } else {
    isHidden.value = currentScrollY > lastScrollY
  }

  lastScrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header class="site-header" :class="{ 'has-bg': isScrolled && !isHidden }">
    <div class="container site-header__inner" :class="{ 'is-hidden': isHidden }">
      <RouterLink to="/" class="site-header__logo" @click="closeMenu">
        <img src="/logo/logo-light.svg" alt="m/design" width="175" height="51" />
      </RouterLink>

      <nav class="site-header__nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="site-header__link"
          :class="{ 'site-header__link--anchor': link.isAnchor }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <BaseButton to="/contacts" variant="primary" size="large" class="site-header__cta">
        Обсудить задачу
      </BaseButton>

      <button class="site-header__burger" aria-label="Открыть меню" @click="openMenu">
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </button>
    </div>

    <div class="mobile-menu" :class="{ 'is-open': isMenuOpen }">
      <button class="mobile-menu__close" aria-label="Закрыть меню" @click="closeMenu">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </button>

      <nav class="mobile-menu__nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="mobile-menu__link"
          :class="{ 'mobile-menu__link--anchor': link.isAnchor }"
          @click="closeMenu"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <BaseButton to="/contacts" variant="primary" size="large" class="mobile-menu__cta" @click="closeMenu">
        Обсудить задачу
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-h);
  background: transparent;
  transition: background-color var(--ease);
}

.site-header.has-bg {
  background: var(--bg);
}

.site-header__inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--gap-lg);
  transition: transform var(--ease);
}

.site-header__inner.is-hidden {
  transform: translateY(-100%);
  pointer-events: none;
}

.site-header__logo {
  display: flex;
  align-items: center;
  margin-right: auto;
}

.site-header__logo img {
  display: block;
  height: 24px;
  width: auto;
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: var(--gap-lg);
}

.site-header__link {
  font: 500 13px/20px var(--f-body);
  color: var(--ink);
  opacity: 0.85;
  padding: 8px 16px;
  border-radius: var(--r-pill);
  background: transparent;
  transition: var(--ease);
}

.site-header__link:hover {
  opacity: 1;
  background: var(--bg-3);
}

/* якорные пункты (Услуги/Процесс) ведут на один и тот же роут "/" —
   router-link-active у них включается одновременно у обоих, поэтому
   постоянную подсветку не показываем, остаётся только hover */
.site-header__link.router-link-active:not(.site-header__link--anchor) {
  opacity: 1;
  background: var(--bg-3);
}

.site-header__burger {
  display: none;
  background: none;
  border: 0;
  color: var(--ink);
  padding: 8px;
}

.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  padding: var(--gutter);
  transform: translateX(100%);
  transition: transform var(--ease);
}

.mobile-menu.is-open {
  transform: translateX(0);
}

.mobile-menu__close {
  align-self: flex-end;
  background: none;
  border: 0;
  color: var(--ink);
  padding: 8px;
}

.mobile-menu__nav {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  margin-top: var(--gap-3xl);
}

.mobile-menu__link {
  font: 500 22px var(--f-head);
  color: var(--ink);
}

.mobile-menu__cta {
  width: 100%;
  margin-top: auto;
}

@media (max-width: 767px) {
  .site-header__nav,
  .site-header__cta {
    display: none;
  }

  .site-header__burger {
    display: block;
  }
}
</style>
