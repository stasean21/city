<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import { consentReady, cookieBarVisible } from '../../utils/consent.js'

// уведомление о cookie: Метрика уже грузится при входе (main.js), плашка только
// сообщает об этом. Ничего не блокирует, фокус не перехватывает. «Принять» и крестик
// одинаково скрывают её навсегда. Только в браузере: в пререндере её нет — у тех,
// кто уже закрыл, она не мигает
const KEY = 'cookie-notice'
const OLD_KEY = 'cookie-consent' // выбор из прежнего окна с галочками — больше не нужен
const HIDDEN_ROUTES = ['not-found', 'styleguide']

const route = useRoute()
const open = ref(false)
const shown = computed(() => open.value && !HIDDEN_ROUTES.includes(route.name))

watch(shown, (value) => { cookieBarVisible.value = value }, { immediate: true })

function close() {
  open.value = false
  try {
    window.localStorage.setItem(KEY, 'closed')
  } catch {
    // хранилище недоступно — плашка покажется и при следующем визите
  }
}

onMounted(() => {
  consentReady.value = true
  try {
    window.localStorage.removeItem(OLD_KEY)
    open.value = window.localStorage.getItem(KEY) !== 'closed'
  } catch {
    open.value = true
  }
})
</script>

<template>
  <Transition name="cookie" appear>
    <div v-if="shown" class="cookie" role="region" aria-label="Уведомление о cookie">
      <p class="small cookie__text">Мы используем <RouterLink to="/cookies" class="text-link">cookies</RouterLink>, чтобы анализировать, как вы пользуетесь сайтом, и улучшать его</p>
      <div class="cookie__actions">
        <BaseButton class="cookie__accept" variant="primary" type="button" @click="close">Принять</BaseButton>
        <button type="button" class="cookie__x" aria-label="Закрыть" @click="close">
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* слева внизу, справа остаётся место под ярлык подарка (--cookie-gift): на 768–800
   плашка в полную ширину заходила на него. Радиус вложенный: кнопка --r-btn + поле --s-12 */
.cookie {
  position: fixed;
  left: var(--s-24);
  bottom: var(--s-24);
  z-index: var(--z-cookie);
  display: flex;
  align-items: center;
  gap: var(--s-12);
  width: min(var(--cookie-w), calc(100vw - 2 * var(--s-24) - var(--cookie-gift)));
  padding: var(--s-12) var(--s-12) var(--s-12) var(--s-24);
  border: var(--hairline) solid var(--border-soft);
  border-radius: calc(var(--r-btn) + var(--s-12));
  background: var(--white);
}

.cookie__text {
  flex: 1;
  min-width: 0;
}

.cookie__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--s-12);
}

.cookie__x {
  display: grid;
  flex: none;
  place-items: center;
  width: var(--cookie-x);
  height: var(--cookie-x);
  padding: 0;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--bg-3);
  color: var(--ink);
  transition: background-color var(--ease);
}

.cookie__x:hover {
  background: var(--bg-4);
}

.cookie__x:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.cookie__x svg {
  width: var(--cookie-x-icon);
  height: var(--cookie-x-icon);
}

.cookie-enter-active,
.cookie-leave-active {
  transition: opacity .4s var(--ease-out), transform .4s var(--ease-out);
}

.cookie-enter-from,
.cookie-leave-to {
  opacity: 0;
  transform: translateY(var(--s-16));
}

/* телефон: над нижней панелью, как ярлык подарка; текст сверху, под ним кнопки */
@media (max-width: 767px) {
  .cookie {
    right: var(--s-12);
    left: var(--s-12);
    bottom: calc(var(--dock-h) + var(--s-16) + var(--s-12) + env(safe-area-inset-bottom));
    flex-direction: column;
    align-items: stretch;
    width: auto;
    padding: var(--s-16) var(--s-12) var(--s-12);
  }

  .cookie__text {
    padding: 0 var(--s-8);
  }

  .cookie__accept {
    flex: 1;
    justify-content: center;
  }
}
</style>
