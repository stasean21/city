<script setup>
import { gsap } from 'gsap'

// сцены сторис «Как я делаю сайт». Механику (кадр, список, таймлайн) даёт
// CardStories, здесь — картинка этапов: прототип из блоков, который
// окрашивается, получает телефонную версию, аналитику и адрес
defineProps({
  active: { type: Number, required: true },
})

const brief = ['Студия ремонта, Москва', 'Заявки из Директа', 'Цель — звонок или форма', 'Сайт за 3 недели']

// блоки прототипа: высота в пикселях кадра 494 × 659
const proto = [{ h: 110, k: 'hero' }, { h: 70, k: 'cards' }, { h: 60, k: 'steps' }, { h: 50, k: 'form' }]

// столбики графика заявок
const bars = [30, 46, 38, 62, 54, 80, 72]

const domain = 'remont-studio.ru'

// у каждого этапа своя сцена длиной ~duration секунд.
// ctx: u() — 1 px макета в px экрана, dur — длина сцены
const scenes = [
  // 1 бриф: галочки по одной
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.doc'), { y: 24 * u(), opacity: 0, duration: 0.6, ease: 'power2.out' })
    s.querySelectorAll('.chk').forEach((c, i) => {
      t.to(c.querySelector('.fill'), { scale: 1, duration: 0.25, ease: 'back.out(2)' }, 0.9 + i * 1.1)
        .to(c.querySelector('path'), { strokeDashoffset: 0, duration: 0.3 }, '-=0.1')
    })
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 2 структура: серые блоки прототипа встают по порядку
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelectorAll('.blk'), { opacity: 0, y: 16 * u(), stagger: 0.6, duration: 0.45, ease: 'power2.out' }, 0.3)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 3 дизайн: блоки окрашиваются один за другим
  (s, { dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelectorAll('.blk .paint'), { opacity: 0, stagger: 0.8, duration: 0.6, ease: 'power2.out' }, 0.4)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 4 вёрстка: рядом появляется телефонная версия
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.to(s.querySelector('.site'), { x: -40 * u(), scale: 0.9, duration: 0.7, ease: 'power2.inOut' }, 0.3)
      .from(s.querySelector('.phone'), { opacity: 0, x: 40 * u(), duration: 0.6, ease: 'power3.out' }, 0.8)
      .from(s.querySelectorAll('.phone .pblk'), { opacity: 0, y: 8 * u(), stagger: 0.3, duration: 0.35, ease: 'power2.out' }, 1.3)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 5 аналитика: график заявок растёт, цели отмечаются
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.chart'), { opacity: 0, y: 16 * u(), duration: 0.5, ease: 'power2.out' }, 0.2)
      .from(s.querySelectorAll('.chart .bar'), { scaleY: 0, stagger: 0.15, duration: 0.5, ease: 'power3.out' }, 0.6)
      .from(s.querySelectorAll('.goal'), { opacity: 0, x: -12 * u(), stagger: 0.5, duration: 0.35, ease: 'power2.out' }, 2.2)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 6 запуск: адресная строка печатается, «готово»
  (s, { dur }) => {
    const t = gsap.timeline()
    const url = s.querySelector('.url-text')
    const o = { n: 0 }
    t.to(o, { n: domain.length, duration: 1.4, ease: 'none', onUpdate: () => { url.textContent = domain.slice(0, Math.round(o.n)) } }, 0.4)
      .from(s.querySelector('.site'), { opacity: 0.4, duration: 0.6 }, 1.8)
      .fromTo(s.querySelector('.done'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 2.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
]

// адрес печатается заново — при сбросе стираем
function reset(s) {
  const url = s.querySelector('.url-text')
  if (url) url.textContent = ''
}

defineExpose({ scenes, reset, duration: 7 })
</script>

<template>
  <!-- 1 бриф -->
  <div data-index="0" class="stage s1" :class="{ on: active === 0 }">
    <div class="center">
      <div class="doc">
        <b>Бриф</b>
        <div v-for="line in brief" :key="line" class="chk">
          <span class="box"><span class="fill"></span><svg viewBox="0 0 14 14"><path d="M2 7.5l3 3 7-7" /></svg></span>{{ line }}
        </div>
      </div>
    </div>
  </div>

  <!-- 2 структура и 3 дизайн: один прототип; в дизайне блоки окрашены -->
  <div v-for="k in [1, 2]" :key="k" :data-index="k" class="stage s-proto" :class="[{ on: active === k }, `s${k + 1}`]">
    <div class="center">
      <div class="site">
        <div class="site-bar"><i></i><i></i><i></i></div>
        <div v-for="b in proto" :key="b.k" class="blk" :class="`is-${b.k}`" :style="{ height: `calc(${b.h} * var(--u))` }">
          <span v-if="k === 2" class="paint"></span>
        </div>
      </div>
    </div>
  </div>

  <!-- 4 вёрстка -->
  <div data-index="3" class="stage s4" :class="{ on: active === 3 }">
    <div class="center">
      <div class="site">
        <div class="site-bar"><i></i><i></i><i></i></div>
        <div v-for="b in proto" :key="b.k" class="blk" :class="`is-${b.k}`" :style="{ height: `calc(${b.h} * var(--u))` }"><span class="paint"></span></div>
      </div>
    </div>
    <div class="phone"><span v-for="n in 4" :key="n" class="pblk"></span></div>
  </div>

  <!-- 5 аналитика -->
  <div data-index="4" class="stage s5" :class="{ on: active === 4 }">
    <div class="center">
      <div class="chart">
        <b>Заявки за неделю</b>
        <div class="bars"><span v-for="(h, i) in bars" :key="i" class="bar" :style="{ height: `calc(${h} * var(--u))` }"></span></div>
        <div class="goal"><i></i>цель: кнопка Telegram</div>
        <div class="goal"><i></i>цель: отправка формы</div>
      </div>
    </div>
  </div>

  <!-- 6 запуск -->
  <div data-index="5" class="stage s6" :class="{ on: active === 5 }">
    <div class="center">
      <div class="site">
        <div class="site-bar"><i></i><i></i><i></i><span class="url"><span class="url-text"></span></span></div>
        <div v-for="b in proto" :key="b.k" class="blk" :class="`is-${b.k}`" :style="{ height: `calc(${b.h} * var(--u))` }"><span class="paint"></span></div>
      </div>
    </div>
    <span class="done">готово ✓</span>
  </div>
</template>

<style scoped>
.stage { position: absolute; inset: 0; visibility: hidden; background: var(--bg-2); }
.stage.on { visibility: visible; }
.center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }

/* 1 бриф */
.doc { width: 74%; padding: calc(24 * var(--u)); background: var(--white); border-radius: calc(16 * var(--u)); }
.doc b, .chart b { display: block; margin-bottom: calc(16 * var(--u)); font: 600 calc(20 * var(--u)) var(--f-head); color: var(--ink); }
.chk { display: flex; gap: calc(12 * var(--u)); align-items: center; padding: calc(8 * var(--u)) 0; font-size: calc(14 * var(--u)); line-height: 1.4; color: var(--ink); }
.box { position: relative; flex: none; width: calc(20 * var(--u)); height: calc(20 * var(--u)); border: calc(1.5 * var(--u)) solid var(--bg-4); border-radius: calc(6 * var(--u)); }
.box .fill { position: absolute; inset: calc(-1.5 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--ink); transform: scale(0); }
.box svg { position: absolute; inset: calc(3 * var(--u)); }
.box path { stroke: var(--white); stroke-width: 2.4; fill: none; stroke-dasharray: 20; stroke-dashoffset: 20; stroke-linecap: round; stroke-linejoin: round; }

/* прототип сайта: окно с серыми блоками */
.site { display: flex; flex-direction: column; gap: calc(8 * var(--u)); width: 74%; padding: 0 calc(12 * var(--u)) calc(12 * var(--u)); overflow: hidden; background: var(--white); border-radius: calc(14 * var(--u)); }
.site-bar { display: flex; align-items: center; gap: calc(5 * var(--u)); margin: 0 calc(-12 * var(--u)); padding: calc(8 * var(--u)) calc(12 * var(--u)); background: var(--bg-3); }
.site-bar i { width: calc(8 * var(--u)); height: calc(8 * var(--u)); border-radius: 50%; background: var(--text-4); }
.url { flex: 1; height: calc(18 * var(--u)); margin-left: calc(8 * var(--u)); padding-left: calc(8 * var(--u)); font: 400 calc(11 * var(--u))/calc(18 * var(--u)) var(--f-body); color: var(--text-3); background: var(--white); border-radius: calc(5 * var(--u)); }
.blk { position: relative; overflow: hidden; border-radius: calc(8 * var(--u)); background: var(--bg-3); }
/* окрашенный вариант блоков — цвета «студии» в тёплой гамме */
.paint { position: absolute; inset: 0; }
.is-hero .paint { background: var(--ink); }
.is-cards .paint { background: var(--story-warm); }
.is-steps .paint { background: var(--story-scene); }
.is-form .paint { background: var(--accent); }

/* 4 вёрстка: телефонная версия рядом */
.s4 .site { transform-origin: 50% 50%; }
.phone { position: absolute; right: calc(28 * var(--u)); top: 50%; display: flex; flex-direction: column; gap: calc(6 * var(--u)); width: calc(110 * var(--u)); height: calc(220 * var(--u)); padding: calc(14 * var(--u)) calc(8 * var(--u)); background: var(--white); border: calc(6 * var(--u)) solid var(--ink); border-radius: calc(20 * var(--u)); translate: 0 -50%; }
.pblk { flex: 1; border-radius: calc(5 * var(--u)); background: var(--story-warm); }
.pblk:first-child { flex: 1.6; background: var(--ink); }
.pblk:last-child { flex: .7; background: var(--accent); }

/* 5 аналитика */
.chart { width: 74%; padding: calc(24 * var(--u)); background: var(--white); border-radius: calc(16 * var(--u)); }
.bars { display: flex; align-items: flex-end; gap: calc(10 * var(--u)); height: calc(90 * var(--u)); margin-bottom: calc(16 * var(--u)); border-bottom: var(--hairline) solid var(--border); }
.bar { flex: 1; border-radius: calc(4 * var(--u)) calc(4 * var(--u)) 0 0; background: var(--story-warm); transform-origin: bottom; }
.bar:nth-child(6) { background: var(--accent); }
.goal { display: flex; align-items: center; gap: calc(10 * var(--u)); padding: calc(6 * var(--u)) 0; font: 500 calc(13 * var(--u)) var(--f-body); color: var(--ink); }
.goal i { width: calc(8 * var(--u)); height: calc(8 * var(--u)); border-radius: 50%; background: var(--accent); }

/* 6 запуск */
.done { position: absolute; right: calc(20 * var(--u)); bottom: calc(20 * var(--u)); padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); color: var(--white); background: var(--ink); border-radius: calc(10 * var(--u)); opacity: 0; }
</style>
