<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import BaseButton from '../ui/BaseButton.vue'
import ConsentCheckbox from '../ui/ConsentCheckbox.vue'
import LegalBody from '../legal/LegalBody.vue'
import { PRIVACY_DATE, PRIVACY_SECTIONS, PRIVACY_TITLE } from '../../data/legal/privacy.js'
import { CONSENT_KEY, consentOpen, consentReady, isDocumentRoute, readConsent, writeConsent } from '../../utils/consent.js'
import { loadMetrika } from '../../utils/metrika.js'

// окно согласия при входе: без первой галочки на сайт не пройти, поэтому ни Esc,
// ни клик по подложке его не закрывают. Только в браузере: в пререндере окна нет,
// текст страницы остаётся в HTML. На /privacy окна нет: человек должен
// иметь возможность прочитать документ до выбора. Выбор при этом не сделан — уйдёт
// с документа без него, и окно появится снова.
// Политика читается в этом же окне: оно разворачивается, второго окна нет
const ENTER_MS = 400
const LEAVE_MS = 300
const FADE_S = 0.25   // содержимое гаснет и проявляется
const RESIZE_S = 0.6  // окно меняет размер
const RESIZE_EASE = 'power2.inOut' // то же, что cubic-bezier(.65, 0, .35, 1)
const PANEL_PROPS = 'width,height,maxWidth,maxHeight'

const route = useRoute()
const visible = computed(() => consentOpen.value && !isDocumentRoute(route))

const mounted = ref(false)
const panelEl = ref(null)
const policy = ref(false)
const metrika = ref(false)
// view — что выбрано (Esc), shown — что сейчас в окне: при смене сначала гаснет старое
const view = ref('form')
const shown = ref('form')
const morphing = ref(false)
const formEl = ref(null)
const policyEl = ref(null)
const backEl = ref(null)
const duration = ref({ enter: ENTER_MS, leave: LEAVE_MS })

// выбор этой вкладки: при недоступном хранилище запомнить его больше негде
let current = null
let returnFocus = null
let reduced = false
let openedFrom = null // ссылка, с которой открыли политику: при возврате фокус на неё
let morphTween = null
let morphRun = 0

function setInert(on) {
  document.getElementById('app')?.toggleAttribute('inert', on)
  // класс, а не инлайн-стиль: лоадер сбрасывает инлайн overflow у html
  document.documentElement.classList.toggle('is-scroll-locked', on)
}

function currentView() {
  return shown.value === 'policy' ? policyEl.value : formEl.value
}

function focusable() {
  return [...currentView().querySelectorAll('a[href], input:not(:disabled), button:not(:disabled), [tabindex="0"]')]
}

// Tab ходит только внутри текущего вида; Esc — только из политики к форме:
// без первой галочки на сайт не пройти, поэтому форму он не закрывает
function onKeydown(event) {
  if (!visible.value) return
  if (event.key === 'Escape') {
    if (view.value === 'policy') switchView('form')
    return
  }
  if (event.key !== 'Tab') return
  const items = focusable()
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (!items.includes(active)) {
    // фокус на самом окне или снаружи: клик мимо кнопок
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus()
  } else if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

function tween(target, vars) {
  return new Promise((resolve) => {
    morphTween = gsap.to(target, { ...vars, onComplete: resolve })
  })
}

function focusView(next) {
  const target = next === 'policy' ? backEl.value : openedFrom
  target?.focus({ preventScroll: true })
}

// содержимое гаснет → окно меняет размер → новое проявляется. Размер — от замера
// к замеру: у формы высота auto. Новый вызов во время анимации убивает прежний твин
// и идёт от текущего размера окна; промис убитого твина просто не продолжится
async function switchView(next) {
  if (next === view.value) return
  const run = ++morphRun
  morphTween?.kill()
  view.value = next
  const panel = panelEl.value

  if (reduced) {
    shown.value = next
    await nextTick()
    focusView(next)
    return
  }

  const swap = shown.value !== next
  if (swap) await tween(currentView(), { opacity: 0, duration: FADE_S })
  const from = panel.getBoundingClientRect()
  morphing.value = true
  gsap.set(panel, { clearProps: PANEL_PROPS })
  shown.value = next
  await nextTick()
  if (run !== morphRun) return
  const to = panel.getBoundingClientRect()
  const content = currentView()
  if (swap) {
    gsap.set(content, { opacity: 0 })
    focusView(next)
  }
  gsap.set(panel, { width: from.width, height: from.height, maxWidth: 'none', maxHeight: 'none' })
  await tween(panel, { width: to.width, height: to.height, duration: RESIZE_S, ease: RESIZE_EASE })
  gsap.set(panel, { clearProps: PANEL_PROPS })
  morphing.value = false
  await tween(content, { opacity: 1, duration: FADE_S })
  gsap.set(content, { clearProps: 'opacity' })
}

function openPolicy(event) {
  openedFrom = event.currentTarget
  switchView('policy')
}

// окно открывается заново — всегда с формы
function resetView() {
  morphRun += 1
  morphTween?.kill()
  morphTween = null
  morphing.value = false
  view.value = 'form'
  shown.value = 'form'
  openedFrom = null
}

// галочки — от текущего выбора, только при открытии: уход на документ и возврат
// (кнопки браузера) их не сбрасывают
watch(consentOpen, (open) => {
  if (!open) return
  policy.value = current !== null
  metrika.value = current === 'all'
}, { flush: 'sync' })

// flush: 'sync' — запомнить фокус нужно раньше, чем страница станет inert и сбросит его
watch(visible, async (show) => {
  consentReady.value = !show
  if (!show) {
    setInert(false)
    returnFocus?.focus?.({ preventScroll: true })
    returnFocus = null
    return
  }
  returnFocus = document.activeElement
  resetView()
  setInert(true)
  await nextTick()
  panelEl.value?.querySelector('input[type="checkbox"]')?.focus({ preventScroll: true })
}, { flush: 'sync' })

function applyChoice(next) {
  const previous = current
  current = next
  // загруженную Метрику выгрузить нельзя — только перезагрузка
  if (previous === 'all' && next === 'necessary') {
    window.location.reload()
    return
  }
  consentOpen.value = false
  if (next === 'all') loadMetrika()
}

function accept() {
  if (!policy.value) return
  const next = metrika.value ? 'all' : 'necessary'
  writeConsent(next)
  applyChoice(next)
}

// выбор сделан в другой вкладке: эта о нём узнаёт, иначе окно появилось бы здесь снова. Очистка хранилища выбор не отменяет до перезагрузки
function onStorage(event) {
  if (event.key !== CONSENT_KEY) return
  const next = readConsent()
  if (next && next !== current) applyChoice(next)
}

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) duration.value = 0
  mounted.value = true
  window.addEventListener('storage', onStorage)
  window.addEventListener('keydown', onKeydown)
  current = readConsent()
  consentOpen.value = current === null
  // watch(visible) сработает только на изменение; на документе без выбора его нет
  consentReady.value = !visible.value
  if (current === 'all') loadMetrika()
})

onUnmounted(() => {
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('keydown', onKeydown)
  morphTween?.kill()
  setInert(false)
})
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <Transition name="consent" appear :duration="duration">
      <div v-if="visible" class="consent">
        <div
          ref="panelEl"
          class="consent__panel"
          :class="{ 'is-wide': shown === 'policy', 'is-morphing': morphing }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="shown === 'policy' ? 'consent-policy-title' : 'consent-title'"
          tabindex="-1"
        >
          <div v-show="shown === 'form'" ref="formEl" class="consent__form">
            <img class="consent__logo" src="/logo/logo-light.svg" alt="m/design" width="175" height="51" />
            <h2 id="consent-title" class="h2 consent__title">Прежде чем начать</h2>
            <p class="consent__text">Мы используем файлы cookie и сервис Яндекс.Метрика, чтобы анализировать посещаемость и улучшать сайт. Подробнее — в <a href="/privacy" class="text-link" @click.prevent="openPolicy">Политике обработки персональных данных</a>.</p>

            <div class="consent__rows">
              <ConsentCheckbox v-model:checked="policy" class="consent__row">
                Я ознакомлен(а) с <a href="/privacy" class="text-link" @click.prevent="openPolicy">Политикой обработки персональных данных</a>
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

          <div v-if="shown === 'policy'" ref="policyEl" class="consent__policy">
            <div class="consent__bar">
              <button ref="backEl" type="button" class="pill consent__back" @click="switchView('form')"><span aria-hidden="true">←</span> Назад к выбору</button>
              <span class="consent__bar-title" aria-hidden="true">Политика обработки персональных данных</span>
              <button type="button" class="consent__close" aria-label="Закрыть политику" @click="switchView('form')">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.7" />
                </svg>
              </button>
            </div>

            <div class="consent__scroll" role="region" tabindex="0" aria-label="Текст политики">
              <div class="consent__doc">
                <h1 id="consent-policy-title" class="h2">{{ PRIVACY_TITLE }}</h1>
                <p class="small consent__date">Дата редакции: {{ PRIVACY_DATE }}</p>

                <div>
                  <LegalBody :sections="PRIVACY_SECTIONS" :anchors="false" />
                </div>

                <div class="consent__end">
                  <h2 class="consent__end-title">Прочитали? Отметьте и продолжайте</h2>
                  <div class="consent__rows consent__rows--end">
                    <ConsentCheckbox v-model:checked="policy" class="consent__row consent__row--end">
                      Я ознакомлен(а) с Политикой обработки персональных данных
                      <span class="consent__tag consent__tag--required">обязательно</span>
                    </ConsentCheckbox>
                    <ConsentCheckbox v-model:checked="metrika" class="consent__row consent__row--end">
                      Разрешаю cookie и Яндекс.Метрику для анализа посещаемости
                      <span class="consent__tag">по желанию</span>
                    </ConsentCheckbox>
                  </div>
                  <BaseButton class="consent__go consent__go--end" variant="primary" type="button" :disabled="!policy" @click="accept">Перейти на сайт</BaseButton>
                </div>
              </div>
            </div>
          </div>
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
  grid-template-rows: minmax(0, 1fr);
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
  border-radius: var(--r-consent);
  background: var(--white);
}

/* фокус на самом окне — только чтобы клик мимо кнопок не уводил его на страницу */
.consent__panel:focus {
  outline: none;
}

/* политика: окно на всю подложку, прокручивается не оно, а текст */
.consent__panel.is-wide {
  max-width: var(--consent-wide-w);
  height: 100%;
  overflow: hidden;
}

.consent__panel.is-morphing {
  overflow: hidden;
}

.consent__form {
  padding: var(--consent-pad);
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

/* ---------- вид «политика» ---------- */
.consent__policy {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* полоса стоит на месте, текст едет под ней */
.consent__bar {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--s-16);
  padding: var(--s-20) var(--s-24);
  border-bottom: var(--hairline) solid var(--border);
}

.consent__back {
  flex: none;
  gap: var(--s-8);
  border: 0;
  color: var(--ink);
  transition: background-color var(--ease);
}

.consent__back:hover {
  background: var(--bg-4);
}

.consent__bar-title,
.consent__end-title {
  font: 500 var(--t-note)/1.3 var(--f-head);
  letter-spacing: var(--ls-h3);
  color: var(--ink);
}

.consent__close {
  display: grid;
  flex: none;
  place-items: center;
  width: var(--consent-close);
  height: var(--consent-close);
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--bg-3);
  color: var(--ink);
  transition: background-color var(--ease);
}

.consent__close:hover {
  background: var(--bg-4);
}

.consent__close svg {
  width: var(--s-16);
  height: var(--s-16);
}

.consent__back:focus-visible,
.consent__close:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.consent__scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: var(--s-32) var(--consent-doc-px) var(--s-40);
}

/* кольцо внутрь: снаружи его обрезало бы окно */
.consent__scroll:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: calc(-1 * var(--focus-ring));
}

.consent__doc {
  max-width: var(--consent-doc-w);
}

.consent__date {
  margin: var(--s-12) 0 var(--s-32);
  color: var(--text-3);
}

/* окно само белое: карточка реквизитов на нём не видна, остался бы один отступ */
.consent__doc :deep(.legal__requisites) {
  padding: 0;
}

.consent__end {
  margin-top: var(--s-40);
  padding: var(--s-24);
  border-radius: var(--r-card);
  background: var(--bg);
}

.consent__rows--end {
  margin-top: var(--s-16);
}

.consent__row--end {
  background: var(--white);
}

.consent__go--end {
  margin-top: var(--s-16);
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

  .consent__bar {
    padding: var(--s-12) var(--s-16);
  }

  /* в полосе не помещается */
  .consent__bar-title {
    display: none;
  }

  .consent__scroll {
    padding-block: var(--s-20) var(--s-24);
  }

  .consent__end {
    padding: var(--s-20);
  }
}
</style>
