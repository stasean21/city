import { ref } from 'vue'

// уведомление о cookie: маленький общий стор, без Pinia.
// consentReady — приложение смонтировано, можно запускать видео и анимации hero
// (VideoLoop, HeroDots, печать подсказки в HeroSection) и подарок. Плашка ничего
// не закрывает, поэтому ждать её не нужно; ставит CookieBar в onMounted.
// cookieBarVisible — плашка сейчас на экране: на телефоне ярлык подарка на её месте
export const consentReady = ref(false)
export const cookieBarVisible = ref(false)
