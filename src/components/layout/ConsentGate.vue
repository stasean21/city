<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import ConsentCheckbox from '../ui/ConsentCheckbox.vue'
import { closeConsent, consentOpen, consentReady, openConsent, readConsent, writeConsent } from '../../utils/consent.js'
import { loadMetrika } from '../../utils/metrika.js'

// окно согласия при входе: без первой галочки на сайт не пройти, поэтому ни Esc,
// ни клик по подложке его не закрывают. Только в браузере: в пререндере окна нет,
// текст страницы остаётся в HTML
const ENTER_MS = 400
const LEAVE_MS = 300

const mounted = ref(false)
const panelEl = ref(null)
const policy = ref(false)
const metrika = ref(false)
const duration = ref({ enter: ENTER_MS, leave: LEAVE_MS })

// выбор этой вкладки: при недоступном хранилище запомнить его больше негде
let current = null
let returnFocus = null

function setInert(on) {
  document.getElementById('app')?.toggleAttribute('inert', on)
  // класс, а не инлайн-стиль: лоадер сбрасывает инлайн overflow у html
  document.documentElement.classList.toggle('is-scroll-locked', on)
}

function focusable() {
  return [...panelEl.value.querySelectorAll('a[href], input:not(:disabled), button:not(:disabled)')]
}

// Tab ходит только внутри окна
function onKeydown(event) {
  if (event.key !== 'Tab') return
  const items = focusable()
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// flush: 'sync' — запомнить фокус нужно раньше, чем страница станет inert и сбросит его
watch(consentOpen, async (open) => {
  if (!open) return
  returnFocus = document.activeElement
  policy.value = current !== null
  metrika.value = current === 'all'
  setInert(true)
  await nextTick()
  panelEl.value?.querySelector('input[type="checkbox"]')?.focus({ preventScroll: true })
}, { flush: 'sync' })

function accept() {
  if (!policy.value) return
  const next = metrika.value ? 'all' : 'necessary'
  const previous = current
  current = next
  writeConsent(next)
  // загруженную Метрику выгрузить нельзя — только перезагрузка
  if (previous === 'all' && next === 'necessary') {
    window.location.reload()
    return
  }
  setInert(false)
  closeConsent()
  if (next === 'all') loadMetrika()
  returnFocus?.focus?.({ preventScroll: true })
  returnFocus = null
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) duration.value = 0
  mounted.value = true
  current = readConsent()
  if (current === null) {
    openConsent()
    return
  }
  consentReady.value = true
  if (current === 'all') loadMetrika()
})

onUnmounted(() => {
  setInert(false)
})
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <Transition name="consent" appear :duration="duration">
      <div v-if="consentOpen" class="consent">
        <div
          ref="panelEl"
          class="consent__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-title"
          @keydown="onKeydown"
        >
          <img class="consent__logo" src="/logo/logo-light.svg" alt="m/design" width="175" height="51" />
          <h2 id="consent-title" class="h2 consent__title">Прежде чем начать</h2>
          <p class="consent__text">Мы используем файлы cookie и сервис Яндекс.Метрика, чтобы анализировать посещаемость и улучшать сайт. Подробнее — в <RouterLink to="/privacy" class="text-link" target="_blank" rel="noopener">Политике обработки персональных данных</RouterLink>.</p>

          <div class="consent__rows">
            <ConsentCheckbox v-model:checked="policy" class="consent__row">
              Я ознакомлен(а) с <RouterLink to="/privacy" class="text-link" target="_blank" rel="noopener">Политикой обработки персональных данных</RouterLink>
              <span class="consent__tag consent__tag--required">обязательно</span>
            </ConsentCheckbox>
            <ConsentCheckbox v-model:checked="metrika" class="consent__row">
              Разрешаю cookie и Яндекс.Метрику для анализа посещаемости
              <span class="consent__tag">по желанию</span>
            </ConsentCheckbox>
          </div>

          <BaseButton class="consent__go" variant="primary" type="button" :disabled="!policy" @click="accept">Перейти на сайт</BaseButton>
          <p class="small consent__hint" aria-live="polite">
            <template v-if="!policy">Отметьте первый пункт, чтобы продолжить</template>
            <template v-else-if="metrika">Метрика подключится после перехода</template>
            <template v-else>Метрика не подключится</template>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* подложка: сайт под окном размыт, клики до него не доходят */
.consent {
  position: fixed;
  inset: 0;
  z-index: var(--z-consent);
  display: grid;
  place-items: center;
  padding: var(--gutter);
  background: var(--consent-veil);
  -webkit-backdrop-filter: var(--consent-blur);
  backdrop-filter: var(--consent-blur);
}

.consent__panel {
  width: 100%;
  max-width: var(--consent-w);
  max-height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--consent-pad);
  border-radius: var(--r-consent);
  background: var(--white);
}

.consent__logo {
  width: auto;
  height: var(--logo-h);
}

.consent__title {
  margin-top: var(--s-24);
}

.consent__text {
  margin-top: var(--s-12);
}

.consent__rows {
  display: grid;
  gap: var(--s-8);
  margin-top: var(--s-24);
}

.consent__row {
  --check-pad: var(--s-12) var(--s-16);
  border-radius: var(--r-btn);
  background: var(--bg);
}

.consent__tag {
  display: inline-block;
  margin-left: var(--s-4);
  padding: 0 var(--consent-tag-px);
  border-radius: var(--r-sm);
  background: var(--white);
  font: 500 var(--t-consent-tag)/1.6 var(--f-body);
  color: var(--text-3);
  white-space: nowrap;
}

.consent__tag--required {
  color: var(--accent);
}

.consent__go {
  justify-content: center;
  width: 100%;
  margin-top: var(--s-24);
}

.consent__hint {
  margin-top: var(--s-12);
  color: var(--text-3);
  text-align: center;
}

/* появление и закрытие */
.consent-enter-active,
.consent-leave-active {
  transition: opacity .3s ease;
}

.consent-leave-active {
  pointer-events: none;
}

.consent-enter-active .consent__panel {
  transition: opacity .4s var(--ease-out), transform .4s var(--ease-out);
}

.consent-leave-active .consent__panel {
  transition: opacity .3s ease, transform .3s ease;
}

.consent-enter-from,
.consent-leave-to {
  opacity: 0;
}

.consent-enter-from .consent__panel,
.consent-leave-to .consent__panel {
  opacity: 0;
  transform: translateY(var(--s-24));
}

/* на телефоне — снизу экрана; выше экрана прокручивается внутри себя */
@media (max-width: 767px) {
  .consent {
    place-items: end stretch;
    padding: var(--s-12) var(--s-12) calc(var(--s-12) + env(safe-area-inset-bottom));
  }

  .consent__panel {
    max-width: none;
  }
}
</style>
