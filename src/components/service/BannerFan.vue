<script setup>
import { computed } from 'vue'
import CoverImage from '../ui/CoverImage.vue'
import { findSize } from '../../utils/banners.js'

// веер первого экрана страницы баннеров: три разных формата одной кампании —
// вертикальный 3:4 слева, квадрат по центру, широкий узкий 32:9 поперёк снизу
const props = defineProps({
  campaign: { type: Object, required: true },
})

const cards = computed(() => [
  { key: 'vertical', size: findSize(props.campaign, 'vertical') },
  { key: 'square', size: findSize(props.campaign, 'square') },
  { key: 'wide-narrow', size: findSize(props.campaign, 'wide-narrow') },
].filter((card) => card.size))
</script>

<template>
  <!-- графика первого экрана: без lazy, смысл несёт текст слева -->
  <div class="bfan once-in" aria-hidden="true">
    <CoverImage
      v-for="{ key, size } in cards"
      :key="key"
      class="bfan__card"
      :class="`is-${key}`"
      :src="size.src"
      :width="size.w"
      :height="size.h"
      :lazy="false"
    />
  </div>
</template>

<style scoped>
/* раскладка в процентах от веера — композиция макета service-banners.html */
.bfan {
  position: relative;
  height: var(--bfan-h);
}

.bfan__card {
  position: absolute;
  border: var(--fan-border) solid var(--white);
  border-radius: var(--r-card);
  transition: transform .8s var(--ease-out);
}

.bfan__card.is-vertical {
  left: 4%;
  top: 6%;
  width: 40%;
  aspect-ratio: 3 / 4;
  transform: rotate(var(--bfan-rot-left));
}

.bfan__card.is-square {
  left: 34%;
  top: 10%;
  z-index: 2;
  width: 46%;
  aspect-ratio: 1;
}

.bfan__card.is-wide-narrow {
  left: 20%;
  top: 60%;
  z-index: 3;
  width: 74%;
  aspect-ratio: 32 / 9;
  transform: rotate(var(--bfan-rot-bottom));
}

@media (hover: hover) {
  .bfan:hover .is-vertical {
    transform: rotate(var(--bfan-rot-left-open)) translate(-6%, -2%);
  }

  .bfan:hover .is-square {
    transform: translateY(-3%);
  }

  .bfan:hover .is-wide-narrow {
    transform: rotate(var(--bfan-rot-bottom-open)) translate(4%, 4%);
  }
}
</style>
