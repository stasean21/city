<script setup>
import { gsap } from 'gsap'

// сцены сторис «Как я делаю карточку» (инфографика) — утверждённый макет
// docs/mockups/card-stories.html. Механику (кадр, список, таймлайн) даёт
// CardStories, здесь — только картинка этапов и их анимации
defineProps({
  active: { type: Number, required: true },
})

// у каждого этапа своя сцена длиной ~duration секунд.
// ctx: u() — 1 px макета в px экрана, cssVar(имя), dur — длина сцены
const scenes = [
  // 1 бриф: галочки по одной, потом референсы
  (s, { u }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.doc'), { y: 24 * u(), opacity: 0, duration: 0.6, ease: 'power2.out' })
    s.querySelectorAll('.chk').forEach((c, i) => {
      t.to(c.querySelector('.fill'), { scale: 1, duration: 0.25, ease: 'back.out(2)' }, 1 + i * 1.3)
        .to(c.querySelector('path'), { strokeDashoffset: 0, duration: 0.3 }, '-=0.1')
    })
    t.from(s.querySelectorAll('.refs span'), { scale: 0, opacity: 0, stagger: 0.15, duration: 0.4, ease: 'back.out(2)' }, 7.6)
    return t
  },
  // 2 анализ: выдача появляется, лупа ходит, отмечает слабые, выводы
  (s, { u }) => {
    const t = gsap.timeline()
    const cards = s.querySelectorAll('.feed .c')
    t.from(cards, { opacity: 0, y: 16 * u(), stagger: 0.08, duration: 0.4, ease: 'power2.out' })
    const lens = s.querySelector('.lens')
    const r = s.getBoundingClientRect()
    const half = 35 * u()
    const order = [0, 2, 4, 3]
    const pos = order.map((i) => {
      const b = cards[i].getBoundingClientRect()
      return { x: b.left - r.left + b.width / 2 - half, y: b.top - r.top + b.height / 2 - half }
    })
    t.set(lens, { left: 0, top: 0, x: pos[0].x, y: pos[0].y, opacity: 0 }, 0)
    t.to(lens, { opacity: 1, duration: 0.3 }, 1)
    const notes = s.querySelectorAll('.notes span')
    pos.forEach((p, i) => {
      t.to(lens, { x: p.x, y: p.y, duration: 0.9, ease: 'power2.inOut' }, 1.2 + i * 1.6)
      t.to(cards[order[i]].querySelector('.x'), { opacity: 1, duration: 0.2 }, 2.1 + i * 1.6)
      if (notes[i] && i < 3) t.to(notes[i], { opacity: 1, y: 0, duration: 0.3 }, 2.2 + i * 1.6)
    })
    t.to(lens, { opacity: 0, duration: 0.3 }, 7.6)
    t.fromTo(notes[3], { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 7.8)
    return t
  },
  // 3 съёмка: ракурсы с разных сторон, вспышка, лента кадров
  (s, { u, dur }) => {
    const t = gsap.timeline()
    const k = u()
    const b = s.querySelector('.bottle')
    const lbl = b.querySelector('.lbl')
    const lines = b.querySelector('.lines')
    const capTop = b.querySelector('.cap-top')
    const ang = s.querySelector('.ang')
    const num = s.querySelector('.num')
    const flash = s.querySelector('.flash')
    const shots = s.querySelectorAll('.strip span')
    const views = [
      { name: 'спереди', w: 108, h: 250, rot: 0, lbl: 1, lines: 0 },
      { name: 'сбоку', w: 46, h: 250, rot: 0, lbl: 0, lines: 0 },
      { name: 'сзади', w: 108, h: 250, rot: 0, lbl: 0, lines: 1 },
      { name: '3/4', w: 84, h: 250, rot: -8, lbl: 1, lines: 0 },
      { name: 'сверху', w: 120, h: 120, rot: 0, lbl: 0, lines: 0, round: 1 },
    ]
    views.forEach((v, i) => {
      const at = 0.4 + i * 1.8
      t.to(b, {
        width: v.w * k,
        height: v.h * k,
        rotate: v.rot,
        borderRadius: v.round ? '50%' : `${18 * k}px ${18 * k}px ${12 * k}px ${12 * k}px`,
        duration: 0.6,
        ease: 'power2.inOut',
      }, at)
        .to(lbl, { opacity: v.lbl, duration: 0.3 }, at)
        .to(lines, { opacity: v.lines, duration: 0.3 }, at)
        .to(capTop, { opacity: v.round ? 0 : 1, duration: 0.3 }, at)
        .call(() => { ang.textContent = v.name; num.textContent = i + 1 }, null, at + 0.3)
        .fromTo(flash, { opacity: 0.85 }, { opacity: 0, duration: 0.35 }, at + 1)
        .to(shots[i], { opacity: 1, y: 0, duration: 0.3 }, at + 1.1)
    })
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 4 обработка: фон уходит «шторкой», появляется сцена, печатается заголовок
  (s, { cssVar, dur }) => {
    const t = gsap.timeline()
    const clean = s.querySelector('.clean')
    const wipe = s.querySelector('.wipe')
    const raw = s.querySelector('.raw')
    const b = s.querySelector('.bottle')
    const tx = s.querySelector('.tx')
    const W = s.getBoundingClientRect().width
    t.set(b, { background: cssVar('--story-product'), rotate: -3 })
    t.to(wipe, { opacity: 1, duration: 0.2 }, 1)
      .fromTo(wipe, { x: 0 }, { x: W, duration: 2.4, ease: 'power1.inOut' }, 1)
      .fromTo(clean, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 2.4, ease: 'power1.inOut' }, 1)
      .to(wipe, { opacity: 0, duration: 0.2 }, 3.4)
      .set(raw, { opacity: 0 }, 3.4)
      .to(b, { background: cssVar('--white'), rotate: 0, duration: 0.8, ease: 'power2.out' }, 3.6)
      .from(s.querySelector('.disc'), { scale: 0.6, opacity: 0, duration: 0.8, ease: 'power2.out' }, 3.6)
    const text = 'Сыворотка для сияния кожи'
    const o = { n: 0 }
    t.to(o, { n: text.length, duration: 2.6, ease: 'none', onUpdate: () => { tx.textContent = text.slice(0, Math.round(o.n)) } }, 5)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 5 инфографика: плашки прилетают на готовое фото
  (s, { u, dur }) => {
    const t = gsap.timeline()
    const k = u()
    t.from(s.querySelector('.ttl'), { opacity: 0, y: 12 * k, duration: 0.5 }, 0.3)
    const from = [{ x: 60 * k }, { x: 60 * k }, { x: -60 * k }, { y: 40 * k }]
    s.querySelectorAll('.bdg').forEach((el, i) => {
      t.fromTo(el, { opacity: 0, scale: 0.8, ...from[i] }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.6, ease: 'back.out(1.8)' }, 1.2 + i * 1.6)
    })
    t.fromTo(s.querySelector('.bottle'), { scale: 1 }, { scale: 1.04, duration: 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 6.5)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 6 выдача: крупная карточка уменьшается и встаёт в сетку конкурентов
  (s, { u, cssVar, dur }) => {
    const t = gsap.timeline()
    const k = u()
    const card = s.querySelector('.hero-card')
    const slot = s.querySelector('.slot')
    const win = s.querySelector('.win')
    const others = s.querySelectorAll('.grid6 > div:not(.slot)')
    const fr = s.getBoundingClientRect()
    const sl = slot.getBoundingClientRect()
    t.set(card, { x: 0, y: 0, scale: 1, borderRadius: 0 })
    t.to(card, { x: sl.left - fr.left, y: sl.top - fr.top, scale: sl.width / fr.width, borderRadius: 40 * k, duration: 1.6, ease: 'power3.inOut' }, 2.2)
    t.to(others, { opacity: 0.55, duration: 0.5, stagger: 0.06 }, 3.2)
    t.set(card, { outline: `${6 * k}px solid ${cssVar('--ink')}` }, 4.2)
    t.fromTo(win, { opacity: 0, y: 8 * k }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 4.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
]

// сцена 4 печатает заголовок — при сбросе стираем
function reset(s) {
  const tx = s.querySelector('.tx')
  if (tx) tx.textContent = ''
}

defineExpose({ scenes, reset, duration: 10 })
</script>

<template>
  <!-- 1 бриф -->
  <div data-index="0" class="stage s1" :class="{ on: active === 0 }">
    <div class="center">
      <div class="doc">
        <b>Бриф</b>
        <div v-for="line in ['Сыворотка с витамином C', 'Женщины 25–40', 'Wildberries, 5 слайдов', 'Акцент — сияние кожи', 'Референсы']" :key="line" class="chk">
          <span class="box"><span class="fill"></span><svg viewBox="0 0 14 14"><path d="M2 7.5l3 3 7-7" /></svg></span>{{ line }}
        </div>
        <div class="refs"><span></span><span></span><span></span></div>
      </div>
    </div>
  </div>

  <!-- 2 анализ -->
  <div data-index="1" class="stage s2" :class="{ on: active === 1 }">
    <div class="feed">
      <div v-for="n in 6" :key="n" class="c"><span class="x"></span></div>
    </div>
    <div class="lens"></div>
    <div class="notes">
      <span>белый фон у всех</span><span>мелкий текст</span><span>нет преимуществ</span>
      <span class="idea">идея: тёплый фон + крупные плашки</span>
    </div>
  </div>

  <!-- 3 съёмка -->
  <div data-index="2" class="stage s3" :class="{ on: active === 2 }">
    <div class="table"></div>
    <div class="center">
      <div class="bottle"><span class="cap-top"></span><span class="lbl">SERUM</span><span class="lines"><i></i><i></i><i></i><i></i></span></div>
    </div>
    <span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
    <span class="rec">ракурс <b class="ang">спереди</b> · кадр <b class="num">1</b> / 5</span>
    <div class="strip"><span v-for="n in 5" :key="n"><i></i></span></div>
    <div class="flash"></div>
  </div>

  <!-- 4 обработка -->
  <div data-index="3" class="stage s4" :class="{ on: active === 3 }">
    <div class="raw"><div class="table"></div></div>
    <div class="clean"><div class="disc"></div></div>
    <div class="center"><div class="bottle"><span class="cap-top"></span><span class="lbl">SERUM</span></div></div>
    <div class="wipe"></div>
    <div class="ttl"><span class="tx"></span><span class="caret"></span></div>
  </div>

  <!-- 5 инфографика -->
  <div data-index="4" class="stage s5" :class="{ on: active === 4 }">
    <div class="disc"></div>
    <div class="center"><div class="bottle"><span class="cap-top"></span><span class="lbl">SERUM</span></div></div>
    <div class="ttl">Сыворотка для сияния кожи</div>
    <div class="bdg bd1"><i></i>Витамин C 15%</div>
    <div class="bdg bd2"><i></i>Без отдушек</div>
    <div class="bdg bd3"><i></i>30 мл</div>
    <div class="bdg bd4"><i></i>Результат за 14 дней</div>
    <div class="dots"><i v-for="n in 5" :key="n"></i></div>
  </div>

  <!-- 6 выдача -->
  <div data-index="5" class="stage s6" :class="{ on: active === 5 }">
    <div class="grid6">
      <div v-for="n in 9" :key="n" :class="{ slot: n === 5 }"></div>
    </div>
    <div class="hero-card">
      <div class="disc"></div>
      <div class="center"><div class="bottle"><span class="cap-top"></span><span class="lbl">SERUM</span></div></div>
      <div class="ttl">Сыворотка для сияния кожи</div>
      <div class="bdg bd1"><i></i>Витамин C 15%</div>
      <div class="bdg bd2"><i></i>Без отдушек</div>
      <div class="bdg bd4"><i></i>Результат за 14 дней</div>
    </div>
    <div class="win">выделяется в выдаче</div>
  </div>
</template>

<style scoped>
.stage { position: absolute; inset: 0; visibility: hidden; }
.stage.on { visibility: visible; }
.center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }

/* флакон — общий «товар» */
.bottle { position: relative; width: calc(108 * var(--u)); height: calc(250 * var(--u)); border-radius: calc(18 * var(--u)) calc(18 * var(--u)) calc(12 * var(--u)) calc(12 * var(--u)); background: var(--story-product); }
.bottle .cap-top { position: absolute; top: calc(-26 * var(--u)); left: 50%; width: calc(44 * var(--u)); height: calc(28 * var(--u)); margin-left: calc(-22 * var(--u)); border-radius: calc(6 * var(--u)) calc(6 * var(--u)) 0 0; background: var(--story-cap); }
.bottle .lbl { position: absolute; top: 38%; left: 0; right: 0; text-align: center; font: 600 calc(12 * var(--u)) var(--f-head); color: var(--story-cap); }
.bottle .lines { position: absolute; top: 34%; left: 18%; right: 18%; display: flex; flex-direction: column; gap: calc(6 * var(--u)); opacity: 0; }
.bottle .lines i { height: calc(4 * var(--u)); border-radius: calc(2 * var(--u)); background: var(--story-table); }

/* 1 бриф */
.s1 { background: var(--bg-2); }
.doc { width: 70%; padding: calc(24 * var(--u)); background: var(--white); border-radius: calc(16 * var(--u)); }
.doc b { display: block; margin-bottom: calc(16 * var(--u)); font: 600 calc(20 * var(--u)) var(--f-head); color: var(--ink); }
.chk { display: flex; gap: calc(12 * var(--u)); align-items: center; padding: calc(8 * var(--u)) 0; font-size: calc(14 * var(--u)); line-height: 1.4; color: var(--ink); }
.box { position: relative; flex: none; width: calc(20 * var(--u)); height: calc(20 * var(--u)); border: calc(1.5 * var(--u)) solid var(--bg-4); border-radius: calc(6 * var(--u)); }
.box .fill { position: absolute; inset: calc(-1.5 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--ink); transform: scale(0); }
.box svg { position: absolute; inset: calc(3 * var(--u)); }
.box path { stroke: var(--white); stroke-width: 2.4; fill: none; stroke-dasharray: 20; stroke-dashoffset: 20; stroke-linecap: round; stroke-linejoin: round; }
.refs { display: flex; gap: calc(8 * var(--u)); padding: calc(6 * var(--u)) 0 0 calc(32 * var(--u)); }
.refs span { width: calc(44 * var(--u)); height: calc(58 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--bg-3); }
.refs span:nth-child(2) { background: var(--story-warm); }
.refs span:nth-child(3) { background: var(--story-warm-2); }

/* 2 анализ */
.s2 { background: var(--bg-2); }
.feed { position: absolute; left: 10%; right: 10%; top: 12%; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: calc(12 * var(--u)); }
.feed .c { position: relative; display: flex; align-items: center; justify-content: center; aspect-ratio: 3 / 4; border-radius: calc(8 * var(--u)); background: var(--story-feed); }
.feed .c::before { content: ""; width: 24%; height: 50%; border-radius: calc(4 * var(--u)); background: var(--white); }
.feed .c .x { position: absolute; inset: calc(-3 * var(--u)); border: calc(2 * var(--u)) solid var(--accent); border-radius: calc(10 * var(--u)); opacity: 0; }
.lens { position: absolute; top: 20%; left: 12%; z-index: 5; width: calc(70 * var(--u)); height: calc(70 * var(--u)); border: calc(2 * var(--u)) solid var(--ink); border-radius: 50%; background: var(--story-glass); }
.lens::after { content: ""; position: absolute; right: calc(-20 * var(--u)); bottom: calc(-6 * var(--u)); width: calc(26 * var(--u)); height: calc(3 * var(--u)); border-radius: calc(2 * var(--u)); background: var(--ink); transform: rotate(45deg); }
.notes { position: absolute; left: 10%; right: 10%; bottom: 13%; display: flex; flex-wrap: wrap; gap: calc(6 * var(--u)); }
.notes span { padding: calc(6 * var(--u)) calc(10 * var(--u)); font: 500 calc(12 * var(--u)) var(--f-body); color: var(--ink); background: var(--white); border-radius: calc(10 * var(--u)); opacity: 0; }
.notes span.idea { color: var(--white); background: var(--ink); }

/* 3 съёмка */
.s3 { background: var(--story-studio); }
.s3 .table { position: absolute; left: 0; right: 0; bottom: 0; height: 28%; background: var(--story-table); }
.s3 .center { bottom: 16%; }
.corner { position: absolute; z-index: 3; width: calc(24 * var(--u)); height: calc(24 * var(--u)); border: calc(2 * var(--u)) solid var(--white); }
.c1 { top: calc(16 * var(--u)); left: calc(16 * var(--u)); border-right: 0; border-bottom: 0; }
.c2 { top: calc(16 * var(--u)); right: calc(16 * var(--u)); border-left: 0; border-bottom: 0; }
.c3 { bottom: calc(16 * var(--u)); left: calc(16 * var(--u)); border-right: 0; border-top: 0; }
.c4 { bottom: calc(16 * var(--u)); right: calc(16 * var(--u)); border-left: 0; border-top: 0; }
.rec { position: absolute; top: calc(20 * var(--u)); left: 50%; z-index: 3; display: flex; gap: calc(6 * var(--u)); align-items: center; font: 500 calc(12 * var(--u)) var(--f-body); color: var(--white); white-space: nowrap; transform: translateX(-50%); }
.rec::before { content: ""; width: calc(8 * var(--u)); height: calc(8 * var(--u)); border-radius: 50%; background: var(--accent); }
.flash { position: absolute; inset: 0; z-index: 4; background: var(--white); opacity: 0; }
.strip { position: absolute; left: 50%; bottom: calc(50 * var(--u)); z-index: 3; display: flex; gap: calc(6 * var(--u)); transform: translateX(-50%); }
.strip span { display: flex; align-items: center; justify-content: center; width: calc(34 * var(--u)); height: calc(44 * var(--u)); border: calc(2 * var(--u)) solid var(--white); border-radius: calc(5 * var(--u)); background: var(--story-product); opacity: 0; }
.strip span i { display: block; width: 30%; height: 60%; border-radius: calc(2 * var(--u)); background: var(--story-table); }

/* 4 обработка */
.s4 .raw { position: absolute; inset: 0; background: var(--story-studio); }
.s4 .raw .table { position: absolute; left: 0; right: 0; bottom: 0; height: 28%; background: var(--story-table); }
.s4 .clean { position: absolute; inset: 0; background: var(--story-scene); clip-path: inset(0 100% 0 0); }
.disc { position: absolute; left: 18%; top: 22%; width: 64%; aspect-ratio: 1; border-radius: 50%; background: var(--story-warm); }
.s4 .center, .s5 .center { top: 12%; }
.wipe { position: absolute; top: 0; bottom: 0; left: 0; z-index: 6; width: calc(2 * var(--u)); background: var(--ink); opacity: 0; }
.wipe::after { content: "удаление фона"; position: absolute; top: calc(20 * var(--u)); left: calc(8 * var(--u)); padding: calc(3 * var(--u)) calc(8 * var(--u)); font: 500 calc(11 * var(--u)) var(--f-body); color: var(--white); white-space: nowrap; background: var(--ink); border-radius: calc(8 * var(--u)); }
.ttl { position: absolute; top: 7%; left: 8%; right: 8%; z-index: 6; min-height: calc(58 * var(--u)); font: 600 calc(26 * var(--u))/1.1 var(--f-head); letter-spacing: calc(-.6 * var(--u)); color: var(--ink); }
.ttl .caret { display: inline-block; width: calc(2 * var(--u)); height: calc(24 * var(--u)); margin-left: calc(2 * var(--u)); vertical-align: calc(-3 * var(--u)); background: var(--ink); }
.s4 .bottle, .s5 .bottle, .hero-card .bottle { background: var(--white); }
.s4 .bottle .cap-top, .s5 .bottle .cap-top, .hero-card .bottle .cap-top { background: var(--ink); }
.s4 .bottle .lbl, .s5 .bottle .lbl, .hero-card .bottle .lbl { color: var(--ink); }

/* 5 инфографика */
.s5 { background: var(--story-scene); }
.bdg { position: absolute; z-index: 7; display: flex; gap: calc(8 * var(--u)); align-items: center; padding: calc(8 * var(--u)) calc(12 * var(--u)); font: 500 calc(12 * var(--u))/calc(16 * var(--u)) var(--f-body); color: var(--ink); white-space: nowrap; background: var(--white); border-radius: calc(12 * var(--u)); opacity: 0; }
.bdg i { flex: none; width: calc(22 * var(--u)); height: calc(22 * var(--u)); border-radius: calc(7 * var(--u)); background: var(--accent); }
.bd1 { right: 6%; top: 36%; }
.bd2 { right: 6%; top: 52%; }
.bd3 { left: 7%; top: 44%; }
.bd4 { left: 8%; bottom: 12%; }
.dots { position: absolute; top: calc(18 * var(--u)); right: calc(18 * var(--u)); z-index: 8; display: flex; gap: calc(4 * var(--u)); }
.dots i { width: calc(16 * var(--u)); height: calc(3 * var(--u)); border-radius: calc(2 * var(--u)); background: var(--story-dot); }
.dots i:first-child { background: var(--ink); }

/* 6 выдача */
.s6 { background: var(--bg-2); }
.grid6 { position: absolute; left: 8%; right: 8%; top: 14%; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: calc(12 * var(--u)); }
.grid6 > div { position: relative; display: flex; align-items: center; justify-content: center; aspect-ratio: 3 / 4; border-radius: calc(8 * var(--u)); background: var(--story-feed); opacity: 0; }
.grid6 > div::before { content: ""; width: 24%; height: 50%; border-radius: calc(4 * var(--u)); background: var(--white); }
.grid6 > div::after { content: ""; position: absolute; left: calc(6 * var(--u)); right: 20%; bottom: calc(-12 * var(--u)); height: calc(5 * var(--u)); border-radius: calc(3 * var(--u)); background: var(--bg-3); }
.grid6 .slot { background: transparent; opacity: 1; }
.grid6 .slot::before, .grid6 .slot::after { display: none; }
.hero-card { position: absolute; left: 0; top: 0; z-index: 9; width: 100%; height: 100%; overflow: hidden; background: var(--story-scene); transform-origin: 0 0; }
.hero-card .center { top: 12%; }
.hero-card .bdg { opacity: 1; }
.win { position: absolute; left: 50%; bottom: 12%; z-index: 10; padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(12 * var(--u)) var(--f-body); color: var(--ink); white-space: nowrap; background: var(--accent); border-radius: calc(10 * var(--u)); opacity: 0; transform: translateX(-50%); }
</style>
