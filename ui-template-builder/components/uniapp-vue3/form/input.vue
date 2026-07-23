<template>
  <view
    class="t-input"
    :class="{
      't-input--disabled': disabled,
      't-input--focus': focused,
      't-input--error': error
    }"
  >
    <!-- 前置图标 -->
    <view v-if="$slots.prepend || prefixIcon" class="t-input__prepend">
      <slot name="prepend">
        <text class="t-input__icon">{{ prefixIcon }}</text>
      </slot>
    </view>

    <view class="t-input__wrapper">
      <!-- 前置内容 -->
      <view v-if="$slots.prefix" class="t-input__prefix">
        <slot name="prefix" />
      </view>

      <input
        class="t-input__inner"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :cursor-spacing="120"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @confirm="handleConfirm"
      />

      <!-- 清空按钮 -->
      <view
        v-if="clearable && modelValue && !disabled"
        class="t-input__clear"
        @click="handleClear"
      >
        ✕
      </view>

      <!-- 后置内容 -->
      <view v-if="$slots.suffix || suffixIcon" class="t-input__suffix">
        <slot name="suffix">
          <text class="t-input__icon">{{ suffixIcon }}</text>
        </slot>
      </view>
    </view>

    <!-- 后置图标 -->
    <view v-if="$slots.append || appendIcon" class="t-input__append">
      <slot name="append">
        <text class="t-input__icon">{{ appendIcon }}</text>
      </slot>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: '请输入'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: Number,
    default: -1
  },
  prefixIcon: {
    type: String,
    default: ''
  },
  suffixIcon: {
    type: String,
    default: ''
  },
  appendIcon: {
    type: String,
    default: ''
  },
  error: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear', 'input', 'confirm'])

const focused = ref(false)

function handleFocus(e) {
  focused.value = true
  emit('focus', e)
}

function handleBlur(e) {
  focused.value = false
  emit('blur', e)
}

function handleInput(e) {
  const value = e.detail.value
  emit('update:modelValue', value)
  emit('input', value)
}

function handleConfirm(e) {
  emit('confirm', e.detail.value)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style lang="scss" scoped>
.t-input {
  display: flex;
  align-items: center;
  background: var(--color-bg-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-input, 8px);
  transition: all 0.2s ease;
}

.t-input--focus {
  border-color: var(--color-primary, #333);
  box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
}

.t-input--error {
  border-color: var(--color-error, #ef4444);
}

.t-input--disabled {
  background: var(--color-bg-surface-hover, #f9fafb);
  opacity: 0.6;
}

.t-input__wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.t-input__inner {
  flex: 1;
  padding: var(--input-padding-y, 8px) var(--input-padding-x, 12px);
  font-size: var(--text-base, 16px);
  color: var(--color-text-primary, #111827);
  background: transparent;
  border: none;
  outline: none;
}

.t-input__inner::placeholder {
  color: var(--color-text-placeholder, #9ca3af);
}

.t-input__prepend,
.t-input__append {
  display: flex;
  align-items: center;
  padding: 0 var(--space-3, 12px);
  color: var(--color-text-secondary, #6b7280);
}

.t-input__prepend {
  border-right: 1px solid var(--color-border, #e5e7eb);
}

.t-input__append {
  border-left: 1px solid var(--color-border, #e5e7eb);
}

.t-input__prefix,
.t-input__suffix {
  display: flex;
  align-items: center;
  padding-left: var(--space-2, 8px);
  color: var(--color-text-secondary, #6b7280);
}

.t-input__suffix {
  padding-left: 0;
  padding-right: var(--space-2, 8px);
}

.t-input__icon {
  font-size: var(--text-base, 16px);
}

.t-input__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: var(--space-2, 8px);
  font-size: 12px;
  color: var(--color-text-tertiary, #9ca3af);
  background: var(--color-bg-surface-hover, #f3f4f6);
  border-radius: 50%;
  cursor: pointer;
}

.t-input__clear:active {
  background: var(--color-bg-surface-active, #e5e7eb);
}
</style>

<!-- 使用示例 -->
<!--
<template>
  <t-input
    v-model="value"
    placeholder="请输入内容"
    clearable
    prefix-icon="👤"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup>
import { ref } from 'vue'
import TInput from '@/components/uniapp-vue3/form/input.vue'

const value = ref('')

function handleFocus() {
  console.log('获得焦点')
}

function handleBlur() {
  console.log('失去焦点')
}
</script>
-->
