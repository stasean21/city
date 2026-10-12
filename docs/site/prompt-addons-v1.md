# Инфографика: блок «Дополнительные услуги» плитками под тарифами

Прочитай `CLAUDE.md`. Блок с тремя тарифами (`PricePackages`) **не трогать**: новый блок встаёт сразу под ним, внутри той же секции `#prices`.

Макет — вариант **B** в `docs/site/addons-mockup/dop-uslugi-a-b-c.png` и `b.html` (ветка `claude/site-overview-setup-iskpz2`). Если ветки нет локально, всё нужное описано ниже.

## 1. Данные — `src/data/services.json`, услуга `infographics`

В `page.packages` добавь поле `addons` (после `items`):

```json
"addons": {
  "title": "Дополнительные услуги",
  "lead": "Добавьте к заказу то, что нужно именно вашему товару.",
  "items": [
    { "title": "Rich-контент", "text": "Расширенное описание для карточки: блоки с картинками и текстом", "price": "500 ₽ / слайд" },
    { "title": "Дополнительный слайд", "text": "Ещё один слайд к готовой карточке в том же стиле", "price": "450 ₽ / слайд" },
    { "title": "Ресайз", "text": "Адаптация готовых слайдов под другие размеры и площадки", "price": "300 ₽ / слайд" },
    { "title": "Замена товара", "text": "Готовая карточка под другой товар: новые фото и тексты, тот же дизайн", "price": "250 ₽ / слайд" },
    { "title": "Срочно", "text": "Работа вне очереди — сдача быстрее основного срока", "price": "+ 200 ₽ / слайд", "featured": true }
  ]
}
```

Цены — от владельца. Тексты-пояснения не менять без его согласия.

## 2. Вёрстка — `src/components/service/PricePackages.vue`

Под `<ul class="prices__grid">`, внутри того же `.container`, если есть `packages.addons`:

```vue
<div v-if="packages.addons" class="addons">
  <div class="addons__head">
    <h3 class="card-title">{{ packages.addons.title }}</h3>
    <p class="lead addons__lead">{{ packages.addons.lead }}</p>
  </div>
  <ul class="addons__grid">
    <li
      v-for="(item, i) in packages.addons.items"
      :key="item.title"
      class="addon"
      :class="{ 'is-featured on-dark': item.featured }"
    >
      <span class="caption addon__num">{{ String(i + 1).padStart(2, '0') }}</span>
      <h4 class="addon__title">{{ item.title }}</h4>
      <p class="small addon__text">{{ item.text }}</p>
      <p class="addon__price">{{ item.price }}</p>
    </li>
  </ul>
</div>
```

Типографику брать готовыми классами из `base.css`, размеры шрифта в компоненте не задавать. Если для названия плитки и цены нет подходящего класса, использовать `.card-title` с меньшим токеном только через новый токен в `tokens.css`, а не числом.

Стили (только токены):

- `.addons` — `margin-top: var(--s-60)`.
- `.addons__head` — как шапка секций: слева заголовок, справа `.lead`, выравнивание по низу, `margin-bottom: var(--s-24)`. На ≤ 991px в столбик.
- `.addons__grid` — `display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--s-16)`.
- `.addon` — `display: flex; flex-direction: column; padding: var(--s-24); background: var(--white); border-radius: var(--r-card); min-height`: заведи токен `--addon-h: 14.5rem /* 232 */`.
  - `.addon__num` — `color: var(--text-3)`.
  - `.addon__title` — отступ сверху `var(--s-24)`, шрифт заголовка (`--f-head`, 500), цвет `var(--ink)`, отрицательный трекинг как у `.h3`.
  - `.addon__text` — `margin-top: var(--s-8); flex: 1`.
  - `.addon__price` — `margin-top: var(--s-16)`, шрифт заголовка, цвет `var(--ink)`.
- `.addon.is-featured` («Срочно») — фон `var(--ink)`. Название и цена белые, текст `var(--dark-text)` (или существующий токен для вторичного текста на тёмном), номер `var(--accent)` — единственная оранжевая отметка.

Адаптив:
- ≤ 991px: `repeat(3, 1fr)`, плитки 4 и 5 во втором ряду.
- ≤ 767px: `repeat(2, 1fr)`, пятая плитка («Срочно») на всю ширину (`grid-column: 1 / -1`), `min-height: auto`.

Кнопок внутри плиток нет: «Обсудить» уже есть в тарифах и в блоке контактов.

## 3. Проверка

- `/services/infographics`: три тарифа как были, под ними «Дополнительные услуги» — пять плиток в ряд, «Срочно» тёмная.
- 1024 → 3 + 2, 375 → 2 + 2 + 1 (Срочно на всю ширину), текст не вылезает.
- Другие услуги: у них нет `addons`, блок не появляется.
- `npm run build` без ошибок, текст блока есть в `dist/services/infographics.html`.
- Коммит: «Инфографика: блок дополнительных услуг».
