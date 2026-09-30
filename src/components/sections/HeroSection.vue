<script setup>
import BaseButton from '../ui/BaseButton.vue'
</script>

<template>
  <section id="hero" class="hero">
    <div class="container">
      <div class="hero__content">
        <h1 class="display hero__title once-in">Дизайн, аналитика и ИИ-разработка для малого и среднего бизнеса</h1>
        <p class="lead hero__lead once-in">Собираю визуал, сайты и автоматизацию так, чтобы всё работало вместе —
          от первого показа в выдаче до первого заказа.</p>
        <div class="hero__actions once-in">
          <BaseButton to="/works" variant="primary" roll>Смотреть работы</BaseButton>
          <BaseButton to="/contacts" variant="secondary" arrow>Обсудить задачу</BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* main уже даёт клиренс под шапку (--header-top + --header-h) */
.hero {
  padding-top: var(--hero-top);
  padding-bottom: var(--hero-bottom);
}

.hero__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero__title {
  max-width: var(--measure-display);
  margin-bottom: var(--s-24);
}

.hero__lead {
  max-width: var(--measure-lead);
  /* без одинокого слова в последней строке */
  text-wrap: balance;
  margin-bottom: var(--s-32);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--s-12);
}
</style>
