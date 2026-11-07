<template>
  <div class="compare-list">
    <div v-for="item in data" :key="item.name" class="compare-item">
      <div class="compare-item__name">{{ item.name }}</div>
      <div class="compare-item__bars">
        <div class="compare-item__bar compare-item__bar--this" :style="{ width: `${(item.current / maxVal) * 100}%` }">
          <span class="compare-item__bar-label">{{ formatValue(item.current) }}</span>
        </div>
        <div class="compare-item__bar compare-item__bar--last" :style="{ width: `${(item.previous / maxVal) * 100}%` }">
          <span class="compare-item__bar-label">{{ formatValue(item.previous) }}</span>
        </div>
      </div>
      <div
        class="compare-item__change"
        :class="changePercent(item) >= 0 ? 'compare-item__change--up' : 'compare-item__change--down'"
      >
        {{ changePercent(item) >= 0 ? '+' : '' }}{{ changePercent(item).toFixed(1) }}%
      </div>
    </div>
    <div v-if="showLegend" class="compare-legend">
      <span class="compare-legend__item"><span class="compare-legend__dot compare-legend__dot--this" /> {{ currentLabel }}</span>
      <span class="compare-legend__item"><span class="compare-legend__dot compare-legend__dot--last" /> {{ previousLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CompareItem {
  name: string
  current: number
  previous: number
}

const props = withDefaults(defineProps<{
  data: CompareItem[]
  max?: number
  showLegend?: boolean
  currentLabel?: string
  previousLabel?: string
  formatter?: (v: number) => string
}>(), {
  showLegend: true,
  currentLabel: '本期',
  previousLabel: '上期',
})

const maxVal = computed(() => props.max ?? Math.max(...props.data.flatMap(d => [d.current, d.previous]), 1))

const changePercent = (item: CompareItem) => {
  if (!item.previous) return 0
  return ((item.current - item.previous) / item.previous) * 100
}

const formatValue = (v: number) => props.formatter ? props.formatter(v) : String(v)
</script>

<style scoped>
.compare-list { display: flex; flex-direction: column; gap: 12px; }
.compare-item { display: flex; align-items: center; gap: 12px; }
.compare-item__name { font-size: 13px; color: var(--color-text-secondary, #4b5563); width: 72px; flex-shrink: 0; text-align: right; }
.compare-item__bars { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.compare-item__bar { height: 14px; border-radius: 3px; display: flex; align-items: center; padding: 0 6px; transition: width 0.6s ease; min-width: 2px; }
.compare-item__bar--this { background: var(--color-primary, #3b82f6); }
.compare-item__bar--last { background: var(--color-bg-secondary, #e5e7eb); }
.compare-item__bar-label { font-size: 10px; color: #fff; white-space: nowrap; }
.compare-item__bar--last .compare-item__bar-label { color: var(--color-text-secondary, #6b7280); }
.compare-item__change { font-size: 12px; font-weight: 600; width: 56px; text-align: right; flex-shrink: 0; }
.compare-item__change--up { color: var(--color-success, #10b981); }
.compare-item__change--down { color: var(--color-danger, #ef4444); }
.compare-legend { display: flex; gap: 16px; margin-top: 4px; justify-content: flex-end; }
.compare-legend__item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-text-tertiary, #9ca3af); }
.compare-legend__dot { width: 8px; height: 8px; border-radius: 2px; }
.compare-legend__dot--this { background: var(--color-primary, #3b82f6); }
.compare-legend__dot--last { background: var(--color-bg-secondary, #e5e7eb); }
</style>