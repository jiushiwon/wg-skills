<template>
  <view class="checkbox-group">
    <view v-if="label" class="checkbox-group__label">
      <text class="checkbox-group__label-text">{{ label }}</text>
    </view>
    <view class="checkbox-group__items">
      <view
        v-for="item in options"
        :key="String(item.value)"
        :class="[
          'checkbox-group__item',
          { 'checkbox-group__item--checked': isChecked(item.value) },
          { 'checkbox-group__item--disabled': disabled }
        ]"
        @click="handleClick(item)"
      >
        <view :class="['checkbox-group__box', { 'checkbox-group__box--checked': isChecked(item.value) }]">
          <view v-if="isChecked(item.value)" class="checkbox-group__check" />
        </view>
        <text class="checkbox-group__text">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface CheckboxOption {
  /** 选项展示文案 */
  label: string
  /** 选项值 */
  value: string | number
}

interface CheckboxGroupProps {
  /** 绑定值，已选中的 value 数组 */
  modelValue?: (string | number)[]
  /** 分组标题 */
  label?: string
  /** 选项列表 */
  options?: CheckboxOption[]
  /** 整组禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  modelValue: () => [],
  label: '',
  options: () => [],
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  'change': [value: (string | number)[]]
}>()

function isChecked(value: string | number): boolean {
  return props.modelValue.includes(value)
}

function handleClick(item: CheckboxOption) {
  if (props.disabled) return
  const list = [...props.modelValue]
  const index = list.indexOf(item.value)
  if (index > -1) {
    list.splice(index, 1)
  } else {
    list.push(item.value)
  }
  emit('update:modelValue', list)
  emit('change', list)
}
</script>

<style lang="scss" scoped>
.checkbox-group {
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
    gap: var(--space-4, 16rpx);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-2, 8rpx);

    &--disabled {
      opacity: 0.5;
    }
  }

  &__box {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid var(--border, #e5e5e5);
    border-radius: var(--radius-sm, 8rpx);
    transition: var(--transition-fast, 150ms ease);

    &--checked {
      background: var(--color-primary, #14b8a6);
      border-color: var(--color-primary, #14b8a6);
    }
  }

  &__check {
    width: 10rpx;
    height: 20rpx;
    border-right: 4rpx solid var(--text-inverse, #ffffff);
    border-bottom: 4rpx solid var(--text-inverse, #ffffff);
    transform: rotate(45deg);
  }

  &__text {
    font-size: var(--font-md, 28rpx);
    color: var(--text-primary, #171717);
  }
}
</style>
