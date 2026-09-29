<template>
  <!-- 链接模式（href / to）：用 div 模拟 a，保持样式一致 -->
  <div
    v-if="href || to"
    :class="buttonClass"
    role="link"
    tabindex="0"
    :aria-disabled="(disabled || loading) ? 'true' : 'false'"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true"></span>
    <template v-else>
      <BaseIcon v-if="icon" :name="icon" :size="iconSize" class="base-button__icon" />
      <slot />
    </template>
  </div>

  <!-- 默认按钮模式 -->
  <div
    v-else
    :class="buttonClass"
    role="button"
    :aria-disabled="(disabled || loading) ? 'true' : 'false'"
    :data-native-type="nativeType"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true"></span>
    <template v-else>
      <BaseIcon v-if="icon" :name="icon" :size="iconSize" class="base-button__icon" />
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from 'frontend-icon-skill/components/BaseIcon.vue'

const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent]
}>()

const props = withDefaults(defineProps<{
  type?: 'primary' | 'default' | 'success' | 'warning' | 'danger' | 'text'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline' | 'ghost' | 'text' | 'link'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  icon?: string
  nativeType?: 'button' | 'submit' | 'reset'
  href?: string
  to?: string | object
  round?: boolean
  circle?: boolean
  name?: string
}>(), {
  type: 'default',
  size: 'md',
  variant: 'solid',
  disabled: false,
  loading: false,
  block: false,
  nativeType: 'button',
  round: false,
  circle: false,
})

/** 图标尺寸随按钮 size 缩放 */
const iconSize = computed(() => ({ sm: 14, md: 16, lg: 18 })[props.size])

const buttonClass = computed(() => [
  'base-button',
  `base-button--type-${props.type}`,
  `base-button--size-${props.size}`,
  `base-button--variant-${props.variant}`,
  {
    'base-button--block': props.block,
    'base-button--loading': props.loading,
    'base-button--round': props.round,
    'base-button--circle': props.circle,
    'is-disabled': props.disabled || props.loading,
  },
])

function handleClick(event: MouseEvent | KeyboardEvent) {
  if (props.disabled || props.loading) return

  // ponytail: base-button 默认渲染 <div role="button">，不会触发原生 form submit。
  // nativeType="submit" 必须手动找最近的 <form> 祖先并 dispatchEvent('submit')，
  // 让 BaseForm 的 @submit.prevent="doSubmit" 能正常执行。
  if (props.nativeType === 'submit') {
    const target = event.currentTarget as HTMLElement | null
    const form = target?.closest('form')
    if (form) {
      event.stopPropagation()
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      return
    }
  }
  if (props.nativeType === 'reset') {
    const target = event.currentTarget as HTMLElement | null
    const form = target?.closest('form')
    if (form) {
      event.stopPropagation()
      form.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }))
      return
    }
  }

  emit('click', event)
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2, 8px);
  border-radius: var(--radius-md, 6px);
  font-weight: var(--weight-medium, 500);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);
  border: 1px solid transparent;
  user-select: none;
  white-space: nowrap;
  outline: none;
  box-sizing: border-box;
}

.base-button:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary-light, rgba(64, 158, 255, 0.3));
}

.base-button:active:not(.is-disabled) {
  transform: scale(0.98);
}

.base-button.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.base-button--block {
  display: flex;
  width: 100%;
}

.base-button--round {
  border-radius: var(--radius-full, 9999px);
}

.base-button--circle {
  border-radius: var(--radius-full, 9999px);
  padding: 0;
  width: var(--height-button-md, 36px);
}

.base-button--size-sm {
  height: var(--height-button-sm, 28px);
  padding: 0 var(--space-3, 12px);
  font-size: var(--font-size-sm, 14px);
}

.base-button--size-md {
  height: var(--height-button-md, 36px);
  padding: 0 var(--space-4, 16px);
  font-size: var(--font-size-base, 14px);
}

.base-button--size-lg {
  height: var(--height-button-lg, 44px);
  padding: 0 var(--space-5, 20px);
  font-size: var(--font-size-lg, 16px);
}

/* Solid Primary */
.base-button--variant-solid.base-button--type-primary {
  background: var(--color-primary, #1890ff);
  color: var(--color-text-inverse, #ffffff);
}
.base-button--variant-solid.base-button--type-primary:hover:not(.is-disabled) {
  background: var(--color-primary-light, #40a9ff);
}

/* Solid Default */
.base-button--variant-solid.base-button--type-default {
  background: var(--color-surface, #ffffff);
  border-color: var(--color-border-strong, #d9d9d9);
  color: var(--color-text, #333333);
}
.base-button--variant-solid.base-button--type-default:hover:not(.is-disabled) {
  border-color: var(--color-primary, #1890ff);
  color: var(--color-primary, #1890ff);
}

/* Success / Warning / Danger (Solid) */
.base-button--variant-solid.base-button--type-success {
  background: var(--color-success, #52c41a);
  color: var(--color-text-inverse, #ffffff);
}
.base-button--variant-solid.base-button--type-warning {
  background: var(--color-warning, #faad14);
  color: var(--color-text-inverse, #ffffff);
}
.base-button--variant-solid.base-button--type-danger {
  background: var(--color-danger, #ff4d4f);
  color: var(--color-text-inverse, #ffffff);
}
.base-button--variant-solid.base-button--type-danger:hover:not(.is-disabled) {
  background: var(--color-danger-dark, #d4380d);
}

/* Outline Primary */
.base-button--variant-outline.base-button--type-primary {
  border-color: var(--color-primary, #1890ff);
  color: var(--color-primary, #1890ff);
  background: transparent;
}
.base-button--variant-outline.base-button--type-primary:hover:not(.is-disabled) {
  background: var(--color-primary, #1890ff);
  color: var(--color-text-inverse, #ffffff);
}

/* Outline Danger */
.base-button--variant-outline.base-button--type-danger {
  border-color: var(--color-danger, #ff4d4f);
  color: var(--color-danger, #ff4d4f);
  background: transparent;
}
.base-button--variant-outline.base-button--type-danger:hover:not(.is-disabled) {
  background: var(--color-danger, #ff4d4f);
  color: var(--color-text-inverse, #ffffff);
}

/* Ghost */
.base-button--variant-ghost {
  background: transparent;
}
.base-button--variant-ghost.base-button--type-primary {
  color: var(--color-primary, #1890ff);
}
.base-button--variant-ghost.base-button--type-danger {
  color: var(--color-danger, #ff4d4f);
}
.base-button--variant-ghost:hover:not(.is-disabled) {
  background: var(--color-surface-hover, rgba(0, 0, 0, 0.04));
}

/* Text */
.base-button--variant-text {
  background: transparent;
  border-color: transparent;
  color: var(--color-text, #333333);
}
.base-button--variant-text.base-button--type-primary {
  color: var(--color-primary, #1890ff);
}
.base-button--variant-text.base-button--type-danger {
  color: var(--color-danger, #ff4d4f);
}
.base-button--variant-text:hover:not(.is-disabled) {
  background: var(--color-surface-hover, rgba(0, 0, 0, 0.04));
}

/* Link */
.base-button--variant-link {
  background: transparent;
  border-color: transparent;
  color: var(--color-primary, #1890ff);
  text-decoration: underline;
}
.base-button--variant-link:hover:not(.is-disabled) {
  color: var(--color-primary-light, #40a9ff);
}

/* Icon（BaseIcon 内联 SVG） */
.base-button__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
}

/* Loading spinner */
.base-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full, 9999px);
  animation: base-button-spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes base-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>