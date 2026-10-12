<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import RollingText from '../ui/RollingText.vue'
import { useActiveSection } from '../../composables/useActiveSection.js'
import { messengers } from '../../utils/messengers.js'
import { headerOffset, scrollBehaviorMode } from '../../utils/headerOffset.js'

// сколько шапка остаётся на экране после перехода к блоку, мс
const HEADER_PIN_MS = 10000

// пункты — блоки главной; с любой страницы ведут на главную к блоку,
// отступ под шапку даёт scrollBehavior в main.js
const navLinks = [
  { label: 'Услуги',       hash: '#services' },
  { label: 'Этапы работы', hash: '#process' },
  { label: 'Отзывы',       hash: '#reviews' },
  { label: 'Обо мне',      hash: '#about' },
  { label: 'FAQ',          hash: '#faq' },
]

// мессенджер без логотипа в шторке не показываем — пустая плитка
const menuMessengers = messengers.filter((item) => item.svg)

const route = useRoute()
const router = useRouter()
const activeHash = useActiveSection(navLinks.map((link) => link.hash))

// тот же адрес (главная с этим hash) роутер считает дублем: навигации нет,
// scrollBehavior не вызывается, а пользователь мог уже уехать от блока.
// Прокручиваем сами тем же расчётом отступа. afterEach тут не сработает —
// закрепляем шапку здесь же
function onNavClick(hash) {
  if (route.path !== '/' || route.hash !== hash) return
  const el = document.querySelector(hash)
  if (!el) return
  pinHeader()
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset()
  window.scrollTo({ top, behavior: scrollBehaviorMode() })
}

const isMenuOpen = ref(false)
const isHidden = ref(false)
const isScrolled = ref(false)
const menuButton = ref(null)
const tileEls = ref([])

function openMenu() {
  isMenuOpen.value = true
  isHidden.value = false
  document.body.style.overflow = 'hidden'
  nextTick(() => tileEls.value[0]?.$el?.focus({ preventScroll: true }))
}

function closeMenu() {
  if (!isMenuOpen.value) return
  isMenuOpen.value = false
  document.body.style.overflow = ''
  menuButton.value?.focus({ preventScroll: true })
}

function toggleMenu() {
  if (isMenuOpen.value) closeMenu()
  else openMenu()
}

function onTileClick(hash) {
  closeMenu()
  onNavClick(hash)
}

function handleKeydown(event) {
  if (event.key === 'Escape' && isMenuOpen.value) {
    closeMenu()
  }
}

// после перехода к блоку шапка закреплена: прокрутка к якорю идёт вниз,
// и без этого шапка пряталась бы, едва пользователь до блока доехал
let pinnedUntil = 0
let pinTimer = null

function pinHeader() {
  pinnedUntil = Date.now() + HEADER_PIN_MS
  isHidden.value = false
  clearTimeout(pinTimer)
  // по истечении ничего не прячем сразу — следующая прокрутка решит сама
  pinTimer = setTimeout(() => { pinnedUntil = 0 }, HEADER_PIN_MS)
}

// 70 = --header-h из tokens.css
let lastScrollY = 0

function handleScroll() {
  const currentScrollY = window.scrollY
  isScrolled.value = currentScrollY > 70

  // lastScrollY обновляем и здесь: иначе первое движение после закрепления
  // посчиталось бы большим скачком
  if (Date.now() < pinnedUntil) {
    isHidden.value = false
    lastScrollY = currentScrollY
    return
  }

  if (isMenuOpen.value || currentScrollY <= 70) {
    isHidden.value = false
  } else {
    isHidden.value = currentScrollY > lastScrollY
  }

  lastScrollY = currentScrollY
}

// шторка есть только на телефоне: при развороте на планшет закрываем,
// иначе страница осталась бы без прокрутки
let desktopQuery = null
let removeAfterGuard = null

function handleDesktop(event) {
  if (event.matches) closeMenu()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  desktopQuery = window.matchMedia('(min-width: 768px)')
  desktopQuery.addEventListener('change', handleDesktop)
  // любой переход с якорем: клик на той же странице и приход с другой
  removeAfterGuard = router.afterEach((to) => {
    if (to.hash) pinHeader()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  desktopQuery?.removeEventListener('change', handleDesktop)
  removeAfterGuard?.()
  clearTimeout(pinTimer)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="site-header" :class="{ 'has-bg': isScrolled && !isHidden }">
    <div class="site-header__inner" :class="{ 'is-hidden': isHidden }">
      <RouterLink to="/" class="site-header__logo" @click="closeMenu">
        <img src="/logo/logo-light.svg" alt="m/design" width="175" height="51" />
      </RouterLink>

      <nav class="site-header__nav" aria-label="Блоки главной">
        <RouterLink
          v-for="link in navLinks"
          :key="link.hash"
          :to="{ path: '/', hash: link.hash }"
          active-class=""
          exact-active-class=""
          class="site-header__link"
          :class="{ 'is-active': activeHash === link.hash }"
          :aria-current="activeHash === link.hash ? 'true' : null"
          :aria-label="link.label"
          @click="onNavClick(link.hash)"
        >
          <RollingText :text="link.label" :step="30" />
        </RouterLink>
      </nav>

      <!-- на планшете «задачу» прячется: пять пунктов и полная подпись не помещаются -->
      <BaseButton
        to="/#contact"
        variant="primary"
        arrow
        class="site-header__cta"
        aria-label="Обсудить задачу"
        @click="onNavClick('#contact')"
      >
        Обсудить<span class="site-header__cta-tail"> задачу</span>
      </BaseButton>
    </div>

    <!-- телефон: затемнение, шторка и нижняя панель. Порядок в DOM = порядок
         слоёв: панель поверх шторки, шторка поверх затемнения -->
    <div class="menu-overlay" :class="{ 'is-open': isMenuOpen }" aria-hidden="true" @click="closeMenu"></div>

    <div
      id="site-mobile-menu"
      class="menu-sheet"
      :class="{ 'is-open': isMenuOpen }"
      role="dialog"
      aria-modal="true"
      aria-label="Меню"
      :inert="!isMenuOpen"
    >
      <span class="menu-sheet__grip" aria-hidden="true"></span>

      <nav class="menu-sheet__grid" aria-label="Блоки главной">
        <RouterLink
          v-for="(link, i) in navLinks"
          :key="link.hash"
          ref="tileEls"
          :to="{ path: '/', hash: link.hash }"
          active-class=""
          exact-active-class=""
          class="menu-tile"
          :class="{ 'is-active': activeHash === link.hash }"
          :aria-current="activeHash === link.hash ? 'true' : null"
          @click="onTileClick(link.hash)"
        >
          <span class="caption menu-tile__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="h3 menu-tile__label">{{ link.label }}</span>
        </RouterLink>
      </nav>

      <ul class="menu-sheet__messengers">
        <li v-for="item in menuMessengers" :key="item.id">
          <a
            :href="item.url"
            class="menu-messenger"
            target="_blank"
            rel="noopener"
            :aria-label="item.name"
          >
            <span class="menu-messenger__icon" aria-hidden="true" v-html="item.svg"></span>
          </a>
        </li>
      </ul>
    </div>

    <div class="dock on-dark" :class="{ 'is-open': isMenuOpen }">
      <button
        ref="menuButton"
        type="button"
        class="ui dock__menu"
        aria-controls="site-mobile-menu"
        :aria-expanded="isMenuOpen"
        :aria-label="isMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
        @click="toggleMenu"
      >
        <span class="dock__icon" aria-hidden="true"><i></i><i></i></span>
        Меню
      </button>

      <BaseButton to="/#contact" variant="primary" arrow class="dock__cta" @click="closeMenu(); onNavClick('#contact')">
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
  /* как .container: содержимое шапки ровно по краям контента страницы */
  max-width: calc(var(--container) + 2 * var(--gutter));
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--gutter);
  display: flex;
  align-items: center;
  border-radius: calc(var(--header-h) / 2);
  background: transparent;
  transition: transform var(--ease), background-color var(--ease);
  pointer-events: auto;
}

/* фон — только когда панель реально показана
   (проскроллили вниз и сейчас скроллим вверх) */
.site-header.has-bg .site-header__inner {
  background: var(--bg);
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
  flex: none;
  align-items: center;
  margin-right: auto;
}

.site-header__logo img {
  display: block;
  height: var(--logo-h);
  width: auto;
}

.site-header__nav {
  display: flex;
  align-items: center;
}

.site-header__link {
  --roll-h: 1.375em;
  font: 500 var(--t-ui)/1.375 var(--f-body);
  color: var(--ink);
  opacity: 0.85;
  padding: var(--nav-link-py) var(--nav-link-px);
  border-radius: var(--r-pill);
  background: transparent;
  white-space: nowrap;
  transition: opacity var(--ease), background-color var(--ease);
}

/* --nav-gap-dense — от текста до текста; паддинги капсул больше половины
   зазора, поэтому соседние капсулы заходят друг под друга */
.site-header__link + .site-header__link {
  margin-left: calc(var(--nav-gap-dense) - 2 * var(--nav-link-px));
}

.site-header__link:hover,
.site-header__link.is-active {
  opacity: 1;
  background: var(--bg-3);
}

/* буквы катаются внутри RollingText — :deep() пробивает её собственный
   scoped-стиль, чтобы hover пункта меню мог их запустить */
.site-header__link:hover :deep(.roll span) {
  transform: translateY(-100%);
}

.site-header__link:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

/* от текста последнего пункта до кнопки — --nav-gap;
   слева от пунктов места даёт margin-right: auto у логотипа */
.site-header__cta {
  flex: none;
  margin-left: calc(var(--nav-gap) - var(--nav-link-px));
  white-space: nowrap;
}

@media (max-width: 991px) {
  .site-header__cta-tail {
    display: none;
  }
}

/* телефон: затемнение, шторка, нижняя панель — только ≤767 */
.menu-overlay,
.menu-sheet,
.dock {
  display: none;
}

@media (max-width: 767px) {
  .site-header__nav,
  .site-header__cta {
    display: none;
  }

  /* сверху только логотип, без подложки */
  .site-header.has-bg .site-header__inner {
    background: transparent;
  }

  .menu-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: var(--overlay);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--ease);
  }

  .menu-overlay.is-open {
    opacity: 1;
    pointer-events: auto;
  }

  .menu-sheet {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: var(--s-12) var(--s-12) calc(var(--dock-h) + var(--s-32) + env(safe-area-inset-bottom));
    background: var(--bg);
    border-radius: var(--r-stage) var(--r-stage) 0 0;
    transform: translateY(100%);
    transition: transform var(--ease);
    pointer-events: auto;
  }

  .menu-sheet.is-open {
    transform: translateY(0);
  }

  .menu-sheet__grip {
    align-self: center;
    width: var(--grip-w);
    height: var(--grip-h);
    margin-bottom: var(--s-16);
    border-radius: var(--r-pill);
    background: var(--bg-3);
  }

  .menu-sheet__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s-8);
  }

  .menu-tile {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: var(--tile-h);
    padding: var(--s-12) var(--s-16);
    border-radius: var(--r-card);
    background: var(--white);
    color: var(--ink);
    transition: background-color var(--ease), color var(--ease);
  }

  /* пятая плитка (FAQ) — на всю ширину, ниже, номер и название в строку */
  .menu-tile:last-child {
    grid-column: span 2;
    height: var(--tile-h-wide);
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: var(--s-16);
  }

  /* .h3 из base.css красит в --ink — цвет берём у плитки */
  .menu-tile__label {
    color: inherit;
  }

  .menu-tile__num {
    color: var(--text-3);
    transition: color var(--ease);
  }

  .menu-tile.is-active {
    background: var(--ink);
    color: var(--white);
  }

  .menu-tile.is-active .menu-tile__num {
    color: var(--accent);
  }

  .menu-sheet__messengers {
    display: flex;
    gap: var(--s-8);
    margin-top: var(--s-12);
  }

  .menu-sheet__messengers li {
    flex: 1;
  }

  .menu-messenger {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--dock-msg-h);
    border-radius: var(--r-card);
    background: var(--white);
  }

  .menu-messenger__icon {
    width: var(--footer-icon);
    height: var(--footer-icon);
  }

  .menu-messenger__icon :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .menu-tile:focus-visible,
  .menu-messenger:focus-visible {
    outline: var(--focus-ring) solid var(--ink);
    outline-offset: var(--focus-ring);
  }

  /* нижняя панель-капсула: видна всегда, поверх шторки */
  .dock {
    display: flex;
    align-items: center;
    gap: var(--dock-pad);
    position: fixed;
    left: var(--s-12);
    right: var(--s-12);
    bottom: calc(var(--s-16) + env(safe-area-inset-bottom));
    height: var(--dock-h);
    padding: var(--dock-pad);
    border-radius: var(--r-pill);
    background: var(--ink);
    pointer-events: auto;
  }

  /* у капсул --r-pill вложенное скругление (панель − отступ) выходит само */
  .dock__menu {
    display: flex;
    align-items: center;
    gap: var(--s-8);
    height: calc(var(--dock-h) - 2 * var(--dock-pad));
    padding: 0 var(--s-16) 0 var(--s-12);
    border: 0;
    border-radius: var(--r-pill);
    background: var(--ink-soft);
    color: var(--white);
    cursor: pointer;
  }

  /* две линии; в открытом меню сходятся в крестик */
  .dock__icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: calc(2 * var(--dock-line-gap) - var(--dock-line-w));
    width: var(--dock-icon);
    height: var(--dock-icon);
  }

  .dock__icon i {
    display: block;
    width: var(--dock-line);
    height: var(--dock-line-w);
    background: currentColor;
    transition: transform var(--ease);
  }

  .dock.is-open .dock__icon i:first-child {
    transform: translateY(var(--dock-line-gap)) rotate(45deg);
  }

  .dock.is-open .dock__icon i:last-child {
    transform: translateY(calc(-1 * var(--dock-line-gap))) rotate(-45deg);
  }

  /* .on-dark у панели делает primary белой с тёмным текстом */
  .dock .dock__cta {
    flex: 1;
    justify-content: center;
    height: calc(var(--dock-h) - 2 * var(--dock-pad));
    border-radius: var(--r-pill);
    white-space: nowrap;
  }

  .dock__menu:focus-visible,
  .dock .dock__cta:focus-visible {
    outline: var(--focus-ring) solid var(--white);
    outline-offset: var(--focus-ring);
  }
}
</style>
