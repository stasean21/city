import contacts from '../data/contacts.json'

// svg встраиваем строкой, чтобы логотипы попали в пререндеренный html;
// файла нет — svg: null, вместо логотипа круг. Новый файл
// подхватится при следующей сборке без правок
const icons = import.meta.glob('../assets/messengers/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// одноцветные глифы (fill="currentColor") — для тёмного футера
const monoIcons = import.meta.glob('../assets/messengers/mono/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// у фирменных логотипов бывают градиенты с id (Max). svg встраивается на страницу
// несколько раз, а url(#id) берёт первый экземпляр в документе — если он внутри
// скрытого блока (шторка меню на десктопе), градиент не рисуется нигде.
// Поэтому id и ссылки на них получают префикс: свой у каждого места вывода
export function withIdPrefix(svg, prefix) {
  if (!svg) return svg
  return svg
    .replace(/\bid="([^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${prefix}$1"`)
}

export const messengers = contacts.map((item) => ({
  ...item,
  svg: withIdPrefix(icons[`../assets/messengers/${item.id}.svg`] ?? null, `${item.id}-`),
  mono: monoIcons[`../assets/messengers/mono/${item.id}.svg`] ?? null,
}))
