import { ref } from 'vue'

// согласие на cookie и Метрику: маленький общий стор, без Pinia.
// consentReady — окно закрыто, можно запускать то, что на него смотрит (видео,
// анимации hero, подарок). До гидрации и пока окно открыто — false
export const consentReady = ref(false)
export const consentOpen = ref(false)

const KEY = 'cookie-consent'
const VALUES = ['all', 'necessary']

export function readConsent() {
  try {
    const value = window.localStorage.getItem(KEY)
    return VALUES.includes(value) ? value : null
  } catch {
    return null
  }
}

export function writeConsent(value) {
  try {
    window.localStorage.setItem(KEY, value)
  } catch {
    // хранилище недоступно — окно покажется и при следующем визите
  }
}

// снова открыть окно: при первом визите и по «Настройкам cookie» в подвале
export function openConsent() {
  consentReady.value = false
  consentOpen.value = true
}

export function closeConsent() {
  consentOpen.value = false
  consentReady.value = true
}
