<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary
  size: { type: String, default: 'default' }, // default | large
  to: { type: String, default: null },
})
</script>

<template>
  <RouterLink v-if="to" :to="to" class="btn" :class="[`btn--${variant}`, `btn--${size}`]">
    <slot />
  </RouterLink>
  <button v-else class="btn" :class="[`btn--${variant}`, `btn--${size}`]">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--r-lg);
  padding: 9px 16px;
  font: 500 13px/20px var(--f-body);
  transition: var(--ease);
  cursor: pointer;
}

.btn--large {
  padding: 12px 16px;
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
</style>
