<script setup>
// первый экран страницы ИИ-агентов: обрывок переписки — клиент, агент,
// служебная отметка. Пузыри медленно плавают со сдвигом фаз. Иллюстрация, aria-hidden
const BUBBLES = [
  { kind: 'user', text: 'Сколько стоит инфографика на 5 слайдов?' },
  { kind: 'agent', text: 'Зависит от товара — пришлите ссылку, посчитаю и передам заявку.' },
  { kind: 'system', text: '● заявка добавлена в таблицу' },
  { kind: 'user', text: 'Отлично, вот ссылка' },
]
</script>

<template>
  <div class="bubbles once-in" aria-hidden="true">
    <p
      v-for="(b, i) in BUBBLES"
      :key="i"
      class="bubbles__b"
      :class="[`is-${b.kind}`, `is-${i + 1}`, { small: b.kind === 'system' }]"
    >{{ b.text }}</p>
  </div>
</template>

<style scoped>
.bubbles {
  position: relative;
  height: var(--bubbles-h);
}

/* сообщение: один угол меньше — «хвост» к отправителю */
.bubbles__b {
  position: absolute;
  max-width: var(--bubble-max);
  padding: var(--s-12) var(--s-16);
  color: var(--ink);
  border-radius: var(--r-card);
  animation: bubble-float 6s ease-in-out infinite;
}

.is-user {
  background: var(--white);
  border-bottom-right-radius: var(--r-sm);
}

.is-agent {
  color: var(--white);
  background: var(--ink);
  border-bottom-left-radius: var(--r-sm);
}

.is-system {
  color: var(--warm-2);
  background: var(--bg-3);
}

/* композиция макета service-agents.html, фазы плавания сдвинуты */
.is-1 { right: 4%; top: 6%; }
.is-2 { left: 4%; top: 30%; animation-delay: -2s; }
.is-3 { right: 10%; top: 58%; animation-delay: -4s; }
.is-4 { left: 14%; top: 80%; animation-delay: -1s; }

@keyframes bubble-float {
  50% { transform: translateY(calc(-1 * var(--bubble-float))); }
}

@media (prefers-reduced-motion: reduce) {
  .bubbles__b {
    animation: none;
  }
}
</style>
