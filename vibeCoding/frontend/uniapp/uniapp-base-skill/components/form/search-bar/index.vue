<template>
  <view class="search-bar">
    <view class="search-bar__wrap">
      <text class="search-bar__icon">搜</text>
      <input
        class="search-bar__input"
        type="text"
        :value="inner"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handleInput"
        @confirm="handleSearch"
      />
      <text v-if="clearable && hasValue" class="search-bar__clear" @click="handleClear">清</text>
    </view>
    <text v-if="showCancel" class="search-bar__cancel" @click="handleCancel">取消</text>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface SearchBarProps {
  /** 绑定值 */
  modelValue?: string
  /** 占位文案 */
  placeholder?: string
  /** 是否显示清除按钮 */
  clearable?: boolean
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 禁用输入 */
  disabled?: boolean
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  modelValue: '',
  placeholder: '搜索',
  clearable: true,
  showCancel: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'input': [value: string]
  'search': [value: string]
  'clear': []
  'cancel': []
}>()

const inner = ref<string>(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    inner.value = val
  }
)

const hasValue = computed(() => inner.value !== '')

function handleInput(e: { detail: { value: string } }) {
  inner.value = e.detail.value
  emit('update:modelValue', e.detail.value)
  emit('input', e.detail.value)
}

function handleSearch(e: { detail: { value: string } }) {
  const val = e.detail ? e.detail.value : inner.value
  emit('search', val)
}

function handleClear() {
  inner.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

function handleCancel() {
  inner.value = ''
  emit('update:modelValue', '')
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  padding: var(--space-2, 8rpx) var(--space-4, 16rpx);
  background: var(--bg-light, #f5f5f5);

  &__wrap {
    flex: 1;
    display: flex;
    align-items: center;
    height: var(--height-btn-md, 72rpx);
    padding: 0 var(--space-3, 12rpx);
    background: var(--bg-card, #ffffff);
    border-radius: var(--radius-full, 9999rpx);
  }

  &__icon {
    margin-right: var(--space-2, 8rpx);
    font-size: var(--font-xs, 24rpx);
    color: var(--text-tertiary, #a3a3a3);
  }

  &__input {
    flex: 1;
    font-size: var(--font-md, 28rpx);
    color: var(--text-primary, #171717);
  }

  &__clear {
    margin-left: var(--space-2, 8rpx);
    padding: var(--space-1, 4rpx) var(--space-2, 8rpx);
    font-size: var(--font-xs, 24rpx);
    color: var(--text-secondary, #525252);
    background: var(--bg-tertiary, #e5e5e5);
    border-radius: var(--radius-sm, 8rpx);
  }

  &__cancel {
    margin-left: var(--space-3, 12rpx);
    font-size: var(--font-md, 28rpx);
    color: var(--color-primary, #14b8a6);
  }
}
</style>
