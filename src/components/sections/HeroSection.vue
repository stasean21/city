<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import HeroDots from './HeroDots.vue'
import contacts from '../../data/contacts.json'
import { scrollToSameAnchor } from '../../utils/headerOffset.js'

// строка задачи: подсказки сменяются по кругу, пока поле пустое и не в фокусе
const PLACEHOLDERS = [
  'Конкуренты дороже, а покупают у них',
  'Продажи упали после смены обложки',
  'Нужен сайт, но нет времени разбираться',
]
const PLACEHOLDER_MS = 4000
const NOTE_MS = 3000 // сколько видна подпись «Текст скопирован»

// адрес — из общего списка мессенджеров, как у кнопок в FAQ и футере
const telegram = contacts.find((item) => item.id === 'telegram').url

// повторный клик по тому же якорю роутер не обрабатывает — прокручиваем сами
const route = useRoute()
const router = useRouter()

const task = ref('')
const inputEl = ref(null)
const placeholderIndex = ref(0)
const placeholder = computed(() => PLACEHOLDERS[placeholderIndex.value])
const noted = ref(false)
let placeholderTimer = 0
let noteTimer = 0

function nextPlaceholder() {
  if (task.value || document.activeElement === inputEl.value) return
  placeholderIndex.value = (placeholderIndex.value + 1) % PLACEHOLDERS.length
}

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
  // reduced motion — стоит первая подсказка
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  placeholderTimer = window.setInterval(nextPlaceholder, PLACEHOLDER_MS)
})

onUnmounted(() => {
  clearInterval(placeholderTimer)
  clearTimeout(noteTimer)
})
</script>

<template>
  <section id="hero" class="hero">
    <div class="hero__stage" data-dark-zone>
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
          <input
            id="hero-task"
            ref="inputEl"
            v-model="task"
            class="lead hero__input"
            type="text"
            :placeholder="placeholder"
            autocomplete="off"
            enterkeyhint="send"
          >
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
.hero__input {
  flex: 1;
  min-width: 0;
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
