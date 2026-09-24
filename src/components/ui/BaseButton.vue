<script setup>
import { computed, useSlots } from 'vue'
import { RouterLink } from 'vue-router'
import RollingText from './RollingText.vue'
import RicochetArrow from './RicochetArrow.vue'

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

    <RicochetArrow v-if="arrow" size="var(--btn-icon)" />
  </component>
</template>

<style scoped>
.btn {
  --btn-icon: 16px;
  --roll-h: 22px;
  display: inline-flex;
  align-items: center;
  gap: var(--gap-icon);
  font: 500 16px/22px var(--f-body);
  border-radius: var(--r-btn);
  padding: var(--btn-py) var(--btn-px);
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
  padding: var(--btn-py) 0;
}

.btn:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

/* стрелка-рикошет — RicochetArrow; у кнопки въезжающая стрелка акцентная */
.btn {
  --ricochet-second: var(--accent);
}

.btn:hover {
  --ricochet-p: 1;
}

/* буквы катаются внутри RollingText — она свой хук на hover не ставит,
   сдвиг запускает владелец эффекта, здесь :deep() пробивает её scoped-стили */
.btn:hover :deep(.roll span) {
  transform: translateY(-100%);
}
</style>
