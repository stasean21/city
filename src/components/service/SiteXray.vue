<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BrowserFrame from '../ui/BrowserFrame.vue'
import CoverImage from '../ui/CoverImage.vue'
import shots from '../../data/site-blocks.json'

// «Под капотом»: тот же скриншот главной, по переключателю поверх — сетка
// контейнера, рамки блоков с их задачей и отступы между секциями.
// всё по разметке site-blocks.json (scripts/shoot-home.mjs)
const props = defineProps({
  site: { type: Object, required: true }, // page.site: { domain, desktop, mobile }
  xray: { type: Object, required: true }, // page.xray: { title, lead, labels: [{ id, name, task }] }
})

const xrayOn = ref(false)

// на мобилке — мобильный скриншот и сетка на 4 колонки; до монтирования — десктоп
const mobile = ref(false)
let mq = null
const sync = () => { mobile.value = mq.matches }
onMounted(() => {
  mq = window.matchMedia('(max-width: 767px)')
  sync()
  mq.addEventListener('change', sync)
})
onUnmounted(() => mq?.removeEventListener('change', sync))

const shot = computed(() => (mobile.value ? shots.mobile : shots.desktop))
const src = computed(() => (mobile.value ? props.site.mobile : props.site.desktop))
const cols = computed(() => (mobile.value ? 4 : 12))

const blocks = computed(() => shot.value.blocks.map((b, i, all) => {
  const label = props.xray.labels.find((l) => l.id === b.id)
  const next = all[i + 1]
  return {
    ...b,
    name: label?.name ?? b.id,
    task: label?.task ?? '',
    // отступ до следующего блока — пунктир с подписью в px
    gapTop: b.top + b.height,
    gapHeight: next ? next.top - (b.top + b.height) : 0,
  }
}))
</script>

<template>
  <div class="xray-block">
    <div class="xray__head">
      <div class="xray__intro">
        <h2 class="display">{{ xray.title }}</h2>
        <p class="lead">{{ xray.lead }}</p>
      </div>
      <div class="xray__seg" role="group" aria-label="Режим просмотра">
        <button type="button" class="ui xray__mode" :aria-pressed="!xrayOn" @click="xrayOn = false">Как видит клиент</button>
        <button type="button" class="ui xray__mode" :aria-pressed="xrayOn" @click="xrayOn = true">Как сделано</button>
      </div>
    </div>

    <BrowserFrame :domain="site.domain">
      <!-- обычная прокрутка, без автопрокрутки -->
      <div class="xray__viewport">
        <div class="xray__page" :class="{ 'is-on': xrayOn }" :style="{ aspectRatio: `${shot.width} / ${shot.height}` }">
          <CoverImage
            :key="src"
            class="xray__shot"
            :src="src"
            alt="Главная страница сайта m/design"
            :width="shot.width"
            :height="shot.height"
          />

          <div class="xray__layer">
            <!-- сетка контейнера: ширина, поля и зазоры как у настоящего .container -->
            <div
              class="xray__grid"
              :style="{
                left: `${shot.container.left}%`,
                width: `${shot.container.width}%`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                columnGap: `${shot.container.gutter}%`,
              }"
            >
              <i v-for="n in cols" :key="n"></i>
            </div>

            <template v-for="b in blocks" :key="b.id">
              <span
                class="xray__box"
                :style="{ top: `${b.top}%`, height: `${b.height}%`, left: `${shot.container.left}%`, width: `${shot.container.width}%` }"
              >
                <span class="caption xray__label">{{ b.name }}<span class="xray__task"> · {{ b.task }}</span></span>
              </span>
              <span
                v-if="b.gapHeight > 0"
                class="xray__gap"
                :style="{ top: `${b.gapTop}%`, height: `${b.gapHeight}%` }"
              >
                <span class="caption">{{ b.gap }}</span>
              </span>
            </template>
          </div>
        </div>
      </div>
    </BrowserFrame>
  </div>
</template>

<style scoped>
.xray__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--s-24);
  margin-bottom: var(--s-24);
}

.xray__intro .lead {
  max-width: var(--measure-title);
  margin-top: var(--sec-lead);
}

/* переключатель-сегмент: внутренняя кнопка r = r-btn − отступ */
.xray__seg {
  display: inline-flex;
  gap: var(--s-4);
  padding: var(--s-4);
  background: var(--bg-3);
  border-radius: var(--r-btn);
}

.xray__mode {
  padding: var(--s-8) var(--s-16);
  color: var(--warm-2);
  background: none;
  border: 0;
  border-radius: calc(var(--r-btn) - var(--s-4));
  transition: background-color var(--ease), color var(--ease);
}

.xray__mode[aria-pressed="true"] {
  color: var(--white);
  background: var(--ink);
}

.xray__mode:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.xray__viewport {
  height: var(--xray-screen-h);
  overflow-y: auto;
}

.xray__page {
  position: relative;
}

.xray__shot {
  width: 100%;
  height: 100%;
}

/* разметка поверх — проявляется в режиме «Как сделано» */
.xray__layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity .4s var(--ease-out);
  pointer-events: none;
}

.is-on .xray__layer {
  opacity: 1;
}

.xray__grid {
  position: absolute;
  top: 0;
  bottom: 0;
  display: grid;
}

.xray__grid i {
  background: var(--xray-col);
}

/* пунктир чуть снаружи содержимого блока, чтобы не резать кнопки и текст */
.xray__box {
  position: absolute;
  box-sizing: content-box;
  margin: calc(-1 * var(--s-4));
  padding: var(--s-4);
  border: var(--hairline) dashed var(--xray-line);
}

.xray__label {
  position: absolute;
  left: 0;
  top: 0;
  max-width: 100%;
  padding: 0 var(--s-8);
  overflow: hidden;
  color: var(--white);
  white-space: nowrap;
  text-overflow: ellipsis;
  background: var(--ink);
  border-radius: var(--r-sm);
  transform: translateY(-100%);
}

.xray__task {
  color: var(--dark-section-text);
}

.xray__gap {
  position: absolute;
  left: 50%;
  border-left: var(--hairline) dashed var(--accent);
}

.xray__gap .caption {
  position: absolute;
  top: 50%;
  left: var(--s-4);
  color: var(--accent);
  transform: translateY(-50%);
}
</style>
