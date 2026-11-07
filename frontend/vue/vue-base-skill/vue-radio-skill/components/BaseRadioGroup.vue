<template>
  <div
    class="base-radio-group"
    :class="[`base-radio-group--${size}`]"
  >
    <BaseRadio
      v-for="opt in options"
      :key="String(opt.value)"
      :model-value="modelValue"
      :value="opt.value"
      :label="opt.label"
      :disabled="disabled || opt.disabled"
      :size="size"
      @change="(val) => handleSelect(val)"
    >
      <slot name="option" :option="opt">{{ opt.label }}</slot>
    </BaseRadio>
  </div>
</template>

<script setup lang="ts">
import BaseRadio from './BaseRadio.vue'

interface RadioOption {
  label: string
  value: unknown
  disabled?: boolean
}

interface BaseRadioGroupProps {
  modelValue?: unknown
  options?: RadioOption[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<BaseRadioGroupProps>(), {
  options: () => [],
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  change: [value: unknown]
}>()

function handleSelect(val: unknown) {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style scoped>
.base-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4, 16px);
}
</style>