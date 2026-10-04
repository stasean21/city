<script setup>
import { gsap } from 'gsap'

// сцены сторис «Как я делаю агента». Механику (кадр, список, таймлайн) даёт
// CardStories, здесь — картинка этапов: бриф, дерево диалога, база ответов,
// подключение каналов, тестовый чат, запуск
defineProps({
  active: { type: Number, required: true },
})

const brief = ['Студия дизайна, 3 услуги', 'Пишут в Telegram и на сайт', 'Частые вопросы: цена, сроки', 'Заявки — в таблицу']

// дерево диалога: вопрос → три ветки
const branches = ['цена', 'сроки', 'заявка']

const docs = ['Цены', 'Условия', 'Частые вопросы']

const nodes = [
  { id: 'tg', label: 'Telegram' },
  { id: 'site', label: 'Сайт' },
  { id: 'sheet', label: 'Таблица' },
  { id: 'you', label: 'Вам' },
]

const chat = [
  { who: 'u', text: 'Сколько стоит баннер?' },
  { who: 'a', text: 'Зависит от размеров — пришлю смету.' },
  { who: 'u', text: 'А сроки?' },
  { who: 'a', text: 'Фиксируем в смете до старта.' },
  { who: 'u', text: 'Отлично, жду' },
]

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
  // 2 сценарии: вопрос, от него расходятся ветки
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.root'), { opacity: 0, y: 12 * u(), duration: 0.45, ease: 'power2.out' }, 0.3)
      .from(s.querySelectorAll('.edge'), { scaleY: 0, stagger: 0.3, duration: 0.4, ease: 'power2.out' }, 1.1)
      .from(s.querySelectorAll('.leaf'), { opacity: 0, y: 10 * u(), stagger: 0.3, duration: 0.4, ease: 'back.out(2)' }, 1.4)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 3 база ответов: карточки-документы ложатся стопкой
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelectorAll('.kb'), { opacity: 0, y: 30 * u(), rotate: 0, stagger: 0.6, duration: 0.5, ease: 'power3.out' }, 0.3)
      .fromTo(s.querySelector('.note'), { opacity: 0, y: 8 * u() }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 2.6)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 4 сборка: каналы соединяются линиями с агентом
  (s, { dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.hub'), { scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, 0.3)
    s.querySelectorAll('.node').forEach((n, i) => {
      t.from(n.querySelector('.wire'), { scaleX: 0, duration: 0.5, ease: 'power2.out' }, 1 + i * 0.7)
        .from(n.querySelector('.chip'), { opacity: 0, scale: 0.7, duration: 0.35, ease: 'back.out(2)' }, 1.3 + i * 0.7)
    })
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 5 тест: мини-чат по одному пузырю
  (s, { u, dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelectorAll('.b'), { opacity: 0, y: 10 * u(), stagger: 0.7, duration: 0.35, ease: 'power2.out' }, 0.3)
    t.set({}, {}, dur - 0.2)
    return t
  },
  // 6 запуск: агент на связи, «готово»
  (s, { dur }) => {
    const t = gsap.timeline()
    t.from(s.querySelector('.live'), { opacity: 0, scale: 0.9, duration: 0.5, ease: 'back.out(2)' }, 0.3)
      .from(s.querySelectorAll('.stat'), { opacity: 0, x: -12, stagger: 0.4, duration: 0.35, ease: 'power2.out' }, 1)
      .fromTo(s.querySelector('.done'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 2.6)
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

  <!-- 2 сценарии -->
  <div data-index="1" class="stage s2" :class="{ on: active === 1 }">
    <div class="center">
      <div class="tree">
        <span class="root">Клиент пишет</span>
        <div class="branches">
          <div v-for="b in branches" :key="b" class="branch"><span class="edge"></span><span class="leaf">{{ b }}</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3 база ответов -->
  <div data-index="2" class="stage s3" :class="{ on: active === 2 }">
    <div class="center">
      <div class="kbs">
        <div v-for="(d, i) in docs" :key="d" class="kb" :class="`kb${i + 1}`"><b>{{ d }}</b><i></i><i></i><i></i></div>
      </div>
    </div>
    <span class="note">из ваших материалов</span>
  </div>

  <!-- 4 сборка -->
  <div data-index="3" class="stage s4" :class="{ on: active === 3 }">
    <div class="center">
      <div class="wiring">
        <span class="hub">m<b>/</b></span>
        <div v-for="n in nodes" :key="n.id" class="node" :class="`is-${n.id}`"><span class="wire"></span><span class="chip">{{ n.label }}</span></div>
      </div>
    </div>
  </div>

  <!-- 5 тест -->
  <div data-index="4" class="stage s5" :class="{ on: active === 4 }">
    <div class="center">
      <div class="mchat">
        <span v-for="(m, i) in chat" :key="i" class="b" :class="`is-${m.who}`">{{ m.text }}</span>
      </div>
    </div>
  </div>

  <!-- 6 запуск -->
  <div data-index="5" class="stage s6" :class="{ on: active === 5 }">
    <div class="center">
      <div class="launch">
        <span class="live"><i></i>агент на связи</span>
        <span class="stat">заявки → таблица</span>
        <span class="stat">важное → вам в Telegram</span>
        <span class="stat">отчёт → каждое утро</span>
      </div>
    </div>
    <span class="done">готово ✓</span>
  </div>
</template>

<style scoped>
.stage { position: absolute; inset: 0; visibility: hidden; background: var(--bg-2); }
.stage.on { visibility: visible; }
.center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.note, .done { position: absolute; padding: calc(6 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); color: var(--white); white-space: nowrap; background: var(--ink); border-radius: calc(10 * var(--u)); }
.note { left: 50%; bottom: 12%; opacity: 0; translate: -50% 0; }
.done { right: calc(20 * var(--u)); bottom: calc(20 * var(--u)); opacity: 0; }

/* 1 бриф */
.doc { width: 74%; padding: calc(24 * var(--u)); background: var(--white); border-radius: calc(16 * var(--u)); }
.doc b { display: block; margin-bottom: calc(16 * var(--u)); font: 600 calc(20 * var(--u)) var(--f-head); color: var(--ink); }
.chk { display: flex; gap: calc(12 * var(--u)); align-items: center; padding: calc(8 * var(--u)) 0; font-size: calc(14 * var(--u)); line-height: 1.4; color: var(--ink); }
.box { position: relative; flex: none; width: calc(20 * var(--u)); height: calc(20 * var(--u)); border: calc(1.5 * var(--u)) solid var(--bg-4); border-radius: calc(6 * var(--u)); }
.box .fill { position: absolute; inset: calc(-1.5 * var(--u)); border-radius: calc(6 * var(--u)); background: var(--ink); transform: scale(0); }
.box svg { position: absolute; inset: calc(3 * var(--u)); }
.box path { stroke: var(--white); stroke-width: 2.4; fill: none; stroke-dasharray: 20; stroke-dashoffset: 20; stroke-linecap: round; stroke-linejoin: round; }

/* 2 дерево диалога */
.tree { display: flex; flex-direction: column; align-items: center; width: 80%; }
.root { padding: calc(10 * var(--u)) calc(16 * var(--u)); font: 600 calc(16 * var(--u)) var(--f-head); color: var(--white); background: var(--ink); border-radius: calc(14 * var(--u)); }
.branches { display: flex; justify-content: space-between; width: 100%; margin-top: calc(8 * var(--u)); }
.branch { display: flex; flex-direction: column; align-items: center; flex: 1; }
.edge { width: calc(2 * var(--u)); height: calc(70 * var(--u)); background: var(--story-cap); transform-origin: top; }
.leaf { padding: calc(8 * var(--u)) calc(14 * var(--u)); font: 500 calc(14 * var(--u)) var(--f-body); color: var(--ink); background: var(--white); border-radius: calc(12 * var(--u)); }
.branch:nth-child(3) .leaf { color: var(--white); background: var(--accent); }

/* 3 база ответов */
.kbs { position: relative; width: calc(260 * var(--u)); height: calc(300 * var(--u)); }
.kb { position: absolute; display: flex; flex-direction: column; gap: calc(10 * var(--u)); width: calc(200 * var(--u)); padding: calc(18 * var(--u)); background: var(--white); border-radius: calc(12 * var(--u)); }
.kb b { font: 600 calc(16 * var(--u)) var(--f-head); color: var(--ink); }
.kb i { height: calc(8 * var(--u)); border-radius: calc(4 * var(--u)); background: var(--bg-3); }
.kb i:nth-child(3) { width: 70%; }
.kb1 { left: 0; top: 0; rotate: -4deg; }
.kb2 { left: calc(30 * var(--u)); top: calc(70 * var(--u)); rotate: 2deg; }
.kb3 { left: calc(60 * var(--u)); top: calc(140 * var(--u)); rotate: -1deg; }
.kb3 b::before { content: ""; display: inline-block; width: calc(8 * var(--u)); height: calc(8 * var(--u)); margin-right: calc(8 * var(--u)); border-radius: 50%; background: var(--accent); vertical-align: middle; }

/* 4 сборка: агент в центре, каналы по углам */
.wiring { position: relative; width: calc(380 * var(--u)); height: calc(300 * var(--u)); }
.hub { position: absolute; left: 50%; top: 50%; display: flex; align-items: center; justify-content: center; width: calc(84 * var(--u)); height: calc(84 * var(--u)); font: 700 calc(24 * var(--u)) var(--f-head); color: var(--white); background: var(--ink); border-radius: 50%; translate: -50% -50%; z-index: 2; }
.hub b { color: var(--accent); }
.node { position: absolute; display: flex; align-items: center; }
.node .chip { padding: calc(8 * var(--u)) calc(12 * var(--u)); font: 500 calc(13 * var(--u)) var(--f-body); color: var(--ink); background: var(--white); border-radius: calc(10 * var(--u)); white-space: nowrap; }
.node .wire { position: absolute; height: calc(2 * var(--u)); background: var(--story-cap); }
.is-tg { left: 0; top: calc(30 * var(--u)); }
.is-site { left: 0; bottom: calc(30 * var(--u)); }
.is-sheet { right: 0; top: calc(30 * var(--u)); }
.is-you { right: 0; bottom: calc(30 * var(--u)); }
.is-tg .wire, .is-site .wire { left: 100%; width: calc(80 * var(--u)); transform-origin: left; }
.is-sheet .wire, .is-you .wire { right: 100%; width: calc(80 * var(--u)); transform-origin: right; }
.is-tg .wire { rotate: 18deg; transform-origin: left; }
.is-site .wire { rotate: -18deg; }
.is-sheet .wire { rotate: -18deg; }
.is-you .wire { rotate: 18deg; }
.is-you .chip { color: var(--white); background: var(--accent); }

/* 5 тест */
.mchat { display: flex; flex-direction: column; gap: calc(8 * var(--u)); width: 76%; padding: calc(18 * var(--u)); background: var(--white); border-radius: calc(16 * var(--u)); }
.b { max-width: 80%; padding: calc(8 * var(--u)) calc(12 * var(--u)); font: 400 calc(13 * var(--u))/1.4 var(--f-body); color: var(--ink); border-radius: calc(14 * var(--u)); }
.b.is-u { align-self: flex-end; background: var(--bg-3); border-bottom-right-radius: calc(4 * var(--u)); }
.b.is-a { align-self: flex-start; background: var(--bg); border-bottom-left-radius: calc(4 * var(--u)); }

/* 6 запуск */
.launch { display: flex; flex-direction: column; align-items: flex-start; gap: calc(10 * var(--u)); }
.live { display: flex; align-items: center; gap: calc(10 * var(--u)); padding: calc(12 * var(--u)) calc(18 * var(--u)); font: 600 calc(18 * var(--u)) var(--f-head); color: var(--white); background: var(--ink); border-radius: calc(16 * var(--u)); }
.live i { width: calc(10 * var(--u)); height: calc(10 * var(--u)); border-radius: 50%; background: var(--accent); }
.stat { padding: calc(8 * var(--u)) calc(14 * var(--u)); font: 500 calc(14 * var(--u)) var(--f-body); color: var(--ink); background: var(--white); border-radius: calc(12 * var(--u)); }
</style>
