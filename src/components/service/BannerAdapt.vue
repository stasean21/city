<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import CoverImage from '../ui/CoverImage.vue'
import SectionHead from '../ui/SectionHead.vue'
import { dims, sizeAlt } from '../../utils/banners.js'

// «Одна идея — все площадки»: рамка баннера перетекает между размерами
// кампании. Макет — docs/mockups/service-banners.html
const props = defineProps({
  campaigns: { type: Array, required: true }, // [{ slug, title, sizes: [{ format, label, w, h, where, src }] }]
})

// автолистание размеров, мс
const STEP = 2200

const campaignIndex = ref(0)
const sizeIndex = ref(0)
// после любого действия пользователя автолистание выключается насовсем,
// а подпись начинает озвучиваться (во время автолистания она молчит)
const touched = ref(false)

const campaign = computed(() => props.campaigns[campaignIndex.value])
const size = computed(() => campaign.value.sizes[sizeIndex.value])

const blockEl = ref(null)
const fitEl = ref(null)
const campsEl = ref(null)
const sizesEl = ref(null)
// место под рамку внутри сцены, px; до монтирования неизвестно
const box = ref(null)

// рамка вписывается в сцену с сохранением пропорций; ширина и высота
// анимируются CSS-переходом. До замера (и в пререндере) — по пропорции
const frameStyle = computed(() => {
  const { w, h } = size.value
  if (!box.value) {
    return w >= h
      ? { width: '100%', aspectRatio: `${w} / ${h}` }
      : { height: '100%', aspectRatio: `${w} / ${h}` }
  }
  const scale = Math.min(box.value.w / w, box.value.h / h)
  return { width: `${w * scale}px`, height: `${h * scale}px` }
})

let timer = null
let resizeObserver = null
let viewObserver = null
let mqReduced = null
const state = { inView: false }

function stop() {
  touched.value = true
  clearInterval(timer)
  timer = null
}

function selectSize(i) {
  stop()
  sizeIndex.value = i
}

// наведение переключает только мышью: на таче pointerenter приходит перед кликом
function hoverSize(event, i) {
  if (event.pointerType === 'mouse') selectSize(i)
}

// при смене кампании остаёмся на том же размере, если он у неё есть
function selectCampaign(i) {
  stop()
  const { w, h } = size.value
  campaignIndex.value = i
  const same = campaign.value.sizes.findIndex((s) => s.w === w && s.h === h)
  sizeIndex.value = same >= 0 ? same : Math.min(sizeIndex.value, campaign.value.sizes.length - 1)
}

// по размерам кампании, после последнего — следующая кампания
function tick() {
  if (!state.inView || document.hidden) return
  if (sizeIndex.value < campaign.value.sizes.length - 1) {
    sizeIndex.value += 1
  } else {
    campaignIndex.value = (campaignIndex.value + 1) % props.campaigns.length
    sizeIndex.value = 0
  }
}

function measure() {
  const el = fitEl.value
  if (el) box.value = { w: el.clientWidth, h: el.clientHeight }
}

// на мобилке ряды пилюль листаются: активная не должна уехать за край.
// крутим только сам ряд, страницу не трогаем
function reveal(row) {
  const active = row?.querySelector('[aria-pressed="true"]')
  if (!active || row.scrollWidth <= row.clientWidth) return
  const left = active.offsetLeft - row.offsetLeft
  if (left < row.scrollLeft || left + active.offsetWidth > row.scrollLeft + row.clientWidth) {
    row.scrollTo({ left: left - (row.clientWidth - active.offsetWidth) / 2, behavior: mqReduced?.matches ? 'auto' : 'smooth' })
  }
}

watch([campaignIndex, sizeIndex], async () => {
  await nextTick()
  reveal(campsEl.value)
  reveal(sizesEl.value)
})

onMounted(() => {
  mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  measure()
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(fitEl.value)

  // reduced motion: без автолистания
  if (mqReduced.matches) return
  viewObserver = new IntersectionObserver(([entry]) => {
    state.inView = entry.isIntersecting
  }, { threshold: 0.4 })
  viewObserver.observe(blockEl.value)
  timer = setInterval(tick, STEP)
})

onUnmounted(() => {
  clearInterval(timer)
  resizeObserver?.disconnect()
  viewObserver?.disconnect()
})
</script>

<template>
  <div class="adapt-block">
    <SectionHead pill="Примеры" title="Одна идея — все площадки" lead="Выберите кампанию и размер — баннер перестроится." />

    <div ref="blockEl" class="adapt">
      <div class="adapt__stage">
        <div ref="campsEl" class="adapt__camps" role="group" aria-label="Кампании">
          <button
            v-for="(item, i) in campaigns"
            :key="item.slug"
            type="button"
            class="adapt__camp"
            :aria-pressed="i === campaignIndex"
            @click="selectCampaign(i)"
          >{{ item.title }}</button>
        </div>

        <!-- место под рамку: отступы от краёв сцены задаёт CSS, JS только замеряет -->
        <div ref="fitEl" class="adapt__fit">
          <div class="adapt__frame" :style="frameStyle">
            <Transition name="adapt-fade">
              <CoverImage
                :key="size.src"
                class="adapt__img"
                :src="size.src"
                :alt="sizeAlt(campaign, size)"
                :width="size.w"
                :height="size.h"
              />
            </Transition>
          </div>
        </div>

        <p class="small adapt__dims" :aria-live="touched ? 'polite' : 'off'">
          <span class="adapt__num">{{ dims(size) }}</span><template v-if="size.where"> · {{ size.where }}</template>
        </p>
      </div>

      <ul ref="sizesEl" class="adapt__sizes" aria-label="Размеры">
        <li v-for="(item, i) in campaign.sizes" :key="`${item.w}x${item.h}`">
          <button
            type="button"
            class="adapt__size"
            :aria-pressed="i === sizeIndex"
            @click="selectSize(i)"
            @pointerenter="hoverSize($event, i)"
          >
            <span class="adapt__name">{{ item.label }}</span>
            <span class="small adapt__wh">{{ dims(item) }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.adapt {
  display: grid;
  grid-template-columns: 1fr var(--adapt-list-w);
  gap: var(--s-60);
  align-items: center;
}

/* ---------- сцена ---------- */
.adapt__stage {
  position: relative;
  height: var(--adapt-stage-h);
  overflow: hidden;
  background: var(--white);
  border-radius: var(--r-stage);
}

.adapt__camps {
  position: absolute;
  top: var(--s-20);
  left: var(--s-24);
  right: var(--s-24);
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-8);
}

.adapt__camp {
  flex: none;
  padding: var(--s-4) var(--s-12);
  font: 500 var(--t-small)/1.54 var(--f-body);
  color: var(--warm-2);
  background: var(--bg-3);
  border: 0;
  border-radius: var(--r-pill);
  transition: background-color var(--ease), color var(--ease);
}

.adapt__camp[aria-pressed="true"] {
  color: var(--white);
  background: var(--ink);
}

/* под пилюлями и подписью остаётся место — рамка в середине */
.adapt__fit {
  position: absolute;
  inset: var(--s-60) var(--s-32);
  display: flex;
  align-items: center;
  justify-content: center;
}

.adapt__frame {
  position: relative;
  flex: none;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  border-radius: var(--r-lg);
  transition: width .9s var(--ease-out), height .9s var(--ease-out);
}

.adapt__img {
  position: absolute;
  inset: 0;
}

/* кроссфейд: новая картинка проявляется поверх уходящей */
.adapt-fade-enter-active,
.adapt-fade-leave-active {
  transition: opacity .5s var(--ease-out);
}

.adapt-fade-enter-from,
.adapt-fade-leave-to {
  opacity: 0;
}

.adapt__dims {
  position: absolute;
  left: var(--s-24);
  bottom: var(--s-20);
  font-variant-numeric: tabular-nums;
}

.adapt__num {
  color: var(--ink);
}

/* ---------- список размеров ---------- */
.adapt__sizes {
  border-top: var(--hairline) solid var(--border);
}

.adapt__size {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--s-16);
  width: 100%;
  padding: var(--s-12) 0;
  text-align: left;
  background: none;
  border: 0;
  border-bottom: var(--hairline) solid var(--border);
}

.adapt__name {
  font: 600 var(--t-h3)/1.3 var(--f-head);
  letter-spacing: var(--ls-h3);
  color: var(--text-4);
  transition: color var(--ease);
}

.adapt__wh {
  color: var(--text-4);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition: color var(--ease);
}

.adapt__size[aria-pressed="true"] .adapt__name {
  color: var(--ink);
}

.adapt__size[aria-pressed="true"] .adapt__wh {
  color: var(--accent);
}

.adapt__camp:focus-visible,
.adapt__size:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

@media (prefers-reduced-motion: reduce) {
  .adapt__frame {
    transition: none;
  }
}

/* ---------- мобилка: сцена на всю ширину, размеры — ряд пилюль ---------- */
@media (max-width: 767px) {
  .adapt {
    grid-template-columns: 1fr;
    gap: var(--s-16);
  }

  .adapt__stage {
    border-radius: var(--r-card);
  }

  .adapt__camps,
  .adapt__sizes {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .adapt__camps::-webkit-scrollbar,
  .adapt__sizes::-webkit-scrollbar {
    display: none;
  }

  .adapt__camps {
    top: var(--s-12);
    left: var(--s-12);
    right: var(--s-12);
  }

  .adapt__dims {
    left: var(--s-16);
    bottom: var(--s-12);
  }

  /* поля — чтобы кольцо фокуса не срезалось прокруткой */
  .adapt__sizes {
    display: flex;
    gap: var(--s-8);
    padding-block: var(--s-4);
    border-top: 0;
  }

  .adapt__sizes li {
    flex: none;
  }

  .adapt__size {
    gap: var(--s-8);
    width: auto;
    padding: var(--s-8) var(--pill-px);
    background: var(--bg-3);
    border: 0;
    border-radius: var(--r-pill);
    transition: background-color var(--ease);
  }

  .adapt__name {
    font: 500 var(--t-small)/1.54 var(--f-body);
    letter-spacing: 0;
    color: var(--warm-2);
  }

  .adapt__wh {
    font-size: var(--t-caption);
    color: var(--text-3);
  }

  .adapt__size[aria-pressed="true"] {
    background: var(--ink);
  }

  .adapt__size[aria-pressed="true"] .adapt__name {
    color: var(--white);
  }
}
</style>
