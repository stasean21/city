// Яндекс Метрика — только после согласия (ConsentGate). Ни <script>, ни <noscript>
// в index.html: без согласия на mc.yandex.ru не уходит ни одного запроса.
// Вебвизор выключен: в политике (п. 5.1) он не описан
const COUNTER = 108640080
const SRC = 'https://mc.yandex.ru/metrika/tag.js'

let loaded = false

export function loadMetrika() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  // очередь вызовов, пока tag.js грузится: tag.js разберёт её сам
  window.ym = window.ym || function ym() {
    (window.ym.a = window.ym.a || []).push(arguments)
  }
  window.ym.l = Date.now()
  const script = document.createElement('script')
  script.async = true
  script.src = SRC
  document.head.appendChild(script)
  window.ym(COUNTER, 'init', { defer: true, clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false })
  window.ym(COUNTER, 'hit', window.location.href)
}

// переход между страницами без перезагрузки; пока Метрика не загружена — ничего
export function hitMetrika(url, referer) {
  if (!loaded) return
  window.ym(COUNTER, 'hit', url, { referer })
}
