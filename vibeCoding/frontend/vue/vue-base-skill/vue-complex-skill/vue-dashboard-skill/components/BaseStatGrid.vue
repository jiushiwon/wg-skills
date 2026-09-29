<template>
  <div class="stat-grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
    <div v-for="item in data" :key="item.label" class="stat-item">
      <div class="stat-item__value" :style="item.color ? { color: item.color } : undefined">{{ item.value }}</div>
      <div class="stat-item__label">{{ item.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  data: Array<{ label: string; value: string; color?: string }>
  columns?: number
}>(), {
  columns: 3,
})
</script>

<style scoped>
.stat-grid { display: grid; gap: 12px; }
.stat-item { text-align: center; padding: 12px 8px; }
.stat-item__value { font-size: 22px; font-weight: 700; color: var(--color-text, #1f2937); line-height: 1.2; }
.stat-item__label { font-size: 12px; color: var(--color-text-secondary, #6b7280); margin-top: 4px; }
</style>