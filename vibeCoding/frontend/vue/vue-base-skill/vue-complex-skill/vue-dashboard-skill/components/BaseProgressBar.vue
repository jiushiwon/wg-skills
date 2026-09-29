<template>
  <div class="progress-bar">
    <div v-if="label || showValue" class="progress-bar__header">
      <span v-if="label" class="progress-bar__label">{{ label }}</span>
      <span v-if="showValue" class="progress-bar__value">{{ displayValue }}</span>
    </div>
    <div class="progress-bar__track" :style="trackStyle">
      <div
        class="progress-bar__fill"
        :class="`progress-bar__fill--${color}`"
        :style="fillStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  max?: number
  label?: string
  showValue?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  height?: number
  animated?: boolean
}>(), {
  max: 100,
  color: 'primary',
  height: 6,
  showValue: true,
  animated: true,
})

const percent = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)))
const displayValue = computed(() => `${Math.round(percent.value)}%`)

const trackStyle = computed(() => ({
  height: `${props.height}px`,
  borderRadius: `${props.height / 2}px`,
}))

const fillStyle = computed(() => ({
  width: `${percent.value}%`,
  borderRadius: `${props.height / 2}px`,
  transition: props.animated ? 'width 0.6s ease' : 'none',
}))
</script>

<style scoped>
.progress-bar { display: flex; flex-direction: column; gap: 6px; }
.progress-bar__header { display: flex; justify-content: space-between; align-items: center; }
.progress-bar__label { font-size: 13px; color: var(--color-text-secondary, #4b5563); }
.progress-bar__value { font-size: 13px; font-weight: 600; color: var(--color-text, #1f2937); }
.progress-bar__track { background: var(--color-bg-secondary, #f3f4f6); overflow: hidden; }
.progress-bar__fill { height: 100%; }
.progress-bar__fill--primary { background: var(--color-primary, #3b82f6); }
.progress-bar__fill--success { background: var(--color-success, #10b981); }
.progress-bar__fill--warning { background: var(--color-warning, #f59e0b); }
.progress-bar__fill--danger  { background: var(--color-danger, #ef4444); }
.progress-bar__fill--info    { background: var(--color-info, #6366f1); }
</style>