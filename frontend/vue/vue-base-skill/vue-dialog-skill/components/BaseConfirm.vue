<template>
  <Teleport to="body">
    <Transition name="base-dialog">
      <div
        v-if="visible"
        class="base-dialog__overlay"
        @click="handleCancel"
      >
        <div
          class="base-dialog base-dialog--confirm"
          role="alertdialog"
          aria-modal="true"
          @click.stop
        >
          <div class="base-confirm__icon" :class="`base-confirm__icon--${type}`">
            <span class="base-confirm__icon-shape" aria-hidden="true">
              {{ iconChar }}
            </span>
          </div>
          <span class="base-dialog__title base-dialog__title--center">{{ title }}</span>
          <span v-if="message" class="base-confirm__message">{{ message }}</span>
          <div class="base-dialog__footer base-dialog__footer--center">
            <span
              class="base-dialog__btn base-dialog__btn--outline"
              role="button"
              tabindex="0"
              @click="handleCancel"
              @keydown.enter="handleCancel"
            >{{ cancelText }}</span>
            <span
              class="base-dialog__btn"
              :class="`base-dialog__btn--${confirmType}`"
              role="button"
              tabindex="0"
              @click="handleConfirm"
              @keydown.enter="handleConfirm"
            >{{ confirmText }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
  cancel: []
}>()

const props = withDefaults(defineProps<{
  visible?: boolean
  type?: 'warning' | 'danger' | 'info'
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmType?: 'primary' | 'danger'
}>(), {
  visible: false,
  type: 'warning',
  title: '确认操作',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  confirmType: 'primary',
})

const iconChar = computed(() => {
  if (props.type === 'warning') return '⚠'
  if (props.type === 'danger') return '✕'
  return 'i'
})

function close() {
  emit('update:visible', false)
}

function handleConfirm() {
  emit('confirm')
  close()
}

function handleCancel() {
  emit('cancel')
  close()
}
</script>

<style scoped>
.base-dialog__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.base-dialog {
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-lg, 12px);
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.16));
  box-sizing: border-box;
}

.base-dialog--confirm {
  max-width: 400px;
  padding: var(--space-6, 24px);
  align-items: center;
  gap: var(--space-3, 12px);
}

.base-confirm__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full, 9999px);
  flex-shrink: 0;
}

.base-confirm__icon--warning {
  background: var(--color-warning-light, #fffbe6);
}
.base-confirm__icon--danger {
  background: var(--color-danger-light, #fff1f0);
}
.base-confirm__icon--info {
  background: var(--color-primary-light, #e6f7ff);
}

.base-confirm__icon-shape {
  font-size: 24px;
  font-weight: var(--weight-bold, 700);
  line-height: 1;
}

.base-confirm__icon--warning .base-confirm__icon-shape {
  color: var(--color-warning, #faad14);
}
.base-confirm__icon--danger .base-confirm__icon-shape {
  color: var(--color-danger, #ff4d4f);
}
.base-confirm__icon--info .base-confirm__icon-shape {
  color: var(--color-primary, #1890ff);
}

.base-dialog__title {
  font-size: var(--font-size-base, 14px);
  font-weight: var(--weight-semibold, 600);
  color: var(--color-text-primary, #333333);
}

.base-dialog__title--center {
  text-align: center;
  width: 100%;
}

.base-confirm__message {
  text-align: center;
  color: var(--color-text-secondary, #666666);
  font-size: var(--font-size-sm, 14px);
  margin-bottom: var(--space-3, 12px);
  line-height: var(--leading-normal, 1.5);
}

.base-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3, 12px);
  padding: var(--space-4, 16px) var(--space-6, 24px);
  border-top: 1px solid var(--color-border-light, #f0f0f0);
}

.base-dialog__footer--center {
  justify-content: center;
  border-top: none;
  padding: 0;
  width: 100%;
}

.base-dialog__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--height-button-md, 36px);
  padding: 0 var(--space-4, 16px);
  border-radius: var(--radius-md, 6px);
  font-size: var(--font-size-base, 14px);
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  transition: all var(--transition-fast, 0.15s);
  box-sizing: border-box;
}

.base-dialog__btn--outline {
  border-color: var(--color-border-strong, #d9d9d9);
  color: var(--color-text, #333333);
  background: var(--color-surface, #ffffff);
}
.base-dialog__btn--outline:hover {
  border-color: var(--color-primary, #1890ff);
  color: var(--color-primary, #1890ff);
}

.base-dialog__btn--primary {
  background: var(--color-primary, #1890ff);
  color: var(--color-text-inverse, #ffffff);
}
.base-dialog__btn--primary:hover {
  background: var(--color-primary-light, #40a9ff);
}

.base-dialog__btn--danger {
  background: var(--color-danger, #ff4d4f);
  color: var(--color-text-inverse, #ffffff);
}
.base-dialog__btn--danger:hover {
  background: var(--color-danger-dark, #d4380d);
}

.base-dialog-enter-active {
  transition: opacity var(--transition-base, 0.2s) ease;
}
.base-dialog-enter-active .base-dialog {
  transition: transform var(--transition-base, 0.2s) ease;
}
.base-dialog-leave-active {
  transition: opacity var(--transition-fast, 0.15s) ease;
}
.base-dialog-leave-active .base-dialog {
  transition: transform var(--transition-fast, 0.15s) ease;
}

.base-dialog-enter-from {
  opacity: 0;
}
.base-dialog-enter-from .base-dialog {
  transform: translateY(-20px);
}
.base-dialog-leave-to {
  opacity: 0;
}
.base-dialog-leave-to .base-dialog {
  transform: translateY(-20px);
}
</style>