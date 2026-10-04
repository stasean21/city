<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import SectionHead from '../ui/SectionHead.vue'

// «Как агент думает»: выбираете входящее сообщение — шаги загораются по очереди:
// понял → нашёл в базе → проверил → ответил сам или позвал вас.
// макет — docs/mockups/service-agents-think.html (F)
const props = defineProps({
  // { title, lead, footnote: [слева, справа], cases: [{ message, steps: [{ text, chip }], end: { type, title, text, chip } }] }
  think: { type: Object, required: true },
})

const STEP_TITLES = ['Понял вопрос', 'Поиск в базе', 'Проверка']
// пауза перед первым шагом и между шагами, мс
const FIRST = 150
const EVERY = 650

const current = ref(0)
// сколько шагов уже загорелось; в пререндере — все шаги первого кейса
const lit = ref(4)

const pipeEl = ref(null)
let run = 0
let reduce = false
let observer = null
const timers = new Set()

function wait(ms) {
  return new Promise((resolve) => {
    const t = setTimeout(() => { timers.delete(t); resolve() }, ms)
    timers.add(t)
  })
}

async function show(i) {
  const id = ++run
  current.value = i
  if (reduce) {
    lit.value = 4
    return
  }
  lit.value = 0
  for (let k = 0; k < 4; k += 1) {
    await wait(k ? EVERY : FIRST)
    if (id !== run) return
    lit.value = k + 1
  }
}

onMounted(() => {
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return
  lit.value = 0
  // первый кейс — когда блок появился на экране
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()
    show(current.value)
  }, { threshold: 0.3 })
  observer.observe(pipeEl.value)
})

onUnmounted(() => {
  run += 1
  timers.forEach(clearTimeout)
  observer?.disconnect()
})
</script>

<template>
  <div class="think-block">
    <SectionHead :title="think.title" :lead="think.lead" />

    <div class="think">
      <div class="think__inbox" role="group" aria-label="Сообщение клиента">
        <button
          v-for="(c, i) in think.cases"
          :key="c.message"
          type="button"
          class="small think__msg"
          :aria-pressed="current === i"
          @click="show(i)"
        >{{ c.message }}</button>
      </div>

      <ol ref="pipeEl" class="think__pipe" aria-live="polite">
        <li
          v-for="(step, k) in think.cases[current].steps"
          :key="k"
          class="think__step"
          :class="{ 'is-on': lit > k }"
        >
          <span class="caption think__n">{{ String(k + 1).padStart(2, '0') }}</span>
          <b class="think__title">{{ STEP_TITLES[k] }}</b>
          <p class="small think__text">{{ step.text }}</p>
          <span class="caption think__chip">{{ step.chip }}</span>
        </li>
        <li
          class="think__step is-end"
          :class="[`is-${think.cases[current].end.type}`, { 'is-on': lit > 3 }]"
        >
          <span class="caption think__n">04</span>
          <b class="think__title">{{ think.cases[current].end.title }}</b>
          <p class="small think__text">{{ think.cases[current].end.text }}</p>
          <span class="caption think__chip">{{ think.cases[current].end.chip }}</span>
        </li>
      </ol>

      <div class="small think__foot">
        <span>{{ think.footnote[0] }}</span>
        <b>{{ think.footnote[1] }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.think {
  padding: var(--s-32);
  color: var(--dark-section-text);
  background: var(--ink);
  border-radius: var(--r-stage);
}

/* входящие сообщения — пузыри-кнопки */
.think__inbox {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-8);
  margin-bottom: var(--s-24);
}

.think__msg {
  max-width: var(--think-msg-max);
  padding: var(--s-8) var(--s-12);
  text-align: left;
  color: var(--white);
  background: var(--ink-soft);
  border: 0;
  border-radius: var(--msg-r);
  border-bottom-right-radius: var(--r-sm);
  transition: background-color var(--ease), color var(--ease);
}

.think__msg[aria-pressed="true"] {
  color: var(--ink);
  background: var(--white);
}

.think__msg:focus-visible {
  outline: var(--focus-ring) solid var(--accent);
  outline-offset: var(--focus-ring);
}

.think__pipe {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s-12);
}

.think__step {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
  min-height: var(--think-step-h);
  padding: var(--s-16);
  background: var(--ink-soft);
  border-radius: var(--r-card);
  opacity: .35;
  transform: translateY(var(--s-4));
  transition: opacity .45s var(--ease-out), transform .5s var(--ease-out), background-color .45s var(--ease-out);
}

.think__step.is-on {
  opacity: 1;
  transform: none;
}

.think__n {
  color: var(--accent);
}

.think__title {
  font: 600 var(--t-note)/1.3 var(--f-head);
  letter-spacing: var(--ls-h3);
  color: var(--white);
}

.think__chip {
  align-self: flex-start;
  margin-top: auto;
  padding: 0 var(--s-8);
  color: var(--white);
  background: var(--ink);
  border-radius: var(--r-pill);
}

/* финал: ответил сам — белая карточка с акцентной пилюлей;
   позвал вас — белая с акцентной обводкой (не заливкой: акцент ~1%) */
.think__step.is-end.is-on {
  background: var(--white);
}

.is-end.is-on .think__title {
  color: var(--ink);
}

.is-end.is-on .think__text {
  color: var(--text);
}

.is-end.is-ok.is-on .think__chip {
  background: var(--accent);
}

.is-end.is-hand.is-on {
  outline: var(--feed-mark) solid var(--accent);
  outline-offset: calc(-1 * var(--feed-mark));
}

.is-end.is-hand.is-on .think__chip {
  background: var(--ink);
}

.think__foot {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--s-16);
  margin-top: var(--s-24);
}

.think__foot b {
  font-weight: 500;
  color: var(--white);
}

@media (max-width: 767px) {
  .think {
    padding: var(--s-20);
  }

  .think__pipe {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
