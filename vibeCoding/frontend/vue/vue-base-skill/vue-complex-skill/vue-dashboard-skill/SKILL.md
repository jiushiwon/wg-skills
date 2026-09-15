---
name: vue-dashboard-skill
description: Vue3 高端数据看板技能。6种差异化风格（经典白色、暗色霓虹、极简无框、LED大屏、毛玻璃、紧凑高密），全部卡片容器强制引用 base-card。触发词："Dashboard"、"数据看板"、"仪表盘"、"大屏"。
---

# Vue3 Dashboard Skill

高端数据看板页组件技能，支持 6 种差异化视觉风格，适用于 SaaS 后台、数据中心大屏、实时监控等多种业务场景。

---

## 容器原则（铁律）

> **所有数据卡片必须基于 `base-card` 容器组件。**

`base-card` 提供统一的圆角、阴影、内边距、hover 动效。禁止使用原生 `<div>` 模拟卡片外观。

---

## 组件依赖

| 组件 | 来源 | 用途 |
|------|------|------|
| `base-card` | `vue-base-skill` | 所有卡片容器（KPI/图表/动态/表格/排行） |
| `base-button` | `vue-button-skill` | 操作按钮（刷新/导出） |
| `base-tag` | `vue-tag-skill` | 订单状态标签 |

---

## 6 种风格

| # | 风格 | 核心差异 | 触发词 |
|---|------|----------|--------|
| 1 | **经典白色** | 白底蓝调，标准卡片阴影，斑马纹表格 | `classic`、`经典` |
| 2 | **暗色霓虹** | 深蓝黑底，青色霓虹发光，科技网格 | `dark`、`霓虹` |
| 3 | **极简无框** | 纯白无阴影，极细分割线，大量留白 | `minimal`、`极简` |
| 4 | **LED 大屏** | 深蓝底色，亮蓝强调，超大字号投屏 | `bigscreen`、`大屏` |
| 5 | **毛玻璃** | 暗色渐变底，紫色系，backdrop-filter | `glass`、`毛玻璃` |
| 6 | **紧凑高密** | 浅灰底色，缩小间距字号，最大信息密度 | `compact`、`紧凑` |

---

## 标准 DashboardPage 模板

```vue
<template>
  <div class="dash-page" :class="[`dash-page--${variant}`]">
    <!-- 页头 -->
    <header v-if="showHeader" class="dash-header">
      <div class="dash-header__info">
        <h1 class="dash-header__title">{{ title }}</h1>
        <p class="dash-header__subtitle">{{ subtitle }}</p>
      </div>
      <div class="dash-header__actions">
        <slot name="header-actions">
          <base-button variant="ghost" @click="$emit('refresh')">刷新</base-button>
          <base-button variant="primary" @click="$emit('export')">导出</base-button>
        </slot>
      </div>
    </header>

    <!-- KPI 指标卡 -->
    <div v-if="showKpi" class="dash-kpi-row">
      <base-card
        v-for="kpi in sortedKpis"
        :key="kpi.label"
        class="dash-kpi-card"
        :style="{ '--kpi-color': kpi.color }"
      >
        <div class="dash-kpi-card__icon">{{ kpi.icon }}</div>
        <div class="dash-kpi-card__info">
          <div class="dash-kpi-card__label">{{ kpi.label }}</div>
          <div class="dash-kpi-card__value">{{ kpi.value }}</div>
          <div
            class="dash-kpi-card__trend"
            :class="`dash-kpi-card__trend--${kpi.trend}`"
          >
            {{ kpi.trend === 'up' ? '↑' : '↓' }} {{ kpi.change }}
          </div>
        </div>
        <slot name="kpi-extra" :kpi="kpi" />
      </base-card>
    </div>

    <!-- 中间区域：图表 + 动态 -->
    <div v-if="showChart || showActivity" class="dash-content-grid">
      <base-card v-if="showChart" class="dash-chart-card">
        <div class="dash-chart-card__title">营收趋势（近7天）</div>
        <slot name="chart-custom">
          <div class="dash-chart">
            <div
              v-for="bar in chartBars"
              :key="bar.label"
              class="dash-chart__col"
            >
              <div
                class="dash-chart__bar"
                :style="{ height: bar.height + 'px' }"
              />
              <div class="dash-chart__label">{{ bar.label }}</div>
            </div>
          </div>
        </slot>
      </base-card>

      <base-card v-if="showActivity" class="dash-activity-card">
        <div class="dash-activity-card__title">实时动态</div>
        <slot name="activity-custom">
          <div class="dash-activity-list">
            <div
              v-for="act in activities"
              :key="act.name + act.time"
              class="dash-activity-item"
            >
              <div class="dash-activity-item__avatar">{{ act.avatar }}</div>
              <div class="dash-activity-item__info">
                <div class="dash-activity-item__text">
                  <strong>{{ act.name }}</strong> {{ act.action }}
                </div>
                <div class="dash-activity-item__time">{{ act.time }}</div>
              </div>
            </div>
          </div>
        </slot>
      </base-card>
    </div>

    <!-- 底部区域：订单表 + 排行 -->
    <div v-if="showTable" class="dash-table-grid">
      <base-card class="dash-orders-card">
        <div class="dash-orders-card__title">最近订单</div>
        <slot name="table-custom">
          <table class="dash-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>商品</th>
                <th>客户</th>
                <th>金额</th>
                <th>状态</th>
                <th>日期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td>{{ order.id }}</td>
                <td>{{ order.product }}</td>
                <td>{{ order.customer }}</td>
                <td><strong>{{ order.amount }}</strong></td>
                <td>
                  <base-tag :variant="order.status">
                    {{ statusLabel(order.status) }}
                  </base-tag>
                </td>
                <td>{{ order.date }}</td>
              </tr>
            </tbody>
          </table>
        </slot>
      </base-card>

      <base-card class="dash-top-card">
        <div class="dash-top-card__title">Top 商品</div>
        <div class="dash-top-list">
          <div
            v-for="(item, idx) in topProducts"
            :key="item.name"
            class="dash-top-item"
          >
            <div
              class="dash-top-item__rank"
              :class="idx < 3 ? `dash-top-item__rank--${idx + 1}` : ''"
            >
              {{ idx + 1 }}
            </div>
            <div class="dash-top-item__name">{{ item.name }}</div>
            <div class="dash-top-item__amount">{{ item.amount }}</div>
          </div>
        </div>
      </base-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ---- Types ----
interface KpiItem {
  label: string
  value: string
  trend: 'up' | 'down' | 'flat'
  change: string
  icon: string
  color: string
}

interface ActivityItem {
  avatar: string
  name: string
  action: string
  time: string
}

interface OrderItem {
  id: string
  product: string
  customer: string
  amount: string
  status: 'completed' | 'pending' | 'processing' | 'cancelled'
  date: string
}

// ---- Props ----
const props = withDefaults(defineProps<{
  variant?: string
  title?: string
  subtitle?: string
  kpis?: KpiItem[]
  activities?: ActivityItem[]
  orders?: OrderItem[]
  showHeader?: boolean
  showKpi?: boolean
  showChart?: boolean
  showActivity?: boolean
  showTable?: boolean
  loading?: boolean
}>(), {
  variant: 'classic',
  title: '数据看板',
  subtitle: '实时业务数据概览',
  kpis: () => [],
  activities: () => [],
  orders: () => [],
  showHeader: true,
  showKpi: true,
  showChart: true,
  showActivity: true,
  showTable: true,
  loading: false,
})

// ---- Emits ----
defineEmits<{
  refresh: []
  export: []
}>()

// ---- Computed ----
const sortedKpis = computed(() => props.kpis)

const topProducts = computed(() => {
  return [...props.orders]
    .sort((a, b) => {
      const va = parseFloat(a.amount.replace(/[¥,]/g, ''))
      const vb = parseFloat(b.amount.replace(/[¥,]/g, ''))
      return vb - va
    })
    .slice(0, 5)
    .map((o) => ({ name: o.product, amount: o.amount }))
})

const chartBars = computed(() => {
  const data = [
    { label: '周一', value: 152000 },
    { label: '周二', value: 186000 },
    { label: '周三', value: 145000 },
    { label: '周四', value: 210000 },
    { label: '周五', value: 198000 },
    { label: '周六', value: 235000 },
    { label: '周日', value: 158000 },
  ]
  const max = Math.max(...data.map((d) => d.value))
  return data.map((d) => ({
    label: d.label,
    height: Math.round((d.value / max) * 180),
  }))
})

// ---- Methods ----
const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    completed: '已完成',
    pending: '待处理',
    processing: '处理中',
    cancelled: '已取消',
  }
  return map[status] || status
}
</script>

<style>
/* ================================================
   Base Styles — shared across all variants
   ================================================ */
.dash-page {
  font-family: var(--dash-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  min-height: 100vh;
  padding: var(--dash-spacing-lg, 24px);
  background: var(--dash-bg-primary, #f5f7fa);
  color: var(--dash-text-primary, #1a1a2e);
  display: flex;
  flex-direction: column;
  gap: var(--dash-spacing-lg, 24px);
}

/* ---- Header ---- */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dash-header__title {
  font-size: var(--dash-font-size-2xl, 28px);
  font-weight: 700;
  margin: 0;
}
.dash-header__subtitle {
  font-size: var(--dash-font-size-base, 14px);
  color: var(--dash-text-secondary, #6b7280);
  margin: 4px 0 0;
}
.dash-header__actions {
  display: flex;
  gap: 8px;
}

/* ---- KPI Row ---- */
.dash-kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--dash-spacing-md, 16px);
}
.dash-kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: var(--dash-card-padding, 24px);
  background: var(--dash-bg-card, #fff);
  border-radius: var(--dash-card-radius, 12px);
  box-shadow: var(--dash-card-shadow, 0 1px 2px rgba(0,0,0,0.06));
  transition: box-shadow var(--dash-transition-fast, 0.15s ease);
}
.dash-kpi-card:hover {
  box-shadow: var(--dash-card-shadow-hover, 0 4px 12px rgba(0,0,0,0.1));
}
.dash-kpi-card__icon {
  width: var(--dash-kpi-icon-size, 48px);
  height: var(--dash-kpi-icon-size, 48px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.dash-kpi-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dash-kpi-card__label {
  font-size: var(--dash-font-size-sm, 13px);
  color: var(--dash-text-secondary, #6b7280);
}
.dash-kpi-card__value {
  font-size: var(--dash-font-size-2xl, 28px);
  font-weight: 700;
  line-height: 1.2;
}
.dash-kpi-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}
.dash-kpi-card__trend--up { color: var(--dash-trend-up, #52c41a); }
.dash-kpi-card__trend--down { color: var(--dash-trend-down, #f5222d); }
.dash-kpi-card__trend--flat { color: var(--dash-trend-flat, #9ca3af); }

/* ---- Content Grid ---- */
.dash-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--dash-spacing-lg, 24px);
}

/* ---- Chart Card ---- */
.dash-chart-card {
  background: var(--dash-bg-card, #fff);
  border-radius: var(--dash-card-radius, 12px);
  box-shadow: var(--dash-card-shadow, 0 1px 2px rgba(0,0,0,0.06));
  padding: var(--dash-card-padding, 24px);
}
.dash-chart-card__title {
  font-size: var(--dash-font-size-lg, 16px);
  font-weight: 600;
  margin-bottom: 16px;
}
.dash-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 200px;
  padding: 16px 0;
}
.dash-chart__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 30px;
}
.dash-chart__bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height var(--dash-transition-base, 0.3s ease);
  min-width: 30px;
  background: linear-gradient(to top, var(--dash-accent-blue, #1890ff), #69c0ff);
}
.dash-chart__label {
  font-size: 11px;
  color: var(--dash-text-muted, #9ca3af);
  text-align: center;
  margin-top: 6px;
}

/* ---- Activity Card ---- */
.dash-activity-card {
  background: var(--dash-bg-card, #fff);
  border-radius: var(--dash-card-radius, 12px);
  box-shadow: var(--dash-card-shadow, 0 1px 2px rgba(0,0,0,0.06));
  padding: var(--dash-card-padding, 24px);
}
.dash-activity-card__title {
  font-size: var(--dash-font-size-lg, 16px);
  font-weight: 600;
  margin-bottom: 16px;
}
.dash-activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}
.dash-activity-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--dash-radius-sm, 6px);
  transition: background var(--dash-transition-fast, 0.15s ease);
}
.dash-activity-item:hover {
  background: var(--dash-bg-card-hover, #fafbfc);
}
.dash-activity-item__avatar {
  width: var(--dash-activity-avatar-size, 36px);
  height: var(--dash-activity-avatar-size, 36px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: var(--dash-bg-card-hover, #fafbfc);
  flex-shrink: 0;
}
.dash-activity-item__info {
  flex: 1;
  min-width: 0;
}
.dash-activity-item__text {
  font-size: var(--dash-font-size-base, 14px);
}
.dash-activity-item__time {
  font-size: 11px;
  color: var(--dash-text-muted, #9ca3af);
  margin-top: 2px;
}

/* ---- Table Grid ---- */
.dash-table-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dash-spacing-lg, 24px);
}
.dash-orders-card,
.dash-top-card {
  background: var(--dash-bg-card, #fff);
  border-radius: var(--dash-card-radius, 12px);
  box-shadow: var(--dash-card-shadow, 0 1px 2px rgba(0,0,0,0.06));
  padding: var(--dash-card-padding, 24px);
}
.dash-orders-card__title,
.dash-top-card__title {
  font-size: var(--dash-font-size-lg, 16px);
  font-weight: 600;
  margin-bottom: 16px;
}

/* ---- Table ---- */
.dash-table {
  width: 100%;
  border-collapse: collapse;
}
.dash-table th {
  background: var(--dash-table-header-bg, #fafafa);
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  font-size: var(--dash-font-size-sm, 13px);
  color: var(--dash-text-secondary, #6b7280);
}
.dash-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--dash-table-border, #f0f0f0);
  font-size: var(--dash-font-size-sm, 13px);
}
.dash-table tbody tr {
  height: var(--dash-table-row-height, 48px);
}
.dash-table tbody tr:hover td {
  background: var(--dash-table-row-hover, #f0f5ff);
}

/* ---- Status Tag ---- */
.dash-status-tag {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
.dash-status-tag--completed { background: #f0fdf4; color: #16a34a; }
.dash-status-tag--pending { background: #fefce8; color: #ca8a04; }
.dash-status-tag--processing { background: #eff6ff; color: #2563eb; }
.dash-status-tag--cancelled { background: #fef2f2; color: #dc2626; }

/* ---- Top List ---- */
.dash-top-list {
  display: flex;
  flex-direction: column;
}
.dash-top-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--dash-table-border, #f0f0f0);
}
.dash-top-item:last-child {
  border-bottom: none;
}
.dash-top-item__rank {
  width: var(--dash-top-rank-size, 24px);
  height: var(--dash-top-rank-size, 24px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: #f3f4f6;
  color: #6b7280;
  flex-shrink: 0;
}
.dash-top-item__rank--1 { background: #fef3c7; color: #b45309; }
.dash-top-item__rank--2 { background: #e5e7eb; color: #4b5563; }
.dash-top-item__rank--3 { background: #fed7aa; color: #c2410c; }
.dash-top-item__name {
  flex: 1;
  font-size: var(--dash-font-size-base, 14px);
}
.dash-top-item__amount {
  font-weight: 600;
  font-size: var(--dash-font-size-base, 14px);
}

/* ---- Responsive ---- */
@media (max-width: 1024px) {
  .dash-content-grid { grid-template-columns: 1fr; }
  .dash-table-grid { grid-template-columns: 1fr; }
  .dash-kpi-row { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
}

/* ================================================
   Variant: classic (经典白色)
   ================================================ */
.dash-page--classic {
  --dash-bg-primary: #f5f7fa;
  --dash-bg-card: #fff;
  --dash-text-primary: #1a1a2e;
  --dash-accent-blue: #1890ff;
}
.dash-page--classic .dash-kpi-card {
  border-left: 3px solid var(--kpi-color, #1890ff);
}
.dash-page--classic .dash-table tbody tr:nth-child(even) td {
  background: #fafafa;
}
.dash-page--classic .dash-chart__bar {
  background: linear-gradient(to top, #1890ff, #69c0ff);
}

/* ================================================
   Variant: dark (暗色霓虹)
   ================================================ */
.dash-page--dark {
  --dash-bg-primary: #0a0f1a;
  --dash-bg-card: #111827;
  --dash-bg-card-hover: #1a2332;
  --dash-text-primary: #e2e8f0;
  --dash-text-secondary: #94a3b8;
  --dash-text-muted: #64748b;
  --dash-border-light: #1f2937;
  --dash-table-header-bg: #0d1424;
  --dash-table-row-hover: #1a2332;
  --dash-table-border: #1f2937;
  --dash-accent-neon: #00f0ff;
}
.dash-page--dark {
  background: linear-gradient(135deg, #0a0f1a, #0d1424);
}
.dash-page--dark .dash-kpi-card {
  box-shadow: 0 0 0 1px #1f2937;
  border-left: 3px solid #00f0ff;
}
.dash-page--dark .dash-kpi-card__value {
  color: #00f0ff;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.dash-page--dark .dash-chart__bar {
  background: linear-gradient(to top, #00f0ff, #0080ff);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}
.dash-page--dark .dash-chart-card,
.dash-page--dark .dash-activity-card,
.dash-page--dark .dash-orders-card,
.dash-page--dark .dash-top-card {
  box-shadow: 0 0 0 1px #1f2937;
}
.dash-page--dark::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}
.dash-page--dark > * {
  position: relative;
  z-index: 1;
}

/* ================================================
   Variant: minimal (极简无框)
   ================================================ */
.dash-page--minimal {
  --dash-bg-primary: #fff;
  --dash-bg-card: #fff;
  --dash-text-primary: #111827;
  --dash-card-shadow: none;
  --dash-card-shadow-hover: none;
}
.dash-page--minimal .dash-kpi-card {
  border: none;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  border-radius: 0;
}
.dash-page--minimal .dash-chart-card,
.dash-page--minimal .dash-activity-card,
.dash-page--minimal .dash-orders-card,
.dash-page--minimal .dash-top-card {
  border: none;
  box-shadow: none;
  padding: 24px 0;
}
.dash-page--minimal .dash-table th {
  background: transparent;
  border-bottom: 2px solid #111827;
}
.dash-page--minimal .dash-table td {
  border-color: #f3f4f6;
}
.dash-page--minimal .dash-header__title {
  font-weight: 300;
  font-size: 32px;
  letter-spacing: -0.5px;
}
.dash-page--minimal .dash-chart__bar {
  background: #111827;
  border-radius: 2px 2px 0 0;
}
.dash-page--minimal .dash-status-tag {
  background: transparent;
  border: 1px solid currentColor;
}

/* ================================================
   Variant: bigscreen (LED 大屏)
   ================================================ */
.dash-page--bigscreen {
  --dash-bg-primary: #04143d;
  --dash-bg-card: rgba(4, 30, 80, 0.6);
  --dash-text-primary: #e2e8f0;
  --dash-text-secondary: #8899bb;
  --dash-border-light: rgba(0, 212, 255, 0.15);
  --dash-card-radius: 8px;
  --dash-accent-led: #00d4ff;
  --dash-table-header-bg: rgba(0, 212, 255, 0.05);
  --dash-table-border: rgba(0, 212, 255, 0.08);
}
.dash-page--bigscreen {
  max-width: 1920px;
  margin: 0 auto;
}
.dash-page--bigscreen .dash-kpi-card {
  box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.15);
  background: rgba(0, 30, 80, 0.5);
}
.dash-page--bigscreen .dash-kpi-card__value {
  font-size: 36px;
  color: #00d4ff;
  font-family: var(--dash-mono-family, monospace);
}
.dash-page--bigscreen .dash-kpi-card__label {
  color: #8899bb;
  font-size: 14px;
}
.dash-page--bigscreen .dash-chart__bar {
  background: linear-gradient(to top, #00d4ff, #0066cc);
}
.dash-page--bigscreen .dash-header__title {
  font-size: 28px;
  color: #00d4ff;
  letter-spacing: 2px;
}
.dash-page--bigscreen .dash-table th {
  color: #00d4ff;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}
.dash-page--bigscreen .dash-orders-card,
.dash-page--bigscreen .dash-top-card {
  box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.1);
}
.dash-page--bigscreen .dash-status-tag--completed {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}

/* ================================================
   Variant: glass (毛玻璃)
   ================================================ */
.dash-page--glass {
  --dash-bg-primary: #0f0f23;
  --dash-bg-card: rgba(255, 255, 255, 0.04);
  --dash-text-primary: #e2e8f0;
  --dash-text-secondary: #94a3b8;
  --dash-border-light: rgba(255, 255, 255, 0.08);
}
.dash-page--glass {
  background: linear-gradient(135deg, #0f0f23, #1a1a3e, #0f0f23);
}
.dash-page--glass .dash-kpi-card {
  backdrop-filter: blur(20px);
  box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.12);
}
.dash-page--glass .dash-kpi-card:hover {
  box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.25), 0 0 20px rgba(139, 92, 246, 0.08);
}
.dash-page--glass .dash-kpi-card__value {
  color: #c4b5fd;
}
.dash-page--glass .dash-chart-card,
.dash-page--glass .dash-activity-card,
.dash-page--glass .dash-orders-card,
.dash-page--glass .dash-top-card {
  backdrop-filter: blur(20px);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06);
}
.dash-page--glass .dash-chart__bar {
  background: linear-gradient(to top, #8b5cf6, #a78bfa);
}
.dash-page--glass .dash-table th {
  background: rgba(139, 92, 246, 0.05);
  color: #a78bfa;
  border-bottom-color: rgba(139, 92, 246, 0.15);
}
.dash-page--glass .dash-table td {
  border-color: rgba(255, 255, 255, 0.05);
}
.dash-page--glass .dash-status-tag--completed {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

/* ================================================
   Variant: compact (紧凑高密)
   ================================================ */
.dash-page--compact {
  --dash-bg-primary: #fafafa;
  --dash-bg-card: #fff;
  --dash-spacing-lg: 12px;
  --dash-spacing-md: 8px;
  --dash-card-padding: 12px;
  --dash-card-radius: 8px;
  --dash-font-size-base: 12px;
  --dash-font-size-lg: 14px;
  --dash-kpi-height: 80px;
}
.dash-page--compact .dash-kpi-card {
  padding: 8px 12px;
  min-height: 60px;
}
.dash-page--compact .dash-kpi-card__icon {
  width: 32px;
  height: 32px;
  font-size: 16px;
  border-radius: 6px;
}
.dash-page--compact .dash-kpi-card__value {
  font-size: 18px;
}
.dash-page--compact .dash-kpi-card__label {
  font-size: 11px;
}
.dash-page--compact .dash-table td,
.dash-page--compact .dash-table th {
  padding: 6px 10px;
  font-size: 12px;
}
.dash-page--compact .dash-table tbody tr {
  height: 32px;
}
.dash-page--compact .dash-activity-item {
  padding: 6px 8px;
}
.dash-page--compact .dash-activity-item__avatar {
  width: 24px;
  height: 24px;
  font-size: 12px;
}
.dash-page--compact .dash-activity-item__text {
  font-size: 12px;
}
.dash-page--compact .dash-activity-item__time {
  font-size: 10px;
}
.dash-page--compact .dash-header__title {
  font-size: 16px;
}
.dash-page--compact .dash-chart {
  height: 120px;
}
.dash-page--compact .dash-chart__bar {
  min-width: 20px;
}
</style>
```

---

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `string` | `'classic'` | 风格：classic / dark / minimal / bigscreen / glass / compact |
| `title` | `string` | `'数据看板'` | 页头标题 |
| `subtitle` | `string` | `'实时业务数据概览'` | 页头副标题 |
| `kpis` | `KpiItem[]` | `[]` | KPI 指标数据 |
| `activities` | `ActivityItem[]` | `[]` | 实时动态数据 |
| `orders` | `OrderItem[]` | `[]` | 订单数据 |
| `showHeader` | `boolean` | `true` | 显示页头 |
| `showKpi` | `boolean` | `true` | 显示 KPI 区域 |
| `showChart` | `boolean` | `true` | 显示图表区域 |
| `showActivity` | `boolean` | `true` | 显示动态区域 |
| `showTable` | `boolean` | `true` | 显示表格区域 |
| `loading` | `boolean` | `false` | 加载态 |

---

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `refresh` | 无 | 用户点击刷新按钮 |
| `export` | 无 | 用户点击导出按钮 |

---

## Types

```ts
interface KpiItem {
  label: string        // 指标名称
  value: string        // 指标值（含单位）
  trend: 'up' | 'down' | 'flat'
  change: string       // 变化幅度 "+12.5%"
  icon: string         // emoji 图标
  color: string        // 主题色 hex
}

interface ActivityItem {
  avatar: string       // emoji 或 URL
  name: string         // 用户名
  action: string       // 操作描述
  time: string         // 时间描述
}

interface OrderItem {
  id: string           // 订单号
  product: string      // 商品名
  customer: string     // 客户名
  amount: string       // 金额（含符号）
  status: 'completed' | 'pending' | 'processing' | 'cancelled'
  date: string         // 日期
}
```

---

## Slots

| Slot | 作用域 | 说明 |
|------|--------|------|
| `header-actions` | 无 | 页头操作区（替代默认的刷新/导出按钮） |
| `kpi-extra` | `{ kpi }` | KPI 卡片额外内容 |
| `chart-custom` | 无 | 替代默认的纯 CSS 柱状图（接入 ECharts 等） |
| `activity-custom` | 无 | 替代默认的动态列表 |
| `table-custom` | 无 | 替代默认的订单表格 |

---

## 文件结构

```
vue-dashboard-skill/
├── SKILL.md                          # 本文件
├── README.md                         # 快速入门
├── templates/
│   └── DashboardPage.vue             # 核心组件模板
└── demo-components/
    ├── shared/
    │   ├── tokens.css                # 设计 Token
    │   └── demo.css                  # 共享基础样式
    └── dashboard-page/
        └── html/
            ├── 00-showcase.html      # 6 种风格画廊
            ├── 01-classic.html       # 经典白色
            ├── 02-dark.html          # 暗色霓虹
            ├── 03-minimal.html       # 极简无框
            ├── 04-bigscreen.html     # LED 大屏
            ├── 05-glass.html         # 毛玻璃
            └── 06-compact.html       # 紧凑高密
```

---

## 不做

- 不做实时 WebSocket 推送（mock 数据即可）
- 不做图表库集成（纯 CSS 柱状图，slot 扩展）
- 不做后端 API 对接
- 不做路由配置
- 不做权限控制
- 不做响应式断点之外的布局适配
- 不做数据持久化

---

## 依赖关系图

```
vue-dashboard-skill
├── vue-base-skill ─── base-card
├── vue-button-skill ── base-button
└── vue-tag-skill ───── base-tag
```
