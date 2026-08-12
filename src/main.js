import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import './styles/tokens.css'
import './styles/base.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to) {
      // 66 = --header-h из tokens.css, шапка фиксирована и перекрывает якорь
      if (to.hash) return { el: to.hash, top: 66 }
      return { top: 0 }
    },
  },
)
