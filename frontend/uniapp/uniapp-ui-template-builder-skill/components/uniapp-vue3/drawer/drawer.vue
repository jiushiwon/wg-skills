<template>
  <view v-if="localVisible" class="drawer-root" @touchmove.stop.prevent>
    <view class="drawer-mask" :class="{ 'is-open': props.visible }" @click="onClose"></view>
    <view
      class="drawer-panel"
      :class="[`position-${position}`, { 'is-open': props.visible }]"
      :style="panelStyle"
    >
      <view class="drawer-header">
        <text class="drawer-title">{{ title }}</text>
        <view class="drawer-close" @click="onClose">
          <text class="drawer-close-icon">×</text>
        </view>
      </view>
      <view class="drawer-body">
        <slot>
          <view class="drawer-empty">
            <text class="drawer-empty-text">暂无内容</text>
          </view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  position: { type: String, default: 'right' },
  title: { type: String, default: '' },
  width: { type: [String, Number], default: '280px' },
  height: { type: [String, Number], default: '40vh' }
})

const emit = defineEmits(['close'])

const localVisible = ref(props.visible)
let closeTimer = null

watch(
  () => props.visible,
  (val) => {
    clearTimeout(closeTimer)
    if (val) {
      localVisible.value = true
    } else {
      closeTimer = setTimeout(() => { localVisible.value = false }, 300)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  clearTimeout(closeTimer)
})

function formatSize(val) {
  if (typeof val === 'number') return `${val}px`
  return val
}

const panelStyle = computed(() => {
  if (props.position === 'bottom') {
    return { height: formatSize(props.height), width: '100%' }
  }
  return { width: formatSize(props.width), height: '100%' }
})

function onClose() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.drawer-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.drawer-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 300ms ease;

  &.is-open {
    opacity: 1;
  }
}

.drawer-panel {
  position: absolute;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 300ms ease;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.08);

  &.is-open {
    transform: translateX(0);
  }

  &.position-right {
    top: 0;
    right: 0;
    bottom: 0;
    transform: translateX(100%);
  }

  &.position-left {
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
  }

  &.position-bottom {
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px 12px 0 0;
    transform: translateY(100%);

    &.is-open {
      transform: translateY(0);
    }
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #F0F0F0;
  flex-shrink: 0;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.drawer-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -8px;
}

.drawer-close-icon {
  font-size: 22px;
  color: #999999;
  line-height: 1;
}

.drawer-body {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.drawer-empty {
  padding: 48px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-empty-text {
  font-size: 14px;
  color: #999999;
}
</style>
