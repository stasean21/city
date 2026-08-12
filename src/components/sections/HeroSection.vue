<script setup>
import BaseButton from '../ui/BaseButton.vue'
</script>

<template>
  <section id="hero" class="hero">
    <div class="container">
      <div class="hero__content">
        <span class="hero__eyebrow once-in">Дизайнер и ИИ-разработчик</span>
        <h1 class="once-in">Дизайн и ИИ-разработка для малого и среднего бизнеса</h1>
        <p class="once-in">Собираю визуал, сайты и автоматизацию так, чтобы всё работало вместе —
          от первого показа в выдаче до первого заказа.</p>
        <div class="hero__actions once-in">
          <BaseButton to="/works" variant="primary" size="large">Смотреть работы</BaseButton>
          <BaseButton to="/contacts" variant="secondary" size="large">Обсудить задачу</BaseButton>
        </div>
        <div class="hero__trust once-in">
          <span class="hero__stat"><strong>—</strong> работ</span>
          <span class="hero__stat"><strong>—</strong> ниш</span>
          <span class="hero__stat"><strong>—</strong> площадок</span>
          <span class="hero__stat"><strong>—</strong> постоянных клиентов</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: 100px;
  padding-bottom: 200px;
}

.hero__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 620px;
}

.hero__eyebrow {
  font: 400 12px var(--f-body);
  color: var(--text-3);
}

.hero__content h1 {
  margin-bottom: 0;
}

.hero__content p {
  max-width: var(--measure-paragraph);
}

.hero__actions {
  display: flex;
  gap: 12px;
}

.hero__trust {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.hero__stat {
  font: 400 13px var(--f-body);
  color: var(--text-3);
}

.hero__stat strong {
  font: 600 15px var(--f-head);
  color: var(--ink);
  margin-right: 4px;
}
</style>
