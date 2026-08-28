<template>
  <view v-if="localVisible" class="picker-root" @touchmove.stop.prevent>
    <view class="picker-mask" :class="{ 'is-open': props.visible }" @click="onCancel"></view>
    <view class="picker-panel" :class="{ 'is-open': props.visible }">
      <view class="picker-header">
        <text class="picker-btn" @click="onCancel">取消</text>
        <text class="picker-title">{{ title }}</text>
        <text class="picker-btn picker-btn-confirm" @click="onConfirm">确定</text>
      </view>
      <scroll-view class="picker-body" scroll-y>
        <view
          class="picker-item"
          v-for="(item, index) in optionList"
          :key="index"
          :class="{ selected: selectedValue === item.value }"
          @click="onSelect(item.value)"
        >
          <text class="picker-item-text">{{ item.label }}</text>
          <text v-if="selectedValue === item.value" class="picker-item-check">✓</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '请选择' },
  options: { type: Array, default: () => [] },
  value: { type: [String, Number], default: '' }
})

const emit = defineEmits(['update:value', 'confirm', 'cancel', 'change'])

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

const optionList = computed(() => {
  return props.options.map((item) => {
    if (typeof item === 'string' || typeof item === 'number') {
      return { label: item, value: item }
    }
    return {
      label: item.label || item.value || item,
      value: item.value !== undefined ? item.value : item.label
    }
  })
})

const selectedValue = ref(props.value)

watch(
  () => props.value,
  (val) => { selectedValue.value = val },
  { immediate: true }
)

function onSelect(val) {
  selectedValue.value = val
  emit('change', val)
  emit('update:value', val)
}

function onConfirm() {
  emit('confirm', selectedValue.value)
}

function onCancel() {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.picker-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.picker-mask {
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

.picker-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #FFFFFF;
  border-radius: 12px 12px 0 0;
  transform: translateY(100%);
  transition: transform 300ms ease;
  display: flex;
  flex-direction: column;
  max-height: 70vh;

  &.is-open {
    transform: translateY(0);
  }
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #F0F0F0;
  flex-shrink: 0;
}

.picker-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.picker-btn {
  font-size: 15px;
  color: #999999;
  padding: 4px 8px;

  &.picker-btn-confirm {
    color: #2563EB;
  }
}

.picker-body {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  padding: 8px 0;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin: 0 12px;
  border-radius: 8px;

  &.selected {
    background: #F5F5F5;

    .picker-item-text {
      color: #2563EB;
      font-weight: 600;
    }
  }
}

.picker-item-text {
  font-size: 15px;
  color: #333333;
}

.picker-item-check {
  font-size: 14px;
  color: #2563EB;
  font-weight: 600;
}
</style>
