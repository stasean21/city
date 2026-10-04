import { nextTick, ref } from 'vue'

// открытие бесконечной галереи работ: кнопка «Смотреть все работы» → галерея,
// после закрытия фокус возвращается на кнопку
export function useWorksGallery() {
  const galleryOpen = ref(false)
  // с какой работы сразу открыть просмотр (-1 — показать полотно)
  const galleryStart = ref(-1)
  let opener = null

  function openGallery(event, start = -1) {
    opener = event?.currentTarget ?? null
    galleryStart.value = start
    galleryOpen.value = true
  }

  async function closeGallery() {
    galleryOpen.value = false
    await nextTick()
    // без прокрутки: страница должна остаться там, где была
  opener?.focus({ preventScroll: true })
    opener = null
  }

  return { galleryOpen, galleryStart, openGallery, closeGallery }
}
