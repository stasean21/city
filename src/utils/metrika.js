// Яндекс Метрика — грузится при входе на сайт (main.js), без ожидания согласия:
// о cookie сообщает плашка CookieBar. Вебвизор включён и описан в политике (п. 5.1).
// Не через <script> в index.html: только в браузере, пререндер её не трогает
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
  window.ym(COUNTER, 'init', { defer: true, clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true })
  window.ym(COUNTER, 'hit', window.location.href)
}

// переход между страницами без перезагрузки; пока Метрика не загружена — ничего
export function hitMetrika(url, referer) {
  if (!loaded) return
  window.ym(COUNTER, 'hit', url, { referer })
}
