<!--
  ProgressBar 进度条
  ============================================================
  展示 0~100 的进度，颜色按状态取主题色（primary/success/warning/error）。
  主题变量真源：uniapp-theme-skill/templates/src/static/css/base.css
-->
<template>
  <view class="progress-bar">
    <view v-if="showText" class="progress-bar__text">
      <text>{{ text || `${clampedPercent}%` }}</text>
    </view>
    <view class="progress-bar__track" :class="{ 'progress-bar__track--round': round }" :style="trackStyle">
      <view class="progress-bar__fill" :class="`progress-bar__fill--${currentStatus}`" :style="fillStyle" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ProgressBarProps {
  /** 进度百分比，0~100，超出自动截断 */
  percent?: number
  /** 状态（决定填充色），为空时取 type */
  status?: 'primary' | 'success' | 'warning' | 'error'
  /** 状态，兼容旧属性名，等价于 status */
  type?: 'primary' | 'success' | 'warning' | 'error'
  /** 是否显示文字 */
  showText?: boolean
  /** 自定义文字，为空时显示百分比 */
  text?: string
  /** 进度条高度（px 值，渲染时按 1px = 2rpx 换算） */
  strokeWidth?: number
  /** 是否圆角 */
  round?: boolean
}

const props = withDefaults(defineProps<ProgressBarProps>(), {
  percent: 0,
  status: '',
  type: 'primary',
  showText: true,
  text: '',
  strokeWidth: 6,
  round: true,
})

/** status 优先，其次兼容的 type */
const currentStatus = computed(() => props.status || props.type)

const clampedPercent = computed(() => Math.min(100, Math.max(0, props.percent)))

/** 1px = 2rpx */
const barHeight = computed(() => `${props.strokeWidth * 2}rpx`)

const trackStyle = computed(() => ({ height: barHeight.value }))

const fillStyle = computed(() => ({
  width: `${clampedPercent.value}%`,
  height: barHeight.value,
}))
</script>

<style lang="scss" scoped>
.progress-bar {
  width: 100%;
}

.progress-bar__text {
  margin-bottom: var(--space-2, 8rpx);
  color: var(--text-secondary, #525252);
  font-size: var(--font-sm, 26rpx);
}

.progress-bar__track {
  width: 100%;
  overflow: hidden;
  background: var(--bg-tertiary, #e5e5e5);
  border-radius: var(--radius-sm, 8rpx);
}

.progress-bar__track--round {
  border-radius: var(--radius-full, 9999rpx);
}

.progress-bar__fill {
  border-radius: inherit;
  transition: width var(--transition-normal, 200ms ease);
}

.progress-bar__fill--primary {
  background: var(--color-primary, #14b8a6);
}

.progress-bar__fill--success {
  background: var(--color-success, #10B981);
}

.progress-bar__fill--warning {
  background: var(--color-warning, #F59E0B);
}

.progress-bar__fill--error {
  background: var(--color-error, #EF4444);
}
</style>
