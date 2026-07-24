<template>
  <view v-if="visible" class="t-modal">
    <transition name="t-modal-fade" appear>
      <view class="t-modal__mask" @click="onClose"></view>
    </transition>
    <transition name="t-modal-zoom" appear>
      <view class="t-modal__dialog">
        <view class="t-modal__header">
          <text class="t-modal__title">{{ title }}</text>
        </view>
        <view class="t-modal__body">
          <text class="t-modal__content">{{ content }}</text>
          <slot></slot>
        </view>
        <view class="t-modal__footer">
          <view
            v-if="showCancel"
            class="t-modal__btn t-modal__btn--cancel"
            @click="onCancel"
          >
            <text>{{ cancelText }}</text>
          </view>
          <view
            v-if="showConfirm"
            class="t-modal__btn t-modal__btn--confirm"
            @click="onConfirm"
          >
            <text>{{ confirmText }}</text>
          </view>
        </view>
      </view>
    </transition>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '提示' },
  content: { type: String, default: '' },
  showCancel: { type: Boolean, default: true },
  showConfirm: { type: Boolean, default: true },
  cancelText: { type: String, default: '取消' },
  confirmText: { type: String, default: '确认' }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
}

function onClose() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.t-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.t-modal__mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

.t-modal__dialog {
  position: relative;
  z-index: 2;
  width: 280px;
  max-width: 80%;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  pointer-events: auto;
}

.t-modal__header {
  padding: 20px 20px 12px;
  text-align: center;
}

.t-modal__title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  line-height: 1.4;
}

.t-modal__body {
  padding: 0 20px 20px;
  text-align: center;
}

.t-modal__content {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
}

.t-modal__footer {
  display: flex;
  align-items: center;
  border-top: 1px solid #E5E5E5;
}

.t-modal__btn {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.t-modal__btn text {
  max-width: 100%;
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
}

.t-modal__btn--cancel {
  color: #666666;
  background: #FFFFFF;
  border-right: 1px solid #E5E5E5;
}

.t-modal__btn--confirm {
  color: #2563EB;
  background: #FFFFFF;
  font-weight: 600;
}

.t-modal__btn--cancel:active,
.t-modal__btn--confirm:active {
  background: #F5F5F5;
}

.t-modal__footer .t-modal__btn:last-child {
  border-right: none;
}

.t-modal-fade-enter-active,
.t-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.t-modal-fade-enter-from,
.t-modal-fade-leave-to {
  opacity: 0;
}

.t-modal-zoom-enter-active,
.t-modal-zoom-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.t-modal-zoom-enter-from,
.t-modal-zoom-leave-to {
  transform: scale(0.92);
  opacity: 0;
}
</style>

<!-- 使用示例 -->
<!--
<template>
  <view>
    <view class="demo-btn" @click="show = true">打开弹窗</view>
    <modal-basic
      :visible="show"
      title="确认删除"
      content="删除后无法恢复，是否继续？"
      @confirm="onConfirm"
      @cancel="show = false"
      @close="show = false"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import ModalBasic from '@/components/uniapp-vue3/modal/modal.vue'

const show = ref(false)

function onConfirm() {
  uni.showToast({ title: '已删除', icon: 'success' })
  show.value = false
}
</script>
-->
