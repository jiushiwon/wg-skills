<template>
  <div
    class="base-radio"
    :class="[
      `base-radio--${size}`,
      {
        'base-radio--checked': isChecked,
        'base-radio--disabled': disabled,
      },
    ]"
  >
    <div class="base-radio__input">
      <div
        class="base-radio__circle"
        :class="{
          'base-radio__circle--checked': isChecked,
          'is-disabled': disabled,
        }"
        role="radio"
        :aria-checked="isChecked"
        :aria-disabled="disabled"
        tabindex="0"
        @click="handleSelect"
        @keydown.enter="handleSelect"
        @keydown.space.prevent="handleSelect"
      >
        <span v-if="isChecked" class="base-radio__dot" />
      </div>
    </div>
    <div v-if="hasLabelSlot || label" class="base-radio__label" @click="handleSelect">
      <slot>{{ label }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface BaseRadioProps {
  modelValue?: unknown
  label?: string
  value?: unknown
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<BaseRadioProps>(), {
  label: '',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  change: [value: unknown]
}>()

const slots = useSlots()
const hasLabelSlot = computed(() => !!slots.default)

const isChecked = computed(() => props.modelValue === props.value)

function handleSelect() {
  if (props.disabled || isChecked.value) return
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>

<style scoped>
.base-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  cursor: pointer;
  user-select: none;
}

.base-radio--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-radio__input {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.base-radio__circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-border, #d9d9d9);
  border-radius: var(--radius-full, 9999px);
  background: var(--color-bg, #ffffff);
  transition: border-color var(--transition-fast, 0.15s);
  cursor: pointer;
  outline: none;
}

.base-radio__circle:focus-visible {
  box-shadow: 0 0 0 3px var(--color-primary-light, rgba(24, 144, 255, 0.2));
}

.base-radio__circle.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-radio__circle--checked {
  border-color: var(--color-primary, #1890ff);
}

.base-radio__dot {
  display: inline-block;
  border-radius: var(--radius-full, 9999px);
  background: var(--color-primary, #1890ff);
}

.base-radio--sm .base-radio__circle {
  width: 16px;
  height: 16px;
}
.base-radio--sm .base-radio__dot {
  width: 6px;
  height: 6px;
}

.base-radio--md .base-radio__circle {
  width: 18px;
  height: 18px;
}
.base-radio--md .base-radio__dot {
  width: 8px;
  height: 8px;
}

.base-radio--lg .base-radio__circle {
  width: 20px;
  height: 20px;
}
.base-radio--lg .base-radio__dot {
  width: 10px;
  height: 10px;
}

.base-radio__label {
  font-size: var(--font-size-base, 14px);
  color: var(--color-text, #333333);
  cursor: pointer;
}

.base-radio--sm .base-radio__label {
  font-size: var(--font-size-sm, 12px);
}
.base-radio--lg .base-radio__label {
  font-size: var(--font-size-lg, 16px);
}

.base-radio--disabled .base-radio__label {
  cursor: not-allowed;
}
</style>