<script setup>
import BaseButton from '../ui/BaseButton.vue'
</script>

<template>
  <section id="hero" class="hero">
    <div class="container">
      <div class="hero__content">
        <h1 class="once-in">Дизайн, аналитика и ИИ-разработка для малого и среднего бизнеса</h1>
        <p class="once-in">Собираю визуал, сайты и автоматизацию так, чтобы всё работало вместе —
          от первого показа в выдаче до первого заказа.</p>
        <div class="hero__actions once-in">
          <BaseButton to="/works" variant="primary" size="lg" roll>Смотреть работы</BaseButton>
          <BaseButton to="/contacts" variant="secondary" size="lg" arrow>Обсудить задачу</BaseButton>
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
  /* main уже даёт клиренс под шапку (--header-top + --header-h).
     без большого min-height и с укороченным нижним паддингом —
     чтобы ServicesIntro тоже попадал в первый экран */
  display: flex;
  align-items: center;
  padding-top: 30px;
  padding-bottom: 60px;
}

.hero__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  /* без общего max-width — h1 может занять всю ширину контейнера,
     чтобы центрирование текста было по центру страницы, а не узкой колонки;
     параграф ниже сам себя ограничивает через --measure-paragraph */
  max-width: none;
}

.hero__content h1 {
  margin-bottom: 0;
  font-weight: 700;
  font-size: 58px;
  text-align: center;
}

/* переиспользуем брейкпоинты, уже принятые в проекте (base.css),
   а не вводим новые; та же пропорция шагов, что и раньше (58/68 ≈ .85) */
@media (max-width: 991px) {
  .hero__content h1 {
    font-size: 48px;
  }
}

@media (max-width: 767px) {
  .hero__content h1 {
    font-size: 34px;
  }
}

@media (max-width: 479px) {
  .hero__content h1 {
    font-size: 31px;
  }
}

.hero__content p {
  /* было унаследовано от body: 15px/25px — здесь ×1.5 */
  font-size: 22.5px;
  line-height: 37.5px;
  /* без --measure-paragraph — шире, как и h1 выше */
  max-width: none;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.hero__trust {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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
