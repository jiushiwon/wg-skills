<template>
  <Teleport to="body">
    <Transition name="base-dialog">
      <div
        v-if="visible"
        class="base-dialog__overlay"
        @click="handleMaskClick"
      >
        <div
          class="base-dialog"
          :style="{ width }"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- 头部 -->
          <div class="base-dialog__header">
            <slot name="header">
              <span class="base-dialog__title">{{ title }}</span>
            </slot>
            <span
              v-if="closable"
              class="base-dialog__close"
              role="button"
              tabindex="0"
              :aria-label="'关闭弹窗'"
              @click="handleClose"
              @keydown.enter="handleClose"
            >✕</span>
          </div>
          <!-- 内容 -->
          <div class="base-dialog__body">
            <slot />
          </div>
          <!-- 底部 -->
          <div v-if="footer" class="base-dialog__footer">
            <slot name="footer">
              <span
                class="base-dialog__btn base-dialog__btn--outline"
                role="button"
                tabindex="0"
                @click="handleCancel"
                @keydown.enter="handleCancel"
              >取消</span>
              <span
                class="base-dialog__btn base-dialog__btn--primary"
                role="button"
                tabindex="0"
                @click="handleConfirm"
                @keydown.enter="handleConfirm"
              >确认</span>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
  confirm: []
  cancel: []
}>()

const props = withDefaults(defineProps<{
  visible?: boolean
  title?: string
  width?: string
  closable?: boolean
  maskClosable?: boolean
  footer?: boolean
  destroyOnClose?: boolean
}>(), {
  visible: false,
  title: '',
  width: '500px',
  closable: true,
  maskClosable: true,
  footer: true,
  destroyOnClose: false,
})

function close() {
  emit('update:visible', false)
  emit('close')
}

function handleClose() {
  close()
}

function handleMaskClick() {
  if (!props.maskClosable) return
  close()
}

function handleCancel() {
  emit('cancel')
  close()
}

function handleConfirm() {
  emit('confirm')
  // ponytail: 遵循常见弹窗模式 — 确认后自动关闭
  close()
}

defineExpose({ close })
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

.base-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4, 16px) var(--space-6, 24px);
  border-bottom: 1px solid var(--color-border-light, #f0f0f0);
}

.base-dialog__title {
  font-size: var(--font-size-base, 14px);
  font-weight: var(--weight-semibold, 600);
  color: var(--color-text-primary, #333333);
}

.base-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  color: var(--color-text-muted, #999999);
  transition: all var(--transition-base, 0.2s);
  user-select: none;
}

.base-dialog__close:hover {
  background: var(--color-bg-hover, rgba(0, 0, 0, 0.04));
  color: var(--color-text-primary, #333333);
}

.base-dialog__body {
  padding: var(--space-5, 20px) var(--space-6, 24px);
  overflow-y: auto;
  flex: 1;
  color: var(--color-text, #333333);
}

.base-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3, 12px);
  padding: var(--space-4, 16px) var(--space-6, 24px);
  border-top: 1px solid var(--color-border-light, #f0f0f0);
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

/* 入场 / 退场动画 */
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