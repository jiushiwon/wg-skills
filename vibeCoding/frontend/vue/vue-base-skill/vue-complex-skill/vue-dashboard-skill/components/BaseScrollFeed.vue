<template>
  <div class="scroll-feed" :style="{ height: `${height}px` }">
    <div v-if="title" class="scroll-feed__title">{{ title }}</div>
    <div class="scroll-feed__viewport">
      <div class="scroll-feed__track" :style="trackStyle">
        <div v-for="(item, i) in loopData" :key="`${item.text}-${i}`" class="scroll-feed__row">
          <span class="scroll-feed__icon" :style="{ background: item.color || '#00d4ff' }" />
          <span class="scroll-feed__text">{{ item.text }}</span>
          <span class="scroll-feed__time">{{ item.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FeedItem {
  text: string
  time: string
  color?: string
}

const props = withDefaults(defineProps<{
  data: FeedItem[]
  title?: string
  height?: number
  speed?: number
}>(), {
  height: 300,
  speed: 30,
})

const loopData = computed(() => [...props.data, ...props.data])

const trackStyle = computed(() => ({
  animation: `scroll-up ${props.speed}s linear infinite`,
}))
</script>

<style scoped>
.scroll-feed { display: flex; flex-direction: column; overflow: hidden; }
.scroll-feed__title { font-size: 14px; font-weight: 600; color: var(--color-text, #1f2937); margin-bottom: 12px; flex-shrink: 0; }
.scroll-feed__viewport { flex: 1; overflow: hidden; }
.scroll-feed__track { display: flex; flex-direction: column; }
.scroll-feed__row { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.scroll-feed__icon { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.scroll-feed__text { flex: 1; font-size: 13px; color: var(--color-text, #1f2937); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.scroll-feed__time { font-size: 11px; color: var(--color-text-tertiary, #9ca3af); flex-shrink: 0; }
@keyframes scroll-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
</style>