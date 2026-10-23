# Превью ссылок (Open Graph) и новый заголовок главной

Прочитай `CLAUDE.md`. Дизайн страниц не меняется. Меняется только то, что видно во вкладке браузера, в поиске и в превью ссылки в Telegram, WhatsApp, VK и Max.

Сначала должен быть применён `prompt-sitemap-robots-v1.md`: нужен `SITE_URL` из `src/data/site.js`. Если его нет — остановись и скажи мне.

Утверждённый макет — ветка `claude/site-overview-setup-iskpz2`:
- картинка превью: `docs/site/og/home.jpg` (1200×630);
- как выглядит в Telegram: `docs/site/og-mockup/telegram-desc.png`, правый вариант.

## 0. Картинка

Я загружу `home.jpg` в Object Storage:
`https://storage.yandexcloud.net/landing-main/new-pages/og/home.jpg`

В репозиторий картинку не класть (правило «Медиа»). Формат JPG, а не WebP: не все мессенджеры показывают WebP в превью.

## 1. Главная — `src/views/HomeView.vue`

В `useHead`:

- `title`: **«m/design — дизайн, автоматизация и ИИ для бизнеса»** (было «m/design — инфографика и ИИ-фото для маркетплейсов»);
- `meta description` (для поисковиков) **оставить как есть**;
- добавить превью:

```js
meta: [
  { name: 'description', content: /* как было */ },
  { property: 'og:title', content: 'm/design — дизайн, автоматизация и ИИ для бизнеса' },
  { property: 'og:description', content: 'Конкуренты уже это сделали. Ваша очередь.' },
  { property: 'og:image', content: OG_HOME },
  { property: 'og:url', content: `${SITE_URL}/` },
],
link: [{ rel: 'canonical', href: `${SITE_URL}/` }],
```

`og:description` отличается от `description` намеренно. Первый — короткая фраза для мессенджеров, второй — описание для Яндекса и Google.

## 2. Общие теги для всех страниц — `src/App.vue`

В существующий `useHead` (где `htmlAttrs: { lang: 'ru' }`) добавить:

```js
meta: [
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'm/design' },
  { property: 'og:locale', content: 'ru_RU' },
  { property: 'og:image', content: OG_HOME },
  { property: 'og:image:width', content: '1200' },
  { property: 'og:image:height', content: '630' },
  { property: 'og:image:alt', content: 'm/design — дизайн, аналитика и ИИ-разработка для малого и среднего бизнеса' },
  { name: 'twitter:card', content: 'summary_large_image' },
],
```

Адрес картинки вынести в `src/data/site.js`:

```js
export const OG_HOME = 'https://storage.yandexcloud.net/landing-main/new-pages/og/home.jpg'
```

`og:image` в `App.vue` — запасная картинка для всех страниц. Страница может переопределить её своим тегом. Проверь, что `@unhead/vue` не дублирует теги, а заменяет их (по `property`). В итоговом HTML каждого тега должно быть ровно по одному.

## 3. Страницы услуг — `src/views/ServiceDetailView.vue`

Своих картинок у услуг пока нет, сделаем позже. Сейчас в `useHead` добавить:

- `og:title` = тот же `title`, что уже есть (`«<Услуга> — m/design»`);
- `og:description` = тот же текст, что в `description` (`page.lead`);
- `og:url` и `canonical` = `${SITE_URL}/services/${slug}`;
- `og:image` не задавать — возьмётся общая из `App.vue`.

## 4. Остальные страницы

- **404:** `canonical` и `og:url` не нужны, `robots: noindex` уже есть.
- **`/privacy`:** только `og:title` = её `title`.

## 5. Проверка

1. `npm run build`. Открыть `dist/index.html` и проверить, что в `<head>`:
   - `<title>m/design — дизайн, автоматизация и ИИ для бизнеса</title>`;
   - `og:title`, `og:description` («Конкуренты уже это сделали. Ваша очередь.»), `og:image`, `og:url`, `canonical`, `twitter:card` — каждый **по одному разу**.
2. `dist/services/infographics…html`: `og:title` и `og:description` — про инфографику, `og:image` — общая, `canonical` — адрес этой страницы.
3. Картинка по адресу `OG_HOME` открывается в браузере (после того как я её загружу).
4. После деплоя я проверю превью сам: отправлю ссылку в Telegram и проверю через валидатор VK.
5. Коммит: «Превью ссылок: og-теги, картинка главной, новый заголовок». Потом `git push`.
