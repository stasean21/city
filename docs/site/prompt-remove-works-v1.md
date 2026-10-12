# Убрать блок «Работы» и страницы работ; кнопка в Hero ведёт к «Услугам и решениям»

Прочитай `CLAUDE.md`. Это та самая «отдельная задача» по блоку работ, о которой там написано. Решение владельца: **блока работ на главной не будет совсем, страниц `/works` и `/works/:slug` тоже.** Пункта «Работы» в меню нет уже после промпта шапки.

## Важно: `works.json` НЕ удалять

Из `src/data/works.json` берут работы галереи на страницах услуг: `ServiceDetailView.vue` → `WorksWall`, `PhotoRows`, `VideoReel`, `BannerMosaic`, `useWorksGallery.js`. Файл остаётся, его содержимое позже заменят реальными работами. Удаляем только то, что относится к блоку на главной и к отдельным страницам работ.

---

## 1. Удалить

- `src/components/sections/WorksSection.vue`
- `src/components/sections/WorksGrid.vue`
- `src/views/WorksView.vue`
- `src/views/WorkDetailView.vue`
- `src/components/ui/WorkCard.vue` — **только если** после удаления `WorksGrid` его больше никто не импортирует, кроме `StyleguideView.vue`. Проверь: `grep -rn "WorkCard" src`. Из стайлгайда убери секцию «Карточка работы» вместе с импортом.

## 2. Роутер — `src/router/index.js`

Удалить маршруты `/works` и `/works/:slug`. Старые адреса теперь попадают в 404, это нормально: сайт ещё не опубликован.

## 3. Пререндер — `vite.config.js`

- Убрать `works.map(work => \`/works/${work.slug}\`)` из `includedRoutes`.
- Убрать импорт `works` из `vite.config.js`, если он больше нигде в конфиге не используется.

## 4. Загрузчик — `src/components/layout/TheLoader.vue`

- Убрать ветку `if (to.name === 'work-detail') { … }` в `getRouteLabel`.
- Убрать `import worksData from '../../data/works.json'`, если он больше не используется в этом файле.
- В `ROUTE_LABELS` убрать ключи `works` и `work-detail`, если они там есть.

## 5. Hero — `src/components/sections/HeroSection.vue`

Сейчас:
```vue
<BaseButton to="/works" variant="primary" roll>Смотреть работы</BaseButton>
<BaseButton to="/contacts" variant="secondary" arrow>Обсудить задачу</BaseButton>
```

Нужно:
```vue
<BaseButton :to="{ path: '/', hash: '#services' }" variant="primary" arrow>Услуги и решения</BaseButton>
<BaseButton :to="{ path: '/', hash: '#contact' }" variant="secondary" arrow>Обсудить задачу</BaseButton>
```

- Первая кнопка ведёт к блоку `#services` с заголовком «Услуги и решения» и называется так же.
- `roll` заменить на `arrow`: в `CLAUDE.md` на кнопках только стрелка, без прокрутки букв.
- Вторая кнопка тоже на главной ведёт к блоку `#contact`, а не на пустую страницу `/contacts`.
- Если проп `to` в `BaseButton.vue` ещё принимает только `String`, поправь на `[String, Object]`. Это было в задаче про разрыв между словами в кнопке.
- Переход к якорю на той же странице — без загрузочного экрана и с плавной прокруткой, как в `prompt-fix-v1.md`. Повторный клик тоже прокручивает.

## 6. Остатки ссылок

После всех правок:
```bash
grep -rnE "['\"\`]/works|work-detail|WorksSection|WorksGrid|WorksView|WorkDetailView" src vite.config.js
```
Результат должен быть пустым. `works.json` и упоминания «works» в стилях галерей услуг не считаются.

## 7. `CLAUDE.md` — раздел «Текущее состояние»

- Удалить абзац «**`WorksSection.vue` и `WorksGrid.vue` отключены намеренно** — …».
- Добавить: «Блока работ на главной и страниц `/works`, `/works/:slug` нет — решение владельца. Работы показываются только в галереях на страницах услуг, источник — `src/data/works.json` (содержимое пока заглушки, будет заменено реальными работами). Кнопка Hero „Услуги и решения“ ведёт к `#services`».
- В разделе «Данные» строку про `works.json` оставить.

## 8. Проверка

1. `npm run build` без ошибок. В `dist/` нет папки `works/` и файла `works.html`.
2. Главная: первая кнопка Hero «Услуги и решения ↗» плавно прокручивает к блоку услуг, шторок нет. «Обсудить задачу» прокручивает к блоку контактов.
3. Страницы услуг: галереи работ на месте и открываются, как раньше.
4. `/works` в адресной строке показывает 404.
5. Коммит: «Убран блок и страницы работ; кнопка Hero ведёт к услугам».
