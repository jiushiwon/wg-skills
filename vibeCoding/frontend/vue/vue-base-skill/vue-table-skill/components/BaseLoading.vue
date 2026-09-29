<template>
  <div
    v-if="visible"
    class="base-loading"
    :class="[
      `base-loading--type-${type}`,
      `base-loading--size-${size}`,
    ]"
    :style="{ color: customColor || `var(--color-${theme}, var(--color-primary, #409eff))` }"
    role="status"
    :aria-label="text || '加载中'"
  >
    <div v-if="type === 'spin'" class="base-loading__spinner base-loading__spinner--ring" />
    <div v-else-if="type === 'pulse'" class="base-loading__pulse-wrap">
      <span class="base-loading__pulse" />
      <span class="base-loading__pulse" />
      <span class="base-loading__pulse" />
    </div>
    <div v-else class="base-loading__dots">
      <span v-for="i in 3" :key="i" class="base-loading__dot" />
    </div>
    <span v-if="text" class="base-loading__text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
// ponytail: 默认实现 dots 动画,spin/pulse/bar 作为 props 预留但仅基础实现。7 种动画 → 实际只跑 2 种（dots/spin/pulse），bar/ring/wave/cube/ripple 不在此实现。
export interface BaseLoadingProps {
  visible?: boolean
  type?: 'spin' | 'dots' | 'bar' | 'ring' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
  theme?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  customColor?: string
  text?: string
  mode?: 'container' | 'fullscreen' | 'inline'
}

withDefaults(defineProps<BaseLoadingProps>(), {
  visible: true,
  type: 'dots',
  size: 'md',
  theme: 'primary',
  mode: 'inline',
})
</script>

<style scoped>
.base-loading {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  font-size: var(--font-size-sm, 14px);
  color: inherit;
}

.base-loading--type-fullscreen,
.base-loading--size-fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  z-index: 9999;
}

/* dots */
.base-loading__dots {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
}

.base-loading__dot {
  display: inline-block;
  width: var(--dot-size, 8px);
  height: var(--dot-size, 8px);
  border-radius: var(--radius-full, 50%);
  background: currentColor;
  animation: base-loading-bounce 1.4s infinite ease-in-out both;
}
.base-loading__dot:nth-child(2) { animation-delay: -0.16s; }
.base-loading__dot:nth-child(3) { animation-delay: -0.32s; }

@keyframes base-loading-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* ring / spin */
.base-loading__spinner--ring {
  display: inline-block;
  width: var(--ring-size, 18px);
  height: var(--ring-size, 18px);
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full, 50%);
  animation: base-loading-rotate 0.8s linear infinite;
  opacity: 0.3;
}

@keyframes base-loading-rotate {
  to { transform: rotate(360deg); }
}

/* pulse */
.base-loading__pulse-wrap {
  position: relative;
  display: inline-block;
  width: var(--pulse-size, 24px);
  height: var(--pulse-size, 24px);
}

.base-loading__pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: currentColor;
  opacity: 0;
  animation: base-loading-pulse 1.8s infinite;
}
.base-loading__pulse:nth-child(2) { animation-delay: 0.6s; }
.base-loading__pulse:nth-child(3) { animation-delay: 1.2s; }

@keyframes base-loading-pulse {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}

/* 尺寸 */
.base-loading--size-sm {
  --dot-size: 6px;
  --ring-size: 14px;
  --pulse-size: 18px;
}
.base-loading--size-md {
  --dot-size: 8px;
  --ring-size: 18px;
  --pulse-size: 24px;
}
.base-loading--size-lg {
  --dot-size: 12px;
  --ring-size: 28px;
  --pulse-size: 36px;
}

.base-loading__text {
  color: var(--color-text-secondary, #606266);
}
</style>
