import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import './styles/tokens.css'
import './styles/base.css'

function headerOffset() {
  const root = getComputedStyle(document.documentElement)
  const rem = parseFloat(root.fontSize)
  const token = (name) => parseFloat(root.getPropertyValue(name)) * rem
  return token('--header-top') + token('--header-h') + token('--s-24')
}

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to) {
      // шапка фиксирована и перекрывает якорь: отступ — её верх и высота
      // плюс зазор, как у липких колонок (читаем токены, на мобилке они меньше)
      if (to.hash) return { el: to.hash, top: headerOffset() }
      return { top: 0 }
    },
  },
)
