<script setup>
import VideoLoop from '../ui/VideoLoop.vue'

// веер первого экрана страницы видеообложек: три ролика 3:4 из первых работ —
// левый и правый повёрнуты, центральный сверху (геометрия как у PhotoFan)
defineProps({
  works: { type: Array, required: true }, // работы с video и poster, по order
})

const POSITIONS = ['left', 'center', 'right']
</script>

<template>
  <div class="vfan once-in" aria-hidden="true">
    <VideoLoop
      v-for="(work, i) in works.slice(0, 3)"
      :key="work.slug"
      class="vfan__card"
      :class="`is-${POSITIONS[i]}`"
      :src="work.video"
      :poster="work.poster"
    />
  </div>
</template>

<style scoped>
.vfan {
  position: relative;
  height: var(--pfan-h);
}

.vfan__card {
  position: absolute;
  width: 44%;
  aspect-ratio: 3 / 4;
  border: var(--fan-border) solid var(--white);
  border-radius: var(--r-card);
  transition: transform .8s var(--ease-out);
}

.vfan__card.is-left {
  left: 4%;
  top: 10%;
  transform: rotate(calc(-1 * var(--pfan-rot)));
}

.vfan__card.is-center {
  left: 28%;
  top: 2%;
  z-index: 2;
}

.vfan__card.is-right {
  left: 52%;
  top: 12%;
  transform: rotate(var(--pfan-rot));
}

@media (hover: hover) {
  .vfan:hover .is-left {
    transform: rotate(calc(-1 * var(--pfan-rot-open))) translateX(-8%);
  }

  .vfan:hover .is-center {
    transform: translateY(-3%);
  }

  .vfan:hover .is-right {
    transform: rotate(var(--pfan-rot-open)) translateX(8%);
  }
}
</style>
