<template>
  <div
    class="base-input"
    :class="[`base-input--${size}`, { 'base-input--disabled': disabled, 'base-input--error': error }]"
  >
    <span v-if="$slots.prefix" class="base-input__prefix">
      <slot name="prefix" />
    </span>
    <div
      class="base-input__inner"
      role="textbox"
      :aria-disabled="disabled"
      :aria-readonly="readonly"
      :contenteditable="!disabled && !readonly ? 'true' : 'false'"
      :data-placeholder="placeholder"
      @blur="onBlur"
      @keydown.enter.prevent="onEnter"
      @input="onInput"
    >{{ displayValue }}</div>
    <span v-if="$slots.suffix" class="base-input__suffix">
      <slot name="suffix" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BaseInputProps } from '../types'

const props = withDefaults(defineProps<BaseInputProps>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  blur: [value: string]
}>()

const internal = ref(String(props.modelValue ?? ''))

watch(
  () => props.modelValue,
  (v) => {
    const next = String(v ?? '')
    if (next !== internal.value) internal.value = next
  }
)

const displayValue = computed(() => internal.value)

function onInput(e: Event): void {
  const text = (e.target as HTMLElement).innerText ?? ''
  const trimmed = props.maxlength ? text.slice(0, props.maxlength) : text
  internal.value = trimmed
  emit('update:modelValue', trimmed)
}

function onBlur(): void {
  emit('change', internal.value)
  emit('blur', internal.value)
}

function onEnter(): void {
  ;(document.activeElement as HTMLElement)?.blur()
}
</script>

<style scoped>
.base-input {
  display: inline-flex;
  align-items: center;
  width: 100%;
  padding: 0 var(--space-3, 12px);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 4px);
  background: var(--color-surface, #fff);
  transition: border-color var(--transition-fast, 0.15s), box-shadow var(--transition-fast, 0.15s);
  box-sizing: border-box;
}

.base-input:hover:not(.base-input--disabled) {
  border-color: var(--color-primary, #409eff);
}

.base-input__inner {
  flex: 1;
  min-width: 0;
  outline: none;
  border: none;
  background: transparent;
  font-size: var(--font-size-base, 14px);
  color: var(--color-text, #303133);
  line-height: 1.5;
  padding: 0;
  min-height: var(--height-input-md, 36px);
  cursor: text;
}

.base-input__inner:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-placeholder, #c0c4cc);
}

.base-input--sm .base-input__inner { min-height: var(--height-input-sm, 28px); font-size: var(--font-size-sm, 14px); }
.base-input--lg .base-input__inner { min-height: var(--height-input-lg, 44px); font-size: var(--font-size-base, 16px); }

.base-input:focus-within {
  border-color: var(--color-primary, #409eff);
  box-shadow: 0 0 0 3px var(--color-primary-light, #ecf5ff);
}

.base-input--disabled {
  background: var(--color-background, #f5f7fa);
  cursor: not-allowed;
  opacity: 0.7;
}

.base-input--error {
  border-color: var(--color-danger, #f56c6c);
}
.base-input--error:focus-within {
  box-shadow: 0 0 0 3px var(--color-danger-light, #fef0f0);
}

.base-input__prefix,
.base-input__suffix {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-placeholder, #909399);
}
.base-input__prefix { margin-right: var(--space-2, 8px); }
.base-input__suffix { margin-left: var(--space-2, 8px); }
</style>
