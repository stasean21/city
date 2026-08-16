<script setup>
import { computed, useSlots } from 'vue'
import { RouterLink } from 'vue-router'
import RollingText from './RollingText.vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost
  size: { type: String, default: 'md' }, // md | lg
  arrow: { type: Boolean, default: false },
  roll: { type: Boolean, default: false },
  to: { type: String, default: null },
  href: { type: String, default: null },
})

const slots = useSlots()

// текст подписи нужен и для разбивки на буквы, и для aria-label,
// поэтому вытаскиваем его из default-слота, а не принимаем пропом
const label = computed(() => {
  if (!slots.default) return ''
  return slots.default()
    .map((node) => (typeof node.children === 'string' ? node.children : ''))
    .join('')
    .trim()
})

const tag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

const linkAttrs = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return {}
})

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  props.size === 'lg' ? 'btn--lg' : null,
])
</script>

<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    class="btn"
    :class="classes"
    :aria-label="roll ? label : null"
  >
    <RollingText v-if="roll" :text="label" />
    <slot v-else />

    <span v-if="arrow" class="arw" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M4 12L12 4M12 4H5.5M12 4v6.5" />
      </svg>
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M4 12L12 4M12 4H5.5M12 4v6.5" />
      </svg>
    </span>
  </component>
</template>

<style scoped>
.btn {
  --btn-icon: 16px;
  --roll-h: 22px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font: 500 16px/22px var(--f-body);
  border-radius: 15px;
  padding: 8px 16px;
  border: 0;
  cursor: pointer;
  text-decoration: none;
  transition: background .2s ease, color .2s ease, border-color .2s ease;
}

.btn--primary {
  background: var(--ink);
  color: var(--white);
}

.btn--primary:hover {
  background: var(--ink-hover);
}

.btn--secondary {
  background: var(--bg-2);
  color: var(--ink);
  border: 1px solid var(--border);
}

.btn--secondary:hover {
  border-color: var(--ink);
}

.btn--ghost {
  background: transparent;
  color: var(--ink);
  padding: 8px 0;
}

.btn:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

/* стрелка-рикошет: два одинаковых svg, второй запаркован снизу-слева
   за пределами видимости; диагональ translate совпадает с направлением
   самой стрелки, иначе эффект «улёта» разваливается */
.arw {
  position: relative;
  width: var(--btn-icon);
  height: var(--btn-icon);
  overflow: hidden;
  flex: none;
}

.arw svg {
  position: absolute;
  width: var(--btn-icon);
  height: var(--btn-icon);
  display: block;
  transition: transform .38s cubic-bezier(.22, 1, .36, 1);
}

.arw svg:nth-child(1) {
  left: 0;
  top: 0;
}

.arw svg:nth-child(2) {
  left: calc(var(--btn-icon) * -1);
  top: var(--btn-icon);
}

.btn:hover .arw svg {
  transform: translate(var(--btn-icon), calc(var(--btn-icon) * -1));
}

.arw svg path {
  stroke: currentColor;
  stroke-width: 1.6;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* вторая стрелка — та, что въезжает на смену первой при наведении */
.arw svg:nth-child(2) path {
  stroke: var(--accent);
}

/* буквы катаются внутри RollingText — она свой хук на hover не ставит,
   сдвиг запускает владелец эффекта, здесь :deep() пробивает её scoped-стили */
.btn:hover :deep(.roll span) {
  transform: translateY(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .arw svg {
    transition: none;
  }

  .arw svg:nth-child(2) {
    display: none;
  }
}
</style>
