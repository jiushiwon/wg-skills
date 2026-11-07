<template>
  <span
    :class="[
      'base-tag',
      `base-tag--type-${type}`,
      `base-tag--size-${size}`,
      `base-tag--variant-${variant}`,
    ]"
  >
    <slot />
    <span
      v-if="closable"
      class="base-tag__close"
      role="button"
      tabindex="0"
      :aria-label="'关闭标签'"
      @click.stop="handleClose"
      @keydown.enter.stop="handleClose"
    >×</span>
  </span>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

withDefaults(defineProps<{
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  variant?: 'solid' | 'outline' | 'light'
  closable?: boolean
}>(), {
  type: 'default',
  size: 'sm',
  variant: 'light',
  closable: false,
})

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.base-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
  padding: 2px var(--space-2, 8px);
  border-radius: var(--radius-sm, 2px);
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--weight-medium, 500);
  line-height: var(--leading-tight, 1.25);
  border: 1px solid transparent;
  box-sizing: border-box;
}

.base-tag--size-md {
  padding: var(--space-1, 4px) var(--space-3, 12px);
  font-size: var(--font-size-sm, 14px);
}

.base-tag__close {
  cursor: pointer;
  opacity: 0.6;
  margin-left: var(--space-1, 4px);
  font-size: var(--font-size-base, 14px);
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition-fast, 0.15s);
}

.base-tag__close:hover {
  opacity: 1;
}

/* Light */
.base-tag--variant-light.base-tag--type-default {
  background: var(--color-bg-secondary, #f5f5f5);
  color: var(--color-text-secondary, #666666);
}
.base-tag--variant-light.base-tag--type-primary {
  background: var(--color-primary-50, #e6f7ff);
  color: var(--color-primary, #1890ff);
}
.base-tag--variant-light.base-tag--type-success {
  background: var(--color-success-light, #f6ffed);
  color: var(--color-success-dark, #389e0d);
}
.base-tag--variant-light.base-tag--type-warning {
  background: var(--color-warning-light, #fffbe6);
  color: var(--color-warning-dark, #d48806);
}
.base-tag--variant-light.base-tag--type-danger {
  background: var(--color-danger-light, #fff1f0);
  color: var(--color-danger-dark, #cf1322);
}
.base-tag--variant-light.base-tag--type-info {
  background: var(--color-info-light, #e6f4ff);
  color: var(--color-info-dark, #0958d9);
}

/* Solid */
.base-tag--variant-solid.base-tag--type-default {
  background: var(--color-text-secondary, #666666);
  color: var(--color-text-inverse, #ffffff);
}
.base-tag--variant-solid.base-tag--type-primary {
  background: var(--color-primary, #1890ff);
  color: var(--color-text-inverse, #ffffff);
}
.base-tag--variant-solid.base-tag--type-success {
  background: var(--color-success, #52c41a);
  color: var(--color-text-inverse, #ffffff);
}
.base-tag--variant-solid.base-tag--type-warning {
  background: var(--color-warning, #faad14);
  color: var(--color-text-inverse, #ffffff);
}
.base-tag--variant-solid.base-tag--type-danger {
  background: var(--color-danger, #ff4d4f);
  color: var(--color-text-inverse, #ffffff);
}
.base-tag--variant-solid.base-tag--type-info {
  background: var(--color-info, #1677ff);
  color: var(--color-text-inverse, #ffffff);
}

/* Outline */
.base-tag--variant-outline {
  background: transparent;
}
.base-tag--variant-outline.base-tag--type-default {
  border-color: var(--color-border-strong, #d9d9d9);
  color: var(--color-text-secondary, #666666);
}
.base-tag--variant-outline.base-tag--type-primary {
  border-color: var(--color-primary, #1890ff);
  color: var(--color-primary, #1890ff);
}
.base-tag--variant-outline.base-tag--type-success {
  border-color: var(--color-success, #52c41a);
  color: var(--color-success, #52c41a);
}
.base-tag--variant-outline.base-tag--type-warning {
  border-color: var(--color-warning, #faad14);
  color: var(--color-warning, #faad14);
}
.base-tag--variant-outline.base-tag--type-danger {
  border-color: var(--color-danger, #ff4d4f);
  color: var(--color-danger, #ff4d4f);
}
.base-tag--variant-outline.base-tag--type-info {
  border-color: var(--color-info, #1677ff);
  color: var(--color-info, #1677ff);
}
</style>