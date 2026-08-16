<script setup>
import BaseButton from '../components/ui/BaseButton.vue'
import WorkCard from '../components/ui/WorkCard.vue'
import AccordionItem from '../components/ui/AccordionItem.vue'

const colorGroups = [
  {
    title: 'Фоны',
    tokens: [
      ['--bg', '#F6F4F2'],
      ['--bg-2', '#F9F7F3'],
      ['--bg-3', '#EAE8E4'],
      ['--bg-4', '#E6E4E0'],
      ['--white', '#FFFFFF'],
    ],
  },
  {
    title: 'Тёмное',
    tokens: [
      ['--ink', '#1D1E22'],
      ['--ink-hover', '#393A3F'],
    ],
  },
  {
    title: 'Текст',
    tokens: [
      ['--text', '#717171'],
      ['--text-2', '#888686'],
      ['--text-3', '#A1A09F'],
    ],
  },
  {
    title: 'Тёплые серые',
    tokens: [
      ['--warm', '#B5B1A9'],
      ['--warm-2', '#615D55'],
    ],
  },
  {
    title: 'Акцент',
    tokens: [
      ['--accent', '#F59958'],
      ['--accent-2', '#FF8E5E'],
    ],
  },
]

const gapScale = [
  ['--gap-xs', 6],
  ['--gap-sm', 8],
  ['--gap-md', 12],
  ['--gap-lg', 24],
  ['--gap-xl', 36],
  ['--gap-2xl', 40],
  ['--gap-3xl', 60],
]

const steps = [
  ['01', 'Бриф', 'Собираем задачу, референсы и ограничения перед началом работы.'],
  ['02', 'Концепция', 'Предлагаю 1–2 направления визуала под задачу.'],
  ['03', 'Правки', 'Дорабатываем выбранное направление до финала.'],
]
</script>

<template>
  <main>
    <section class="container">
      <span class="caption">Служебная страница</span>
      <h1>Стайлгайд</h1>
      <p>Проверка токенов и базовых компонентов до вёрстки контента. На продакшен-сайте не публикуется.</p>
    </section>

    <section class="container">
      <h2>Типографика</h2>
      <div class="type-sample">
        <div class="h1">Заголовок H1 — Aa Бб 52/−1.5</div>
        <div class="h2">Заголовок H2 — Aa Бб 32/−0.64</div>
        <div class="h3">Заголовок H3 — Aa Бб 18/−0.18</div>
        <p>Body text 15/25 — карточки товаров и инфографика для маркетплейсов.</p>
        <span class="ui">UI 13/20 — кнопки, меню</span>
        <span class="caption">Caption 12/28 — подписи</span>
      </div>
    </section>

    <section class="container">
      <h2>Палитра</h2>
      <div class="swatch-groups">
        <div v-for="group in colorGroups" :key="group.title" class="swatch-group">
          <span class="caption">{{ group.title }}</span>
          <div class="swatch-row">
            <div v-for="[token, hex] in group.tokens" :key="token" class="swatch">
              <div class="swatch__color" :style="{ background: `var(${token})` }" />
              <span class="swatch__label">{{ token }}</span>
              <span class="swatch__hex">{{ hex }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container">
      <h2>Шкала отступов (gap)</h2>
      <div class="gap-scale">
        <div v-for="[token, px] in gapScale" :key="token" class="gap-row">
          <span class="ui">{{ token }}</span>
          <div class="gap-bar" :style="{ width: `${px}px` }" />
          <span class="caption">{{ px }}px</span>
        </div>
      </div>
    </section>

    <section class="container">
      <h2>Кнопки</h2>
      <div class="row">
        <BaseButton variant="primary">Обсудить задачу</BaseButton>
        <BaseButton variant="primary" size="lg">Обсудить задачу</BaseButton>
        <BaseButton variant="secondary">Смотреть работы</BaseButton>
        <BaseButton variant="secondary" size="lg">Смотреть работы</BaseButton>
        <BaseButton variant="ghost">Подробнее</BaseButton>
      </div>
      <div class="row">
        <BaseButton variant="primary" size="lg" arrow>Обсудить задачу</BaseButton>
        <BaseButton variant="secondary" size="lg" arrow>Смотреть работы</BaseButton>
        <BaseButton variant="primary" size="lg" roll>Обсудить задачу</BaseButton>
      </div>
    </section>

    <section class="container">
      <h2>Карточка</h2>
      <div class="card" style="max-width: 320px;">
        <span class="h3">Заголовок карточки</span>
        <p>Белая карточка на бежевом фоне, без тени.</p>
      </div>
    </section>

    <section class="container">
      <h2>Пилюля / тег</h2>
      <div class="row">
        <span class="pill">Wildberries</span>
        <span class="pill">Ozon</span>
        <span class="pill">AI-визуал</span>
      </div>
    </section>

    <section class="container">
      <h2>Карточка работы</h2>
      <div class="work-grid">
        <WorkCard slug="demo-1" title="Название работы" category="Wildberries" />
        <WorkCard slug="demo-2" title="Название работы" category="Ozon" />
        <WorkCard slug="demo-3" title="Название работы" category="AI-визуал" />
      </div>
    </section>

    <section class="container">
      <h2>Problem → Solution</h2>
      <div class="problem-solution">
        <div>
          <span class="problem-solution__label">Проблема</span>
          <h3>Карточка не выделяется в поиске</h3>
        </div>
        <div>
          <span class="problem-solution__label">Решение</span>
          <h3>Инфографика с акцентом на выгоду</h3>
        </div>
      </div>
    </section>

    <section class="container">
      <h2>Нумерованный список этапов</h2>
      <div class="step-list">
        <div v-for="[number, title, text] in steps" :key="number" class="step">
          <span class="step__number">{{ number }}</span>
          <div class="step__body">
            <h3>{{ title }}</h3>
            <p>{{ text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container">
      <h2>FAQ / Аккордеон</h2>
      <div>
        <AccordionItem question="Какие сроки?">Зависит от объёма — обсуждаем на брифе.</AccordionItem>
        <AccordionItem question="Какие правки входят?">Правки по согласованному брифу включены в стоимость.</AccordionItem>
        <AccordionItem question="В каких форматах отдаёте файлы?">PNG, JPG, при необходимости — исходники.</AccordionItem>
      </div>
    </section>

    <section class="container">
      <h2>Поля формы</h2>
      <div class="field-demo">
        <input class="field" type="text" placeholder="Имя" />
        <textarea class="field" placeholder="Задача" rows="3"></textarea>
      </div>
    </section>

    <section class="dark-section">
      <div class="container">
        <h2>Тёмная секция</h2>
        <p>Используется 1–2 раза на всю страницу — акцентный приём, не рядовой блок.</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.type-sample {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

.swatch-groups {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
}

.swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-md);
  margin-top: var(--gap-sm);
}

.swatch {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
  width: 120px;
}

.swatch__color {
  height: 60px;
  border-radius: var(--r-sm);
  border: 1px solid var(--border);
}

.swatch__label {
  font: 400 12px var(--f-body);
  color: var(--text);
}

.swatch__hex {
  font: 400 12px var(--f-body);
  color: var(--text-3);
}

.gap-scale {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.gap-row {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
}

.gap-row .ui {
  width: 110px;
  color: var(--text);
}

.gap-bar {
  height: 12px;
  background: var(--accent);
  border-radius: var(--r-sm);
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-md);
}

.field-demo {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  max-width: var(--measure-paragraph);
}
</style>
