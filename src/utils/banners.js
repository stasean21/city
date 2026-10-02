import data from '../data/banners.json'

// кампании баннеров по порядку показа
export const campaigns = [...data].sort((a, b) => a.order - b.order)

// «1080 × 1080» — цифры выравнивает tabular-nums
export const dims = (size) => `${size.w} × ${size.h}`

// подпись плитки: «1080 × 1080 · квадрат»
export const sizeTag = (size) => `${dims(size)} · ${size.label.toLowerCase()}`

// alt картинки: «Кроссовки, Квадрат 1080×1080»
export const sizeAlt = (campaign, size) => `${campaign.title}, ${size.label} ${size.w}×${size.h}`

// первый размер кампании нужного формата
export const findSize = (campaign, format) => campaign.sizes.find((size) => size.format === format)
