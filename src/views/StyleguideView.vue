<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import BaseButton from '../components/ui/BaseButton.vue'
import HeroSection from '../components/sections/HeroSection.vue'

// служебная страница: живая копия эталона docs/mockups/foundation.html,
// собранная только из классов и токенов проекта. В sitemap не входит

const roles = [
  { name: 'Display', spec: ['58 / 700 · мобилка 34', 'hero и заголовки всех секций'], cls: 'display', text: 'Услуги и решения' },
  { name: 'H2', spec: ['36 / 600 · мобилка 24', 'подзаголовки, крупные фразы'], cls: 'h2', text: 'Товар хороший, а карточку пролистывают' },
  { name: 'Card title', spec: ['28 / 600 · мобилка 22', 'названия в карточках'], cls: 'card-title', text: 'Инфографика для маркетплейсов' },
  { name: 'H3', spec: ['22 / 500 · мобилка 18', 'пункты, вопросы FAQ, этапы'], cls: 'h3', text: 'Сколько правок входит в работу?' },
  { name: 'Lead', spec: ['20 / 400 · мобилка 16', 'вводный абзац секции'], cls: 'lead', text: 'Собираю визуал, сайты и автоматизацию под одну задачу — чтобы товар продавался, а заявки доходили до вас.' },
  { name: 'Body', spec: ['15 / 400 · мобилка 14', 'основной текст'], cls: 'body', text: 'Разбираю товар, аудиторию и конкурентов, собираю референсы. Фиксируем объём, стоимость и дату сдачи — до начала работы. На каждом этапе понятно, что происходит и что вы получите.' },
  { name: 'Small', spec: ['13 / 400', 'описания в карточках, подписи'], cls: 'small', text: 'Карточки, которые объясняют товар за три секунды и выделяются в выдаче' },
  { name: 'Caption', spec: ['12 / 400', 'метки, служебные подписи'], cls: 'caption', text: 'инфографика · Wildberries · этап 3 из 6' },
]

const spaceScale = [4, 8, 12, 16, 20, 24, 32, 40, 60, 80, 120]

const rhythm = [
  { title: 'Десктоп', rows: [['между секциями', 240], ['вводный абзац → контент', 80], ['pill → заголовок', 24], ['заголовок → lead', 20]] },
  { title: 'Планшет ≤ 991', rows: [['между секциями', 160], ['вводный абзац → контент', 48], ['pill → заголовок', 20], ['заголовок → lead', 16]] },
  { title: 'Мобилка ≤ 767', rows: [['между секциями', 100], ['вводный абзац → контент', 32], ['pill → заголовок', 16], ['заголовок → lead', 12]] },
]

const steps = [
  ['01', 'Заявка', 'Пишете в Telegram или через форму на сайте', 'созвон или переписка'],
  ['02', 'Бриф', 'Разбираю товар, аудиторию и конкурентов', 'бриф-документ'],
  ['03', 'Смета', 'Фиксируем объём, стоимость и срок', 'смета и дата сдачи'],
]

// плашки «ширина · масштаб» и переключатель масштаба — только здесь
const width = ref(0)
const scale = ref('1.00')
const scaleOff = ref(false)

function update() {
  width.value = window.innerWidth
  scale.value = (parseFloat(getComputedStyle(document.documentElement).fontSize) / 16).toFixed(2)
}

function setScaleOff(value) {
  scaleOff.value = value
  document.documentElement.classList.toggle('scale-off', value)
  update()
}

onMounted(() => {
  update()
  window.addEventListener('resize', update)
})

onUnmounted(() => {
  window.removeEventListener('resize', update)
  document.documentElement.classList.remove('scale-off')
})
</script>

<template>
  <main>
    <HeroSection />

    <section>
      <div class="container">
        <div class="sg-divider"><span>1 · Типографика — все роли текста на сайте</span></div>
        <div class="sg-roles">
          <div v-for="role in roles" :key="role.name" class="sg-role">
            <div class="sg-role__meta">
              <b>{{ role.name }}</b>
              <span v-for="line in role.spec" :key="line">{{ line }}</span>
            </div>
            <div :class="role.cls">{{ role.text }}</div>
          </div>

          <div class="sg-role">
            <div class="sg-role__meta">
              <b>UI — кнопки</b>
              <span>16 / 500 · мобилка 15</span>
              <span>как в шапке: поля 8×16, скругление 15</span>
              <span>стрелка-рикошет при наведении</span>
            </div>
            <div class="sg-buttons">
              <div class="sg-row">
                <BaseButton variant="primary" arrow>Обсудить задачу</BaseButton>
                <BaseButton variant="secondary" arrow>Смотреть работы</BaseButton>
                <BaseButton variant="primary">Смотреть работы</BaseButton>
                <BaseButton variant="secondary">Все услуги</BaseButton>
              </div>
              <div class="sg-row sg-dark on-dark">
                <BaseButton variant="primary" arrow>Написать в Telegram</BaseButton>
                <BaseButton variant="secondary" arrow>VK</BaseButton>
              </div>
              <span class="caption">наведите на кнопку со стрелкой · слева основная, справа второстепенная · ниже — на тёмном фоне</span>
            </div>
          </div>

          <div class="sg-role">
            <div class="sg-role__meta">
              <b>Number</b>
              <span>80 / 500 · мобилка 56</span>
              <span>номера этапов, цифры</span>
            </div>
            <div class="num">01 &nbsp;02 &nbsp;03</div>
          </div>

          <div class="sg-role">
            <div class="sg-role__meta">
              <b>Number small</b>
              <span>48 / 500 · мобилка 24</span>
              <span>номера в узких колонках</span>
            </div>
            <div class="num-sm">01 &nbsp;02 &nbsp;03</div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="sg-divider"><span>2 · Отступы — одна шкала на всё</span></div>
        <div class="sg-scale">
          <div v-for="n in spaceScale" :key="n">
            <i :style="{ width: `var(--s-${n})`, height: `var(--s-${n})` }"></i>
            <span>{{ n }}</span>
          </div>
        </div>
        <div class="sg-rhythm">
          <div v-for="table in rhythm" :key="table.title" class="sg-rh">
            <b>{{ table.title }}</b>
            <div v-for="[label, value] in table.rows" :key="label">
              <span>{{ label }}</span><span>{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="sg-divider"><span>3 · Так собирается любая секция</span></div>
        <span class="pill sg-demo__pill">Процесс</span>
        <h2 class="display sg-demo__title">Как работаем</h2>
        <p class="lead sg-demo__lead">Шесть шагов от первого сообщения до готовых файлов. На каждом этапе вы знаете, что происходит.</p>
        <div class="sg-steps">
          <div v-for="[num, title, text, result] in steps" :key="num" class="sg-step">
            <span class="num sg-step__num">{{ num }}</span>
            <span class="display">{{ title }}</span>
            <span>{{ text }}</span>
            <span class="small sg-step__result">→ {{ result }}</span>
          </div>
        </div>
        <p class="sg-note">pill → 24 → Display → 20 → lead · → 80 → карточки 350: поля 32 · номер 80 → 24 → название Display 58 → 12 → текст · результат прижат к низу · секция заканчивается отступом 240</p>
      </div>
    </section>

    <div class="sg-switch" role="group" aria-label="Режим масштаба">
      <button type="button" :aria-pressed="!scaleOff" @click="setScaleOff(false)">с масштабом</button>
      <button type="button" :aria-pressed="scaleOff" @click="setScaleOff(true)">без масштаба (как сейчас)</button>
    </div>
    <span class="sg-vw">ширина экрана {{ width }}px · масштаб {{ scale }}×</span>
  </main>
</template>

<style scoped>
/* служебные пометки макета (разделители, плашки, подписи) — не часть
   системы, поэтому их мелкие размеры заданы здесь, а не токенами */

.sg-divider {
  display: flex;
  align-items: center;
  gap: var(--s-16);
  margin-bottom: var(--s-60);
}

.sg-divider::after {
  content: "";
  flex: 1;
  height: var(--hairline);
  background: var(--border-soft);
}

.sg-divider span {
  font: 500 var(--t-caption) var(--f-body);
  color: var(--ink);
  background: var(--white);
  padding: var(--s-4) var(--s-12);
  border-radius: var(--r-pill);
  white-space: nowrap;
}

/* типографика — таблица ролей */
.sg-roles {
  border-top: var(--hairline) solid var(--border-soft);
}

.sg-role {
  display: grid;
  grid-template-columns: 14rem 1fr;
  gap: var(--s-24);
  align-items: baseline;
  padding: var(--s-32) 0;
  border-bottom: var(--hairline) solid var(--border-soft);
}

.sg-role__meta b {
  display: block;
  font: 500 var(--t-small) var(--f-body);
  color: var(--ink);
  margin-bottom: var(--s-4);
}

.sg-role__meta span {
  display: block;
  font: 400 var(--t-caption)/1.5 var(--f-body);
  color: var(--text-3);
}

.sg-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--s-16);
}

.sg-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-12);
}

.sg-dark {
  width: fit-content;
  padding: var(--s-20);
  background: var(--ink);
  border-radius: var(--r-card);
}

/* отступы */
.sg-scale {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--s-24);
}

.sg-scale div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-8);
}

.sg-scale i {
  display: block;
  background: var(--accent);
  opacity: .85;
  border-radius: .125rem;
}

.sg-scale span {
  font: 400 var(--t-caption) var(--f-body);
  color: var(--text-3);
}

.sg-rhythm {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--s-24);
  margin-top: var(--s-60);
}

.sg-rh {
  background: var(--white);
  border-radius: var(--r-card);
  padding: var(--s-24);
}

.sg-rh b {
  display: block;
  font: 500 var(--t-small) var(--f-body);
  color: var(--ink);
  margin-bottom: var(--s-12);
}

.sg-rh div {
  display: flex;
  justify-content: space-between;
  padding: var(--s-8) 0;
  border-top: var(--hairline) solid var(--border);
  font-size: var(--t-small);
}

.sg-rh div span:last-child {
  color: var(--ink);
  font-weight: 500;
}

/* пример секции */
.sg-demo__pill {
  margin-bottom: var(--sec-pill);
}

.sg-demo__title {
  max-width: var(--measure-title);
  margin-bottom: var(--sec-lead);
}

.sg-demo__lead {
  margin-bottom: var(--sec-content);
}

.sg-steps {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--s-24);
}

.sg-step {
  display: flex;
  flex-direction: column;
  gap: var(--s-12);
  min-height: var(--step-card-h);
  padding: var(--s-32);
  background: var(--white);
  border-radius: var(--r-card);
}

/* номер → название: gap 12 + 12 = 24 */
.sg-step__num {
  color: var(--bg-4);
  margin-bottom: var(--s-12);
}

.sg-step__result {
  margin-top: auto;
  padding-top: var(--s-16);
  border-top: var(--hairline) solid var(--border);
}

.sg-note {
  margin-top: var(--s-24);
  max-width: none;
  font: 500 .6875rem/1.4 ui-monospace, Menlo, monospace;
  color: var(--accent);
}

/* плашки */
.sg-vw {
  position: fixed;
  right: var(--s-12);
  bottom: var(--s-12);
  z-index: 99;
  padding: var(--s-4) .625rem;
  font: 500 .6875rem var(--f-body);
  color: var(--white);
  background: var(--ink);
  border-radius: var(--r-pill);
  pointer-events: none;
}

.sg-switch {
  position: fixed;
  left: var(--s-12);
  bottom: var(--s-12);
  z-index: 99;
  display: flex;
  gap: .125rem;
  padding: .1875rem;
  font: 500 .6875rem var(--f-body);
  background: var(--ink);
  border-radius: var(--r-pill);
}

.sg-switch button {
  border: 0;
  padding: .3rem .7rem;
  font: inherit;
  color: var(--footer-link);
  background: transparent;
  border-radius: var(--r-pill);
}

.sg-switch button[aria-pressed="true"] {
  color: var(--ink);
  background: var(--white);
}

.sg-switch button:focus-visible {
  outline: var(--focus-ring) solid var(--accent);
  outline-offset: var(--focus-ring);
}

@media (max-width: 767px) {
  .sg-role {
    grid-template-columns: 1fr;
    gap: var(--s-12);
  }

  .sg-rhythm,
  .sg-steps {
    grid-template-columns: 1fr;
  }

  .sg-step {
    min-height: 0;
  }

  /* на узком экране плашки не помещаются в одну строку */
  .sg-vw {
    bottom: var(--s-60);
  }
}
</style>
