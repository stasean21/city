<script setup>
import { computed, useSlots } from 'vue'
import { RouterLink } from 'vue-router'
import RollingText from './RollingText.vue'
import RicochetArrow from './RicochetArrow.vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost
  // md | lg — размеры теперь одинаковые (как кнопка в шапке),
  // lg оставлен алиасом, чтобы не ломать вызовы
  size: { type: String, default: 'md' },
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

const classes = computed(() => ['btn', `btn--${props.variant}`])
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
  --roll-h: 1.375em;
  display: inline-flex;
  align-items: center;
  gap: var(--s-12);
  font: 500 var(--t-ui)/1.375 var(--f-body);
  border-radius: var(--r-btn);
  padding: var(--s-8) var(--s-16);
  /* прозрачная рамка у всех вариантов — высота primary и secondary одна */
  border: var(--hairline) solid transparent;
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
  border: var(--hairline) solid var(--border);
}

.btn--secondary:hover {
  border-color: var(--ink);
}

.btn--ghost {
  background: transparent;
  color: var(--ink);
  padding: var(--s-8) 0;
}

.btn:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

/* на тёмном фоне (футер, тёмные секции) — те же primary/secondary,
   инвертированные: владелец ставит на предке класс .on-dark */
:global(.on-dark .btn--primary),
:global(.on-dark .btn--primary:hover) {
  background: var(--white);
  color: var(--ink);
}

:global(.on-dark .btn--secondary) {
  background: transparent;
  color: var(--white);
  border-color: var(--on-dark-border);
}

:global(.on-dark .btn--secondary:hover) {
  border-color: var(--white);
}

:global(.on-dark .btn:focus-visible) {
  outline-color: var(--white);
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
