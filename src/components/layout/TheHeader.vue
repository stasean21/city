<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import RollingText from '../ui/RollingText.vue'

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
  document.body.style.overflow = 'hidden'
}

function closeMenu() {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

function handleKeydown(event) {
  if (event.key === 'Escape' && isMenuOpen.value) {
    closeMenu()
  }
}

// 70 = --header-h из tokens.css
let lastScrollY = 0

function handleScroll() {
  const currentScrollY = window.scrollY
  isScrolled.value = currentScrollY > 70

  if (isMenuOpen.value || currentScrollY <= 70) {
    isHidden.value = false
  } else {
    isHidden.value = currentScrollY > lastScrollY
  }

  lastScrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="site-header" :class="{ 'has-bg': isScrolled && !isHidden }">
    <div class="site-header__inner" :class="{ 'is-hidden': isHidden }">
      <RouterLink to="/" class="site-header__logo" @click="closeMenu">
        <img src="/logo/logo-light.svg" alt="m/design" width="175" height="51" />
      </RouterLink>

      <nav class="site-header__nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="site-header__link"
          :aria-label="link.label"
        >
          <RollingText :text="link.label" :step="30" />
        </RouterLink>
      </nav>

      <BaseButton to="/contacts" variant="primary" size="lg" arrow class="site-header__cta">
        Обсудить задачу
      </BaseButton>

      <button
        class="site-header__burger"
        aria-label="Открыть меню"
        aria-controls="site-mobile-menu"
        :aria-expanded="isMenuOpen"
        @click="openMenu"
      >
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </button>
    </div>

    <div
      id="site-mobile-menu"
      class="mobile-menu"
      :class="{ 'is-open': isMenuOpen }"
      role="dialog"
      aria-modal="true"
      :inert="!isMenuOpen"
    >
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
          @click="closeMenu"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <BaseButton to="/contacts" variant="primary" size="lg" arrow class="mobile-menu__cta" @click="closeMenu">
        Обсудить задачу
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: var(--header-top);
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-h);
  padding: 0 var(--gutter);
  pointer-events: none;
}

/* фон и скругление — на самой панели, а не на .site-header:
   иначе при скролле подсвечивался бы прямоугольник во всю ширину экрана,
   а не плавающая «таблетка» в границах контейнера */
.site-header__inner {
  max-width: var(--container);
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--gutter);
  display: flex;
  align-items: center;
  gap: var(--gap-lg);
  border-radius: 35px;
  background: transparent;
  transition: transform var(--ease), background-color var(--ease), box-shadow var(--ease);
  pointer-events: auto;
}

/* свечение — временное, для теста; видно только когда панель
   реально показана (проскроллили вниз и сейчас скроллим вверх) */
.site-header.has-bg .site-header__inner {
  background: var(--bg);
  box-shadow: 0 0 16px rgba(255, 0, 0, .15);
}

.site-header__inner.is-hidden {
  /* translateY(-100%) сдвигает только на высоту самой панели —
     этого мало, пока .site-header висит с отступом --header-top от верха,
     нужно убрать оба слагаемых, иначе кусок панели остаётся в кадре */
  transform: translateY(calc(-1 * (var(--header-top) + var(--header-h))));
  pointer-events: none;
}

.site-header__logo {
  display: flex;
  align-items: center;
  margin-right: auto;
}

.site-header__logo img {
  display: block;
  height: 35px;
  width: auto;
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: var(--gap-lg);
}

.site-header__link {
  --roll-h: 22px;
  font: 500 16px/22px var(--f-body);
  color: var(--ink);
  opacity: 0.85;
  /* рамка вокруг текста — тот же масштаб 13→16px применён и к паддингу */
  padding: 10px 20px;
  border-radius: var(--r-pill);
  background: transparent;
  transition: opacity .2s ease, background-color .2s ease;
}

.site-header__link:hover {
  opacity: 1;
  background: var(--bg-3);
}

/* буквы катаются внутри RollingText — :deep() пробивает её собственный
   scoped-стиль, чтобы hover пункта меню мог их запустить */
.site-header__link:hover :deep(.roll span) {
  transform: translateY(-100%);
}

.site-header__link.router-link-active {
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
  pointer-events: auto;
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
  justify-content: space-between;
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
