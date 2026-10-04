<script setup>
// окно браузера: полоса с точками и адресной строкой, внутри — слот.
// декоративное — смысл передаёт текст рядом
defineProps({
  domain: { type: String, default: '' },
})
</script>

<template>
  <div class="browser" aria-hidden="true">
    <div class="browser__bar">
      <i></i><i></i><i></i>
      <span class="caption browser__url">{{ domain }}</span>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.browser {
  overflow: hidden;
  background: var(--white);
  border: var(--hairline) solid var(--border);
  border-radius: var(--r-card);
}

.browser__bar {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  padding: var(--s-8) var(--s-12);
  background: var(--bg-3);
}

.browser__bar i {
  flex: none;
  width: var(--browser-dot);
  height: var(--browser-dot);
  background: var(--text-4);
  border-radius: 50%;
}

.browser__url {
  flex: 1;
  max-width: var(--browser-url-max);
  margin-left: var(--s-8);
  padding: 0 var(--s-8);
  overflow: hidden;
  color: var(--text-3);
  white-space: nowrap;
  text-overflow: ellipsis;
  background: var(--white);
  border-radius: var(--r-sm);
}
</style>
