<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import HeroDots from './HeroDots.vue'
import contacts from '../../data/contacts.json'
import { scrollToSameAnchor } from '../../utils/headerOffset.js'

// строка задачи: подсказка сама печатается и стирается, пока поле пустое и не в фокусе.
// placeholder курсор не умеет — поверх поля «призрак» с текстом и оранжевым курсором
const PLACEHOLDERS = [
  'Конкуренты дороже, а покупают у них',
  'Продажи упали после смены обложки',
  'Нужен сайт, но нет времени разбираться',
]
const TYPE_MS = 55        // на букву при наборе (+ случайно до TYPE_JITTER — живее)
const TYPE_JITTER = 35
const SPACE_MS = 40       // после пробела — чуть дольше, как при настоящем наборе
const ERASE_MS = 22       // на букву при стирании
const HOLD_MS = 1600      // сколько держим готовую фразу
const GAP_MS = 350        // пауза между фразами
const NOTE_MS = 3000 // сколько видна подпись «Текст скопирован»

// адрес — из общего списка мессенджеров, как у кнопок в FAQ и футере
const telegram = contacts.find((item) => item.id === 'telegram').url

// повторный клик по тому же якорю роутер не обрабатывает — прокручиваем сами
const route = useRoute()
const router = useRouter()

const task = ref('')
const stageEl = ref(null)
const noted = ref(false)
let noteTimer = 0

// ---------- печать подсказки ----------
const phraseIndex = ref(0)
// в пререндере — первая фраза целиком: поле не пустое, при гидрации ничего не прыгает
const typed = ref(PLACEHOLDERS[0])
const typing = ref(false) // буквы идут — курсор горит ровно, не мигает
const focused = ref(false)
const ghostOn = computed(() => !task.value && !focused.value)
// в фокусе «призрака» нет — пример виден обычной подсказкой, пока человек пишет своё
const placeholder = computed(() => (ghostOn.value ? '' : PLACEHOLDERS[phraseIndex.value]))

let typeTimer = 0
let inView = false
let reduced = false
let fresh = true // первый запуск — со стирания фразы из пререндера

function later(fn, ms) {
  typeTimer = window.setTimeout(fn, ms)
}

function typeStep(i) {
  const phrase = PLACEHOLDERS[phraseIndex.value]
  typed.value = phrase.slice(0, i)
  if (i >= phrase.length) {
    typing.value = false
    later(eraseStep, HOLD_MS)
    return
  }
  typing.value = true
  later(() => typeStep(i + 1), TYPE_MS + Math.random() * TYPE_JITTER + (phrase[i - 1] === ' ' ? SPACE_MS : 0))
}

function eraseStep() {
  typing.value = true
  typed.value = typed.value.slice(0, -1)
  if (typed.value) {
    later(eraseStep, ERASE_MS)
    return
  }
  typing.value = false
  phraseIndex.value = (phraseIndex.value + 1) % PLACEHOLDERS.length
  later(() => typeStep(1), GAP_MS)
}

function stopTyping() {
  clearTimeout(typeTimer)
  typeTimer = 0
  typing.value = false
}

// одна цепочка setTimeout; стоит, пока hero вне экрана, вкладка скрыта,
// поле в фокусе или в нём текст. Продолжает с новой фразы
function syncTyping() {
  const run = !reduced && inView && !document.hidden && ghostOn.value
  if (!run) {
    stopTyping()
    return
  }
  if (typeTimer) return
  if (fresh) {
    fresh = false
    eraseStep()
    return
  }
  phraseIndex.value = (phraseIndex.value + 1) % PLACEHOLDERS.length
  typed.value = ''
  typeStep(1)
}

watch(ghostOn, syncTyping)
let stageObserver = null

function send() {
  const text = task.value.trim()
  // пусто — к блоку «Обсудим задачу?», как кнопки «Обсудить задачу»
  if (!text) {
    if (!scrollToSameAnchor(route, '#contact')) router.push({ path: '/', hash: '#contact' })
    return
  }
  // текст — в буфер (на случай, если ?text= не подставится в чат) и Telegram
  // в новой вкладке. Копируем до открытия: страница без фокуса буфер не получит
  copy(text)
  window.open(`${telegram}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    return // буфер недоступен (нет разрешения, не https) — и подпись не нужна
  }
  noted.value = true
  clearTimeout(noteTimer)
  noteTimer = window.setTimeout(() => { noted.value = false }, NOTE_MS)
}

onMounted(() => {
  // reduced motion — без печати: первая фраза целиком, курсор не мигает
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    typing.value = true
    return
  }
  stageObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    syncTyping()
  })
  stageObserver.observe(stageEl.value)
  document.addEventListener('visibilitychange', syncTyping)
})

onUnmounted(() => {
  stopTyping()
  stageObserver?.disconnect()
  document.removeEventListener('visibilitychange', syncTyping)
  clearTimeout(noteTimer)
})
</script>

<template>
  <section id="hero" class="hero">
    <div ref="stageEl" class="hero__stage" data-dark-zone>
      <HeroDots />
      <div class="hero__content" :class="{ 'is-noted': noted }">
        <!-- две строки — два блока, а не <br>: Chrome выравнивает (text-wrap: balance)
             только часть до принудительного переноса, и вторая на узких экранах
             рвалась бы «…среднего / бизнеса» -->
        <h1 class="display hero__title once-in"><span class="hero__line">Дизайн, аналитика и <span class="hero__nowrap">ИИ-разработка</span></span> <span class="hero__line">для малого и среднего бизнеса</span></h1>

        <form class="hero__bar once-in" @submit.prevent="send">
          <svg class="hero__bar-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <label class="visually-hidden" for="hero-task">Опишите задачу</label>
          <span class="hero__field">
            <input
              id="hero-task"
              v-model="task"
              class="lead hero__input"
              type="text"
              :placeholder="placeholder"
              autocomplete="off"
              enterkeyhint="send"
              @focus="focused = true"
              @blur="focused = false"
            >
            <span v-if="ghostOn" class="lead hero__ghost" :class="{ 'is-typing': typing }" aria-hidden="true">{{ typed }}<i class="hero__caret"></i></span>
          </span>
          <BaseButton class="hero__send-pc" variant="primary" arrow type="submit">Обсудить задачу</BaseButton>
          <button class="hero__send-mobile" type="submit" aria-label="Отправить задачу">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <!-- живой регион есть всегда: вставленную подпись скринридер прочитает -->
          <div class="hero__note" role="status">
            <Transition name="hero-note">
              <span v-if="noted" class="caption hero__note-text">Текст скопирован — вставьте его в чат</span>
            </Transition>
          </div>
        </form>

        <BaseButton
          class="hero__services once-in"
          :to="{ path: '/', hash: '#services' }"
          variant="secondary"
          @click="scrollToSameAnchor(route, '#services')"
        >
          Услуги и решения <span aria-hidden="true">↓</span>
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* main уже даёт клиренс под шапку (--header-top + --header-h); сверху — зазор
   до капсулы. Поля --gutter и ширина контейнера — как у белой панели шапки,
   поэтому края капсулы совпадают с её краями */
.hero {
  padding: var(--hero-gap) var(--gutter) var(--hero-bottom);
}

/* капсула — первый экран целиком: под ней остаётся столько же, сколько над ней */
.hero__stage {
  position: relative;
  max-width: calc(var(--container) + 2 * var(--gutter));
  height: min(var(--hero-stage-h), calc(100svh - var(--header-top) - var(--header-h) - 2 * var(--hero-gap)));
  min-height: var(--hero-stage-min);
  margin-inline: auto;
  overflow: hidden;
  border-radius: var(--r-hero);
  background: var(--hero-stage-bg);
}

.hero__content {
  position: relative; /* над canvas */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--s-40);
  text-align: center;
}

.hero__title {
  margin-bottom: var(--s-40);
  color: var(--white);
}

.hero__line {
  display: block;
}

/* «ИИ-» и «разработка» не расходятся по строкам */
.hero__nowrap {
  white-space: nowrap;
}

/* строка задачи: вложенное скругление — кнопка --r-btn + поле --s-12 */
.hero__bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--s-12);
  width: 100%;
  max-width: var(--hero-bar-w);
  padding: var(--s-12) var(--s-12) var(--s-12) var(--s-24);
  border-radius: calc(var(--r-btn) + var(--s-12));
  background: var(--white);
  text-align: left;
}

/* кольцо фокуса — вокруг всей строки: у самого поля рамки нет */
.hero__bar:has(.hero__input:focus-visible) {
  outline: var(--focus-ring) solid var(--white);
  outline-offset: var(--focus-ring);
}

.hero__bar-arrow {
  flex: none;
  width: var(--btn-icon);
  height: var(--btn-icon);
  color: var(--text-3);
}

/* .lead задаёт шрифт (16 на телефоне — iOS не увеличивает страницу при фокусе) */
/* поле и «призрак» поверх него — в одной ячейке строки */
.hero__field {
  position: relative;
  flex: 1;
  min-width: 0;
}

.hero__input {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  background: none;
  color: var(--ink);
  text-overflow: ellipsis;
}

.hero__input::placeholder {
  color: var(--text);
  opacity: 1;
}

/* печатающаяся подсказка: шрифт поля (.lead), длинная строка обрезается справа */
.hero__ghost {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
  color: var(--text);
  white-space: nowrap;
  pointer-events: none;
}

/* курсор — линия, в px намеренно, как --hairline */
.hero__caret {
  display: inline-block;
  flex: none;
  width: 2px;
  height: 1.1em;
  margin-left: 2px;
  border-radius: 1px;
  background: var(--accent);
  animation: hero-caret 1s steps(1) infinite;
}

.is-typing .hero__caret {
  animation: none;
  opacity: 1;
}

@keyframes hero-caret {
  50% { opacity: 0; }
}

/* «Обсудить задачу» в строке — акцентная: исключение, согласованное владельцем
   по макету первого экрана. Въезжающая стрелка рикошета — тёмная, акцентная
   на акцентном фоне пропала бы */
.hero__bar .hero__send-pc {
  --ricochet-second: var(--ink);
  flex: none;
  background: var(--accent);
  color: var(--ink);
}

.hero__bar .hero__send-pc:hover {
  background: var(--accent-2);
}

/* на телефоне вместо «Обсудить задачу» — квадрат со стрелкой: подпись уже есть в нижней панели */
.hero__send-mobile {
  display: none;
  flex: none;
  place-items: center;
  width: var(--hero-send);
  height: var(--hero-send);
  padding: 0;
  border: 0;
  border-radius: var(--r-btn);
  background: var(--ink);
  color: var(--white);
  transition: background-color var(--ease);
}

.hero__send-mobile svg {
  width: var(--hero-send-icon);
  height: var(--hero-send-icon);
}

.hero__send-mobile:active {
  background: var(--ink-hover);
}

@media (hover: hover) {
  .hero__send-mobile:hover {
    background: var(--ink-hover);
  }
}

.hero__send-mobile:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

/* «Текст скопирован» — под строкой, вне потока: содержимое стоит по центру капсулы,
   и вставка сдвинула бы заголовок. Кнопка «Услуги и решения» на это время отъезжает */
.hero__note {
  position: absolute;
  top: calc(100% + var(--s-16));
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
}

.hero__note-text {
  color: var(--dark-section-text);
}

.hero-note-enter-active,
.hero-note-leave-active {
  transition: opacity var(--ease);
}

.hero-note-enter-from,
.hero-note-leave-to {
  opacity: 0;
}

/* вторичная на тёмной капсуле: прозрачная, с обводкой --hero-outline */
.hero__content .hero__services {
  position: relative;
  margin-top: var(--s-16);
  border-color: transparent;
  background: transparent;
  color: var(--white);
  transition: transform .35s var(--ease-out), background-color var(--ease);
}

/* обводка толще волосяной рамки кнопки — отдельным слоем поверх неё:
   на высоту не влияет, кнопка той же высоты, что primary */
.hero__content .hero__services::before {
  content: '';
  position: absolute;
  inset: calc(-1 * var(--hairline));
  border: var(--hero-outline-w) solid var(--hero-outline);
  border-radius: inherit;
  pointer-events: none;
}

.hero__content .hero__services:hover {
  border-color: transparent;
  background: var(--ink-soft);
}

.hero__content .hero__services:focus-visible {
  outline-color: var(--white);
}

.hero__content.is-noted .hero__services {
  transform: translateY(var(--s-32));
}

@media (max-width: 767px) {
  .hero {
    padding-inline: var(--s-12);
  }

  /* капсула — весь экран между логотипом и нижней панелью: сверху и снизу
     по --hero-gap, панель висит на --s-16 от края */
  .hero__stage {
    height: calc(100svh - var(--header-top) - var(--header-h) - 2 * var(--hero-gap) - var(--dock-h) - var(--s-16) - env(safe-area-inset-bottom));
  }

  .hero__content {
    padding: var(--s-24) var(--s-16);
  }

  .hero__bar .hero__send-pc {
    display: none;
  }

  .hero__send-mobile {
    display: grid;
  }

  .hero__content .hero__services {
    justify-content: center;
    width: 100%;
  }
}
</style>
