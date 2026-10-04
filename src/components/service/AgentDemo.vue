<script setup>
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import SectionHead from '../ui/SectionHead.vue'
import telegramSvg from '../../assets/messengers/telegram.svg?raw'

// «Как работает агент»: демо-переписка слева, справа — что агент делает
// в это время (события, таблица заявок, уведомление). Сценарии — page.demo.scenarios,
// имена и данные вымышлены, это подписано. Макет — docs/mockups/service-agents.html (A)
const props = defineProps({
  // { title, lead, note, channel, footnote, table: [[...]], scenarios: [{ title, who, steps: [{ type, text | cells }] }] }
  demo: { type: Object, required: true },
})

// тайминги макета, мс
const T = { typing: 900, afterAgent: 700, beforeUser: 500, afterUser: 600, log: 400, row: 500, ping: 900, between: 5000 }
const LOG_MAX = 4

const current = ref(0)
const who = ref(props.demo.scenarios[0].who)
const messages = ref([])
const log = ref([])
const rows = ref([])
const ping = reactive({ on: false, title: '', text: '' })

const blockEl = ref(null)
const feedEl = ref(null)

let uid = 0
let run = 0
let reduce = false
let inView = false
let started = false
let observer = null
const timers = new Set()
let resumeWaiters = []

// весь сценарий сразу — для пререндера и reduced motion
function fill(k) {
  reset(k)
  props.demo.scenarios[k].steps.forEach(apply)
}

function reset(k) {
  current.value = k
  who.value = props.demo.scenarios[k].who
  messages.value = []
  log.value = []
  rows.value = []
  ping.on = false
}

// один шаг сценария — в ленту, журнал, таблицу или уведомление
function apply(step) {
  const id = ++uid
  if (step.type === 'u' || step.type === 'a') messages.value.push({ id, type: step.type, text: step.text })
  else if (step.type === 'log') {
    log.value.push({ id, text: step.text })
    if (log.value.length > LOG_MAX) log.value.shift()
  } else if (step.type === 'row') rows.value.unshift({ id, cells: step.cells })
  else if (step.type === 'ping') {
    ping.title = step.cells[0]
    ping.text = step.cells[1]
    ping.on = true
  }
}

const active = () => inView && !document.hidden

// пауза, пока блок вне экрана или вкладка скрыта
function whenActive() {
  if (active()) return Promise.resolve()
  return new Promise((resolve) => resumeWaiters.push(resolve))
}

function resume() {
  if (!active()) return
  resumeWaiters.forEach((r) => r())
  resumeWaiters = []
}

function wait(ms) {
  return new Promise((resolve) => {
    const t = setTimeout(() => { timers.delete(t); resolve() }, ms)
    timers.add(t)
  })
}

// лента чата прокручивается сама к последнему сообщению — только она, не страница
async function scrollFeed() {
  await nextTick()
  const el = feedEl.value
  if (el) el.scrollTop = el.scrollHeight
}

async function play(k) {
  const id = ++run
  if (reduce) {
    fill(k)
    await scrollFeed()
    return
  }
  reset(k)
  const alive = async (ms) => {
    await wait(ms)
    await whenActive()
    return id === run
  }
  for (const step of props.demo.scenarios[k].steps) {
    if (id !== run) return
    if (step.type === 'a') {
      const typing = { id: ++uid, type: 'typing' }
      messages.value.push(typing)
      await scrollFeed()
      if (!(await alive(T.typing))) return
      messages.value = messages.value.filter((m) => m !== typing && m.id !== typing.id)
      apply(step)
      await scrollFeed()
      if (!(await alive(T.afterAgent))) return
    } else if (step.type === 'u') {
      if (!(await alive(T.beforeUser))) return
      apply(step)
      await scrollFeed()
      if (!(await alive(T.afterUser))) return
    } else {
      apply(step)
      if (!(await alive(T[step.type] ?? T.log))) return
    }
  }
  // пауза — и следующий сценарий по кругу
  if (await alive(T.between)) play((k + 1) % props.demo.scenarios.length)
}

function choose(k) {
  started = true
  play(k)
}

function replay() {
  started = true
  play(current.value)
}

// до монтирования и в пререндере — первый сценарий целиком
fill(0)

onMounted(() => {
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return
  reset(0)
  observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    // первый запуск — когда блок впервые попал в экран
    if (inView && !started) {
      started = true
      play(0)
    }
    resume()
  }, { threshold: 0.3 })
  observer.observe(blockEl.value)
  document.addEventListener('visibilitychange', resume)
})

onUnmounted(() => {
  run += 1
  timers.forEach(clearTimeout)
  timers.clear()
  observer?.disconnect()
  document.removeEventListener('visibilitychange', resume)
})
</script>

<template>
  <div class="demo-block">
    <SectionHead pill="Примеры" :title="demo.title" :lead="demo.lead" />

    <span class="caption demo__note">{{ demo.note }}</span>

    <div class="demo__scen" role="group" aria-label="Сценарий">
      <button
        v-for="(sc, k) in demo.scenarios"
        :key="sc.title"
        type="button"
        class="small demo__pill"
        :aria-pressed="current === k"
        @click="choose(k)"
      >{{ sc.title }}</button>
    </div>

    <div ref="blockEl" class="agent">
      <!-- что видит клиент -->
      <div class="chat">
        <div class="chat__top">
          <span class="chat__ava" aria-hidden="true">m<b>/</b></span>
          <div>
            <strong class="chat__name">Помощник m/design</strong>
            <span class="caption chat__who">{{ who }}</span>
          </div>
          <span class="caption chat__channel">{{ demo.channel }}</span>
        </div>
        <div ref="feedEl" class="chat__feed" aria-live="polite">
          <template v-for="m in messages" :key="m.id">
            <div v-if="m.type === 'typing'" class="msg is-a is-typing" aria-label="печатает">
              <i></i><i></i><i></i>
            </div>
            <div v-else class="small msg" :class="`is-${m.type}`">{{ m.text }}</div>
          </template>
        </div>
      </div>

      <!-- что делает агент -->
      <div class="back" aria-live="polite">
        <p class="small back__title">За кулисами<span>сейчас</span></p>
        <ul class="small back__log">
          <!-- в тексте событий только <b> — данные свои, не пользовательские -->
          <li v-for="item in log" :key="item.id"><i aria-hidden="true"></i><span v-html="item.text"></span></li>
        </ul>
        <div class="caption tbl" role="table" aria-label="Таблица заявок">
          <div class="tbl__row is-head" role="row">
            <span role="columnheader">Клиент</span><span role="columnheader">Задача</span>
            <span role="columnheader">Площадка</span><span role="columnheader">Статус</span>
          </div>
          <div v-for="r in rows" :key="r.id" class="tbl__row is-new" role="row">
            <span v-for="(c, i) in r.cells" :key="i" role="cell" :class="{ tbl__status: i === 3 }">{{ c }}</span>
          </div>
          <div v-for="(r, k) in demo.table" :key="`base-${k}`" class="tbl__row" role="row">
            <span v-for="(c, i) in r" :key="i" role="cell" :class="{ tbl__status: i === 3 }">{{ c }}</span>
          </div>
        </div>
        <div class="ping" :class="{ 'is-on': ping.on }">
          <span class="ping__icon" aria-hidden="true" v-html="telegramSvg"></span>
          <div>
            <b class="small ping__title">{{ ping.title }}</b>
            <span class="caption ping__text">{{ ping.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="small demo__under">
      <span>{{ demo.footnote }}</span>
      <button type="button" class="small demo__replay" @click="replay">↻ проиграть заново</button>
    </div>
  </div>
</template>

<style scoped>
.demo__note {
  display: inline-flex;
  align-items: center;
  gap: var(--s-8);
  margin-bottom: var(--s-20);
  padding: var(--s-4) var(--s-12);
  color: var(--ink);
  background: var(--white);
  border-radius: var(--r-pill);
}

.demo__note::before {
  content: "";
  width: var(--dot);
  height: var(--dot);
  background: var(--accent);
  border-radius: 50%;
}

.demo__scen {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-8);
  margin-bottom: var(--s-24);
}

.demo__pill {
  padding: var(--s-8) var(--s-16);
  font-weight: 500;
  color: var(--warm-2);
  background: var(--bg-3);
  border: 0;
  border-radius: var(--r-pill);
  transition: background-color var(--ease), color var(--ease);
}

.demo__pill[aria-pressed="true"] {
  color: var(--white);
  background: var(--ink);
}

.demo__pill:focus-visible,
.demo__replay:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.agent {
  display: grid;
  grid-template-columns: minmax(var(--agent-col-min), 1fr) 1.15fr;
  gap: var(--s-16);
}

/* ---------- чат ---------- */
.chat {
  display: flex;
  flex-direction: column;
  height: var(--agent-demo-h);
  padding: var(--s-20);
  background: var(--white);
  border-radius: var(--r-stage);
}

.chat__top {
  display: flex;
  align-items: center;
  gap: var(--s-12);
  padding-bottom: var(--s-12);
  border-bottom: var(--hairline) solid var(--border);
}

.chat__ava {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--agent-ava);
  height: var(--agent-ava);
  font: 700 var(--t-small)/1 var(--f-head);
  color: var(--white);
  white-space: nowrap;
  background: var(--ink);
  border-radius: 50%;
}

.chat__ava b {
  color: var(--accent);
}

.chat__name {
  display: block;
  font: 500 var(--t-body)/1.4 var(--f-body);
  color: var(--ink);
}

.chat__who {
  color: var(--text);
}

.chat__channel {
  margin-left: auto;
  padding: 0 var(--s-8);
  color: var(--warm-2);
  background: var(--bg-3);
  border-radius: var(--r-pill);
}

.chat__feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
  padding-top: var(--s-12);
  overflow-y: auto;
  scrollbar-width: none;
}

.chat__feed::-webkit-scrollbar {
  display: none;
}

.msg {
  max-width: 82%;
  padding: var(--s-8) var(--s-12);
  color: var(--ink);
  border-radius: var(--msg-r);
  animation: msg-pop .35s var(--ease-out);
}

.msg.is-u {
  align-self: flex-end;
  background: var(--bg-3);
  border-bottom-right-radius: var(--r-sm);
}

.msg.is-a {
  align-self: flex-start;
  background: var(--bg);
  border-bottom-left-radius: var(--r-sm);
}

.msg.is-typing {
  display: inline-flex;
  gap: var(--s-4);
  padding: var(--s-12);
}

.msg.is-typing i {
  width: var(--dot);
  height: var(--dot);
  background: var(--text-3);
  border-radius: 50%;
  animation: msg-dot 1s infinite;
}

.msg.is-typing i:nth-child(2) { animation-delay: .15s; }
.msg.is-typing i:nth-child(3) { animation-delay: .3s; }

@keyframes msg-pop {
  from { opacity: 0; transform: translateY(var(--s-8)); }
}

@keyframes msg-dot {
  50% { opacity: .25; }
}

/* ---------- за кулисами ---------- */
.back {
  display: flex;
  flex-direction: column;
  gap: var(--s-16);
  height: var(--agent-demo-h);
  padding: var(--s-24);
  overflow: hidden;
  color: var(--dark-section-text);
  background: var(--ink);
  border-radius: var(--r-stage);
}

.back__title {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: var(--white);
}

.back__title span {
  font-weight: 400;
  color: var(--footer-text);
}

.back__log {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
  min-height: var(--agent-log-h);
}

.back__log li {
  display: flex;
  align-items: baseline;
  gap: var(--s-8);
  animation: msg-pop .35s var(--ease-out);
}

.back__log i {
  flex: none;
  width: var(--dot);
  height: var(--dot);
  background: var(--accent);
  border-radius: 50%;
}

.back__log :deep(b) {
  font-weight: 500;
  color: var(--white);
}

.tbl {
  padding: var(--s-12);
  background: var(--ink-soft);
  border-radius: var(--r-card);
}

.tbl__row {
  display: grid;
  grid-template-columns: 1.1fr 1.2fr 1fr .9fr;
  align-items: center;
  gap: var(--s-8);
  padding: var(--s-8) 0;
  border-bottom: var(--hairline) solid var(--footer-border);
}

.tbl__row:last-child {
  border-bottom: 0;
}

.tbl__row.is-head {
  color: var(--footer-text);
}

.tbl__row.is-new {
  color: var(--white);
  animation: row-in .6s var(--ease-out);
}

.tbl__status {
  justify-self: start;
  white-space: nowrap;
  padding: 0 var(--s-8);
  color: var(--accent);
  background: var(--status-bg);
  border-radius: var(--r-pill);
}

@keyframes row-in {
  from { background: var(--row-flash); }
}

.ping {
  display: flex;
  align-items: center;
  gap: var(--s-12);
  margin-top: auto;
  padding: var(--s-12);
  color: var(--ink);
  background: var(--white);
  border-radius: var(--r-card);
  opacity: 0;
  transform: translateY(var(--s-16));
  transition: opacity .4s var(--ease-out), transform .5s var(--ease-out);
}

.ping.is-on {
  opacity: 1;
  transform: none;
}

.ping__icon {
  flex: none;
  width: var(--agent-icon);
  height: var(--agent-icon);
}

.ping__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.ping__title {
  display: block;
  font-weight: 500;
  color: var(--ink);
}

.ping__text {
  color: var(--text);
}

.demo__under {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--s-16);
  margin-top: var(--s-16);
}

.demo__replay {
  padding: 0;
  font-weight: 500;
  color: var(--ink);
  background: none;
  border: 0;
}

@media (max-width: 767px) {
  .agent {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .msg,
  .back__log li,
  .tbl__row.is-new,
  .msg.is-typing i {
    animation: none;
  }
}
</style>
