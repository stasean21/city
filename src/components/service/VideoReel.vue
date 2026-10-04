<script setup>
import { computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import SectionHead from '../ui/SectionHead.vue'
import VideoLoop from '../ui/VideoLoop.vue'
import WorksGallery from './WorksGallery.vue'
import { useWorksGallery } from '../../composables/useWorksGallery.js'

// «Работы» на странице видеообложек: стена вертикальных роликов шахматкой,
// играют сами и без звука. Клик — ролик крупно в галерее, кнопка — вся галерея.
// макет — docs/mockups/service-video-examples.html (B)
const props = defineProps({
  works: { type: Array, required: true }, // { slug, title, niche, video, poster, duration }
  title: { type: String, default: 'Работы' },
  lead: { type: String, default: '' },
  serviceTitle: { type: String, default: '' },
})

// «0:07»
const time = (sec = 0) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

const { galleryOpen, galleryStart, openGallery, closeGallery } = useWorksGallery()
const galleryItems = computed(() => props.works.map(({ title, niche, poster, video }) => ({
  title,
  niche,
  cover: poster,
  poster,
  video,
})))
</script>

<template>
  <div class="reel-block">
    <SectionHead :title="title" :lead="lead" />

    <ul class="reel">
      <li v-for="(work, i) in works" :key="work.slug" class="reel__item">
        <button
          type="button"
          class="reel__btn"
          aria-haspopup="dialog"
          :aria-label="`${work.title}, ${work.niche}, ${time(work.duration)} — открыть ролик`"
          @click="openGallery($event, i)"
        >
          <VideoLoop class="reel__video" :src="work.video" :poster="work.poster" />
          <span class="reel__meta" aria-hidden="true">
            <span class="caption reel__name">{{ work.title }}</span>
            <span class="caption reel__time">{{ time(work.duration) }}</span>
          </span>
        </button>
      </li>
    </ul>

    <div class="reel__more">
      <BaseButton type="button" variant="primary" arrow aria-haspopup="dialog" @click="openGallery">Смотреть все работы</BaseButton>
    </div>

    <!-- галерея всех роликов — монтируется только на время показа -->
    <Teleport to="body">
      <WorksGallery
        v-if="galleryOpen"
        :items="galleryItems"
        :title="serviceTitle"
        :start="galleryStart"
        @close="closeGallery"
      />
    </Teleport>
  </div>
</template>

<style scoped>
/* четыре колонки, каждая вторая сдвинута вниз — шахматка;
   отступ снизу компенсирует сдвиг */
.reel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s-16);
  padding-bottom: var(--reel-shift);
}

.reel__item:nth-child(even) {
  transform: translateY(var(--reel-shift));
}

.reel__btn {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 9 / 16;
  padding: 0;
  overflow: hidden;
  background: none;
  border: 0;
  border-radius: var(--r-card);
}

.reel__btn:focus-visible {
  outline: var(--focus-ring) solid var(--ink);
  outline-offset: var(--focus-ring);
}

.reel__video {
  width: 100%;
  height: 100%;
  transition: transform .5s var(--ease-out);
}

@media (hover: hover) {
  .reel__btn:hover .reel__video {
    transform: scale(1.03);
  }
}

.reel__meta {
  position: absolute;
  left: var(--s-12);
  right: var(--s-12);
  bottom: var(--s-12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--s-8);
}

.reel__name,
.reel__time {
  padding: var(--s-4) var(--s-12);
  white-space: nowrap;
  border-radius: var(--r-pill);
}

.reel__name {
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ink);
  background: var(--white);
}

.reel__time {
  flex: none;
  color: var(--white);
  background: var(--ink);
  font-variant-numeric: tabular-nums;
}

.reel__more {
  display: flex;
  justify-content: center;
  margin-top: var(--s-40);
}

@media (max-width: 767px) {
  .reel {
    grid-template-columns: 1fr 1fr;
  }

  .reel__name,
  .reel__time {
    padding: 0 var(--s-8);
  }

  .reel__meta {
    left: var(--s-8);
    right: var(--s-8);
    bottom: var(--s-8);
  }
}
</style>
