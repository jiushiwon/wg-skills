<template>
  <div class="hbar-list">
    <div v-for="item in data" :key="item.label" class="hbar-item">
      <span class="hbar-item__label">{{ item.label }}</span>
      <div class="hbar-item__bar">
        <div
          class="hbar-item__fill"
          :style="{ width: `${(item.value / maxVal) * 100}%`, background: item.color || defaultColor }"
        >
          <span v-if="showInnerValue" class="hbar-item__inner">{{ formatValue(item.value) }}</span>
        </div>
      </div>
      <span v-if="showValue" class="hbar-item__val">{{ formatValue(item.value) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface HBarItem {
  label: string
  value: number
  color?: string
}

const props = withDefaults(defineProps<{
  data: HBarItem[]
  max?: number
  showValue?: boolean
  showInnerValue?: boolean
  defaultColor?: string
  formatter?: (v: number) => string
}>(), {
  showValue: true,
  showInnerValue: false,
  defaultColor: '#3b82f6',
})

const maxVal = computed(() => props.max ?? Math.max(...props.data.map(d => d.value), 1))

const formatValue = (v: number) => props.formatter ? props.formatter(v) : String(v)
</script>

<style scoped>
.hbar-list { display: flex; flex-direction: column; gap: 10px; }
.hbar-item { display: flex; align-items: center; gap: 10px; }
.hbar-item__label { font-size: 13px; color: var(--color-text-secondary, #4b5563); width: 72px; flex-shrink: 0; text-align: right; }
.hbar-item__bar { flex: 1; height: 20px; background: var(--color-bg-secondary, #f3f4f6); border-radius: 4px; overflow: hidden; }
.hbar-item__fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding: 0 8px; transition: width 0.6s ease; min-width: 2px; }
.hbar-item__inner { font-size: 11px; color: #fff; font-weight: 600; white-space: nowrap; }
.hbar-item__val { font-size: 13px; font-weight: 600; color: var(--color-text, #1f2937); width: 60px; text-align: right; flex-shrink: 0; }
</style>