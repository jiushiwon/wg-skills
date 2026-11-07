<template>
  <div
    class="base-checkbox-group"
    :class="[`base-checkbox-group--${size}`]"
  >
    <BaseCheckbox
      v-for="opt in options"
      :key="String(opt.value)"
      :model-value="isSelected(opt.value)"
      :label="opt.label"
      :disabled="disabled || opt.disabled"
      :size="size"
      @change="(checked) => handleToggle(opt.value, checked)"
    >
      <slot name="option" :option="opt">{{ opt.label }}</slot>
    </BaseCheckbox>
  </div>
</template>

<script setup lang="ts">
import BaseCheckbox from './BaseCheckbox.vue'

interface CheckboxOption {
  label: string
  value: unknown
  disabled?: boolean
}

interface BaseCheckboxGroupProps {
  modelValue?: unknown[]
  options?: CheckboxOption[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<BaseCheckboxGroupProps>(), {
  modelValue: () => [],
  options: () => [],
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown[]]
  change: [value: unknown[]]
}>()

function isSelected(value: unknown): boolean {
  return Array.isArray(props.modelValue) && props.modelValue.includes(value)
}

function handleToggle(value: unknown, checked: boolean) {
  const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  if (checked) {
    arr.push(value)
  } else {
    const idx = arr.indexOf(value)
    if (idx > -1) arr.splice(idx, 1)
  }
  emit('update:modelValue', arr)
  emit('change', arr)
}
</script>

<style scoped>
.base-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4, 16px);
}
</style>