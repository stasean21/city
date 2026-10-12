<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import RollingText from '../ui/RollingText.vue'
import { useActiveSection } from '../../composables/useActiveSection.js'
import { messengers, withIdPrefix } from '../../utils/messengers.js'
import { scrollToSameAnchor } from '../../utils/headerOffset.js'
import navLinks from '../../data/nav.json'

// сколько шапка остаётся на экране после перехода к блоку, мс
const HEADER_PIN_MS = 3000

// мессенджер без логотипа в шторке не показываем — пустая плитка.
// Свой префикс id: градиенты логотипов не должны ссылаться на копию в блоке контактов
const menuMessengers = messengers
  .filter((item) => item.svg)
  .map((item) => ({ ...item, svg: withIdPrefix(item.svg, 'sheet-') }))

const route = useRoute()
const router = useRouter()
const activeHash = useActiveSection(navLinks.map((link) => link.hash))

// ---------- скользящая таблетка под активным пунктом ----------
// ссылки — по hash: порядок массива ref в v-for Vue не гарантирует
const linkEls = new Map()
const pillEl = ref(null)
let pillShown = false
let pillFrame = 0

function setLinkEl(hash, comp) {
  if (comp) linkEls.set(hash, comp.$el)
  else linkEls.delete(hash)
}

function placePill() {
  const pill = pillEl.value
  if (!pill) return
  const link = linkEls.get(activeHash.value)
  // активного блока нет — гаснет на месте, без «улёта»
  if (!link) {
    pill.style.opacity = '0'
    pillShown = false
    return
  }
  const move = () => {
    pill.style.width = `${link.offsetWidth}px`
    pill.style.transform = `translateX(${link.offsetLeft}px)`
  }
  if (pillShown) {
    move()
    return
  }
  // из невидимого состояния: сперва без анимации ставим на ссылку, потом проявляем
  pill.style.transition = 'none'
  move()
  void pill.offsetWidth
  pill.style.transition = ''
  pill.style.opacity = '1'
  pillShown = true
}

function onResize() {
  cancelAnimationFrame(pillFrame)
  pillFrame = requestAnimationFrame(placePill)
}

// пункты (data/nav.json, общие с футером) — блоки главной: с любой страницы
// ведут на главную к блоку, отступ под шапку даёт scrollBehavior в main.js.
// Повторный клик по тому же якорю прокручиваем сами; afterEach тогда не
// сработает — закрепляем шапку здесь же
function onNavClick(hash) {
  if (scrollToSameAnchor(route, hash)) pinHeader()
}

const isMenuOpen = ref(false)
const isHidden = ref(false)
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

// до 70px от верха шапка не прячется
let lastScrollY = 0

function handleScroll() {
  const currentScrollY = window.scrollY

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
  // таблетка: ширина пунктов зависит от шрифта — пересчёт и после его загрузки
  watch(activeHash, placePill, { flush: 'post' })
  window.addEventListener('resize', onResize)
  document.fonts?.ready.then(placePill)
  placePill()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  desktopQuery?.removeEventListener('change', handleDesktop)
  removeAfterGuard?.()
  window.removeEventListener('resize', onResize)
  cancelAnimationFrame(pillFrame)
  clearTimeout(pinTimer)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner" :class="{ 'is-hidden': isHidden }">
      <RouterLink to="/" class="site-header__logo" @click="closeMenu">
        <img src="/logo/logo-light.svg" alt="m/design" width="175" height="51" />
      </RouterLink>

      <nav class="site-header__nav" aria-label="Блоки главной">
        <span ref="pillEl" class="site-header__pill" aria-hidden="true"></span>
        <RouterLink
          v-for="link in navLinks"
          :key="link.hash"
          :ref="(comp) => setLinkEl(link.hash, comp)"
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

      <BaseButton
        :to="{ path: '/', hash: '#contact' }"
        variant="primary"
        arrow
        class="site-header__cta"
        @click="onNavClick('#contact')"
      >
        Обсудить задачу
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
            :aria-label="`Написать в ${item.name}`"
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

      <BaseButton :to="{ path: '/', hash: '#contact' }" variant="primary" arrow class="dock__cta" @click="closeMenu(); onNavClick('#contact')">
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

/* вся шапка — одна белая панель в границах контейнера, всегда с фоном.
   Радиус по правилу вложенности: кнопка --r-btn + отступ --header-pad.
   Слева воздух перед логотипом, с трёх других сторон — --header-pad */
.site-header__inner {
  max-width: calc(var(--container) + 2 * var(--gutter));
  height: 100%;
  margin: 0 auto;
  padding: var(--header-pad) var(--header-pad) var(--header-pad) var(--s-24);
  display: flex;
  align-items: center;
  border-radius: var(--header-r);
  background: var(--white);
  transition: transform var(--ease);
  pointer-events: auto;
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

/* меню внутри панели, справа у кнопки; отступы между пунктами дают их поля */
.site-header__nav {
  position: relative;
  display: flex;
  align-items: center;
}

/* бежевая плашка под активным пунктом, по высоте пункта (= кнопки):
   ширину и сдвиг ставит placePill() */
.site-header__pill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: var(--r-btn);
  background: var(--bg);
  opacity: 0;
  transition: transform var(--ease), width var(--ease), opacity var(--ease);
}

.site-header__link {
  --roll-h: 1.375em;
  position: relative;
  font: 500 var(--t-ui)/1.375 var(--f-body);
  color: var(--text);
  /* высота как у .btn: те же поля по вертикали и прозрачная рамка */
  padding: var(--s-8) var(--nav-link-px);
  border: var(--hairline) solid transparent;
  border-radius: var(--r-btn);
  white-space: nowrap;
  transition: color var(--ease);
}

.site-header__link:hover {
  color: var(--ink);
}

/* текст над плашкой */
.site-header__link.is-active {
  z-index: 1;
  color: var(--ink);
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

/* от меню до кнопки — --s-16; слева от меню места даёт margin-right: auto у логотипа */
.site-header__cta {
  flex: none;
  margin-left: var(--s-16);
  white-space: nowrap;
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

  /* сверху только логотип, без подложки и полей панели */
  .site-header__inner {
    padding: 0 var(--gutter);
    border-radius: 0;
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
