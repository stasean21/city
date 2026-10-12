// шапка фиксирована и перекрывает якорь: отступ — её верх и высота
// плюс зазор, как у липких колонок (читаем токены, на мобилке они меньше)
export function headerOffset() {
  const root = getComputedStyle(document.documentElement)
  const rem = parseFloat(root.fontSize)
  const token = (name) => parseFloat(root.getPropertyValue(name)) * rem
  return token('--header-top') + token('--header-h') + token('--s-24')
}

// плавно внутри страницы; при reduced motion — сразу
export function scrollBehaviorMode() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}
