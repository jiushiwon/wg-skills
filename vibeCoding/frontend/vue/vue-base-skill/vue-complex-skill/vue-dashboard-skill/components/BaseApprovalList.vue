<template>
  <div class="approval-list">
    <div v-for="item in data" :key="item.title" class="approval-item">
      <span class="approval-item__badge" :style="{ background: item.color || '#3b82f6' }" />
      <div class="approval-item__info">
        <div class="approval-item__title">{{ item.title }}</div>
        <div class="approval-item__meta">{{ item.meta }}</div>
      </div>
      <div v-if="item.amount" class="approval-item__amount">{{ item.amount }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: Array<{
    title: string
    meta: string
    amount?: string
    color?: string
  }>
}>()
</script>

<style scoped>
.approval-list { display: flex; flex-direction: column; gap: 8px; }
.approval-item {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border: 1px solid var(--color-border-light, #f3f4f6); border-radius: 8px;
  transition: border-color 0.2s ease;
}
.approval-item:hover { border-color: var(--color-primary, #3b82f6); }
.approval-item__badge { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.approval-item__info { flex: 1; min-width: 0; }
.approval-item__title { font-size: 14px; font-weight: 500; color: var(--color-text, #1f2937); }
.approval-item__meta { font-size: 12px; color: var(--color-text-tertiary, #9ca3af); margin-top: 2px; }
.approval-item__amount { font-size: 14px; font-weight: 600; color: var(--color-text, #1f2937); flex-shrink: 0; }
</style>