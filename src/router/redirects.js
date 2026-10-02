// старые адреса → новые. общий список для роутера и vite.config.js:
// редиректы не пререндерятся, их обрабатывает роутер
export const redirects = [
  // «AI-фотосессии» объединены с предметной съёмкой — старые ссылки не должны давать 404
  { path: '/services/ai-fotosessii', redirect: '/services/predmetnaya-syomka' },
  // инфографика переехала на короткий адрес
  { path: '/services/infografika-dlya-marketpleysov', redirect: '/services/infographics' },
]
