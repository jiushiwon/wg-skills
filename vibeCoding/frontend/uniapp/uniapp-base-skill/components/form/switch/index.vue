<template>
  <view class="switch" @click="handleClick">
    <text v-if="label" class="switch__label">{{ label }}</text>
    <view
      :class="['switch__core', { 'switch__core--checked': modelValue, 'switch__core--disabled': disabled }]"
      :style="coreStyle"
    >
      <view class="switch__dot" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SwitchProps {
  /** 绑定值，是否开启 */
  modelValue?: boolean
  /** 左侧标签文案 */
  label?: string
  /** 开启态轨道颜色，空字符串表示用主题主色 */
  activeColor?: string
  /** 关闭态轨道颜色，空字符串表示用主题灰 */
  inactiveColor?: string
  /** 禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: false,
  label: '',
  activeColor: '',
  inactiveColor: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'change': [value: boolean]
}>()

// 颜色由 prop 覆盖时才写内联样式，否则交给样式表里的主题变量
const coreStyle = computed(() => {
  const color = props.modelValue ? props.activeColor : props.inactiveColor
  return color ? { backgroundColor: color } : {}
})

function handleClick() {
  if (props.disabled) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<style lang="scss" scoped>
.switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3, 12rpx) var(--space-4, 16rpx);
  background: var(--bg-card, #ffffff);

  &__label {
    font-size: var(--font-lg, 30rpx);
    color: var(--text-primary, #171717);
  }

  &__core {
    position: relative;
    width: 102rpx;
    height: 62rpx;
    background: var(--text-tertiary, #a3a3a3);
    border-radius: var(--radius-full, 9999rpx);
    transition: var(--transition-normal, 200ms ease);

    &--checked {
      background: var(--color-primary, #14b8a6);
    }

    &--disabled {
      opacity: 0.5;
    }
  }

  &__dot {
    position: absolute;
    top: 4rpx;
    left: 4rpx;
    width: 54rpx;
    height: 54rpx;
    background: var(--bg-card, #ffffff);
    border-radius: var(--radius-full, 9999rpx);
    box-shadow: var(--shadow-sm, 0 2rpx 8rpx rgba(0, 0, 0, 0.04));
    transition: var(--transition-normal, 200ms ease);
  }

  &__core--checked &__dot {
    transform: translateX(40rpx);
  }
}
</style>
