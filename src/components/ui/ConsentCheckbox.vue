<script setup>
import { useId } from 'vue'

// согласие в форме: по умолчанию не отмечено, отправка заблокирована, пока нет галочки.
//
//   <ConsentCheckbox v-model:checked="agree" :error="tried && !agree" />
//   <BaseButton type="submit" :disabled="!agree">Отправить заявку</BaseButton>
//
// ВАЖНО: заявки из будущей формы нельзя отправлять через Formspree / EmailJS /
// Web3Forms / Google Forms / Telegram-бота — только через свой бэкенд на Timeweb
// (зона MSK-1) с отправкой на почту stasean21@yandex.ru.
//
// Слот заменяет подпись (окно согласия при входе); --check-pad — поля вокруг
// строки: они входят в <label>, поэтому клик работает по всей плашке
const props = defineProps({
  checked: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:checked'])

const errorId = useId()
</script>

<template>
  <div class="check" :class="{ 'is-checked': props.checked, 'is-error': props.error, 'is-disabled': props.disabled }">
    <label class="check__label">
      <input
        class="visually-hidden check__input"
        type="checkbox"
        :checked="props.checked"
        :disabled="props.disabled"
        :aria-invalid="props.error ? 'true' : null"
        :aria-describedby="props.error ? errorId : null"
        @change="$emit('update:checked', $event.target.checked)"
      >
      <span class="check__box" aria-hidden="true">
        <svg class="check__mark" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="check__text">
        <slot>Я даю <RouterLink to="/consent" class="text-link">согласие на обработку персональных данных</RouterLink> и ознакомлен(а) с <RouterLink to="/privacy" class="text-link">Политикой обработки персональных данных</RouterLink></slot>
      </span>
    </label>
    <p v-if="props.error" :id="errorId" class="small check__error">Без согласия мы не сможем обработать заявку</p>
  </div>
</template>

<style scoped>
.check__label {
  position: relative;
  display: grid;
  grid-template-columns: var(--check-box) 1fr;
  gap: var(--s-12);
  align-items: start;
  padding: var(--check-pad, 0);
  border-radius: inherit;
  color: var(--ink);
  cursor: pointer;
}

.check__box {
  display: grid;
  place-items: center;
  width: var(--check-box);
  height: var(--check-box);
  border: var(--check-line) solid var(--check-border);
  border-radius: var(--r-sm);
  background: var(--white);
  color: var(--white);
  transition: background-color var(--ease), border-color var(--ease);
}

.check__mark {
  width: var(--check-icon);
  height: var(--check-icon);
  opacity: 0;
}

.check__label:hover .check__box {
  border-color: var(--warm-2);
}

.check__input:focus-visible + .check__box {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.is-error .check__box,
.is-error .check__label:hover .check__box {
  border-color: var(--error);
}

.is-checked .check__box,
.is-checked .check__label:hover .check__box {
  border-color: var(--ink);
  background: var(--ink);
}

.is-checked .check__mark {
  opacity: 1;
}

.is-disabled .check__label {
  color: var(--text-3);
  cursor: not-allowed;
}

.is-disabled .check__box,
.is-disabled .check__label:hover .check__box {
  border-color: var(--bg-4);
  background: var(--bg-3);
}

.is-disabled.is-checked .check__box {
  border-color: var(--text-3);
  background: var(--text-3);
}

/* под подписью, вровень с текстом */
.check__error {
  margin-top: var(--s-4);
  padding-left: calc(var(--check-box) + var(--s-12));
  color: var(--error);
}
</style>
