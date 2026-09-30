import contacts from '../data/contacts.json'

// svg встраиваем строкой, чтобы логотипы попали в пререндеренный html;
// файла ещё нет (max.svg) — svg: null, вместо логотипа круг. Новый файл
// подхватится при следующей сборке без правок
const icons = import.meta.glob('../assets/messengers/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const messengers = contacts.map((item) => ({
  ...item,
  svg: icons[`../assets/messengers/${item.id}.svg`] ?? null,
}))
