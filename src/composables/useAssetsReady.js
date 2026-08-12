const MIN_TIME = 1500
const MAX_TIME = 6000

function imagePromise(img) {
  if (img.complete && img.naturalWidth > 0) {
    return img.decode ? img.decode().catch(() => {}) : Promise.resolve()
  }
  if (img.decode) {
    return img.decode().catch(() => {})
  }
  return new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true })
    img.addEventListener('error', resolve, { once: true })
  })
}

/**
 * Ждёт реальной загрузки медиа первого экрана (картинки внутри main + шрифты),
 * но не дольше MAX_TIME и не быстрее MIN_TIME — чтобы заставка не мигала
 * на быстром соединении и не зависала на медленном.
 */
export function useAssetsReady({ root = document, minTime = MIN_TIME, maxTime = MAX_TIME } = {}) {
  const images = Array.from(root.querySelectorAll('main img'))
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve()

  const allReady = Promise.all([...images.map(imagePromise), fontsReady])
  const timeout = new Promise((resolve) => setTimeout(resolve, maxTime))
  const minDelay = new Promise((resolve) => setTimeout(resolve, minTime))

  return Promise.all([Promise.race([allReady, timeout]), minDelay]).then(() => undefined)
}
