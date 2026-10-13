<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const items = [
  {
    word: 'Дизайн',
    note: 'Инфографика, AI-фото и видеообложки для карточек.',
  },
  {
    word: 'Реклама',
    note: 'Кабинеты Ozon и Wildberries, SEO, тесты обложек.',
  },
  {
    word: 'Цифры',
    note: 'Смотрю, что сработало, и делаю следующую итерацию.',
  },
].map((item, i) => ({ ...item, num: String(i + 1).padStart(2, '0') }))

const AVATAR = 'https://storage.yandexcloud.net/landing-main/new-pages/about/avatar.jpg'
// одно фото на все три слова — меняется только текст слева
const PHOTO = 'https://storage.yandexcloud.net/landing-main/new-pages/about/my_phtoto.webp'
const PHOTO_ALT = 'Станислав — дизайнер карточек для маркетплейсов'

// фото 4:5 — реальные размеры задаются при загрузке, соотношение одно
const PHOTO_W = 800
const PHOTO_H = 1000

const AUTOPLAY_MS = 2600
const CLICK_HOLD_MS = 10000 // сколько держим выбранное кликом слово

const active = ref(0)
const sectionEl = ref(null)
const tabEls = ref([])
// картинки, которых ещё нет в хранилище: прячем, остаётся фон сцены
const broken = ref(new Set())

// автолистание — пока секция в экране и вкладка видна; клик держит слово
// CLICK_HOLD_MS, клавиатурный фокус — пауза. Наведение мыши ничего не трогает
const state = { inView: false, focused: false, holding: false }
let interval = null
let holdTimer = null
let observer = null
let mqReduced = null

function canPlay() {
  return state.inView && !state.focused && !state.holding && !document.hidden && !mqReduced?.matches
}

function sync() {
  if (canPlay()) {
    if (!interval) {
      interval = setInterval(() => {
        active.value = (active.value + 1) % items.length
      }, AUTOPLAY_MS)
    }
  } else if (interval) {
    clearInterval(interval)
    interval = null
  }
}

// клик: сразу это слово и держим; потом автолистание — со следующего.
// Повторный клик перезапускает удержание
function onClick(i) {
  active.value = i
  state.holding = true
  clearTimeout(holdTimer)
  holdTimer = setTimeout(() => {
    state.holding = false
    if (canPlay()) active.value = (active.value + 1) % items.length
    sync()
  }, CLICK_HOLD_MS)
  sync()
}

// фокус с клавиатуры выбирает слово и ставит паузу, пока фокус на табах;
// фокус от клика мышью паузу не ставит
function onFocus(i, event) {
  if (!event.target.matches(':focus-visible')) return
  state.focused = true
  active.value = i
  sync()
}

function onBlur() {
  if (!state.focused) return
  state.focused = false
  sync()
}

// стрелки — как у табов: по кругу, фокус переезжает вместе с выбором
const KEYS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

function onKeydown(event) {
  const step = KEYS[event.key]
  if (!step) return
  event.preventDefault()
  const next = (active.value + step + items.length) % items.length
  active.value = next
  tabEls.value[next]?.focus()
}

function markBroken(src) {
  broken.value = new Set(broken.value).add(src)
}

onMounted(() => {
  mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  mqReduced.addEventListener('change', sync)
  document.addEventListener('visibilitychange', sync)

  // картинка из пререндера могла упасть до того, как Vue повесил @error
  sectionEl.value.querySelectorAll('img').forEach((img) => {
    if (img.complete && !img.naturalWidth) markBroken(img.getAttribute('src'))
  })

  observer = new IntersectionObserver(([entry]) => {
    state.inView = entry.isIntersecting
    sync()
  })
  observer.observe(sectionEl.value)
})

onUnmounted(() => {
  clearInterval(interval)
  clearTimeout(holdTimer)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', sync)
  mqReduced?.removeEventListener('change', sync)
})
</script>

<template>
  <section id="about" ref="sectionEl" class="about">
    <div class="container about__layout">
      <!-- обычный CSS sticky, как в ReviewsWall: без align-self: start
           колонка растянется на высоту сетки и прилипать будет нечему -->
      <div class="about__text">
        <span class="pill about__pill">Обо мне</span>

        <div class="about__words" role="tablist" aria-label="Чем занимаюсь" @keydown="onKeydown">
          <button
            v-for="(item, i) in items"
            :id="`about-tab-${i}`"
            :key="item.word"
            ref="tabEls"
            type="button"
            role="tab"
            class="word about__word"
            :class="{ 'is-active': active === i }"
            :aria-selected="active === i"
            aria-controls="about-stage"
            :tabindex="active === i ? 0 : -1"
            @focus="onFocus(i, $event)"
            @blur="onBlur"
            @click="onClick(i)"
          >
            {{ item.word }}
            <span class="small about__num" aria-hidden="true">{{ item.num }}</span>
          </button>
        </div>

        <!-- все три строки лежат в одной ячейке и задают высоту по самой
             длинной — текст под словами не прыгает при смене -->
        <div class="about__note">
          <p class="lead about__note-live" aria-live="polite">{{ items[active].note }}</p>
          <p v-for="item in items" :key="item.word" class="lead about__note-ghost" aria-hidden="true">{{ item.note }}</p>
        </div>

        <ul class="small about__terms">
          <li><i class="about__dot"></i>по всей России</li>
          <li><i class="about__dot"></i>физлица и юрлица, договор</li>
        </ul>
      </div>

      <div
        id="about-stage"
        class="about__stage"
        role="tabpanel"
        :aria-labelledby="`about-tab-${active}`"
        tabindex="0"
      >
        <img
          class="about__photo"
          :class="{ 'is-broken': broken.has(PHOTO) }"
          :src="PHOTO"
          :alt="PHOTO_ALT"
          :width="PHOTO_W"
          :height="PHOTO_H"
          loading="lazy"
          decoding="async"
          @error="markBroken(PHOTO)"
        />

        <span class="about__chip">
          <img
            v-if="!broken.has(AVATAR)"
            class="about__avatar"
            :src="AVATAR"
            alt=""
            width="56"
            height="56"
            loading="lazy"
            decoding="async"
            @error="markBroken(AVATAR)"
          />
          <span v-else class="about__avatar"></span>
          <span class="small about__name">Станислав</span>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-60);
  align-items: start;
}

/* текст липкий: едет вниз, пока не упрётся в низ фото */
.about__text {
  position: sticky;
  top: calc(var(--header-top) + var(--header-h) + var(--s-24));
  align-self: start;
  min-width: 0;
}

.about__pill {
  margin-bottom: var(--sec-pill);
}

/* слова-табы */
.about__words {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-4);
}

.about__word {
  display: inline-flex;
  align-items: baseline;
  gap: var(--s-16);
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  color: var(--text-4);
  cursor: pointer;
  transition: color .5s var(--ease-out);
}

.about__word.is-active {
  color: var(--ink);
}

.about__word:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.about__num {
  font-weight: 500;
  letter-spacing: 0;
  color: var(--accent);
  opacity: 0;
  transition: opacity .5s var(--ease-out);
}

.about__word.is-active .about__num {
  opacity: 1;
}

/* строка-пояснение */
.about__note {
  display: grid;
  max-width: var(--measure-heading);
  margin-top: var(--s-32);
}

.about__note > p {
  grid-area: 1 / 1;
  color: var(--ink);
}

.about__note-ghost {
  visibility: hidden;
}

/* условия */
.about__terms {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-8) var(--s-20);
  margin-top: var(--s-24);
}

.about__terms li {
  display: flex;
  align-items: center;
  gap: var(--s-8);
  color: var(--ink);
}

.about__dot {
  flex: none;
  width: var(--dot);
  height: var(--dot);
  background: var(--accent);
  border-radius: var(--r-pill);
}

/* сцена с фото; фон виден, пока файлов нет */
.about__stage {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--bg-3);
  border-radius: var(--r-stage);
}

.about__stage:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.about__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about__photo.is-broken {
  visibility: hidden;
}

/* чип с именем поверх фото */
.about__chip {
  position: absolute;
  top: var(--s-12);
  left: var(--s-12);
  display: inline-flex;
  align-items: center;
  gap: var(--s-8);
  padding: var(--s-4) var(--s-12) var(--s-4) var(--s-4);
  background: var(--white);
  border-radius: var(--r-pill);
}

.about__avatar {
  flex: none;
  width: var(--avatar-sm);
  height: var(--avatar-sm);
  object-fit: cover;
  background: var(--bg-3);
  border-radius: var(--r-pill);
}

.about__name {
  font-weight: 500;
  color: var(--ink);
}

@media (max-width: 767px) {
  .about__layout {
    grid-template-columns: 1fr;
    gap: var(--s-32);
  }

  .about__text {
    position: static;
  }
}
</style>
