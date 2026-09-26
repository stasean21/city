<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import BaseButton from '../ui/BaseButton.vue'

const heroEl = ref(null)
const objectEl = ref(null)

let onMouseMove = null

onMounted(() => {
  const section = heroEl.value
  const el = objectEl.value
  if (!section || !el) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isNarrow = window.matchMedia('(max-width: 767px)').matches
  const isTouch = window.matchMedia('(hover: none)').matches
  if (reducedMotion || isNarrow || isTouch) return

  gsap.set(el, { x: 0, y: 0 })
  const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power2.out' })
  const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' })
  const strength = 0.35
  const maxTravel = 60

  // следим за курсором по всей странице, а не только над .hero — смещение
  // считаем от границ секции, но клампим, чтобы вдали от неё объект не улетал
  onMouseMove = (event) => {
    const rect = section.getBoundingClientRect()
    const dx = gsap.utils.clamp(-1, 1, gsap.utils.mapRange(rect.left, rect.right, -1, 1, event.clientX))
    const dy = gsap.utils.clamp(-1, 1, gsap.utils.mapRange(rect.top, rect.bottom, -1, 1, event.clientY))
    xTo(dx * maxTravel * strength)
    yTo(dy * maxTravel * strength)
  }

  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  if (onMouseMove) window.removeEventListener('mousemove', onMouseMove)
  if (objectEl.value) gsap.killTweensOf(objectEl.value)
})
</script>

<template>
  <section id="hero" class="hero" ref="heroEl">
    <div class="container">
      <div class="hero__content">
        <img
          ref="objectEl"
          class="hero__object"
          src="https://storage.yandexcloud.net/landing-main/icons/hes-test.png"
          alt=""
          aria-hidden="true"
        />
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
  padding-top: var(--s-32);
  padding-bottom: var(--hero-bottom);
}

.hero__object {
  position: absolute;
  top: var(--hero-object-top);
  /* поправа держится в пределах пустого поля справа от контента —
     иначе там, где поле почти нулевое, объект вылезает за вьюпорт
     и добавляет горизонтальный скролл */
  right: calc(-1 * min(var(--hero-object-shift), max(var(--s-20), (100vw - var(--container)) / 2)));
  width: var(--hero-object-w);
  height: auto;
  pointer-events: none;
}

@media (max-width: 991px) {
  .hero__object {
    width: var(--hero-object-w-sm);
    top: var(--hero-object-top-sm);
    right: 0;
  }
}

@media (max-width: 767px) {
  .hero__object {
    display: none;
  }
}

.hero__content {
  position: relative;
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
  margin-bottom: var(--s-32);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--s-12);
}
</style>
