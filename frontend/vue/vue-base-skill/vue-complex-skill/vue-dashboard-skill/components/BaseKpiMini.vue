<template>
  <div class="kpi-mini-grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
    <div v-for="item in data" :key="item.label" class="kpi-mini">
      <div class="kpi-mini__label">{{ item.label }}</div>
      <div class="kpi-mini__row">
        <span class="kpi-mini__value">{{ item.value }}</span>
        <span v-if="item.change" class="kpi-mini__change" :class="item.trend === 'up' ? 'kpi-mini__change--up' : 'kpi-mini__change--down'">
          {{ item.trend === 'up' ? '↑' : '↓' }}{{ item.change }}
        </span>
      </div>
      <div v-if="item.bar !== undefined" class="kpi-mini__bar">
        <div class="kpi-mini__bar-fill" :style="{ width: `${item.bar}%`, background: item.color || '#3b82f6' }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  data: Array<{
    label: string
    value: string
    color?: string
    trend?: 'up' | 'down'
    change?: string
    bar?: number
  }>
  columns?: number
}>(), {
  columns: 3,
})
</script>

<style scoped>
.kpi-mini-grid { display: grid; gap: 8px; }
.kpi-mini { padding: 8px 10px; }
.kpi-mini__label { font-size: 11px; color: var(--color-text-secondary, #6b7280); margin-bottom: 2px; }
.kpi-mini__row { display: flex; align-items: baseline; gap: 6px; }
.kpi-mini__value { font-size: 18px; font-weight: 700; color: var(--color-text, #1f2937); line-height: 1.2; }
.kpi-mini__change { font-size: 11px; font-weight: 500; }
.kpi-mini__change--up { color: #10b981; }
.kpi-mini__change--down { color: #ef4444; }
.kpi-mini__bar { height: 3px; background: var(--color-bg-secondary, #f3f4f6); border-radius: 2px; margin-top: 6px; overflow: hidden; }
.kpi-mini__bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
</style>