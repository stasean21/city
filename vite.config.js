import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import works from './src/data/works.json' with { type: 'json' }
import services from './src/data/services.json' with { type: 'json' }

export default defineConfig({
  plugins: [vue()],
  ssgOptions: {
    includedRoutes(paths) {
      return paths
        .filter(path => !path.includes(':slug'))
        .concat(
          works.map(work => `/works/${work.slug}`),
          services.map(service => `/services/${service.slug}`),
        )
    },
  },
})
