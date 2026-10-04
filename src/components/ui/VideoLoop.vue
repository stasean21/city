<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// декоративный зацикленный ролик без звука: MP4 подставляется только при
// первом появлении в экране (preload="none" + src по требованию), играет,
// пока виден и вкладка активна. reduced motion — только постер.
// смысл несёт подпись рядом, поэтому видео aria-hidden
const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, default: '' },
})

const videoEl = ref(null)
// src до первого появления пустой — страница не качает все MP4 сразу
const activeSrc = ref('')
let observer = null
let visible = false
let reduce = false

function play() {
  const video = videoEl.value
  if (!video || reduce || !visible || document.hidden) return
  // play() отклоняется, пока файла нет или браузер не разрешил — это не ошибка
  video.play()?.catch(() => {})
}

function pause() {
  videoEl.value?.pause()
}

function onVisibility() {
  if (document.hidden) pause()
  else play()
}

onMounted(() => {
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && !activeSrc.value) activeSrc.value = props.src
    if (visible) requestAnimationFrame(play)
    else pause()
  }, { threshold: 0.3 })
  observer.observe(videoEl.value)
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  pause()
})
</script>

<template>
  <span class="video-loop">
    <video
      ref="videoEl"
      class="video-loop__video"
      :src="activeSrc || undefined"
      :poster="poster || undefined"
      muted
      loop
      playsinline
      preload="none"
      disablepictureinpicture
      aria-hidden="true"
      tabindex="-1"
    ></video>
  </span>
</template>

<style scoped>
/* пока ни постера, ни ролика нет — подложка, как у CoverImage */
.video-loop {
  display: block;
  overflow: hidden;
  background: var(--bg-3);
}

.video-loop__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
