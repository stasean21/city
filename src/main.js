import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import './styles/tokens.css'
import './styles/base.css'
import { headerOffset, scrollBehaviorMode } from './utils/headerOffset.js'
import { hitMetrika } from './utils/metrika.js'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to, from) {
      if (to.hash) {
        // плавно — только внутри той же страницы; с другой страницы прокрутка
        // мгновенная, её закрывают шторки. Первая загрузка (from без matched) —
        // тоже сразу
        const samePage = from.matched.length > 0 && to.path === from.path
        return { el: to.hash, top: headerOffset(), behavior: samePage ? scrollBehaviorMode() : 'auto' }
      }
      return { top: 0 }
    },
  },
  ({ router, isClient }) => {
    if (!isClient) return
    // переходы между страницами; якоря внутри страницы — не новый просмотр
    router.afterEach((to, from, failure) => {
      if (failure || to.path === from.path) return
      const { origin } = window.location
      hitMetrika(origin + to.fullPath, origin + from.fullPath)
    })
  },
)
