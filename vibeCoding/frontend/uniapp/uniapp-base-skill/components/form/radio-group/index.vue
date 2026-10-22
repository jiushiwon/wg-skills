<template>
  <view class="radio-group">
    <view v-if="label" class="radio-group__label">
      <text class="radio-group__label-text">{{ label }}</text>
    </view>
    <view class="radio-group__items">
      <view
        v-for="item in options"
        :key="String(item.value)"
        :class="[
          'radio-group__item',
          { 'radio-group__item--checked': modelValue === item.value },
          { 'radio-group__item--disabled': disabled }
        ]"
        @click="handleClick(item)"
      >
        <view :class="['radio-group__circle', { 'radio-group__circle--checked': modelValue === item.value }]">
          <view v-if="modelValue === item.value" class="radio-group__dot" />
        </view>
        <text class="radio-group__text">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface RadioOption {
  /** 选项展示文案 */
  label: string
  /** 选项值 */
  value: string | number
}

interface RadioGroupProps {
  /** 绑定值，选中的 value */
  modelValue?: string | number
  /** 分组标题 */
  label?: string
  /** 选项列表 */
  options?: RadioOption[]
  /** 整组禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<RadioGroupProps>(), {
  modelValue: '',
  label: '',
  options: () => [],
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'change': [value: string | number]
}>()

function handleClick(item: RadioOption) {
  if (props.disabled) return
  emit('update:modelValue', item.value)
  emit('change', item.value)
}
</script>

<style lang="scss" scoped>
.radio-group {
  padding: var(--space-3, 12rpx) var(--space-4, 16rpx);
  background: var(--bg-card, #ffffff);

  &__label {
    margin-bottom: var(--space-3, 12rpx);
  }

  &__label-text {
    font-size: var(--font-md, 28rpx);
    color: var(--text-primary, #171717);
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6, 24rpx);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-2, 8rpx);

    &--disabled {
      opacity: 0.5;
    }
  }

  &__circle {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid var(--border, #e5e5e5);
    border-radius: var(--radius-full, 9999rpx);
    transition: var(--transition-fast, 150ms ease);

    &--checked {
      border-color: var(--color-primary, #14b8a6);
    }
  }

  &__dot {
    width: 20rpx;
    height: 20rpx;
    background: var(--color-primary, #14b8a6);
    border-radius: var(--radius-full, 9999rpx);
  }

  &__text {
    font-size: var(--font-md, 28rpx);
    color: var(--text-primary, #171717);
  }
}
</style>
