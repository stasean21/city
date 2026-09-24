<script setup>
// стрелка-рикошет: сама не слушает наведение — когда улетать, решает владелец,
// выставляя на себе --ricochet-p: 1 (hover, :active на тач, :focus-visible).
// цвет — currentColor; второй стрелке владелец может задать --ricochet-second
defineProps({
  size: { type: String, default: '16px' },
})
</script>

<template>
  <span class="ricochet" :style="{ '--ricochet-size': size }" aria-hidden="true">
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M4 12L12 4M12 4H5.5M12 4v6.5" />
    </svg>
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M4 12L12 4M12 4H5.5M12 4v6.5" />
    </svg>
  </span>
</template>

<style scoped>
/* два одинаковых svg, второй запаркован снизу-слева за пределами видимости;
   диагональ translate совпадает с направлением самой стрелки,
   иначе эффект «улёта» разваливается */
.ricochet {
  position: relative;
  display: block;
  width: var(--ricochet-size);
  height: var(--ricochet-size);
  overflow: hidden;
  flex: none;
}

.ricochet svg {
  position: absolute;
  width: var(--ricochet-size);
  height: var(--ricochet-size);
  display: block;
  transform: translate(
    calc(var(--ricochet-p, 0) * var(--ricochet-size)),
    calc(var(--ricochet-p, 0) * var(--ricochet-size) * -1)
  );
  transition: transform .38s cubic-bezier(.22, 1, .36, 1);
}

.ricochet svg:nth-child(1) {
  left: 0;
  top: 0;
}

.ricochet svg:nth-child(2) {
  left: calc(var(--ricochet-size) * -1);
  top: var(--ricochet-size);
}

.ricochet svg path {
  stroke: currentColor;
  stroke-width: 1.6;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* вторая стрелка — та, что въезжает на смену первой */
.ricochet svg:nth-child(2) path {
  stroke: var(--ricochet-second, currentColor);
}

@media (prefers-reduced-motion: reduce) {
  .ricochet svg {
    transition: none;
  }

  .ricochet svg:nth-child(2) {
    display: none;
  }
}
</style>
