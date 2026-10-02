<script setup>
import CoverImage from '../ui/CoverImage.vue'

// веер первого экрана страницы съёмки: три кадра 4:5 из первых работ —
// левый и правый повёрнуты, центральный сверху
defineProps({
  works: { type: Array, required: true }, // работы услуги по order, берутся три
})

const POSITIONS = ['left', 'center', 'right']
</script>

<template>
  <!-- графика первого экрана: без lazy, смысл несёт текст слева -->
  <div class="pfan once-in" aria-hidden="true">
    <CoverImage
      v-for="(work, i) in works.slice(0, 3)"
      :key="work.slug"
      class="pfan__card"
      :class="`is-${POSITIONS[i]}`"
      :src="work.cover"
      :width="800"
      :height="1000"
      :lazy="false"
    />
  </div>
</template>

<style scoped>
/* раскладка в процентах от веера — композиция макета service-photo.html */
.pfan {
  position: relative;
  height: var(--pfan-h);
}

.pfan__card {
  position: absolute;
  width: 44%;
  aspect-ratio: 4 / 5;
  border: var(--fan-border) solid var(--white);
  border-radius: var(--r-card);
  transition: transform .8s var(--ease-out);
}

.pfan__card.is-left {
  left: 4%;
  top: 10%;
  transform: rotate(calc(-1 * var(--pfan-rot)));
}

.pfan__card.is-center {
  left: 28%;
  top: 2%;
  z-index: 2;
}

.pfan__card.is-right {
  left: 52%;
  top: 12%;
  transform: rotate(var(--pfan-rot));
}

@media (hover: hover) {
  .pfan:hover .is-left {
    transform: rotate(calc(-1 * var(--pfan-rot-open))) translateX(-8%);
  }

  .pfan:hover .is-center {
    transform: translateY(-3%);
  }

  .pfan:hover .is-right {
    transform: rotate(var(--pfan-rot-open)) translateX(8%);
  }
}
</style>
