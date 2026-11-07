<template>
  <div class="sparkline" :style="{ width: `${width}px`, height: `${height}px` }">
    <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="strokeColor" stop-opacity="0.3" />
          <stop offset="100%" :stop-color="strokeColor" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path v-if="area" :d="areaPath" :fill="`url(#${gradientId})`" />
      <path :d="linePath" fill="none" :stroke="strokeColor" :stroke-width="strokeWidth" stroke-linejoin="round" stroke-linecap="round" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data: number[]
  width?: number
  height?: number
  strokeWidth?: number
  color?: string
  area?: boolean
}>(), {
  width: 120,
  height: 32,
  strokeWidth: 1.5,
  color: '#3b82f6',
  area: true,
})

const strokeColor = computed(() => props.color)
const gradientId = computed(() => `sparkline-grad-${Math.random().toString(36).slice(2, 8)}`)

const points = computed(() => {
  const { data, width, height } = props
  if (!data.length) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = props.strokeWidth
  const w = width - padding * 2
  const h = height - padding * 2
  return data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * w
    const y = padding + h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
})

const linePath = computed(() => {
  const pts = points.value.split(' ')
  if (pts.length < 2) return ''
  return `M${pts.join(' L')}`
})

const areaPath = computed(() => {
  const pts = points.value.split(' ')
  if (pts.length < 2) return ''
  const { width, height, strokeWidth: sw } = props
  return `M${pts[0]} L${pts.join(' L')} L${width - sw},${height} L${sw},${height} Z`
})
</script>

<style scoped>
.sparkline { display: inline-block; line-height: 0; }
.sparkline svg { width: 100%; height: 100%; }
</style>