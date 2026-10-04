<script setup>
import { onMounted, ref } from 'vue'
import BrowserFrame from '../ui/BrowserFrame.vue'
import CoverImage from '../ui/CoverImage.vue'
import SectionHead from '../ui/SectionHead.vue'
import { useAutoScroll } from '../../composables/useAutoScroll.js'
import shots from '../../data/site-blocks.json'

// «Вы уже на моём сайте»: окно со скриншотом главной сам едет, активный блок
// обведён и подписан, справа — что в нём сделано. Разметка блоков — site-blocks.json
// (scripts/shoot-home.mjs), макет — docs/mockups/service-sites.html
const props = defineProps({
  site: { type: Object, required: true }, // page.site: { title, lead, domain, desktop, notes }
})

// ~27px/с, как в макете
const SPEED = 27
// активный блок — тот, чья середина ближе всего к этой доле высоты окна
const FOCUS = 0.45

const shot = shots.desktop
const container = shot.container
// заметки привязаны к блокам главной по порядку
const blocks = shot.blocks.slice(0, props.site.notes.length)

const active = ref(0)
const viewportEl = ref(null)
const auto = useAutoScroll(viewportEl, { speed: SPEED })

// высота страницы на скриншоте в px окна
const pageH = () => viewportEl.value.scrollHeight

function onScroll() {
  const vp = viewportEl.value
  const focus = ((vp.scrollTop + vp.clientHeight * FOCUS) / pageH()) * 100
  let best = 0
  let bestDist = Infinity
  blocks.forEach((b, i) => {
    const dist = Math.abs(b.top + b.height / 2 - focus)
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  })
  active.value = best
}

// клик по заметке — окно плавно докручивает её блок к фокусу
function goTo(i) {
  const vp = viewportEl.value
  const b = blocks[i]
  const top = ((b.top + b.height / 2) / 100) * pageH() - vp.clientHeight * FOCUS
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  auto.hold(3500)
  vp.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })
  active.value = i
  setTimeout(auto.sync, 1200)
}

onMounted(onScroll)
</script>

<template>
  <div class="live-block">
    <SectionHead pill="Примеры" :title="site.title" :lead="site.lead" />

    <div class="live">
      <BrowserFrame :domain="site.domain">
        <div
          ref="viewportEl"
          class="live__viewport"
          @scroll.passive="onScroll"
          @wheel.passive="auto.user"
          @touchstart.passive="auto.user"
          @pointerdown="auto.user"
        >
          <div class="live__page" :style="{ aspectRatio: `${shot.width} / ${shot.height}` }">
            <CoverImage
              class="live__shot"
              :src="site.desktop"
              alt="Главная страница сайта m/design"
              :width="shot.width"
              :height="shot.height"
            />
            <!-- рамка и метка активного блока — по разметке скриншота -->
            <span
              v-for="(b, i) in blocks"
              :key="b.id"
              class="live__pin"
              :class="{ 'is-on': active === i }"
              :style="{
                top: `${b.top}%`,
                height: `${b.height}%`,
                left: `${container.left}%`,
                width: `${container.width}%`,
              }"
            >
              <span class="caption live__tag">{{ site.notes[i].tag }}</span>
            </span>
          </div>
        </div>
      </BrowserFrame>

      <ol class="live__notes">
        <li v-for="(note, i) in site.notes" :key="note.title" :class="{ 'is-on': active === i }">
          <button type="button" class="live__note" :aria-current="active === i ? 'true' : undefined" @click="goTo(i)">
            <span class="small live__num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span>
              <span class="live__title">{{ note.title }}</span>
              <span class="small live__text">{{ note.text }}</span>
            </span>
          </button>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.live {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: var(--s-40);
  align-items: start;
}

/* окно — настоящий прокручиваемый блок: колесо нативное, у края уходит странице */
.live__viewport {
  height: var(--live-screen-h);
  overflow-y: auto;
  overscroll-behavior: auto;
  scrollbar-width: none;
}

.live__viewport::-webkit-scrollbar {
  display: none;
}

.live__page {
  position: relative;
}

.live__shot {
  width: 100%;
  height: 100%;
}

.live__pin {
  position: absolute;
  margin: calc(-1 * var(--pin-out));
  padding: var(--pin-out);
  box-sizing: content-box;
  border: var(--pin-line) solid var(--accent);
  border-radius: var(--r-lg);
  opacity: 0;
  transition: opacity .35s var(--ease-out);
  pointer-events: none;
}

.live__pin.is-on {
  opacity: 1;
}

.live__tag {
  position: absolute;
  top: 0;
  right: var(--s-12);
  padding: 0 var(--s-8);
  color: var(--white);
  white-space: nowrap;
  background: var(--accent);
  border-radius: var(--r-pill);
  transform: translateY(-50%);
}

/* ---------- заметки ---------- */
.live__notes {
  position: sticky;
  top: calc(var(--header-top) + var(--header-h) + var(--s-24));
  border-top: var(--hairline) solid var(--border);
}

.live__notes li {
  border-bottom: var(--hairline) solid var(--border);
  opacity: .35;
  transition: opacity .35s var(--ease-out);
}

.live__notes li.is-on {
  opacity: 1;
}

.live__note {
  display: flex;
  gap: var(--s-12);
  width: 100%;
  padding: var(--s-12) 0;
  text-align: left;
  background: none;
  border: 0;
}

.live__note:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.live__num {
  flex: none;
  width: var(--s-24);
  color: var(--accent);
}

.live__title {
  display: block;
  font: 600 var(--t-note)/1.3 var(--f-head);
  letter-spacing: var(--ls-h3);
  color: var(--ink);
}

.live__text {
  display: block;
  margin-top: var(--s-4);
}

@media (max-width: 767px) {
  .live {
    grid-template-columns: 1fr;
  }

  .live__notes {
    position: static;
  }
}
</style>
