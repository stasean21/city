<script setup>
import { gsap } from 'gsap'

// сцены сторис «Как проходит съёмка» — макет docs/mockups/service-photo.html.
// механику (кадр, список, таймлайн) даёт CardStories, здесь — картинка этапов.
// съёмка — с помощью AI по фото клиента: кадр товара схематичный
// (коробка и баночка на столе), без картинок из хранилища
defineProps({
  active: { type: Number, required: true },
})

const brief = ['Крем для лица, 50 мл', 'Ozon и Wildberries', 'Белый фон и интерьер', 'Спереди, сбоку, в руке, деталь']

// всего кадров по списку — счётчик в сцене генерации
const SHOTS = 8
// вспышка — раз в ~1.6 с
const FLASH_EVERY = 1.6

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
  // 2 фото товара: снимки клиента сеткой, потом список кадров
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelectorAll('.ref'), { opacity: 0, y: 16 * u(), stagger: 0.25, duration: 0.45, ease: 'power2.out' }, 0.2)
      .fromTo(s.querySelector('.note'), { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 2.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 3 сцена: кадр затемнён, свет включается по одному источнику
  (s, { dur }) => {
    const t = gsap.timeline()
    const lamps = s.querySelectorAll('.lamp')
    t.fromTo(s.querySelector('.dim'), { opacity: 0.75 }, { opacity: 0.45, duration: 2.4, ease: 'power1.inOut' }, 0.6)
      .from(lamps, { opacity: 0, scale: 0.6, stagger: 1, duration: 0.5, ease: 'back.out(2)' }, 0.6)
      .fromTo(s.querySelector('.note'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 3.4)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 4 генерация: вспышки и счётчик кадров
  (s, { dur }) => {
    const t = gsap.timeline()
    const flash = s.querySelector('.flash')
    const num = s.querySelector('.count')
    const count = Math.floor((dur - 0.8) / FLASH_EVERY)
    for (let k = 0; k < count; k += 1) {
      const at = 0.8 + k * FLASH_EVERY
      t.fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.45, ease: 'power2.out' }, at)
        .call(() => { num.textContent = k + 1 }, null, at)
    }
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 5 доработка: чистый кадр проявляется поверх сырого «шторкой»
  (s, { u, dur }) => {
    const t = gsap.timeline()
    const W = s.getBoundingClientRect().width
    t.to(s.querySelector('.wipe'), { opacity: 1, duration: 0.2 }, 0.6)
      .fromTo(s.querySelector('.wipe'), { x: 0 }, { x: W, duration: 2.6, ease: 'power1.inOut' }, 0.6)
      .fromTo(s.querySelector('.clean'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 2.6, ease: 'power1.inOut' }, 0.6)
      .to(s.querySelector('.wipe'), { opacity: 0, duration: 0.2 }, 3.2)
      .fromTo(s.querySelector('.note'), { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 3.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 6 сдача: лента готовых кадров, отметка «готово»
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelectorAll('.strip span'), { opacity: 0, y: 12 * u(), stagger: 0.3, duration: 0.35, ease: 'power2.out' }, 0.4)
      .fromTo(s.querySelector('.done'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 2.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
]

// счётчик кадров сбрасываем вместе со сценой
function reset(s) {
  const num = s.querySelector('.count')
  if (num) num.textContent = '1'
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

  <!-- 2 фото товара -->
  <div data-index="1" class="stage s2" :class="{ on: active === 1 }">
    <div class="refs">
      <div v-for="n in 4" :key="n" class="ref" :class="`ref${n}`"><i></i></div>
    </div>
    <span class="note">ваши фото → список из {{ SHOTS }} кадров</span>
  </div>

  <!-- 3 сцена -->
  <div data-index="2" class="stage s3" :class="{ on: active === 2 }">
    <div class="shot"><span class="table"></span><span class="pack"></span><span class="jar"><i>AURA</i></span></div>
    <div class="dim"></div>
    <span class="lamp l1"></span><span class="lamp l2"></span>
    <span class="note">фон, интерьер и свет</span>
  </div>

  <!-- 4 генерация -->
  <div data-index="3" class="stage s4" :class="{ on: active === 3 }">
    <div class="shot raw"><span class="table"></span><span class="pack"></span><span class="jar"><i>AURA</i></span></div>
    <span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
    <span class="rec">кадр <b class="count">1</b> / {{ SHOTS }}</span>
    <div class="flash"></div>
  </div>

  <!-- 5 доработка -->
  <div data-index="4" class="stage s5" :class="{ on: active === 4 }">
    <div class="shot raw"><span class="table"></span><span class="pack"></span><span class="jar"><i>AURA</i></span></div>
    <div class="shot clean"><span class="table"></span><span class="pack"></span><span class="jar"><i>AURA</i></span></div>
    <div class="wipe"></div>
    <span class="note">сверка с оригиналом · артефакты</span>
  </div>

  <!-- 6 сдача -->
  <div data-index="5" class="stage s6" :class="{ on: active === 5 }">
    <div class="shot"><span class="table"></span><span class="pack"></span><span class="jar"><i>AURA</i></span></div>
    <div class="strip"><span v-for="n in 4" :key="n"><i></i></span></div>
    <span class="done">готово ✓</span>
  </div>
</template>

<style scoped>
.stage { position: absolute; inset: 0; visibility: hidden; }
.stage.on { visibility: visible; }
.center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }

/* кадр товара: стол, коробка и баночка крема. координаты — пиксели кадра 494 × 659 */
.shot { position: absolute; inset: 0; background: var(--story-scene); }
.shot .table { position: absolute; left: 0; right: 0; bottom: 0; height: 30%; background: var(--story-warm); }
.shot .pack { position: absolute; left: calc(150 * var(--u)); bottom: calc(170 * var(--u)); width: calc(110 * var(--u)); height: calc(180 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--story-warm-2); }
.shot .jar { position: absolute; left: calc(220 * var(--u)); bottom: calc(150 * var(--u)); display: flex; align-items: center; justify-content: center; width: calc(150 * var(--u)); height: calc(110 * var(--u)); border-radius: calc(14 * var(--u)) calc(14 * var(--u)) calc(18 * var(--u)) calc(18 * var(--u)); background: var(--white); }
.shot .jar::before { content: ""; position: absolute; left: calc(8 * var(--u)); right: calc(8 * var(--u)); top: calc(-34 * var(--u)); height: calc(38 * var(--u)); border-radius: calc(10 * var(--u)) calc(10 * var(--u)) calc(4 * var(--u)) calc(4 * var(--u)); background: var(--ink-soft); }
.shot .jar i { font: 600 calc(16 * var(--u)) var(--f-head); font-style: normal; color: var(--ink); }
/* сырой кадр: тусклый, сероватый */
.shot.raw { filter: grayscale(.45) contrast(.9) brightness(.92); }

.note { position: absolute; left: 50%; bottom: 12%; z-index: 5; padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); color: var(--white); white-space: nowrap; background: var(--ink); border-radius: calc(10 * var(--u)); opacity: 0; translate: -50% 0; }

/* 1 бриф */
.s1 { background: var(--bg-2); }
.doc { width: 74%; padding: calc(24 * var(--u)); background: var(--white); border-radius: calc(16 * var(--u)); }
.doc b { display: block; margin-bottom: calc(16 * var(--u)); font: 600 calc(20 * var(--u)) var(--f-head); color: var(--ink); }
.chk { display: flex; gap: calc(12 * var(--u)); align-items: center; padding: calc(8 * var(--u)) 0; font-size: calc(14 * var(--u)); line-height: 1.4; color: var(--ink); }
.box { position: relative; flex: none; width: calc(20 * var(--u)); height: calc(20 * var(--u)); border: calc(1.5 * var(--u)) solid var(--bg-4); border-radius: calc(6 * var(--u)); }
.box .fill { position: absolute; inset: calc(-1.5 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--ink); transform: scale(0); }
.box svg { position: absolute; inset: calc(3 * var(--u)); }
.box path { stroke: var(--white); stroke-width: 2.4; fill: none; stroke-dasharray: 20; stroke-dashoffset: 20; stroke-linecap: round; stroke-linejoin: round; }

/* 2 фото товара: снимки клиента — разные фоны, силуэт товара */
.s2 { background: var(--bg-2); }
.refs { position: absolute; left: 10%; right: 10%; top: 10%; display: grid; grid-template-columns: 1fr 1fr; gap: calc(12 * var(--u)); }
.ref { position: relative; aspect-ratio: 4 / 5; border-radius: calc(10 * var(--u)); background: var(--story-feed); }
.ref2 { background: var(--story-warm); }
.ref3 { background: var(--story-scene); }
.ref4 { background: var(--bg-3); }
.ref i { position: absolute; left: 50%; bottom: 22%; width: 34%; height: 30%; border-radius: calc(8 * var(--u)); background: var(--white); translate: -50% 0; }
.ref2 i { width: 22%; height: 50%; border-radius: 30% 30% 10% 10%; background: var(--story-cap); }
.ref4 i { width: 30%; aspect-ratio: 1; height: auto; border-radius: 50%; background: var(--story-warm-2); }

/* 3 сцена: кадр затемнён, два источника света сверху */
.dim { position: absolute; inset: 0; z-index: 2; background: var(--ink); opacity: .75; }
.lamp { position: absolute; top: calc(40 * var(--u)); z-index: 3; width: calc(90 * var(--u)); height: calc(60 * var(--u)); border: calc(3 * var(--u)) solid var(--white); border-radius: calc(8 * var(--u)); background: var(--story-glass); }
.l1 { left: calc(40 * var(--u)); rotate: -14deg; }
.l2 { right: calc(40 * var(--u)); rotate: 14deg; }

/* 4 генерация: видоискатель, счётчик и вспышка */
.corner { position: absolute; z-index: 3; width: calc(24 * var(--u)); height: calc(24 * var(--u)); border: calc(2 * var(--u)) solid var(--white); }
.c1 { top: calc(16 * var(--u)); left: calc(16 * var(--u)); border-right: 0; border-bottom: 0; }
.c2 { top: calc(16 * var(--u)); right: calc(16 * var(--u)); border-left: 0; border-bottom: 0; }
.c3 { bottom: calc(16 * var(--u)); left: calc(16 * var(--u)); border-right: 0; border-top: 0; }
.c4 { bottom: calc(16 * var(--u)); right: calc(16 * var(--u)); border-left: 0; border-top: 0; }
.rec { position: absolute; top: calc(20 * var(--u)); left: 50%; z-index: 3; display: flex; gap: calc(6 * var(--u)); align-items: center; font: 500 calc(12 * var(--u)) var(--f-body); color: var(--ink); white-space: nowrap; translate: -50% 0; }
.rec::before { content: ""; width: calc(8 * var(--u)); height: calc(8 * var(--u)); border-radius: 50%; background: var(--accent); }
.flash { position: absolute; inset: 0; z-index: 4; background: var(--white); opacity: 0; }

/* 5 доработка */
.clean { clip-path: inset(0 100% 0 0); }
.wipe { position: absolute; top: 0; bottom: 0; left: 0; z-index: 4; width: calc(2 * var(--u)); background: var(--ink); opacity: 0; }

/* 6 сдача */
.strip { position: absolute; left: 50%; top: calc(40 * var(--u)); z-index: 3; display: flex; gap: calc(8 * var(--u)); translate: -50% 0; }
.strip span { display: flex; align-items: flex-end; justify-content: center; width: calc(52 * var(--u)); height: calc(65 * var(--u)); padding-bottom: calc(14 * var(--u)); border: calc(2 * var(--u)) solid var(--white); border-radius: calc(6 * var(--u)); background: var(--story-warm); }
.strip span i { width: 40%; height: 30%; border-radius: calc(3 * var(--u)); background: var(--white); }
.done { position: absolute; right: calc(20 * var(--u)); bottom: calc(20 * var(--u)); z-index: 5; padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); color: var(--white); background: var(--ink); border-radius: calc(10 * var(--u)); opacity: 0; }
</style>
