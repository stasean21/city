<script setup>
import { computed, ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import CoverImage from '../ui/CoverImage.vue'
import SectionHead from '../ui/SectionHead.vue'
import SlidesLightbox from './SlidesLightbox.vue'
import { dims, sizeAlt, sizeTag } from '../../utils/banners.js'

// «Любой размер»: мозаика из всех размеров всех кампаний, ряды выровнены по высоте.
// клик открывает все размеры кампании одной лентой
const props = defineProps({
  campaigns: { type: Array, required: true }, // уже по order
})

// две кампании целиком: 14 плиток дают лишний ряд и выводят страницу за 8000px
const LIMIT = 10

// все размеры всех кампаний по order
const tiles = computed(() => props.campaigns
  .flatMap((campaign) => campaign.sizes.map((size) => ({ campaign, size })))
  .slice(0, LIMIT))

const lightbox = ref(null)

function openSet(campaign, event) {
  lightbox.value.open(campaign, event.currentTarget)
}
</script>

<template>
  <div class="mosaic-block">
    <SectionHead
      title="Любой размер"
      lead="Квадрат, вертикальный, горизонтальный и широкие форматы. Нажмите на баннер — откроются все размеры кампании."
    />

    <ul class="mosaic">
      <li
        v-for="{ campaign, size } in tiles"
        :key="`${campaign.slug}-${size.w}x${size.h}`"
        class="mosaic__item"
        :class="`is-${size.format}`"
      >
        <button
          type="button"
          class="mosaic__tile"
          aria-haspopup="dialog"
          :aria-label="`${campaign.title}, ${sizeTag(size)} — все размеры кампании`"
          @click="openSet(campaign, $event)"
        >
          <CoverImage class="mosaic__img" :src="size.src" :alt="sizeAlt(campaign, size)" :width="size.w" :height="size.h" />
          <span class="caption mosaic__tag" aria-hidden="true"><span>{{ dims(size) }}</span><span class="mosaic__label"> · {{ size.label.toLowerCase() }}</span></span>
        </button>
      </li>
    </ul>

    <div class="mosaic__more">
      <!-- TODO: куда ведёт «Смотреть все работы» — решит владелец -->
      <BaseButton type="button" variant="primary" arrow>Смотреть все работы</BaseButton>
    </div>

    <SlidesLightbox ref="lightbox" />
  </div>
</template>

<style scoped>
/* выровненные ряды: у плитки пропорция своего формата, а растёт она
   пропорционально ей — в ряду все плитки одной высоты, ряд во всю ширину,
   дыр нет при любом порядке. --mosaic-h — желаемая высота ряда */
.mosaic {
  display: flex;
  flex-wrap: wrap;
  gap: var(--mosaic-gap);
}

.mosaic__item {
  display: flex;
  flex: var(--ratio) 1 calc(var(--ratio) * var(--mosaic-h));
  min-width: 0;
  aspect-ratio: var(--ratio);
}

.is-square { --ratio: 1; }
.is-vertical { --ratio: .75; }        /* 3 / 4 */
.is-horizontal { --ratio: 1.3333; }   /* 4 / 3 */
.is-wide { --ratio: 1.7778; }         /* 16 / 9 */
.is-wide-narrow { --ratio: 3.5556; }  /* 32 / 9 */

.mosaic__tile {
  position: relative;
  container-type: inline-size;
  display: block;
  width: 100%;
  padding: 0;
  background: none;
  border: 0;
}

.mosaic__tile:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.mosaic__img {
  width: 100%;
  height: 100%;
  border-radius: var(--r-lg);
  transition: transform .5s var(--ease-out);
}

/* подпись размера — при наведении; на таче видна всегда */
.mosaic__tag {
  position: absolute;
  left: var(--s-8);
  bottom: var(--s-8);
  padding: var(--s-4) var(--s-8);
  max-width: calc(100% - 2 * var(--s-8));
  overflow: hidden;
  color: var(--ink);
  white-space: nowrap;
  text-overflow: ellipsis;
  background: var(--white);
  border-radius: var(--r-pill);
  opacity: 0;
  transform: translateY(var(--s-4));
  transition: opacity .3s var(--ease-out), transform .4s var(--ease-out);
}

@media (hover: hover) {
  .mosaic__tile:hover .mosaic__img {
    transform: scale(.98);
  }

  .mosaic__tile:hover .mosaic__tag,
  .mosaic__tile:focus-visible .mosaic__tag {
    opacity: 1;
    transform: none;
  }
}

@media (hover: none) {
  .mosaic__tag {
    opacity: 1;
    transform: none;
  }
}

/* подпись не шире плитки: на узкой — только размер, на совсем узкой её нет
   (смысл несёт aria-label кнопки) */
@container (max-width: 12rem) {
  .mosaic__label { display: none; }
}

@container (max-width: 6rem) {
  .mosaic__tag { display: none; }
}

.mosaic__more {
  display: flex;
  justify-content: center;
  margin-top: var(--s-40);
}

</style>
