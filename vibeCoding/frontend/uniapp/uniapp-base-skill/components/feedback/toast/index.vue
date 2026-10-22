<!--
  Toast 轻提示
  ============================================================
  用途：短暂出现在屏幕中央 / 底部的轻量提示（纯展示件）。
  约定：
    - show 变为 true 时开始计时，duration 到期自动关闭并派发 close；
    - duration 为 0 时不自动关闭，需由调用方控制；
    - 不使用 emoji，类型通过配色区分。
-->
<template>
  <view v-if="show" class="toast" :class="`toast--${type}`">
    <text class="toast__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

interface ToastProps {
  /** 是否显示 */
  show?: boolean
  /** 提示文案 */
  text?: string
  /** 类型：text / success / error / warning / loading */
  type?: 'text' | 'success' | 'error' | 'warning' | 'loading'
  /** 自动关闭时长（ms），0 表示不自动关闭 */
  duration?: number
}

const props = withDefaults(defineProps<ToastProps>(), {
  show: false,
  text: '',
  type: 'text',
  duration: 2000,
})

const emit = defineEmits<{ close: [] }>()

let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

watch(
  () => props.show,
  (val) => {
    clearTimer()
    if (val && props.duration > 0) {
      timer = setTimeout(() => {
        timer = null
        emit('close')
      }, props.duration)
    }
  },
  { immediate: true },
)

onBeforeUnmount(clearTimer)
</script>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-index-toast, 600);
  max-width: 70%;
  padding: var(--space-3, 12rpx) var(--space-5, 20rpx);
  border-radius: var(--radius-md, 16rpx);
  background: var(--bg-overlay, rgba(0, 0, 0, 0.5));
}

.toast__text {
  font-size: var(--font-md, 28rpx);
  line-height: 1.5;
  color: var(--text-inverse, #ffffff);
  text-align: center;
}

.toast--success {
  background: var(--success, #10B981);
}

.toast--error {
  background: var(--error, #EF4444);
}

.toast--warning {
  background: var(--warning, #F59E0B);
}

.toast--loading {
  background: var(--bg-overlay, rgba(0, 0, 0, 0.5));
}
</style>
