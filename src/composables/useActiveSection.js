import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// какой блок главной сейчас на экране: активна секция, которая пересекает
// линию примерно на трети высоты окна. '' — hero, контакты, футер или не главная.
// шапка живёт поверх всех страниц, поэтому наблюдатель перезапускается при
// возврате на главную, а при уходе с неё отключается. На сервере не выполняется
export function useActiveSection(hashes) {
  const route = useRoute()
  const active = ref('')
  const visible = new Set()
  let observer = null
  let stopWatch = null

  function stop() {
    observer?.disconnect()
    observer = null
    visible.clear()
    active.value = ''
  }

  function start() {
    stop()
    if (route.name !== 'home') return

    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const hash = `#${entry.target.id}`
        if (entry.isIntersecting) visible.add(hash)
        else visible.delete(hash)
      }
      active.value = hashes.find((hash) => visible.has(hash)) ?? ''
    }, { rootMargin: '-33% 0px -66% 0px' })

    for (const hash of hashes) {
      const el = document.getElementById(hash.slice(1))
      if (el) observer.observe(el)
    }
  }

  onMounted(() => {
    start()
    // после рендера новой страницы, когда секции главной уже в DOM
    stopWatch = watch(() => route.name, () => nextTick(start), { flush: 'post' })
  })

  onUnmounted(() => {
    stopWatch?.()
    stop()
  })

  return active
}
