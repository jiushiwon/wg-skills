<template>
  <div
    class="base-textarea"
    :class="[`base-textarea--${size}`, { 'base-textarea--disabled': disabled }]"
  >
    <div
      class="base-textarea__inner"
      role="textbox"
      data-multiline="true"
      :aria-disabled="disabled"
      :contenteditable="!disabled && !readonly ? 'true' : 'false'"
      :data-placeholder="placeholder"
      :style="{ minHeight: `${rows * 1.6}em` }"
      @blur="onBlur"
      @input="onInput"
    >{{ internal }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BaseTextareaProps } from '../types'

const props = withDefaults(defineProps<BaseTextareaProps>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  rows: 4,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const internal = ref(String(props.modelValue ?? ''))

watch(
  () => props.modelValue,
  (v) => {
    const next = String(v ?? '')
    if (next !== internal.value) internal.value = next
  }
)

function onInput(e: Event): void {
  const text = (e.target as HTMLElement).innerText ?? ''
  const trimmed = props.maxlength ? text.slice(0, props.maxlength) : text
  internal.value = trimmed
  emit('update:modelValue', trimmed)
}

function onBlur(): void {
  emit('change', internal.value)
}
</script>

<style scoped>
.base-textarea {
  display: block;
  width: 100%;
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 4px);
  background: var(--color-surface, #fff);
  transition: border-color var(--transition-fast, 0.15s), box-shadow var(--transition-fast, 0.15s);
  box-sizing: border-box;
}

.base-textarea:hover:not(.base-textarea--disabled) {
  border-color: var(--color-primary, #409eff);
}

.base-textarea__inner {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  outline: none;
  font-size: var(--font-size-base, 14px);
  color: var(--color-text, #303133);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.base-textarea__inner:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-placeholder, #c0c4cc);
}

.base-textarea:focus-within {
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 3px var(--color-primary-light, #ecf5ff);
}

.base-textarea--disabled {
  background: var(--color-background, #f5f7fa);
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
