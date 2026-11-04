import { ref } from 'vue'

// согласие на cookie и Метрику: маленький общий стор, без Pinia.
// consentOpen — окно нужно: выбора ещё нет или открыты настройки. На документах
// оно при этом не показывается: их должно быть можно прочитать до выбора.
// consentReady — окна на экране нет, можно запускать то, что на него смотрит
// (видео, анимации hero). До гидрации и пока окно на экране — false; ставит ConsentGate.
// Метрика от них не зависит: она грузится только при сохранённом all
export const consentReady = ref(false)
export const consentOpen = ref(false)

export const CONSENT_KEY = 'cookie-consent'
const DOCUMENT_ROUTES = ['privacy', 'consent']
const VALUES = ['all', 'necessary']

export function readConsent() {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY)
    return VALUES.includes(value) ? value : null
  } catch {
    return null
  }
}

export function writeConsent(value) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value)
  } catch {
    // хранилище недоступно — окно покажется и при следующем визите
  }
}

export function isDocumentRoute(route) {
  return DOCUMENT_ROUTES.includes(route.name)
}
