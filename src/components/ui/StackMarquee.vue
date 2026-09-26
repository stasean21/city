<script setup>
import { computed } from 'vue'
import stack from '../../data/stack.json'

const props = defineProps({
  items: { type: Array, required: true }, // id из stack.json
})

// svg встраиваем строкой, чтобы иконки попали в пререндеренный html
const icons = import.meta.glob('../../assets/stack/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// половина трека должна быть шире самого широкого контейнера, иначе в конце
// цикла справа открывается пустота; короткий стек услуги повторяем внутри
// половины. 14 пилюль — длина стека главной, она заведомо шире контейнера
const MIN_PER_HALF = 14

const tools = computed(() =>
  props.items
    .map((id) => stack.find((tool) => tool.id === id))
    .filter(Boolean)
    .map((tool) => ({
      ...tool,
      svg: tool.icon ? icons[`../../assets/stack/${tool.icon}.svg`] : null,
    }))
)

const repeats = computed(() => Math.max(1, Math.ceil(MIN_PER_HALF / (tools.value.length || 1))))
</script>

<template>
  <div class="marquee">
    <div class="marquee__track">
      <!-- список идёт дважды подряд: сдвиг на -50% ставит вторую копию
           ровно на место первой, и петля получается без шва -->
      <ul class="marquee__list" aria-label="Инструменты">
        <template v-for="rep in repeats" :key="rep">
          <!-- повторы-заполнители скрыты от скринридера: каждый инструмент читается один раз -->
          <li v-for="tool in tools" :key="tool.id" class="chip" :aria-hidden="rep > 1 ? 'true' : null">
            <span v-if="tool.svg" class="marquee__icon" aria-hidden="true" v-html="tool.svg"></span>
            {{ tool.name }}
          </li>
        </template>
      </ul>
      <ul class="marquee__list marquee__list--clone" aria-hidden="true">
        <template v-for="rep in repeats" :key="rep">
          <li v-for="tool in tools" :key="tool.id" class="chip">
            <span v-if="tool.svg" class="marquee__icon" v-html="tool.svg"></span>
            {{ tool.name }}
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* края гаснут маской-обрезкой: в маске важна только непрозрачность,
   поэтому цвет стопа любой непрозрачный, берём --ink */
.marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    var(--ink) var(--marquee-fade),
    var(--ink) calc(100% - var(--marquee-fade)),
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    var(--ink) var(--marquee-fade),
    var(--ink) calc(100% - var(--marquee-fade)),
    transparent
  );
}

.marquee__track {
  display: flex;
  width: max-content;
  animation: marquee var(--marquee-duration) linear infinite;
}

/* зазор после каждой копии, а не gap у трека — иначе -50% промахивается
   на половину зазора и петля дёргается */
.marquee__list {
  display: flex;
  gap: var(--s-12);
  padding-right: var(--s-12);
}

.marquee__icon {
  display: block;
  flex: none;
  width: var(--stack-icon);
  height: var(--stack-icon);
}

.marquee__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (hover: hover) {
  .marquee:hover .marquee__track {
    animation-play-state: paused;
  }
}

/* глобальное правило в base.css лишь сжимает длительность до 0.01ms —
   строка бы дёрнулась и встала; здесь анимацию снимаем целиком,
   а стек показываем обычным переносимым списком */
@media (prefers-reduced-motion: reduce) {
  .marquee {
    -webkit-mask-image: none;
    mask-image: none;
  }

  .marquee__track {
    width: auto;
    animation: none;
  }

  .marquee__list {
    flex-wrap: wrap;
    padding-right: 0;
  }

  .marquee__list--clone,
  .marquee__list li[aria-hidden='true'] {
    display: none;
  }
}
</style>
