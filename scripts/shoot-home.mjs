// Скриншоты главной для страницы «Лендинги и сайты» + разметка её блоков.
//
//   npm run shoot:home            — собрать сайт, снять, записать данные
//   npm run shoot:home -- --no-build   — снять уже собранный dist
//
// Результат:
//   shots/home-desktop.webp, shots/home-mobile.webp — владелец заливает в
//     https://storage.yandexcloud.net/landing-main/site/
//   src/data/site-blocks.json — положение блоков главной в процентах от высоты
//     страницы, геометрия контейнера и отступ между секциями (для SiteLive и SiteXray)
import { spawn, execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import sharp from 'sharp'

const PORT = 4179
const URL = `http://localhost:${PORT}/`
const QUALITY = 80

// блоки главной: id секций; последний — «Вопросы + связь» (faq + contact)
const BLOCKS = [
  { id: 'hero', from: '#hero' },
  { id: 'services', from: '#services' },
  { id: 'process', from: '#process' },
  { id: 'reviews', from: '#reviews' },
  { id: 'about', from: '#about' },
  { id: 'faq', from: '#faq', to: '#contact' },
]

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
}

if (!process.argv.includes('--no-build')) {
  execSync('npm run build', { stdio: 'inherit' })
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(URL)
      if (res.ok) return
    } catch {
      // ещё не поднялся
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('preview не запустился')
}

const round = (n) => Math.round(n * 1000) / 1000

async function shoot(browser, name) {
  const { width, height, ...device } = VIEWPORTS[name]
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    ...device,
  })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'load' })

  // загрузчик снимает блокировку прокрутки, когда закончил; сам слой прячем
  await page.waitForFunction(() => document.documentElement.style.overflow !== 'hidden', null, { timeout: 15000 })
  await page.addStyleTag({ content: '.the-loader { display: none !important; }' })

  // проходим страницу: ленивые картинки и наблюдатели срабатывают
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += Math.round(height * 0.6)) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.evaluate(() => Promise.all([...document.images].map((img) => (img.complete
    ? null
    : new Promise((r) => { img.onload = r; img.onerror = r })))))
  await page.waitForTimeout(600)

  const data = await page.evaluate((blocks) => {
    const doc = document.documentElement
    const pageH = doc.scrollHeight
    const pageW = doc.clientWidth
    const box = (sel) => {
      const el = document.querySelector(sel)
      const r = el.getBoundingClientRect()
      const padBottom = parseFloat(getComputedStyle(el).paddingBottom)
      return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY - padBottom, gap: padBottom }
    }
    const container = document.querySelector('#hero .container').getBoundingClientRect()
    const gutter = parseFloat(getComputedStyle(document.querySelector('#hero .container')).paddingLeft)
    return {
      pageH,
      pageW,
      container: { left: container.left + gutter, width: container.width - 2 * gutter, gutter },
      blocks: blocks.map(({ id, from, to }) => {
        const a = box(from)
        const b = to ? box(to) : a
        return { id, top: a.top, height: b.bottom - a.top, gap: b.gap }
      }),
    }
  }, BLOCKS)

  const png = await page.screenshot({ fullPage: true, type: 'png' })
  await sharp(png).webp({ quality: QUALITY }).toFile(`shots/home-${name}.webp`)
  await context.close()

  // всё в процентах от размеров скриншота — так разметка не зависит от ширины окна на сайте
  const pct = (v, of) => round((v / of) * 100)
  return {
    width: data.pageW,
    height: data.pageH,
    // gutter — зазор колонок сетки в процентах от ширины контейнера
    container: {
      left: pct(data.container.left, data.pageW),
      width: pct(data.container.width, data.pageW),
      gutter: pct(data.container.gutter, data.container.width),
    },
    blocks: data.blocks.map((b) => ({
      id: b.id,
      top: pct(b.top, data.pageH),
      height: pct(b.height, data.pageH),
      gap: Math.round(b.gap), // отступ под блоком, px при этой ширине
    })),
  }
}

try {
  await waitForServer()
  mkdirSync('shots', { recursive: true })
  // браузер Playwright, а если он не скачан (npx playwright install) — установленный Chrome
  const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }))
  const result = {}
  for (const name of Object.keys(VIEWPORTS)) {
    result[name] = await shoot(browser, name)
    console.log(`${name}: ${result[name].width}×${result[name].height} → shots/home-${name}.webp`)
  }
  await browser.close()
  writeFileSync('src/data/site-blocks.json', `${JSON.stringify(result, null, 2)}\n`)
  console.log('src/data/site-blocks.json записан')
} finally {
  server.kill()
}
