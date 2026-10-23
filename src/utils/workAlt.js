import { typo } from './typo.js'

// alt обложки работы — по услуге, к которой она относится; название из works.json.
// для поиска и скринридера: что это за работа, а не что нарисовано
export function workAlt(work) {
  const services = work.services ?? []
  if (services.includes('videooblozhki')) return typo(`Видеообложка для карточки: ${work.title}`)
  if (services.includes('predmetnaya-syomka')) return typo(`Предметная съёмка с помощью ИИ: ${work.title}`)
  return typo(`Инфографика для карточки товара: ${work.title}`)
}

// alt слайда работы в просмотре: «Купальник — слайд 2 из 6»
export const slideAlt = (title, n, total) => typo(`${title} — слайд ${n} из ${total}`)
