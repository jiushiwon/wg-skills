<!--
  Modal 模态框
  ============================================================
  用途：基于 BasePopup（direction="center"）的确认 / 提示对话框。
  约定：
    - 外壳（遮罩、圆角、进出场）全部由 BasePopup 提供，本组件只排布内容；
    - 遮罩点击是否关闭由 closeOnMask 控制；
    - 确认 / 取消均会关闭自身（update:show=false）并派发 close；
    - 危险态（danger）确认按钮使用错误色。
-->
<template>
  <BasePopup
    :show="show"
    direction="center"
    width="560rpx"
    padding="none"
    :mask-closable="closeOnMask"
    @update:show="onPopupShow"
  >
    <view class="modal">
      <view v-if="title" class="modal__title">
        <text class="modal__title-text">{{ title }}</text>
      </view>

      <view class="modal__content">
        <slot>{{ message }}</slot>
      </view>

      <view class="modal__footer">
        <view v-if="showCancel" class="modal__btn modal__btn--cancel" @click="onCancel">
          <text class="modal__btn-text">{{ cancelText }}</text>
        </view>
        <view
          v-if="showConfirm"
          class="modal__btn modal__btn--confirm"
          :class="{ 'is-danger': danger }"
          @click="onConfirm"
        >
          <text class="modal__btn-text">{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </BasePopup>
</template>

<script setup lang="ts">
import BasePopup from '../../../containers/base-popup/index.vue'

interface ModalProps {
  /** 显示状态（v-model:show） */
  show?: boolean
  /** 标题 */
  title?: string
  /** 内容文本（默认插槽优先级更高） */
  message?: string
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 取消按钮文字 */
  cancelText?: string
  /** 确认按钮文字 */
  confirmText?: string
  /** 点击遮罩是否关闭 */
  closeOnMask?: boolean
  /** 危险态：确认按钮使用错误色 */
  danger?: boolean
}

withDefaults(defineProps<ModalProps>(), {
  show: false,
  title: '',
  message: '',
  showCancel: true,
  showConfirm: true,
  cancelText: '取消',
  confirmText: '确定',
  closeOnMask: true,
  danger: false,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
  cancel: []
  confirm: []
}>()

// BasePopup 遮罩点击时关闭
function onPopupShow(value: boolean) {
  emit('update:show', value)
  if (!value) emit('close')
}

function close() {
  emit('update:show', false)
  emit('close')
}

function onCancel() {
  emit('cancel')
  close()
}

function onConfirm() {
  emit('confirm')
  close()
}
</script>

<style scoped>
.modal {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal__title {
  padding: var(--space-6, 24rpx) var(--space-4, 16rpx) var(--space-2, 8rpx);
  text-align: center;
}

.modal__title-text {
  font-size: var(--font-lg, 30rpx);
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary, #171717);
}

.modal__content {
  padding: var(--space-2, 8rpx) var(--space-4, 16rpx) var(--space-6, 24rpx);
  font-size: var(--font-md, 28rpx);
  line-height: 1.6;
  color: var(--text-secondary, #525252);
  text-align: center;
}

.modal__footer {
  display: flex;
  border-top: 1rpx solid var(--border, #e5e5e5);
}

.modal__btn {
  flex: 1;
  height: var(--height-btn-md, 72rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition-fast, 150ms ease);
}

.modal__btn:active {
  opacity: 0.7;
}

.modal__btn--cancel {
  border-right: 1rpx solid var(--border, #e5e5e5);
}

.modal__btn-text {
  font-size: var(--font-lg, 30rpx);
  line-height: 1;
}

.modal__btn--cancel .modal__btn-text {
  color: var(--text-secondary, #525252);
}

.modal__btn--confirm .modal__btn-text {
  color: var(--color-primary, #14b8a6);
  font-weight: 600;
}

.modal__btn--confirm.is-danger .modal__btn-text {
  color: var(--color-error, #EF4444);
}
</style>
