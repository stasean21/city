<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  step: { type: Number, default: 25 }, // мс задержки на букву
})

const letters = computed(() => [...props.text])
const stepMs = computed(() => `${props.step}ms`)
</script>

<template>
  <span class="roll" aria-hidden="true">
    <div class="roll__base">
      <span v-for="(ch, i) in letters" :key="`b${i}`" :style="{ '--i': i }">{{ ch }}</span>
    </div>
    <div class="roll__up">
      <span v-for="(ch, i) in letters" :key="`u${i}`" :style="{ '--i': i }">{{ ch }}</span>
    </div>
  </span>
</template>

<style scoped>
.roll {
  position: relative;
  display: inline-block;
  overflow: hidden;
  height: var(--roll-h, 1.25rem);
  vertical-align: top;
}

.roll__base,
.roll__up {
  display: flex;
}

.roll__up {
  position: absolute;
  left: 0;
  top: 100%;
}

.roll span {
  display: inline-block;
  white-space: pre;
  transition: transform .42s cubic-bezier(.22, 1, .36, 1);
  transition-delay: calc(var(--i) * v-bind(stepMs));
}

@media (prefers-reduced-motion: reduce) {
  .roll span {
    transition: none;
  }

  .roll__up {
    display: none;
  }
}
</style>
