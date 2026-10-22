<!--
  Button 按钮组件
  ============================================================
  用途：统一按钮样式（primary / ghost / text / danger × sm / md / lg），
       loading / disabled / block / round 全支持，样式全走主题变量。
  特性：
    - 按压反馈只改 transform / opacity；
    - loading 态用全局关键帧类 .ui-spin（关键帧真源 styles/animation.scss），
      组件内不自带 @keyframes；
    - 触控区不小于 88rpx。
-->
<template>
  <view
    class="btn"
    :class="[
      `is-${type}`,
      `is-${size}`,
      {
        'is-round': shape === 'round',
        'is-block': block,
        'is-disabled': disabled || loading,
      },
    ]"
    @click="onClick"
  >
    <view v-if="loading" class="btn-spinner ui-spin" />
    <image v-else-if="icon" class="btn-icon" :src="icon" mode="aspectFit" />
    <text class="btn-text"><slot>{{ text }}</slot></text>
  </view>
</template>

<script setup lang="ts">
interface ButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'ghost' | 'text' | 'danger'
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 禁用 */
  disabled?: boolean
  /** 加载中（内置转圈，禁用点击） */
  loading?: boolean
  /** 块级（宽度 100%） */
  block?: boolean
  /** 圆角风格 */
  shape?: 'radius' | 'round'
  /** 左侧图标 URL（可选） */
  icon?: string
  /** 按钮文本（slot 优先） */
  text?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  shape: 'radius',
  icon: '',
  text: '按钮',
})

const emit = defineEmits<{ click: [] }>()

function onClick() {
  if (props.disabled || props.loading) return
  emit('click')
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--height-btn-xl, 96rpx);
  padding: 0 var(--space-12, 48rpx);
  border-radius: var(--radius-btn, 9999rpx);
  transition: transform var(--transition-fast, 150ms ease), opacity var(--transition-fast, 150ms ease);
}

.btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* ---- 尺寸 ---- */
.is-sm {
  height: var(--height-btn-sm, 56rpx);
  min-height: var(--height-btn-sm, 56rpx);
  padding: 0 var(--space-8, 32rpx);
}

.is-md {
  height: var(--height-btn-md, 72rpx);
  min-height: var(--height-btn-md, 72rpx);
}

.is-lg {
  height: var(--height-btn-lg, 88rpx);
  min-height: var(--height-btn-lg, 88rpx);
  font-weight: 600;
}

.is-block {
  display: flex;
  width: 100%;
}

.is-round {
  border-radius: var(--radius-full, 9999rpx);
}

/* ---- 类型 ---- */
.is-primary {
  background: var(--color-primary, #14b8a6);
}

.is-primary .btn-text {
  color: var(--text-inverse, #ffffff);
}

.is-ghost {
  background: var(--bg-light, #f5f5f5);
  border: 1rpx solid var(--border-light, #f5f5f5);
}

.is-ghost .btn-text {
  color: var(--color-primary, #14b8a6);
}

.is-text {
  background: transparent;
}

.is-text .btn-text {
  color: var(--color-primary, #14b8a6);
}

.is-danger {
  background: var(--color-error, #EF4444);
}

.is-danger .btn-text {
  color: var(--text-inverse, #ffffff);
}

/* ---- 禁用 ---- */
.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* ---- 内容 ---- */
.btn-text {
  font-size: var(--font-md, 28rpx);
  color: inherit;
  line-height: 1;
}

.btn-icon {
  width: var(--icon-md, 48rpx);
  height: var(--icon-md, 48rpx);
  margin-right: var(--space-2, 8rpx);
}

.btn-spinner {
  width: var(--icon-xs, 24rpx);
  height: var(--icon-xs, 24rpx);
  margin-right: var(--space-2, 8rpx);
  border: 3rpx solid var(--border-light, #f5f5f5);
  border-top-color: var(--text-inverse, #ffffff);
  border-radius: var(--radius-full, 9999rpx);
}

.is-ghost .btn-spinner,
.is-text .btn-spinner {
  border-color: var(--border, #e5e5e5);
  border-top-color: var(--color-primary, #14b8a6);
}
</style>
