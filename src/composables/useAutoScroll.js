import { onMounted, onUnmounted } from 'vue'

// медленная автопрокрутка блока туда-обратно через его scrollTop.
// блок — настоящий прокручиваемый (или overflow: hidden) элемент: колесо и свайп
// работают нативно, у края прокрутка сама уходит странице.
// едет, только пока блок в экране и вкладка видна; после ручного действия
// (user()) ждёт resumeAfter и продолжает с нового места. reduced motion — стоит
export function useAutoScroll(elRef, { speed = 20, resumeAfter = 2500 } = {}) {
  let raf = 0
  let last = 0
  let y = 0
  let dir = 1
  let inView = false
  let holdUntil = 0
  let observer = null

  function tick(now) {
    raf = requestAnimationFrame(tick)
    const dt = last ? (now - last) / 1000 : 0
    last = now
    const el = elRef.value
    if (!el || !inView || document.hidden || now < holdUntil) return
    const max = el.scrollHeight - el.clientHeight
    if (max <= 0) return
    // своё число, а не scrollTop: дробный сдвиг за кадр браузер округлил бы
    y += speed * dt * dir
    if (y >= max) { y = max; dir = -1 }
    if (y <= 0) { y = 0; dir = 1 }
    el.scrollTop = y
  }

  // ручная прокрутка или программный переход: пауза, потом с нового места
  function hold(ms = resumeAfter) {
    holdUntil = performance.now() + ms
  }

  function user() {
    hold()
    requestAnimationFrame(() => { y = elRef.value?.scrollTop ?? y })
  }

  // положение после плавного перехода — продолжить с него
  function sync() {
    y = elRef.value?.scrollTop ?? y
  }

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting }, { threshold: 0.2 })
    observer.observe(elRef.value)
    raf = requestAnimationFrame(tick)
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    observer?.disconnect()
  })

  return { user, hold, sync }
}
