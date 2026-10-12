<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { messengers } from '../../utils/messengers.js'
import { scrollToSameAnchor } from '../../utils/headerOffset.js'
import navLinks from '../../data/nav.json'

const year = computed(() => new Date().getFullYear())
const route = useRoute()

// в футере свой порядок кругов; одноцветные глифы (mono), без них круг не выводим
const ORDER = ['telegram', 'whatsapp', 'vk']
const footerMessengers = ORDER
  .map((id) => messengers.find((item) => item.id === id))
  .filter((item) => item?.mono)

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

        <!-- пункты — те же, что в шапке (data/nav.json) -->
        <nav class="site-footer__nav" aria-label="Навигация в подвале">
          <RouterLink
            v-for="link in navLinks"
            :key="link.hash"
            :to="{ path: '/', hash: link.hash }"
            active-class=""
            exact-active-class=""
            class="site-footer__link"
            @click="scrollToSameAnchor(route, link.hash)"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="site-footer__contacts">
          <a href="mailto:design@muntyanu.ru" class="site-footer__mail">
            <svg class="site-footer__mail-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.6" />
              <path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.6" />
            </svg>
            <span class="site-footer__mail-text">design@muntyanu.ru</span>
          </a>

          <ul class="site-footer__messengers">
            <li v-for="item in footerMessengers" :key="item.id">
              <a
                :href="item.url"
                class="site-footer__messenger"
                target="_blank"
                rel="noopener"
                :aria-label="`Написать в ${item.name}`"
              >
                <span class="site-footer__icon" aria-hidden="true" v-html="item.mono"></span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="site-footer__bottom">
        <span class="caption site-footer__legal">© {{ year }} m/design · ИП Мунтяну Станислав · ИНН 366609497266</span>
        <div class="site-footer__meta">
          <RouterLink to="/privacy" class="caption site-footer__privacy">Политика конфиденциальности</RouterLink>
          <button type="button" class="caption site-footer__up" @click="toTop">
            Наверх
            <svg class="site-footer__up-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </button>
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

/* строка 1: логотип · меню по центру · почта и мессенджеры */
.site-footer__top {
  display: flex;
  align-items: center;
  gap: var(--s-16);
  padding-bottom: var(--s-32);
  border-bottom: var(--hairline) solid var(--footer-border);
}

.site-footer__logo {
  display: block;
  flex: none;
}

.site-footer__logo img {
  display: block;
  height: var(--logo-h);
  width: auto;
}

.site-footer__nav {
  display: flex;
  margin-inline: auto;
}

/* капсула ховера — как в шапке по высоте, но поля --s-8: с --nav-link-px
   (и даже с --pill-px) строка не помещается в карточку уже на 992–1085 */
.site-footer__link {
  padding: var(--nav-link-py) var(--s-8);
  border-radius: var(--r-pill);
  font: 500 var(--t-ui)/1.375 var(--f-body);
  color: var(--white);
  opacity: .7;
  white-space: nowrap;
  transition: opacity var(--ease), background-color var(--ease);
}

.site-footer__link:hover {
  opacity: 1;
  background: var(--ink-soft);
}

.site-footer__contacts {
  display: flex;
  align-items: center;
  gap: var(--s-8);
  flex: none;
}

.site-footer__mail {
  display: inline-flex;
  align-items: center;
  gap: var(--s-8);
  height: var(--footer-icon-btn);
  padding: 0 var(--s-16) 0 var(--s-12);
  border-radius: var(--r-pill);
  background: var(--ink-soft);
  font: 500 var(--t-footer-mail)/1.375 var(--f-body);
  color: var(--white);
  white-space: nowrap;
  transition: background-color var(--ease);
}

.site-footer__mail:hover {
  background: var(--ink-hover);
}

.site-footer__mail-icon {
  flex: none;
  width: var(--footer-mail-icon);
  height: var(--footer-mail-icon);
  color: var(--accent);
}

.site-footer__mail-text {
  overflow: hidden;
  text-overflow: ellipsis;
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
  color: var(--white);
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
  align-items: center;
  justify-content: space-between;
  gap: var(--s-16) var(--s-24);
  padding: var(--s-20) 0 var(--s-24);
}

.site-footer__legal {
  color: var(--text-3);
}

.site-footer__meta {
  display: flex;
  align-items: center;
  gap: var(--s-8);
}

.site-footer__privacy,
.site-footer__up {
  padding: var(--s-8) var(--pill-px);
  border-radius: var(--r-pill);
  color: var(--white);
  white-space: nowrap;
  transition: background-color var(--ease);
}

.site-footer__privacy:hover {
  background: var(--ink-soft);
}

.site-footer__up {
  display: inline-flex;
  align-items: center;
  gap: var(--s-8);
  border: 0;
  background: var(--ink-soft);
  cursor: pointer;
}

.site-footer__up:hover {
  background: var(--ink-hover);
}

.site-footer__up-icon {
  width: var(--footer-up-icon);
  height: var(--footer-up-icon);
}

.site-footer a:focus-visible,
.site-footer button:focus-visible {
  outline: var(--focus-ring) solid var(--white);
  outline-offset: var(--focus-ring);
}

/* меню целиком уходит на вторую строку, если в одну не помещается */
@media (max-width: 991px) {
  .site-footer__top {
    flex-wrap: wrap;
  }

  /* текст первого пункта — ровно под логотипом: поле капсулы выносим за край */
  .site-footer__nav {
    order: 1;
    flex-basis: 100%;
    margin-inline: calc(-1 * var(--s-8)) 0;
  }

  .site-footer__contacts {
    margin-left: auto;
  }
}

@media (max-width: 767px) {
  /* снизу запас под нижнюю панель шапки — конец карточки виден над ней */
  .site-footer {
    margin: 0 var(--s-8) calc(var(--dock-h) + var(--s-32) + env(safe-area-inset-bottom));
    padding: var(--s-24) var(--s-20) 0;
  }

  .site-footer__top {
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: nowrap;
  }

  .site-footer__nav {
    order: 0;
    margin-inline: 0;
    flex-wrap: wrap;
    gap: var(--s-4) var(--s-20);
  }

  /* на таче капсула ховера не нужна — без горизонтальных полей */
  .site-footer__link {
    padding-inline: 0;
  }

  /* почта и три круга — в одну строку: почта сжимается, круги нет */
  .site-footer__contacts {
    align-self: stretch;
    margin-left: 0;
  }

  .site-footer__mail {
    flex: 1;
    min-width: 0;
    font-size: var(--t-small);
  }

  .site-footer__messengers li {
    flex: none;
  }

  .site-footer__bottom {
    flex-direction: column;
    align-items: stretch;
  }

  .site-footer__meta {
    justify-content: space-between;
  }

  .site-footer__privacy {
    padding-inline: 0;
  }
}

/* на узком телефоне адрес с конвертом и три круга в строку не помещаются:
   конверт прячем, зазоры сжимаем — адрес виден целиком */
@media (max-width: 479px) {
  .site-footer__contacts,
  .site-footer__messengers {
    gap: var(--s-4);
  }

  .site-footer__mail {
    padding: 0 var(--s-12);
  }

  .site-footer__mail-icon {
    display: none;
  }
}
</style>
