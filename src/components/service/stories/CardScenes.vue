<script setup>
import { gsap } from 'gsap'

// сцены сторис «Как я делаю карточку» (инфографика) — реальный кейс,
// раздельный купальник для Ozon. Макет docs/site/process-mockup/kupalnik.html.
// Механику (кадр, список, таймлайн) даёт CardStories, здесь — картинка этапов
const props = defineProps({
  active: { type: Number, required: true },
  media: { type: String, default: '' }, // папка с картинками кейса в Object Storage
})

const src = (name) => props.media + name

// скриншоты выдачи 2340×1774; прямоугольники карточек — в % от обрезки .crop4
// [left, top, width, height]
const FEED = {
  kari: [0.55, 0.5, 23.6, 34.9],
  zella: [25.8, 0.5, 23.6, 34.9],
  mine: [50.9, 0.5, 23.6, 34.9],
  mozzito: [50.9, 50.3, 23.6, 34.9],
}
// где стоит моя карточка внутри обрезки .crop3
const SLOT = { left: '32.6%', top: '0.49%', width: '34.8%', height: '34.9%' }

const pct = (v) => `${v}%`

// у каждого этапа своя сцена длиной ~duration секунд.
// ctx: u() — 1 px макета в px экрана, dur — длина сцены
const scenes = [
  // 1 бриф: бланк, фото от клиента, галочки по одной, референсы
  (s, { u }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.doc'), { y: 24 * u(), opacity: 0, duration: 0.6, ease: 'power2.out' })
    t.from(s.querySelector('.clip'), { y: 40 * u(), rotate: 14, opacity: 0, duration: 0.7, ease: 'back.out(1.6)' }, 0.5)
    s.querySelectorAll('.chk').forEach((c, i) => {
      t.to(c.querySelector('.fill'), { scale: 1, duration: 0.25, ease: 'back.out(2)' }, 1.2 + i * 1.2)
        .to(c.querySelector('path'), { strokeDashoffset: 0, duration: 0.3 }, '-=0.1')
    })
    // fromTo, а не from: при reduced motion CardStories сразу перематывает сцену на конец,
    // и from со stagger оставался в начальном состоянии (scale 0)
    t.fromTo(s.querySelectorAll('.refs > *'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.15, duration: 0.4, ease: 'back.out(2)' }, 7.6)
    return t
  },
  // 2 анализ: выдача, лупа обходит карточки, отметки и выводы
  (s, { u }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.crop4'), { opacity: 0, y: 16 * u(), duration: 0.5, ease: 'power2.out' })
    const order = ['kari', 'zella', 'mozzito', 'mine']
    const marks = s.querySelectorAll('.mark')
    const lens = s.querySelector('.lens')
    const notes = s.querySelectorAll('.note')
    order.forEach((key, i) => {
      const [l, top, w, h] = FEED[key]
      const p = { left: pct(l + w / 2), top: pct(top + h / 2) }
      gsap.set(marks[i], { left: pct(l), top: pct(top), width: pct(w), height: pct(h) })
      if (i === 0) t.set(lens, p, 0).to(lens, { opacity: 1, duration: 0.3 }, 1)
      else t.to(lens, { ...p, duration: 0.9, ease: 'power2.inOut' }, 1.2 + i * 1.6)
      t.to(marks[i], { opacity: 1, duration: 0.2 }, 2.1 + i * 1.6)
      if (i < 3) t.fromTo(notes[i], { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.3 }, 2.2 + i * 1.6)
    })
    t.to(lens, { opacity: 0, duration: 0.3 }, 7.6)
    t.fromTo(notes[3], { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 7.8)
    return t
  },
  // 3 ИИ-фотосессия: фото на белом → пять ИИ-кадров со вспышкой, лента миниатюр
  (s, { u, dur }) => {
    const t = gsap.timeline()
    const shots = s.querySelectorAll('.shot')
    const thumbs = s.querySelectorAll('.strip img')
    const flash = s.querySelector('.flash')
    const lbl = s.querySelector('.lbl')
    for (let i = 1; i < shots.length; i++) {
      const at = 0.8 + (i - 1) * 1.7
      t.call(() => { lbl.textContent = `ИИ-кадр ${i} / ${shots.length - 1}` }, null, at)
        .fromTo(flash, { opacity: 0.85 }, { opacity: 0, duration: 0.4 }, at)
        .set(shots[i], { opacity: 1 }, at)
        .set(shots[i - 1], { opacity: 0 }, at)
        .fromTo(thumbs[i], { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.3 }, at + 0.2)
    }
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 4 обработка: «шторка» замены фона, сцена чуть «доезжает», плашка
  (s, { u, dur }) => {
    const t = gsap.timeline()
    const W = s.getBoundingClientRect().width
    const wipe = s.querySelector('.wipe')
    const after = s.querySelector('.after')
    t.to(wipe, { opacity: 1, duration: 0.2 }, 1)
      .fromTo(wipe, { x: 0 }, { x: W, duration: 3, ease: 'power1.inOut' }, 1)
      .fromTo(after, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 3, ease: 'power1.inOut' }, 1)
      .to(wipe, { opacity: 0, duration: 0.2 }, 4)
      .fromTo(after, { scale: 1.06 }, { scale: 1, duration: 4, ease: 'power2.out' }, 4)
      .fromTo(s.querySelector('.done'), { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 4.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 5 инфографика: главный слайд собирается по слоям (каждый слой — полный кадр)
  (s, { u, dur }) => {
    const t = gsap.timeline()
    const layers = s.querySelectorAll('.layer')
    const add = s.querySelector('.add')
    const names = ['+ заголовок', '+ размерный ряд', '+ ткань крупно', '+ детали']
    names.forEach((name, i) => {
      const at = 0.8 + i * 1.9
      t.to(layers[i + 1], { opacity: 1, duration: 0.6, ease: 'power2.out' }, at)
        .call(() => { add.textContent = name }, null, at)
        .fromTo(add, { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.3 }, at)
    })
    t.to(add, { opacity: 0, duration: 0.3 }, 8.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 6 выдача: готовый слайд встаёт на место старой карточки, остальное гаснет
  (s, { u, dur }) => {
    const t = gsap.timeline()
    const card = s.querySelector('.hero-card')
    t.set(card, { left: 0, top: 0, width: '100%', height: '100%' })
    t.to(card, { ...SLOT, duration: 1.6, ease: 'power3.inOut' }, 1.6)
    t.to(s.querySelector('.serp'), { opacity: 1, duration: 1, ease: 'power2.out' }, 4)
    t.to(card, { opacity: 0, duration: 0.3 }, 4.6)
    t.fromTo(s.querySelector('.win'), { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 5)
    t.set({}, {}, dur - 0.2)
    return t
  },
]

// сцена 3 меняет подпись — при сбросе возвращаем
function reset(s) {
  const lbl = s.querySelector('.lbl')
  if (lbl) lbl.textContent = 'исходник на белом'
}

defineExpose({ scenes, reset, duration: 10 })

const brief = [
  'Раздельный, красный с белым кантом',
  'Женщины 20–35, к отпуску',
  'Ozon: главный слайд + серия',
  'Акцент — посадка и размеры 42–52',
  'Настроение: лето, юг, солнце',
]
const notes = ['мелкий текст', 'размеров не видно', 'у всех море и пляж']
const ai = ['ai-1.webp', 'ai-2.webp', 'ai-3.webp', 'ai-4.webp', 'ai-5.webp']
const layers = ['layer-0.webp', 'layer-1.webp', 'layer-2.webp', 'layer-3.webp', 'final.webp']
</script>

<template>
  <!-- 1 бриф -->
  <div data-index="0" class="stage s1" :class="{ on: active === 0 }">
    <div class="doc">
      <b>Бриф <span class="tag">купальник</span></b>
      <div v-for="line in brief" :key="line" class="chk">
        <span class="box"><span class="fill"></span><svg viewBox="0 0 14 14"><path d="M2 7.5l3 3 7-7" /></svg></span>{{ line }}
      </div>
      <div class="refs">
        <span class="swatch"></span>
        <img :src="src('ai-2.webp')" width="840" height="1120" alt="" loading="lazy" decoding="async">
        <img :src="src('ai-4.webp')" width="840" height="1120" alt="" loading="lazy" decoding="async">
      </div>
    </div>
    <div class="clip">
      <img :src="src('source-white.webp')" width="840" height="1120" alt="" loading="lazy" decoding="async">
      <span>фото от клиента</span>
    </div>
  </div>

  <!-- 2 анализ -->
  <div data-index="1" class="stage s2" :class="{ on: active === 1 }">
    <div class="crop crop4">
      <img :src="src('competitors.webp')" width="2340" height="1774" alt="" loading="lazy" decoding="async">
      <span v-for="n in 4" :key="n" class="mark"></span>
      <span class="lens"></span>
    </div>
    <div class="notes">
      <span v-for="note in notes" :key="note" class="chip note">{{ note }}</span>
      <span class="chip chip--dark note">идея: крупный заголовок, размеры, ткань</span>
    </div>
  </div>

  <!-- 3 ИИ-фотосессия -->
  <div data-index="2" class="stage s3" :class="{ on: active === 2 }">
    <img class="full shot is-first" :src="src('source-white.webp')" width="840" height="1120" alt="" loading="lazy" decoding="async">
    <img v-for="f in ai" :key="f" class="full shot" :src="src(f)" width="840" height="1120" alt="" loading="lazy" decoding="async">
    <div class="flash"></div>
    <span class="rec"><b class="lbl">исходник на белом</b></span>
    <div class="strip">
      <img :src="src('source-white.webp')" width="840" height="1120" alt="" loading="lazy" decoding="async">
      <img v-for="f in ai" :key="f" :src="src(f)" width="840" height="1120" alt="" loading="lazy" decoding="async">
    </div>
  </div>

  <!-- 4 обработка -->
  <div data-index="3" class="stage s4" :class="{ on: active === 3 }">
    <img class="full" :src="src('model-white.webp')" width="840" height="1120" alt="" loading="lazy" decoding="async">
    <img class="full after" :src="src('model-scene.webp')" width="840" height="1120" alt="" loading="lazy" decoding="async">
    <div class="wipe"></div>
    <span class="chip done">свет и цвет под сцену</span>
  </div>

  <!-- 5 инфографика -->
  <div data-index="4" class="stage s5" :class="{ on: active === 4 }">
    <img v-for="(f, i) in layers" :key="f" class="full layer" :class="{ 'is-first': i === 0 }" :src="src(f)" width="840" height="1120" alt="" loading="lazy" decoding="async">
    <span class="chip chip--dark add"></span>
  </div>

  <!-- 6 выдача: было → стало -->
  <div data-index="5" class="stage s6" :class="{ on: active === 5 }">
    <div class="crop crop3"><img :src="src('competitors.webp')" width="2340" height="1774" alt="" loading="lazy" decoding="async"></div>
    <div class="crop crop3 serp"><img :src="src('serp.webp')" width="2340" height="1774" alt="" loading="lazy" decoding="async"></div>
    <div class="hero-card"><img :src="src('final.webp')" width="840" height="1120" alt="" loading="lazy" decoding="async"></div>
    <span class="chip chip--accent win">видно сразу</span>
  </div>
</template>

<style scoped>
.stage { position: absolute; inset: 0; visibility: hidden; }
.stage.on { visibility: visible; }
.full { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

/* плашки-подписи внутри сцены */
.chip { position: absolute; z-index: 8; padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); color: var(--ink); white-space: nowrap; background: var(--white); border-radius: calc(10 * var(--u)); }
.chip--dark { color: var(--white); background: var(--ink); }
.chip--accent { background: var(--accent); }

/* скриншот выдачи 2340×1774, обрезка через проценты */
.crop { position: absolute; overflow: hidden; }
.crop img { position: absolute; max-width: none; height: auto; }
/* 4 колонки карточек: x 451…2273, y 134…1774 исходника */
.crop4 { top: 0; left: 0; right: 0; aspect-ratio: 1822 / 1640; }
.crop4 img { top: -8.17%; left: -24.75%; width: 128.43%; }
/* 3 колонки вокруг моей карточки, 3:4: x 978…2208, y 134…1774 */
.crop3 { inset: 0; }
.crop3 img { top: -8.17%; left: -79.51%; width: 190.24%; }

/* 1 бриф */
.s1 { background: var(--bg-2); }
.doc { position: absolute; top: 9%; left: 7%; right: 7%; padding: calc(28 * var(--u)); background: var(--white); border-radius: calc(20 * var(--u)); }
.doc b { display: block; margin-bottom: calc(14 * var(--u)); font: 600 calc(26 * var(--u)) var(--f-head); letter-spacing: calc(-.6 * var(--u)); color: var(--ink); }
.tag { display: inline-block; margin-left: calc(8 * var(--u)); padding: calc(3 * var(--u)) calc(10 * var(--u)); vertical-align: middle; font: 500 calc(12 * var(--u)) var(--f-body); letter-spacing: 0; color: var(--ink); background: var(--bg-3); border-radius: var(--r-pill); }
.chk { display: flex; gap: calc(12 * var(--u)); align-items: center; padding: calc(9 * var(--u)) 0; font-size: calc(15 * var(--u)); line-height: 1.35; color: var(--ink); }
.box { position: relative; flex: none; width: calc(22 * var(--u)); height: calc(22 * var(--u)); border: calc(1.5 * var(--u)) solid var(--bg-4); border-radius: calc(7 * var(--u)); }
.box .fill { position: absolute; inset: calc(-1.5 * var(--u)); border-radius: calc(7 * var(--u)); background: var(--ink); transform: scale(0); }
.box svg { position: absolute; inset: calc(3 * var(--u)); }
.box path { stroke: var(--white); stroke-width: 2.4; fill: none; stroke-dasharray: 20; stroke-dashoffset: 20; stroke-linecap: round; stroke-linejoin: round; }
.refs { display: flex; gap: calc(8 * var(--u)); padding: calc(8 * var(--u)) 0 0 calc(34 * var(--u)); }
.refs > * { width: calc(64 * var(--u)); height: calc(85 * var(--u)); border-radius: calc(8 * var(--u)); object-fit: cover; }
.swatch { position: relative; background: var(--story-swim); }
.swatch::after { content: ""; position: absolute; left: 0; right: 0; bottom: 22%; height: calc(5 * var(--u)); background: var(--story-swim-trim); }
.clip { position: absolute; right: 5%; bottom: 5%; z-index: 3; width: 34%; padding: calc(6 * var(--u)) calc(6 * var(--u)) calc(22 * var(--u)); background: var(--white); border-radius: calc(10 * var(--u)); transform: rotate(5deg); }
.clip img { display: block; width: 100%; height: auto; aspect-ratio: 3 / 4; object-fit: cover; border-radius: calc(5 * var(--u)); }
.clip span { position: absolute; left: 0; right: 0; bottom: calc(5 * var(--u)); text-align: center; font: 500 calc(11 * var(--u)) var(--f-body); color: var(--text); }

/* 2 анализ */
.s2 { background: var(--bg-2); }
.mark { position: absolute; z-index: 4; border: calc(2.5 * var(--u)) solid var(--accent); border-radius: calc(10 * var(--u)); opacity: 0; }
.lens { position: absolute; z-index: 5; width: calc(76 * var(--u)); height: calc(76 * var(--u)); margin: calc(-38 * var(--u)) 0 0 calc(-38 * var(--u)); border: calc(2.5 * var(--u)) solid var(--ink); border-radius: 50%; background: var(--story-glass); opacity: 0; }
.lens::after { content: ""; position: absolute; right: calc(-22 * var(--u)); bottom: calc(-6 * var(--u)); width: calc(28 * var(--u)); height: calc(3.5 * var(--u)); border-radius: calc(2 * var(--u)); background: var(--ink); transform: rotate(45deg); }
.notes { position: absolute; left: 6%; right: 6%; bottom: 13%; display: flex; flex-wrap: wrap; gap: calc(6 * var(--u)); }
.notes .chip { position: static; opacity: 0; }

/* 3 ИИ-фотосессия */
.s3 { background: var(--bg-4); }
.shot { opacity: 0; }
.shot.is-first { opacity: 1; }
.flash { position: absolute; inset: 0; z-index: 6; background: var(--white); opacity: 0; }
.rec { position: absolute; top: calc(18 * var(--u)); left: 50%; z-index: 7; display: flex; gap: calc(6 * var(--u)); align-items: center; padding: calc(5 * var(--u)) calc(12 * var(--u)); font: 500 calc(12 * var(--u)) var(--f-body); color: var(--ink); white-space: nowrap; background: var(--white); border-radius: var(--r-pill); transform: translateX(-50%); }
.rec::before { content: ""; width: calc(8 * var(--u)); height: calc(8 * var(--u)); border-radius: 50%; background: var(--accent); }
.strip { position: absolute; left: 50%; bottom: calc(56 * var(--u)); z-index: 7; display: flex; gap: calc(6 * var(--u)); transform: translateX(-50%); }
.strip img { width: calc(38 * var(--u)); height: calc(50 * var(--u)); object-fit: cover; border: calc(2 * var(--u)) solid var(--white); border-radius: calc(6 * var(--u)); opacity: 0; }
.strip img:first-child { opacity: 1; }

/* 4 обработка */
.after { clip-path: inset(0 100% 0 0); }
.wipe { position: absolute; top: 0; bottom: 0; left: 0; z-index: 6; width: calc(2 * var(--u)); background: var(--ink); opacity: 0; }
.wipe::after { content: "замена фона"; position: absolute; top: calc(20 * var(--u)); left: calc(8 * var(--u)); padding: calc(4 * var(--u)) calc(10 * var(--u)); font: 500 calc(12 * var(--u)) var(--f-body); color: var(--white); white-space: nowrap; background: var(--ink); border-radius: calc(8 * var(--u)); }
.done { right: 5%; bottom: 5%; opacity: 0; }

/* 5 инфографика */
.layer { opacity: 0; }
.layer.is-first { opacity: 1; }
.add { right: 5%; bottom: 5%; opacity: 0; }

/* 6 выдача */
.serp { opacity: 0; }
.hero-card { position: absolute; top: 0; left: 0; z-index: 9; width: 100%; height: 100%; overflow: hidden; }
.hero-card img { display: block; width: 100%; height: 100%; object-fit: cover; }
.win { top: 52%; left: 50%; z-index: 10; opacity: 0; transform: translateX(-50%); }
</style>
