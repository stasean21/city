import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { publishedServices } from './src/data/published.js'

import { redirects } from './src/router/redirects.js'

const redirectPaths = new Set(redirects.map(route => route.path))

export default defineConfig({
  plugins: [vue()],
  ssgOptions: {
    includedRoutes(paths) {
      return paths
        // динамические шаблоны, редиректы и служебный /styleguide не пререндерим
        .filter(path => !path.includes(':') && !redirectPaths.has(path) && path !== '/styleguide')
        .concat(
          // черновики (draft) не пререндерятся
          publishedServices.map(service => `/services/${service.slug}`),
          // страница 404 для хостинга: dist/404.html
          '/404',
        )
    },
  },
})
