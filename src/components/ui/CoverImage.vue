<script setup>
import { onMounted, ref } from 'vue'

// картинка из Object Storage с заглушкой: пока файла нет (404), видна
// подложка --bg-3, а не значок битой картинки
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  width: { type: [Number, String], default: 600 },
  height: { type: [Number, String], default: 800 },
  lazy: { type: Boolean, default: true },
})

const imgEl = ref(null)
const broken = ref(false)

// картинка из пререндера могла упасть до того, как Vue повесил @error
onMounted(() => {
  const img = imgEl.value
  if (img?.complete && !img.naturalWidth) broken.value = true
})
</script>

<template>
  <span class="cover">
    <img
      ref="imgEl"
      class="cover__img"
      :class="{ 'is-broken': broken }"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="lazy ? 'lazy' : undefined"
      decoding="async"
      @error="broken = true"
    />
  </span>
</template>

<style scoped>
.cover {
  display: block;
  overflow: hidden;
  background: var(--bg-3);
}

.cover__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover__img.is-broken {
  visibility: hidden;
}
</style>
