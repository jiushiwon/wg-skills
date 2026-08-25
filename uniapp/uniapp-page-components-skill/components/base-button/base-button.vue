<!--
  BaseButton 自定义按钮
  ============================================================
  用途：统一按钮样式（primary / ghost / text / danger × sm / md / lg），
       loading / disabled / block / round 全支持，样式全走主题变量。
  特性：
    - 按压反馈只改 transform/opacity（style-skill D08）；
    - loading 态内置旋转 spinner（CSS 动画），自动禁用点击；
    - 与 base-form-item 搭配，是 form-page / login-page 的默认提交按钮。
-->
<template>
  <view
    class="base-button"
    :class="[`is-${type}`, `is-${size}`, { 'is-round': shape === 'round', 'is-block': block, 'is-disabled': disabled || loading }]"
    @click="onClick"
  >
    <view v-if="loading" class="bb-spinner" />
    <image v-else-if="icon" class="bb-icon" :src="icon" mode="aspectFit" />
    <text class="bb-text"><slot>{{ text }}</slot></text>
  </view>
</template>

<script setup lang="ts">
interface Props {
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

const props = withDefaults(defineProps<Props>(), {
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

<style lang="scss" scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-xl);
  border-radius: var(--radius-btn);
  transition: transform 150ms ease-out, opacity 150ms ease-out;

  &:active {
    transform: scale(0.97);
    opacity: 0.9;
  }
}

/* ---- 尺寸 ---- */
.is-sm {
  height: var(--height-btn-sm);
  padding: 0 var(--spacing-lg);
}

.is-md {
  height: var(--height-btn-md);
}

.is-lg {
  height: var(--height-btn-lg);
  font-weight: 600;
}

.is-block {
  display: flex;
  width: 100%;
}

.is-round {
  border-radius: var(--radius-full);
}

/* ---- 类型 ---- */
.is-primary {
  background: var(--color-primary);
}

.is-primary .bb-text {
  color: var(--white);
}

.is-ghost {
  background: var(--color-bg-tinted);
  border: 1rpx solid var(--color-border-light);
}

.is-ghost .bb-text {
  color: var(--color-primary);
}

.is-text {
  background: transparent;
}

.is-text .bb-text {
  color: var(--color-primary);
}

.is-danger {
  background: var(--color-error);
}

.is-danger .bb-text {
  color: var(--white);
}

/* ---- 禁用 ---- */
.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* ---- 内容 ---- */
.bb-text {
  font-size: var(--font-md);
  color: inherit;
  line-height: 1;
}

.bb-icon {
  width: var(--icon-md);
  height: var(--icon-md);
  margin-right: var(--spacing-xs);
}

.bb-spinner {
  width: 28rpx;
  height: 28rpx;
  margin-right: var(--spacing-xs);
  border: 3rpx solid rgba(255, 255, 255, 0.4);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: bb-spin 0.8s linear infinite;
}

.is-ghost .bb-spinner,
.is-text .bb-spinner {
  border-color: var(--color-border);
  border-top-color: var(--color-primary);
}

@keyframes bb-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
