<script setup lang="ts">
import { computed } from 'vue'
import type { LoadingMaskProps } from '../types/loading'
import BaseLoading from './BaseLoading.vue'

const props = withDefaults(defineProps<LoadingMaskProps>(), {
  text: '',
  fullscreen: true,
  transparent: false,
})

const maskStyle = computed(() => {
  if (props.transparent) {
    // 半透明：背景更透
    return {
      background: 'rgba(255, 255, 255, 0.5)',
    }
  }
  return {}
})
</script>

<template>
  <Teleport to="body">
    <Transition name="loading-mask">
      <div
        v-if="visible"
        class="base-loading-mask"
        :class="{ 'is-fullscreen': fullscreen }"
        :style="maskStyle"
      >
        <div class="base-loading-mask__wrapper">
          <BaseLoading type="spin" size="lg" />
          <span v-if="text" class="base-loading-mask__text">{{ text }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}

.base-loading-mask.is-fullscreen {
  position: fixed;
}

.base-loading-mask:not(.is-fullscreen) {
  position: absolute;
}

.base-loading-mask__wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-4, 16px) var(--space-5, 20px);
  background: var(--color-surface, #fff);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));
}

.base-loading-mask__text {
  font-size: var(--font-base, 14px);
  color: var(--color-text-secondary, #606266);
}

/* Transition */
.loading-mask-enter-active,
.loading-mask-leave-active {
  transition: opacity 0.2s ease;
}

.loading-mask-enter-from,
.loading-mask-leave-to {
  opacity: 0;
}
</style>
