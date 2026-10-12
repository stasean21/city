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

// повторный клик по ссылке на тот же якорь (адрес уже /#reviews): роутер считает
// это дублем, навигации и scrollBehavior нет — прокручиваем сами тем же расчётом.
// true — прокрутили (вызывающему, например, закрепить шапку).
// path — страница якоря: по умолчанию главная, блок текущей страницы — route.path
export function scrollToSameAnchor(route, hash, path = '/') {
  if (route.path !== path || route.hash !== hash) return false
  const el = document.querySelector(hash)
  if (!el) return false
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset()
  window.scrollTo({ top, behavior: scrollBehaviorMode() })
  return true
}
