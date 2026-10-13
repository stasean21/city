# «Обо мне»: одно фото на все три слова

Прочитай `CLAUDE.md` (разделы «Медиа», «Доступность»). Файл: `src/components/sections/AboutSwitch.vue`.

Решение владельца: справа в блоке «Обо мне» одно фото. При смене слов «Дизайн / Реклама / Цифры» меняются только слово и строка под ним, фото стоит на месте. Автолистание, клик, клавиатура, табы и плашка «Станислав» — без изменений.

Файлы уже лежат в Yandex Object Storage:
- фото: `https://storage.yandexcloud.net/landing-main/new-pages/about/my_phtoto.webp` (имя файла именно такое, с опечаткой — не исправлять)
- аватар: `https://storage.yandexcloud.net/landing-main/new-pages/about/avatar.jpg`

## 1. Данные в `<script setup>`

- Из объектов `items` убрать поля `photo` и `alt`. Остаются `word` и `note`, `num` считается как раньше.
- Константу `AVATAR` заменить на новый адрес:

```js
const AVATAR = 'https://storage.yandexcloud.net/landing-main/new-pages/about/avatar.jpg'
```

- Рядом с `AVATAR` добавить:

```js
// одно фото на все три слова — меняется только текст слева
const PHOTO = 'https://storage.yandexcloud.net/landing-main/new-pages/about/my_phtoto.webp'
const PHOTO_ALT = 'Станислав — дизайнер карточек для маркетплейсов'
```

- Убрать `// TODO`-комментарии про плейсхолдеры фото и аватара.
- `PHOTO_W` / `PHOTO_H` (800 / 1000 — соотношение 4:5, фото кадрируется `object-fit: cover`), `broken`, `markBroken` и проверку упавших картинок в `onMounted` оставить: они нужны, пока файлов нет в хранилище.

## 2. Шаблон

Вместо `<img v-for="(item, i) in items" … class="about__photo" …>` — одна картинка:

```vue
<img
  class="about__photo"
  :class="{ 'is-broken': broken.has(PHOTO) }"
  :src="PHOTO"
  :alt="PHOTO_ALT"
  :width="PHOTO_W"
  :height="PHOTO_H"
  loading="lazy"
  decoding="async"
  @error="markBroken(PHOTO)"
/>
```

Обёртку `#about-stage` (role, aria, tabindex) и плашку `about__chip` не трогать. У аватарки в плашке должно быть `object-fit: cover` (фото квадратное, лицо по центру) — если нет, добавь.

## 3. Стили

У `.about__photo` убрать то, что нужно было только для смены фото: `opacity: 0`, `transform: scale(1.04)`, `transition`, и правило `.about__photo.is-active`. Фото видно всегда. `position: absolute; inset: 0; width/height: 100%; object-fit: cover;` и правило `.is-broken` оставить.

Если после правок какие-то токены или keyframes больше нигде не используются (проверь grep'ом по `src/`), удали их.

## 4. Проверка

1. Главная → «Обо мне»: справа одно фото. Слова переключаются сами каждые ~2.6 с, строка под словом меняется, фото стоит на месте без мигания.
2. Клик по «Цифры» держит слово 10 секунд, Tab и стрелки работают как раньше.
3. Плашка «Станислав» показывает новую аватарку.
4. Обе картинки открываются (Network → статус 200). Если какая-то не загрузилась, на её месте бежевый фон, а не значок битой картинки.
5. 1440 / 1024 / 375: фото 4:5 без искажений, лицо не обрезано.
6. `npm run build` без ошибок. Коммит: «Обо мне: одно фото на все три слова». Потом `git push`.
