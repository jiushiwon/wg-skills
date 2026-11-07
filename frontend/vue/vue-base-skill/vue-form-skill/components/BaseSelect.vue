<template>
  <div
    class="base-select"
    :class="[
      `base-select--${size}`,
      { 'base-select--open': open, 'base-select--disabled': disabled },
    ]"
    tabindex="0"
    @click="toggle"
    @blur="onBlur"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
  >
    <span class="base-select__label" :class="{ 'is-placeholder': !labelText }">
      {{ labelText || placeholder }}
    </span>
    <span class="base-select__arrow" :class="{ 'is-open': open }" />

    <ul v-if="open" class="base-select__panel" role="listbox">
      <li
        v-for="opt in options"
        :key="String(opt.value)"
        class="base-select__option"
        :class="{ 'is-active': opt.value === modelValue }"
        role="option"
        :aria-selected="opt.value === modelValue"
        tabindex="0"
        @mousedown.prevent="select(opt.value)"
      >
        {{ opt.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BaseSelectOption, BaseSelectProps } from '../types'

const props = withDefaults(defineProps<BaseSelectProps>(), {
  modelValue: null,
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  change: [value: unknown]
}>()

const open = ref(false)

const labelText = computed(() => {
  const found = props.options.find((o) => o.value === props.modelValue)
  return found?.label ?? ''
})

function toggle(): void {
  if (props.disabled) return
  open.value = !open.value
}

function select(v: unknown): void {
  emit('update:modelValue', v)
  emit('change', v)
  open.value = false
}

function onBlur(): void {
  setTimeout(() => (open.value = false), 150)
}
</script>

<style scoped>
.base-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 120px;
  padding: 0 var(--space-3, 12px);
  border: 1px solid var(--color-border, #dcdfe6);
  border-radius: var(--radius-md, 4px);
  background: var(--color-surface, #fff);
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: all var(--transition-fast, 0.15s);
  box-sizing: border-box;
}

.base-select:hover:not(.base-select--disabled),
.base-select:focus-visible {
  border-color: var(--color-primary, #409eff);
}

.base-select--sm { height: var(--height-input-sm, 28px); font-size: var(--font-size-sm, 14px); }
.base-select--md { height: var(--height-input-md, 36px); font-size: var(--font-size-base, 14px); }
.base-select--lg { height: var(--height-input-lg, 44px); font-size: var(--font-size-base, 16px); }

.base-select__label {
  flex: 1;
  color: var(--color-text, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.base-select__label.is-placeholder { color: var(--color-text-placeholder, #c0c4cc); }

.base-select__arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  margin-left: var(--space-2, 8px);
  transition: transform var(--transition-fast, 0.15s);
  opacity: 0.6;
}
.base-select__arrow.is-open { transform: rotate(180deg); }

.base-select__panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: var(--space-1, 4px) 0;
  list-style: none;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #ebeef5);
  border-radius: var(--radius-md, 4px);
  box-shadow: var(--shadow-lg, 0 4px 12px rgba(0,0,0,0.12));
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.base-select__option {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  cursor: pointer;
  transition: background-color var(--transition-fast, 0.15s);
}
.base-select__option:hover { background: var(--color-background, #f5f7fa); }
.base-select__option.is-active {
  background: var(--color-primary-light, #ecf5ff);
  color: var(--color-primary, #409eff);
  font-weight: 600;
}

.base-select--disabled {
  background: var(--color-background, #f5f7fa);
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
