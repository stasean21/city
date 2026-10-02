<script setup>
import { gsap } from 'gsap'

// сцены сторис «Как я делаю баннеры» — макет docs/mockups/service-banners.html.
// механику (кадр, список, таймлайн) даёт CardStories, здесь — картинка этапов.
// баннер схематичный и сам перестраивается под пропорцию (container queries),
// поэтому сцены не зависят от картинок в хранилище
defineProps({
  active: { type: Number, required: true },
})

// копия иллюстрации — как у заглушек в макете
const banner = { title: 'Бег без усталости', sub: 'Новая коллекция', cta: 'Купить', badge: '−20%' }

const brief = ['Кроссовки, новая коллекция', 'VK, Telegram, Яндекс Директ', 'Цель — продажи на сайте', 'Тест одну неделю']

// раскладка адаптаций: одна идея в пяти форматах сайта
const sizes = ['vertical', 'square', 'horizontal', 'wide', 'wide-narrow']

const files = ['1080x1080.webp', '1080x1440.webp', '1440x1080.webp', '1440x810.webp', '1440x405.webp']

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
  // 2 референсы: чужая реклама, одна отмечена, вывод
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelectorAll('.ad'), { opacity: 0, y: 16 * u(), stagger: 0.12, duration: 0.45, ease: 'power2.out' })
    s.querySelectorAll('.ad .x').forEach((x, i) => {
      t.to(x, { opacity: 1, duration: 0.25 }, 1.6 + i * 0.9)
    })
    t.fromTo(s.querySelector('.idea'), { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 4.4)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 3 ключевой визуал: главный баннер собирается и согласуется
  (s, { u, dur }) => {
    const t = gsap.timeline()
    const key = s.querySelector('.key')
    t.from(key, { scale: 0.85, opacity: 0, duration: 0.7, ease: 'back.out(1.6)' }, 0.2)
      .from(key.querySelector('.bn-t'), { opacity: 0, y: 10 * u(), duration: 0.4 }, 1)
      .from(key.querySelector('.bn-c'), { opacity: 0, scale: 0.6, duration: 0.4, ease: 'back.out(2)' }, 1.6)
      .from(key.querySelector('.bn-b'), { opacity: 0, scale: 0, duration: 0.4, ease: 'back.out(2)' }, 2.1)
      .fromTo(s.querySelector('.ok'), { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 3.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 4 адаптации: тот же баннер встаёт во все размеры
  (s, { dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelectorAll('.size'), { opacity: 0, scale: 0.9, stagger: 0.8, duration: 0.5, ease: 'back.out(1.6)' }, 0.3)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 5 сдача: файлы по размерам, отметка «готово»
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.files'), { y: 24 * u(), opacity: 0, duration: 0.6, ease: 'power2.out' })
      .from(s.querySelectorAll('.file'), { opacity: 0, x: -12 * u(), stagger: 0.5, duration: 0.35, ease: 'power2.out' }, 0.7)
      .fromTo(s.querySelector('.done'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 4)
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

  <!-- 2 референсы -->
  <div data-index="1" class="stage s2" :class="{ on: active === 1 }">
    <div class="refs">
      <div v-for="n in 4" :key="n" class="ad" :class="`ad${n}`">
        <i></i><i></i><i></i>
        <span v-if="n !== 3" class="x"></span>
      </div>
    </div>
    <span class="idea">идея: один крупный оффер и кнопка</span>
  </div>

  <!-- 3 ключевой визуал -->
  <div data-index="2" class="stage s3" :class="{ on: active === 2 }">
    <div class="center">
      <div class="key">
        <div class="bn">
          <div class="bn-in">
            <p class="bn-t">{{ banner.title }}<small>{{ banner.sub }}</small></p>
            <span class="bn-p"></span>
            <span class="bn-c">{{ banner.cta }}</span>
          </div>
          <span class="bn-b">{{ banner.badge }}</span>
        </div>
      </div>
    </div>
    <span class="ok">ключевой визуал согласован ✓</span>
  </div>

  <!-- 4 адаптации -->
  <div data-index="3" class="stage s4" :class="{ on: active === 3 }">
    <div v-for="key in sizes" :key="key" class="size" :class="`is-${key}`">
      <div class="bn">
        <div class="bn-in">
          <p class="bn-t">{{ banner.title }}<small>{{ banner.sub }}</small></p>
          <span class="bn-p"></span>
          <span class="bn-c">{{ banner.cta }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 5 сдача -->
  <div data-index="4" class="stage s5" :class="{ on: active === 4 }">
    <div class="center">
      <div class="files">
        <b>Файлы</b>
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

/* баннер-схема: сам перестраивается под пропорцию рамки.
   единицы cq* — доли рамки, как единицы внутри SVG */
.bn { position: relative; width: 100%; height: 100%; overflow: hidden; container-type: size; background: var(--story-warm); border-radius: calc(10 * var(--u)); }
.bn-in { position: absolute; inset: 0; display: grid; grid-template: "t p" 1fr "c p" auto / 1fr 1fr; gap: 6cqmin; align-items: center; padding: 7cqmin; }
.bn-t { grid-area: t; align-self: start; font: 600 13cqmin/1 var(--f-head); letter-spacing: -.03em; color: var(--ink); }
.bn-t small { display: block; margin-top: 3cqmin; font: 500 6cqmin/1.2 var(--f-body); color: var(--warm-2); }
.bn-p { grid-area: p; justify-self: center; width: 80%; max-height: 100%; aspect-ratio: 1; border-radius: 42% 42% 16% 16%; background: var(--story-bn-shape); }
.bn-c { grid-area: c; justify-self: start; padding: 3cqmin 6cqmin; font: 600 6cqmin/1 var(--f-body); color: var(--white); white-space: nowrap; background: var(--ink); border-radius: var(--r-pill); }
.bn-b { position: absolute; top: 5cqmin; right: 5cqmin; display: grid; place-items: center; width: 18cqmin; height: 18cqmin; font: 600 6cqmin/1 var(--f-head); color: var(--white); background: var(--accent); border-radius: 50%; }

@container (orientation: portrait) {
  .bn-in { grid-template: "t" auto "p" 1fr "c" auto / 1fr; }
  .bn-t { font-size: 11cqw; }
  .bn-t small { font-size: 5cqw; }
  /* «товар» по высоте средней строки, чтобы кнопка не уезжала за край */
  .bn-p { width: auto; max-width: 70%; height: 100%; min-height: 0; }
  .bn-c { justify-self: center; padding: 2.5cqw 5cqw; font-size: 5cqw; }
}

@container (min-aspect-ratio: 5/2) {
  .bn-in { grid-template: "p t c" 1fr / auto 1fr auto; gap: 3cqw; padding: 0 4cqw; }
  .bn-t { align-self: center; font-size: 34cqh; }
  .bn-t small { margin-top: 2cqh; font-size: 15cqh; }
  .bn-p { width: auto; height: 76cqh; }
  .bn-c { padding: 7cqh 14cqh; font-size: 15cqh; }
}

@container (min-aspect-ratio: 6/1) {
  .bn-t { font-size: 44cqh; }
  .bn-t small { display: none; }
}

/* 1 бриф */
.s1 { background: var(--bg-2); }
.doc { width: 74%; padding: calc(24 * var(--u)); background: var(--white); border-radius: calc(16 * var(--u)); }
.doc b, .files b { display: block; margin-bottom: calc(16 * var(--u)); font: 600 calc(20 * var(--u)) var(--f-head); color: var(--ink); }
.chk { display: flex; gap: calc(12 * var(--u)); align-items: center; padding: calc(8 * var(--u)) 0; font-size: calc(14 * var(--u)); line-height: 1.4; color: var(--ink); }
.box { position: relative; flex: none; width: calc(20 * var(--u)); height: calc(20 * var(--u)); border: calc(1.5 * var(--u)) solid var(--bg-4); border-radius: calc(6 * var(--u)); }
.box .fill { position: absolute; inset: calc(-1.5 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--ink); transform: scale(0); }
.box svg { position: absolute; inset: calc(3 * var(--u)); }
.box path { stroke: var(--white); stroke-width: 2.4; fill: none; stroke-dasharray: 20; stroke-dashoffset: 20; stroke-linecap: round; stroke-linejoin: round; }

/* 2 референсы: чужие креативы схемой — заголовок, подзаголовок, кнопка */
.s2 { background: var(--bg-2); }
.refs { position: absolute; left: 10%; right: 10%; top: 10%; display: grid; grid-template-columns: 1fr 1fr; gap: calc(12 * var(--u)); }
.ad { position: relative; display: flex; flex-direction: column; gap: calc(8 * var(--u)); aspect-ratio: 1; padding: calc(18 * var(--u)); border-radius: calc(10 * var(--u)); background: var(--story-feed); }
.ad2 { background: var(--story-warm-2); }
.ad3 { background: var(--story-warm); }
.ad4 { background: var(--bg-3); }
.ad i { height: calc(10 * var(--u)); border-radius: calc(5 * var(--u)); background: var(--white); }
.ad i:nth-child(1) { width: 80%; height: calc(16 * var(--u)); }
.ad i:nth-child(2) { width: 55%; }
.ad i:nth-child(3) { width: 36%; height: calc(22 * var(--u)); margin-top: auto; border-radius: var(--r-pill); background: var(--ink); }
.ad3 i:nth-child(1) { width: 90%; height: calc(28 * var(--u)); background: var(--ink); }
.ad .x { position: absolute; inset: calc(-3 * var(--u)); border: calc(2 * var(--u)) solid var(--accent); border-radius: calc(12 * var(--u)); opacity: 0; }
.idea { position: absolute; left: 10%; bottom: 13%; padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); color: var(--white); background: var(--ink); border-radius: calc(10 * var(--u)); opacity: 0; }

/* 3 ключевой визуал */
.s3 { background: var(--story-scene); }
.key { width: 66%; aspect-ratio: 1; }
.ok { position: absolute; left: 50%; bottom: 12%; padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); color: var(--white); white-space: nowrap; background: var(--ink); border-radius: calc(10 * var(--u)); opacity: 0; translate: -50% 0; }

/* 4 адаптации: вертикальный + квадрат, горизонтальный + широкий одной высоты,
   под ними широкий узкий. координаты — пиксели кадра 494 × 659 */
.s4 { background: var(--bg-3); }
.size { position: absolute; }
.size .bn { border-radius: calc(8 * var(--u)); }
.is-vertical { left: calc(40 * var(--u)); top: calc(60 * var(--u)); width: calc(171 * var(--u)); height: calc(227 * var(--u)); }
.is-square { left: calc(227 * var(--u)); top: calc(60 * var(--u)); width: calc(227 * var(--u)); height: calc(227 * var(--u)); }
.is-horizontal { left: calc(40 * var(--u)); top: calc(303 * var(--u)); width: calc(171 * var(--u)); height: calc(128 * var(--u)); }
.is-wide { left: calc(227 * var(--u)); top: calc(303 * var(--u)); width: calc(227 * var(--u)); height: calc(128 * var(--u)); }
.is-wide-narrow { left: calc(40 * var(--u)); top: calc(447 * var(--u)); width: calc(414 * var(--u)); height: calc(116 * var(--u)); }

/* 5 сдача */
.s5 { background: var(--bg-2); }
.files { width: 74%; padding: calc(24 * var(--u)); background: var(--white); border-radius: calc(16 * var(--u)); }
.file { display: flex; gap: calc(12 * var(--u)); align-items: center; padding: calc(8 * var(--u)) 0; font: 500 calc(14 * var(--u))/1.4 var(--f-body); color: var(--ink); font-variant-numeric: tabular-nums; border-top: var(--hairline) solid var(--border); }
.file i { flex: none; width: calc(28 * var(--u)); height: calc(28 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--story-warm); }
.done { position: absolute; right: calc(20 * var(--u)); bottom: calc(20 * var(--u)); padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); color: var(--white); background: var(--ink); border-radius: calc(10 * var(--u)); opacity: 0; }
</style>
