<script setup lang="ts">
import { computed } from 'vue'
import type { EmptyProps, EmptyEmits } from '../types/empty'

const props = withDefaults(defineProps<EmptyProps>(), {
  image: '',
  description: '暂无内容',
  actionText: '',
  imageSize: 120,
})

const emit = defineEmits<EmptyEmits>()

const imageStyle = computed(() => ({
  width: props.imageSize + 'px',
  height: props.imageSize + 'px',
}))

// 默认图标（SVG 内联）
const defaultImage = `
<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="50" fill="#F5F7FA"/>
  <path d="M60 25C41.778 25 27 39.778 27 58C27 76.222 41.778 91 60 91C78.222 91 93 76.222 93 58C93 39.778 78.222 25 60 25ZM60 81C45.088 81 33 68.912 33 54C33 39.088 45.088 27 60 27C74.912 27 87 39.088 87 54C87 68.912 74.912 81 60 81Z" fill="#C0C4CC"/>
  <path d="M60 42C51.163 42 44 49.163 44 58C44 66.837 51.163 74 60 74C68.837 74 76 66.837 76 58C76 49.163 68.837 42 60 42ZM60 64C55.582 64 52 60.418 52 56C52 51.582 55.582 48 60 48C64.418 48 68 51.582 68 56C68 60.418 64.418 64 60 64Z" fill="#C0C4CC"/>
  <circle cx="60" cy="58" r="6" fill="#C0C4CC"/>
  <path d="M50 90C50 85.582 53.582 82 58 82H62C66.418 82 70 85.582 70 90" stroke="#C0C4CC" stroke-width="4" stroke-linecap="round"/>
</svg>
`
</script>

<template>
  <div class="base-empty">
    <div class="base-empty__image" :style="imageStyle">
      <span v-if="!image" class="base-empty__icon" v-html="defaultImage" />
      <img v-else :src="image" class="base-empty__img" alt="empty">
    </div>
    <p class="base-empty__description">{{ description }}</p>
    <button
      v-if="actionText"
      class="base-empty__action"
      @click="emit('action')"
    >
      {{ actionText }}
    </button>
  </div>
</template>

<style scoped>
.base-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6, 24px);
  text-align: center;
}

.base-empty__image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-empty__icon {
  width: 100%;
  height: 100%;
}

.base-empty__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.base-empty__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.base-empty__description {
  margin-top: var(--space-3, 12px);
  color: var(--color-text-secondary, #909399);
  font-size: var(--font-base, 14px);
  line-height: 1.5;
}

.base-empty__action {
  margin-top: var(--space-4, 16px);
  padding: var(--space-2, 8px) var(--space-4, 16px);
  background: var(--color-primary, #409eff);
  color: #fff;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-base, 14px);
  cursor: pointer;
  transition: opacity 0.2s;
}

.base-empty__action:hover {
  opacity: 0.9;
}
</style>
