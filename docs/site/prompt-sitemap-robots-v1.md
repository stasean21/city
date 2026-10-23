# sitemap.xml и robots.txt

Прочитай `CLAUDE.md`. Дизайн сайта не меняется: это служебные файлы для поисковиков.

Домен сайта: **https://muntyanu-design.ru**

## 1. Адрес сайта в одном месте

Создать `src/data/site.js`:

```js
// адрес сайта без слэша на конце — для sitemap, robots, canonical и превью ссылок
export const SITE_URL = 'https://muntyanu-design.ru'
```

## 2. sitemap.xml — собирается при сборке

В `vite.config.js`, в `ssgOptions`:
- вынести список маршрутов из `includedRoutes` в общую переменную;
- добавить `onFinished`, который пишет `dist/sitemap.xml`.

В sitemap попадают только настоящие страницы:
- `/` — главная;
- `/services/<slug>` — услуги **без** `draft` (сейчас 4: инфографика, предметная съёмка, видеообложки, ИИ-агенты).

Не попадают:
- `/404`;
- `/styleguide`;
- редиректы;
- черновики `reklamnye-bannery` и `lendingi-i-sayty`;
- `/privacy` — пока в ней нет текста. Когда появится политика, добавим отдельно.

Формат:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://muntyanu-design.ru/</loc><lastmod>2026-10-23</lastmod></url>
  <url><loc>https://muntyanu-design.ru/services/infographics</loc><lastmod>2026-10-23</lastmod></url>
  …
</urlset>
```

- `lastmod` — дата сборки (`YYYY-MM-DD`).
- Адреса без слэша на конце, кроме главной. Посмотри, какие файлы реально создаёт vite-ssg (`services/infographics.html` или `services/infographics/index.html`). Адреса в sitemap должны совпадать с тем, как страница открывается на хостинге.
- Без `priority` и `changefreq`: Яндекс и Google их игнорируют.

## 3. robots.txt — статичный файл

`public/robots.txt`:

```
User-agent: *
Disallow: /styleguide

Sitemap: https://muntyanu-design.ru/sitemap.xml
```

`Disallow` для черновиков не нужен: их нет в `dist`, а ссылки на них отдают 404.

## 4. Проверка

1. `npm run build` без ошибок.
2. В `dist/` есть `robots.txt` и `sitemap.xml`.
3. В `sitemap.xml` ровно 5 адресов: главная и 4 услуги. Нет 404, styleguide, privacy, баннеров и лендингов.
4. Каждый адрес из sitemap открывается в `npm run preview` (без 404).
5. `sitemap.xml` валиден: открывается в браузере как XML без ошибок.
6. Коммит: «sitemap.xml и robots.txt для muntyanu-design.ru». Потом `git push`.
