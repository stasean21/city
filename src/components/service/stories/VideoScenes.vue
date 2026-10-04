<script setup>
import { gsap } from 'gsap'

// сцены сторис «Как я делаю видеообложку». Механику (кадр, список, таймлайн)
// даёт CardStories, здесь — картинка этапов. Товар — схематичные наушники,
// без картинок и роликов из хранилища
defineProps({
  active: { type: Number, required: true },
})

const brief = ['Наушники беспроводные', 'Wildberries и Ozon', 'Выгода — шумоподавление', 'Ролик на 6 секунд']

// раскадровка 6 секунд
const board = [
  { time: '0–1,5 с', name: 'зацепка' },
  { time: '1,5–4 с', name: 'выгода' },
  { time: '4–6 с', name: 'призыв' },
]

const files = ['ozon.mp4', 'wildberries.mp4', 'cover.webp']

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
  // 2 сценарий: три полосы раскадровки, по ним идёт плейхед
  (s, { u, dur }) => {
    const t = gsap.timeline()
    const rows = s.querySelectorAll('.board-row')
    t.from(rows, { opacity: 0, x: -16 * u(), stagger: 0.3, duration: 0.4, ease: 'power2.out' }, 0.2)
    rows.forEach((row, i) => {
      t.to(row, { backgroundColor: getComputedStyle(row).getPropertyValue('--row-on').trim(), duration: 0.2 }, 1.6 + i * 1.5)
        .to(row.querySelector('.bar i'), { scaleX: 1, duration: 1.3, ease: 'none' }, 1.6 + i * 1.5)
    })
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 3 фото товара: снимки клиента сеткой
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelectorAll('.ref'), { opacity: 0, y: 16 * u(), stagger: 0.25, duration: 0.45, ease: 'power2.out' }, 0.2)
      .fromTo(s.querySelector('.note'), { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 2.4)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 4 анимация: товар оживает — лёгкий поворот и приближение
  (s, { dur }) => {
    const t = gsap.timeline()
    const hp = s.querySelector('.hp')
    t.fromTo(hp, { rotate: -6, scale: 0.92 }, { rotate: 6, scale: 1.06, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0.2)
      .from(s.querySelectorAll('.motion i'), { opacity: 0, scaleX: 0, stagger: 0.2, duration: 0.4, ease: 'power2.out' }, 0.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 5 монтаж: поверх товара появляются текст и бейдж
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.ttl'), { opacity: 0, y: 12 * u(), duration: 0.5, ease: 'power2.out' }, 0.6)
      .from(s.querySelector('.sub'), { opacity: 0, y: 8 * u(), duration: 0.4, ease: 'power2.out' }, 1.4)
      .from(s.querySelector('.badge'), { opacity: 0, scale: 0, duration: 0.5, ease: 'back.out(2)' }, 2.4)
      .from(s.querySelector('.cta'), { opacity: 0, y: 8 * u(), duration: 0.4, ease: 'back.out(2)' }, 3.4)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 6 сдача: файлы MP4 и отметка «готово»
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.files'), { y: 24 * u(), opacity: 0, duration: 0.6, ease: 'power2.out' })
      .from(s.querySelectorAll('.file'), { opacity: 0, x: -12 * u(), stagger: 0.5, duration: 0.35, ease: 'power2.out' }, 0.7)
      .fromTo(s.querySelector('.done'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 3)
    t.set({}, {}, dur - 0.2)
    return t
  },
]

defineExpose({ scenes, duration: 7 })
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

  <!-- 2 сценарий -->
  <div data-index="1" class="stage s2" :class="{ on: active === 1 }">
    <div class="center">
      <div class="board">
        <b>Сценарий · 6 с</b>
        <div v-for="row in board" :key="row.name" class="board-row">
          <span class="thumb"></span>
          <span class="txt"><i>{{ row.time }}</i>{{ row.name }}</span>
          <span class="bar"><i></i></span>
        </div>
      </div>
    </div>
  </div>

  <!-- 3 фото товара -->
  <div data-index="2" class="stage s3" :class="{ on: active === 2 }">
    <div class="refs">
      <div v-for="n in 4" :key="n" class="ref" :class="`ref${n}`"><i></i></div>
    </div>
    <span class="note">ваши фото → основа ролика</span>
  </div>

  <!-- 4 анимация -->
  <div data-index="3" class="stage s4" :class="{ on: active === 3 }">
    <span class="table"></span>
    <div class="center"><div class="hp"><span class="band"></span><span class="cup l"></span><span class="cup r"></span></div></div>
    <span class="motion"><i></i><i></i><i></i></span>
    <span class="rec">AI · оживляю сцену</span>
  </div>

  <!-- 5 монтаж -->
  <div data-index="4" class="stage s5" :class="{ on: active === 4 }">
    <span class="table"></span>
    <div class="center"><div class="hp"><span class="band"></span><span class="cup l"></span><span class="cup r"></span></div></div>
    <p class="ttl">Тишина в метро</p>
    <p class="sub">шумоподавление</p>
    <span class="badge">хит</span>
    <span class="cta">В корзину</span>
  </div>

  <!-- 6 сдача -->
  <div data-index="5" class="stage s6" :class="{ on: active === 5 }">
    <div class="center">
      <div class="files">
        <b>Файлы <span class="mp4">MP4</span></b>
        <div v-for="file in files" :key="file" class="file"><i></i>{{ file }}</div>
      </div>
    </div>
    <span class="done">готово ✓</span>
  </div>
</template>

<style scoped>
.stage { position: absolute; inset: 0; visibility: hidden; }
.stage.on { visibility: visible; }
.center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }

.note, .rec, .done, .cta { position: absolute; z-index: 5; padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); white-space: nowrap; border-radius: calc(10 * var(--u)); }
.note { left: 50%; bottom: 12%; color: var(--white); background: var(--ink); opacity: 0; translate: -50% 0; }

/* наушники — общий «товар»; координаты — пиксели кадра 494 × 659 */
.table { position: absolute; left: 0; right: 0; bottom: 0; height: 30%; background: var(--story-warm); }
.s4 .center, .s5 .center { bottom: 14%; }
.hp { position: relative; width: calc(200 * var(--u)); height: calc(190 * var(--u)); }
.hp .band { position: absolute; left: calc(22 * var(--u)); right: calc(22 * var(--u)); top: 0; height: calc(150 * var(--u)); border: calc(16 * var(--u)) solid var(--ink-soft); border-bottom: 0; border-radius: calc(100 * var(--u)) calc(100 * var(--u)) 0 0; }
.hp .cup { position: absolute; bottom: 0; width: calc(60 * var(--u)); height: calc(92 * var(--u)); border-radius: calc(22 * var(--u)); background: var(--ink); }
.hp .l { left: 0; }
.hp .r { right: 0; }

/* 1 бриф */
.s1, .s2, .s3, .s6 { background: var(--bg-2); }
.doc, .board, .files { width: 74%; padding: calc(24 * var(--u)); background: var(--white); border-radius: calc(16 * var(--u)); }
.doc b, .board b, .files b { display: flex; align-items: center; gap: calc(8 * var(--u)); margin-bottom: calc(16 * var(--u)); font: 600 calc(20 * var(--u)) var(--f-head); color: var(--ink); }
.chk { display: flex; gap: calc(12 * var(--u)); align-items: center; padding: calc(8 * var(--u)) 0; font-size: calc(14 * var(--u)); line-height: 1.4; color: var(--ink); }
.box { position: relative; flex: none; width: calc(20 * var(--u)); height: calc(20 * var(--u)); border: calc(1.5 * var(--u)) solid var(--bg-4); border-radius: calc(6 * var(--u)); }
.box .fill { position: absolute; inset: calc(-1.5 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--ink); transform: scale(0); }
.box svg { position: absolute; inset: calc(3 * var(--u)); }
.box path { stroke: var(--white); stroke-width: 2.4; fill: none; stroke-dasharray: 20; stroke-dashoffset: 20; stroke-linecap: round; stroke-linejoin: round; }

/* 2 сценарий: полосы раскадровки, текущая подсвечивается */
.board-row { --row-on: var(--story-scene); display: grid; grid-template-columns: calc(52 * var(--u)) 1fr; grid-template-rows: auto auto; column-gap: calc(12 * var(--u)); align-items: center; margin-top: calc(8 * var(--u)); padding: calc(8 * var(--u)); border-radius: calc(10 * var(--u)); background: var(--bg-2); }
.board-row .thumb { grid-row: span 2; height: calc(66 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--story-warm); }
.board-row .txt { font: 600 calc(15 * var(--u)) var(--f-head); color: var(--ink); }
.board-row .txt i { display: block; font: 400 calc(12 * var(--u)) var(--f-body); font-style: normal; color: var(--text); }
.board-row .bar { height: calc(3 * var(--u)); margin-top: calc(6 * var(--u)); overflow: hidden; border-radius: calc(2 * var(--u)); background: var(--bg-3); }
.board-row .bar i { display: block; height: 100%; background: var(--accent); transform: scaleX(0); transform-origin: left; }

/* 3 фото товара */
.refs { position: absolute; left: 10%; right: 10%; top: 10%; display: grid; grid-template-columns: 1fr 1fr; gap: calc(12 * var(--u)); }
.ref { position: relative; aspect-ratio: 4 / 5; border-radius: calc(10 * var(--u)); background: var(--story-feed); }
.ref2 { background: var(--story-warm); }
.ref3 { background: var(--story-scene); }
.ref4 { background: var(--bg-3); }
.ref i { position: absolute; left: 50%; top: 50%; width: 40%; height: 36%; border: calc(8 * var(--u)) solid var(--ink-soft); border-bottom: 0; border-radius: calc(50 * var(--u)) calc(50 * var(--u)) 0 0; translate: -50% -50%; }

/* 4 анимация: следы движения и подпись */
.s4, .s5 { background: var(--story-scene); }
.motion { position: absolute; left: calc(56 * var(--u)); top: 42%; display: flex; flex-direction: column; gap: calc(12 * var(--u)); }
.motion i { display: block; width: calc(56 * var(--u)); height: calc(4 * var(--u)); border-radius: calc(2 * var(--u)); background: var(--story-cap); transform-origin: right; }
.motion i:nth-child(2) { width: calc(36 * var(--u)); margin-left: calc(20 * var(--u)); }
.rec { top: calc(24 * var(--u)); left: 50%; color: var(--ink); background: var(--white); translate: -50% 0; }

/* 5 монтаж: текст, бейдж и кнопка поверх товара */
.ttl { position: absolute; top: 9%; left: 8%; right: 8%; z-index: 4; font: 600 calc(32 * var(--u))/1.1 var(--f-head); letter-spacing: calc(-.6 * var(--u)); color: var(--ink); }
.sub { position: absolute; top: calc(118 * var(--u)); left: 8%; z-index: 4; font: 500 calc(15 * var(--u)) var(--f-body); color: var(--warm-2); }
.badge { position: absolute; top: calc(170 * var(--u)); right: 9%; z-index: 4; display: grid; place-items: center; width: calc(72 * var(--u)); height: calc(72 * var(--u)); font: 600 calc(16 * var(--u)) var(--f-head); color: var(--white); background: var(--accent); border-radius: 50%; }
.cta { left: 50%; bottom: 9%; color: var(--white); background: var(--ink); translate: -50% 0; }

/* 6 сдача */
.mp4 { padding: calc(2 * var(--u)) calc(8 * var(--u)); font: 500 calc(12 * var(--u)) var(--f-body); color: var(--white); background: var(--ink); border-radius: calc(8 * var(--u)); }
.file { display: flex; gap: calc(12 * var(--u)); align-items: center; padding: calc(8 * var(--u)) 0; font: 500 calc(14 * var(--u))/1.4 var(--f-body); color: var(--ink); border-top: var(--hairline) solid var(--border); }
.file i { flex: none; width: calc(22 * var(--u)); height: calc(30 * var(--u)); border-radius: calc(5 * var(--u)); background: var(--story-warm); }
.done { right: calc(20 * var(--u)); bottom: calc(20 * var(--u)); color: var(--white); background: var(--ink); opacity: 0; }
</style>
