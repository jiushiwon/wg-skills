<script setup lang="ts">
interface BaseSwitchProps {
  modelValue?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<BaseSwitchProps>(), {
  modelValue: false,
  disabled: false,
  loading: false,
  size: 'md',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [value: boolean];
}>();

function toggle() {
  if (props.disabled || props.loading) return;
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
}
</script>

<template>
  <div
    class="base-switch"
    :class="[
      `base-switch--${size}`,
      {
        'base-switch--on': modelValue,
        'base-switch--disabled': disabled || loading,
        'base-switch--loading': loading,
      },
    ]"
    role="switch"
    :aria-checked="modelValue"
    :aria-disabled="disabled || loading"
    tabindex="0"
    @click="toggle"
    @keydown.enter="toggle"
    @keydown.space.prevent="toggle"
  >
    <span class="base-switch__track">
      <span class="base-switch__thumb">
        <span v-if="loading" class="base-switch__spinner" />
      </span>
    </span>
  </div>
</template>

<style scoped>
.base-switch {
  display: inline-flex;
  align-items: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  outline: none;
  user-select: none;
}

.base-switch:focus-visible .base-switch__track {
  box-shadow: 0 0 0 3px var(--color-primary-light, rgba(64, 158, 255, 0.3));
}

.base-switch--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-switch--loading {
  cursor: wait;
}

.base-switch__track {
  display: flex;
  align-items: center;
  border-radius: var(--radius-full, 999px);
  background: var(--color-bg-secondary, #f0f2f5);
  border: 2px solid var(--color-border, #dcdfe6);
  transition: background 0.2s, border-color 0.2s;
  position: relative;
}

.base-switch--on .base-switch__track {
  background: var(--color-primary, #409eff);
  border-color: var(--color-primary, #409eff);
}

.base-switch__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-white, #fff);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.base-switch--on .base-switch__thumb {
  transform: translateX(100%);
}

.base-switch--sm .base-switch__track {
  width: 36px;
  height: 20px;
}

.base-switch--sm .base-switch__thumb {
  width: 16px;
  height: 16px;
  margin: 2px;
}

.base-switch--md .base-switch__track {
  width: 44px;
  height: 24px;
}

.base-switch--md .base-switch__thumb {
  width: 20px;
  height: 20px;
  margin: 2px;
}

.base-switch--lg .base-switch__track {
  width: 52px;
  height: 28px;
}

.base-switch--lg .base-switch__thumb {
  width: 24px;
  height: 24px;
  margin: 2px;
}

.base-switch__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border, #dcdfe6);
  border-top-color: var(--color-primary, #409eff);
  border-radius: 50%;
  animation: base-switch-spin 0.6s linear infinite;
}

@keyframes base-switch-spin {
  to { transform: rotate(360deg); }
}
</style>