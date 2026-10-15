# Удалить пустые страницы /about и /contacts

Прочитай `CLAUDE.md`.

На страницах `/about` и `/contacts` есть только заголовок. Ссылок на них на сайте нет: меню, футер и кнопки ведут к блокам главной `#about` и `#contact`. Но при сборке эти страницы попадают в `dist` и могут попасть в поиск. Поэтому страницы удаляем, а их адреса перенаправляем на блоки главной.

## Что сделать

1. Удалить `src/views/AboutView.vue` и `src/views/ContactsView.vue`.

2. `src/router/index.js` — убрать оба маршрута:
   ```js
   { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
   { path: '/contacts', name: 'contacts', component: () => import('../views/ContactsView.vue') },
   ```

3. `src/router/redirects.js` — добавить в массив `redirects` два редиректа на блоки главной:
   ```js
   // отдельных страниц «Обо мне» и «Контакты» нет — это блоки главной
   { path: '/about', redirect: { path: '/', hash: '#about' } },
   { path: '/contacts', redirect: { path: '/', hash: '#contact' } },
   ```
   `vite.config.js` уже исключает пути из `redirects` из пререндера, его не трогать.

4. Поиском по проекту найти остатки: `grep -rn "AboutView\|ContactsView\|name: 'about'\|name: 'contacts'\|'/about'\|'/contacts'" src scripts`. Ничего не должно остаться, кроме двух строк в `redirects.js`. `#about` и `#contact` (якоря блоков) не трогать.

## Проверка

1. `npm run build` без ошибок. В `dist` нет папок `about/` и `contacts/`, а `index.html`, страницы услуг, `privacy/` и `404.html` на месте.
2. `npm run dev`:
   - `localhost:5173/about` → главная, прокрутка к блоку «Обо мне», в адресной строке `/#about`;
   - `localhost:5173/contacts` → главная, прокрутка к блоку контактов, в адресной строке `/#contact`.
   Блоки не должны прятаться под шапкой.
3. `/services/infographics` → в меню «Обо мне» и кнопка «Обсудить задачу» работают как раньше.
4. Коммит: «Удалены пустые страницы /about и /contacts, адреса ведут на блоки главной». Потом `git push`.
