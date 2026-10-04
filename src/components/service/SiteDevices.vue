<script setup>
import { ref } from 'vue'
import BrowserFrame from '../ui/BrowserFrame.vue'
import CoverImage from '../ui/CoverImage.vue'
import { useAutoScroll } from '../../composables/useAutoScroll.js'
import shots from '../../data/site-blocks.json'

// первый экран страницы сайтов: окно браузера и телефон поверх, в них —
// скриншоты главной этого сайта, медленно едут вверх-вниз. Иллюстрация, aria-hidden
defineProps({
  site: { type: Object, required: true }, // page.site: { domain, desktop, mobile }
})

// ~18px/с, как в макете
const SPEED = 18

const desktopEl = ref(null)
const mobileEl = ref(null)
useAutoScroll(desktopEl, { speed: SPEED })
useAutoScroll(mobileEl, { speed: SPEED })
</script>

<template>
  <div class="devices once-in" aria-hidden="true">
    <BrowserFrame class="devices__desktop" :domain="site.domain">
      <div ref="desktopEl" class="devices__screen">
        <CoverImage
          class="devices__shot"
          :style="{ aspectRatio: `${shots.desktop.width} / ${shots.desktop.height}` }"
          :src="site.desktop"
          alt="Главная страница сайта m/design"
          :width="shots.desktop.width"
          :height="shots.desktop.height"
          :lazy="false"
        />
      </div>
    </BrowserFrame>

    <div class="devices__phone">
      <div ref="mobileEl" class="devices__screen devices__screen--phone">
        <CoverImage
          class="devices__shot"
          :style="{ aspectRatio: `${shots.mobile.width} / ${shots.mobile.height}` }"
          :src="site.mobile"
          alt="Главная страница сайта m/design на телефоне"
          :width="shots.mobile.width"
          :height="shots.mobile.height"
          :lazy="false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* композиция макета service-sites.html: окно слева, телефон поверх справа внизу */
.devices {
  position: relative;
  height: calc(var(--dev-screen-h) * 1.5);
}

.devices__desktop {
  position: absolute;
  left: 0;
  top: 0;
  width: 78%;
}

.devices__phone {
  position: absolute;
  right: 2%;
  bottom: 0;
  z-index: 2;
  width: 34%;
  padding: var(--fan-border);
  background: var(--ink);
  border-radius: var(--dev-phone-r);
}

/* экран прокручивается автопрокруткой; вручную не листается — иллюстрация */
.devices__screen {
  height: var(--dev-screen-h);
  overflow: hidden;
}

.devices__screen--phone {
  border-radius: var(--dev-phone-screen-r);
}

.devices__shot {
  width: 100%;
}
</style>
