<template>
  <div
    class="base-checkbox"
    :class="[
      `base-checkbox--${size}`,
      {
        'base-checkbox--checked': isChecked,
        'base-checkbox--disabled': disabled,
        'base-checkbox--indeterminate': indeterminate,
      },
    ]"
  >
    <div class="base-checkbox__input">
      <div
        class="base-checkbox__box"
        :class="{
          'base-checkbox__box--checked': isChecked,
          'base-checkbox__box--indeterminate': indeterminate,
          'is-disabled': disabled,
        }"
        role="checkbox"
        :aria-checked="indeterminate ? 'mixed' : isChecked"
        :aria-disabled="disabled"
        tabindex="0"
        @click="handleToggle"
        @keydown.enter="handleToggle"
        @keydown.space.prevent="handleToggle"
      >
        <svg
          v-if="indeterminate"
          class="base-checkbox__icon"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <line x1="3" y1="8" x2="13" y2="8" />
        </svg>
        <svg
          v-else-if="isChecked"
          class="base-checkbox__icon"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="3 8 7 12 13 4" />
        </svg>
      </div>
    </div>
    <div v-if="hasLabelSlot || label" class="base-checkbox__label" @click="handleToggle">
      <slot>{{ label }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface BaseCheckboxProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  indeterminate?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<BaseCheckboxProps>(), {
  modelValue: false,
  label: '',
  disabled: false,
  indeterminate: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const slots = useSlots()
const hasLabelSlot = computed(() => !!slots.default)

const isChecked = computed(() => !!props.modelValue)

function handleToggle() {
  if (props.disabled) return
  const checked = !isChecked.value
  emit('update:modelValue', checked)
  emit('change', checked)
}
</script>

<style scoped>
.base-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  cursor: pointer;
  user-select: none;
}

.base-checkbox--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-checkbox__input {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.base-checkbox__box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-border, #d9d9d9);
  border-radius: var(--radius-sm, 2px);
  background: var(--color-bg, #ffffff);
  transition: border-color var(--transition-fast, 0.15s), background var(--transition-fast, 0.15s);
  cursor: pointer;
  outline: none;
}

.base-checkbox__box:focus-visible {
  box-shadow: 0 0 0 3px var(--color-primary-light, rgba(24, 144, 255, 0.2));
}

.base-checkbox__box.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-checkbox__box--checked,
.base-checkbox__box--indeterminate {
  border-color: var(--color-primary, #1890ff);
  background: var(--color-primary, #1890ff);
}

.base-checkbox__icon {
  width: 70%;
  height: 70%;
  color: var(--color-text-inverse, #ffffff);
  pointer-events: none;
}

.base-checkbox--sm .base-checkbox__box {
  width: 16px;
  height: 16px;
}
.base-checkbox--md .base-checkbox__box {
  width: 18px;
  height: 18px;
}
.base-checkbox--lg .base-checkbox__box {
  width: 20px;
  height: 20px;
}

.base-checkbox__label {
  font-size: var(--font-size-base, 14px);
  color: var(--color-text, #333333);
  cursor: pointer;
}

.base-checkbox--sm .base-checkbox__label {
  font-size: var(--font-size-sm, 12px);
}
.base-checkbox--lg .base-checkbox__label {
  font-size: var(--font-size-lg, 16px);
}

.base-checkbox--disabled .base-checkbox__label {
  cursor: not-allowed;
}
</style>