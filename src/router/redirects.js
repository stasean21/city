// старые адреса → новые. общий список для роутера и vite.config.js:
// редиректы не пререндерятся, их обрабатывает роутер
export const redirects = [
  // «ИИ-фотосессии» объединены с предметной съёмкой — старые ссылки не должны давать 404
  { path: '/services/ai-fotosessii', redirect: '/services/predmetnaya-syomka' },
  // инфографика переехала на короткий адрес
  { path: '/services/infografika-dlya-marketpleysov', redirect: '/services/infographics' },
  // отдельных страниц «Обо мне» и «Контакты» нет — это блоки главной
  { path: '/about', redirect: { path: '/', hash: '#about' } },
  { path: '/contacts', redirect: { path: '/', hash: '#contact' } },
]
