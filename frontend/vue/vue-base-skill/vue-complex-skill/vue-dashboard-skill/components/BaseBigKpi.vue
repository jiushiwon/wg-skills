<template>
  <div class="big-kpi-list">
    <div v-for="item in data" :key="item.label" class="big-kpi">
      <div class="big-kpi__label">{{ item.label }}</div>
      <div class="big-kpi__value" :style="item.color ? { color: item.color } : undefined">{{ item.value }}</div>
      <div v-if="item.change" class="big-kpi__sub" :class="item.trend === 'up' ? 'big-kpi__sub--up' : 'big-kpi__sub--down'">
        {{ item.trend === 'up' ? '↑' : '↓' }} {{ item.change }}
      </div>
      <div v-if="item.bar !== undefined" class="big-kpi__bar">
        <div class="big-kpi__bar-fill" :style="{ width: `${item.bar}%`, background: item.color || '#00d4ff' }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: Array<{
    label: string
    value: string
    color?: string
    trend?: 'up' | 'down'
    change?: string
    bar?: number
  }>
}>()
</script>

<style scoped>
.big-kpi-list { display: flex; flex-direction: column; gap: 12px; }
.big-kpi { padding: 16px; }
.big-kpi__label { font-size: 12px; color: var(--color-text-secondary, #8899bb); margin-bottom: 6px; }
.big-kpi__value {
  font-size: 28px; font-weight: 700; font-family: var(--dash-mono-family, monospace);
  color: #00d4ff; text-shadow: 0 0 8px rgba(0,212,255,0.3); line-height: 1.2;
}
.big-kpi__sub { font-size: 12px; margin-top: 4px; }
.big-kpi__sub--up { color: #52c41a; }
.big-kpi__sub--down { color: #f5222d; }
.big-kpi__bar { height: 4px; background: rgba(0,212,255,0.1); border-radius: 2px; margin-top: 8px; overflow: hidden; }
.big-kpi__bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
</style>