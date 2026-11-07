<template>
  <transition name="toast-fade">
    <view v-if="visible" class="t-toast" :class="[`t-toast--${position}`]">
      <view class="t-toast__box" :class="[`t-toast--type-${type}`]">
        <view v-if="type === 'success'" class="t-toast__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </view>
        <view v-else-if="type === 'error'" class="t-toast__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </view>
        <view v-else-if="type === 'loading'" class="t-toast__icon">
          <view class="t-toast__spinner"></view>
        </view>
        <text class="t-toast__message">{{ message }}</text>
      </view>
    </view>
  </transition>
</template>

<script setup>
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  message: { type: String, default: '' },
  position: { type: String, default: 'middle' },
  duration: { type: Number, default: 2000 }
})

const emit = defineEmits(['close', 'update:visible'])

let timer = null

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function close() {
  clearTimer()
  emit('update:visible', false)
  emit('close')
}

watch(() => props.visible, (val) => {
  clearTimer()
  if (val) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}, { immediate: true })

onUnmounted(() => {
  clearTimer()
})
</script>

<style lang="scss" scoped>
.t-toast {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 2000;
}

.t-toast--top {
  align-items: flex-start;
  padding-top: 48px;
}

.t-toast--middle {
  align-items: center;
}

.t-toast--bottom {
  align-items: flex-end;
  padding-bottom: 48px;
}

.t-toast__box {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 80%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: #333333;
  font-size: 14px;
  pointer-events: auto;
  overflow: hidden;
}

.t-toast__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333333;
}

.t-toast__icon svg {
  width: 100%;
  height: 100%;
}

.t-toast__spinner {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: t-toast-spin 0.8s linear infinite;
}

.t-toast--type-success .t-toast__icon {
  color: #10B981;
}

.t-toast--type-error .t-toast__icon {
  color: #EF4444;
}

.t-toast__message {
  max-width: 240px;
  line-height: 1.5;
  text-align: center;
  word-break: break-word;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes t-toast-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<!-- 使用示例 -->
<!--
<template>
  <view>
    <view class="demo-btn" @click="showToast = true">显示 Toast</view>
    <toast-basic
      v-model:visible="showToast"
      type="success"
      message="保存成功"
      position="middle"
      :duration="2000"
      @close="onClose"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import ToastBasic from '@/components/uniapp-vue3/toast/toast.vue'

const showToast = ref(false)

function onClose() {
  console.log('toast closed')
}
</script>
-->
