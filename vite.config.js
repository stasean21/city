import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import services from './src/data/services.json' with { type: 'json' }

import { redirects } from './src/router/redirects.js'
import { SITE_URL } from './src/data/site.js'

const OUT_DIR = 'dist'
const redirectPaths = new Set(redirects.map(route => route.path))

// страницы услуг: черновики (draft) не пререндерятся — хостинг отдаёт 404.html
const servicePaths = services
  .filter(service => !service.draft)
  .map(service => `/services/${service.slug}`)

// настоящие страницы сайта — для sitemap.xml. без 404, /styleguide, редиректов,
// черновиков и /privacy (пока в ней нет текста политики)
const sitemapPaths = ['/', ...servicePaths]

function writeSitemap() {
  const lastmod = new Date().toISOString().slice(0, 10)
  // адреса без слэша на конце, кроме главной: vite-ssg пишет services/<slug>.html
  const urls = sitemapPaths
    .map(path => `  <url><loc>${SITE_URL}${path}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n')
  writeFileSync(
    resolve(OUT_DIR, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
}

export default defineConfig({
  plugins: [vue()],
  build: { outDir: OUT_DIR },
  ssgOptions: {
    includedRoutes(paths) {
      return paths
        // динамические шаблоны, редиректы и служебный /styleguide не пререндерим
        .filter(path => !path.includes(':') && !redirectPaths.has(path) && path !== '/styleguide')
        .concat(
          servicePaths,
          // страница 404 для хостинга: dist/404.html
          '/404',
        )
    },
    onFinished: writeSitemap,
  },
})
