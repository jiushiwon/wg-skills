<template>
  <BaseFormItem
    :label="label"
    :label-width="label ? labelWidth : '0'"
    :error="errorText"
    :adjust-position="adjustPosition"
    :cursor-spacing="cursorSpacing"
  >
    <view :class="['input-field__wrap', { 'input-field__wrap--error': error }]">
      <input
        class="input-field__input"
        :type="type"
        :value="inner"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        :adjust-position="adjustPosition"
        :cursor-spacing="cursorSpacing"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <text v-if="clearable && hasValue" class="input-field__clear" @click="handleClear">清</text>
    </view>
  </BaseFormItem>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseFormItem from '../../../containers/base-form-item/index.vue'

interface InputFieldProps {
  /** 绑定值 */
  modelValue?: string | number
  /** 标签文案，为空时隐藏标签列 */
  label?: string
  /** 输入类型，text / number / idcard / digit 等 */
  type?: string
  /** 占位文案 */
  placeholder?: string
  /** 禁用输入 */
  disabled?: boolean
  /** 最大长度，-1 表示不限制 */
  maxlength?: number
  /** 是否显示清除按钮 */
  clearable?: boolean
  /** 错误状态 */
  error?: boolean
  /** 错误提示文案 */
  errorMessage?: string
  /** 标签列宽 */
  labelWidth?: string
  /** 键盘弹起时是否自动上推页面（小程序端） */
  adjustPosition?: boolean
  /** 输入框与键盘的间距（px，仅 adjustPosition 为 true 时生效） */
  cursorSpacing?: number
}

const props = withDefaults(defineProps<InputFieldProps>(), {
  modelValue: '',
  label: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  maxlength: -1,
  clearable: false,
  error: false,
  errorMessage: '',
  labelWidth: '160rpx',
  adjustPosition: true,
  cursorSpacing: 0,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'input': [value: string]
  'blur': [event: unknown]
  'focus': [event: unknown]
  'clear': []
}>()

const inner = ref<string | number>(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    inner.value = val
  }
)

const hasValue = computed(() => inner.value !== '' && inner.value !== undefined && inner.value !== null)

// 容器只在有文案时才渲染错误行，避免出现空的错误占位
const errorText = computed(() => (props.error && props.errorMessage ? props.errorMessage : ''))

function handleInput(e: { detail: { value: string } }) {
  inner.value = e.detail.value
  emit('update:modelValue', e.detail.value)
  emit('input', e.detail.value)
}

function handleBlur(e: unknown) {
  emit('blur', e)
}

function handleFocus(e: unknown) {
  emit('focus', e)
}

function handleClear() {
  inner.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style lang="scss" scoped>
.input-field {
  &__wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    height: var(--height-btn-md, 72rpx);
    padding: 0 var(--space-3, 12rpx);
    background: var(--bg-light, #f5f5f5);
    border-radius: var(--radius-input, 16rpx);

    &--error {
      border: 2rpx solid var(--color-error, #EF4444);
    }
  }

  &__input {
    flex: 1;
    min-width: 0;
    font-size: var(--font-lg, 30rpx);
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
}
</style>
