<script>
import { h } from 'vue'

// разметка для поисковиков (schema.org) — <script type="application/ld+json">
// в теле страницы: JSON-LD валиден и в body и так надёжно попадает в пререндер.
// <script> в шаблоне Vue запрещён, а v-html на <component is="script"> в SSR
// теряется — поэтому render-функция с innerHTML.
// «<» экранируем, чтобы текст из данных не мог закрыть тег script
export default {
  name: 'JsonLd',
  props: {
    data: { type: Object, required: true },
  },
  setup(props) {
    return () => h('script', {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(props.data).replace(/</g, '\\u003c'),
    })
  },
}
</script>
