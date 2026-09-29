<template>
  <div class="dash-page" :class="[`dash-page--${variant}`, `dash-page--${layout}`]">
    <!-- 页头（通用 slot，两种布局共用） -->
    <template #header-block>
      <div v-if="showHeader" role="banner" class="dash-header">
        <div>
          <div class="dash-header__title">{{ title }}</div>
          <div class="dash-header__subtitle">{{ subtitle }}</div>
        </div>
        <div class="dash-header__actions">
          <slot name="header-actions">
            <div class="dash-header__btn" @click="$emit('refresh')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:-2px"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> 刷新
            </div>
            <div class="dash-header__btn dash-header__btn--primary" @click="$emit('export')">导出</div>
          </slot>
        </div>
      </div>
    </template>

    <!-- ============================================================ -->
    <!-- Layout: default — header → kpi → content-grid → table-grid  -->
    <!-- ============================================================ -->
    <template v-if="layout === 'default'">
      <slot name="header-block" />
      <div v-if="showKpi" class="dash-kpi-row">
        <base-card v-for="kpi in sortedKpis" :key="kpi.label" class="dash-kpi-card">
          <div class="dash-kpi-card__icon" :style="{ background: kpi.color + '15', color: kpi.color }">{{ kpi.icon }}</div>
          <div class="dash-kpi-card__info">
            <div class="dash-kpi-card__label">{{ kpi.label }}</div>
            <div class="dash-kpi-card__value">{{ kpi.value }}</div>
            <div class="dash-kpi-card__trend" :class="`dash-kpi-card__trend--${kpi.trend}`">{{ kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→' }} {{ kpi.change }}</div>
          </div>
          <slot name="kpi-extra" :kpi="kpi" />
        </base-card>
      </div>
      <div v-if="showChart || showActivity" class="dash-content-grid">
        <base-card v-if="showChart" class="dash-chart-card">
          <div class="dash-chart-card__title">营收趋势（近7天）</div>
          <slot name="chart-custom">
            <div class="dash-chart">
              <div v-for="bar in chartBars" :key="bar.label" class="dash-chart__col">
                <div class="dash-chart__bar" :style="{ height: bar.height + 'px' }" />
                <div class="dash-chart__label">{{ bar.label }}</div>
              </div>
            </div>
          </slot>
        </base-card>
        <base-card v-if="showActivity" class="dash-activity-card">
          <div class="dash-activity-card__title">实时动态</div>
          <slot name="activity-custom">
            <div class="dash-activity-list">
              <div v-for="act in activities" :key="act.name + act.time" class="dash-activity-item">
                <div class="dash-activity-item__avatar">{{ act.avatar }}</div>
                <div class="dash-activity-item__info">
                  <div class="dash-activity-item__text"><strong>{{ act.name }}</strong> {{ act.action }}</div>
                  <div class="dash-activity-item__time">{{ act.time }}</div>
                </div>
              </div>
            </div>
          </slot>
        </base-card>
      </div>
      <div v-if="showTable" class="dash-table-grid">
        <base-card class="dash-orders-card">
          <div class="dash-orders-card__title">最近订单</div>
          <slot name="table-custom">
            <div class="dash-table" role="table">
              <div class="dash-table__head" role="rowgroup">
                <div class="dash-table__row dash-table__row--header" role="row">
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">订单号</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">商品</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">客户</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">金额</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">状态</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">日期</div>
                </div>
              </div>
              <div class="dash-table__body" role="rowgroup">
                <div v-for="order in orders" :key="order.id" class="dash-table__row" role="row">
                  <div class="dash-table__cell" role="cell">{{ order.id }}</div>
                  <div class="dash-table__cell" role="cell">{{ order.product }}</div>
                  <div class="dash-table__cell" role="cell">{{ order.customer }}</div>
                  <div class="dash-table__cell" role="cell"><strong>{{ order.amount }}</strong></div>
                  <div class="dash-table__cell" role="cell"><span class="dash-status-tag" :class="`dash-status-tag--${order.status}`">{{ statusLabel(order.status) }}</span></div>
                  <div class="dash-table__cell" role="cell">{{ order.date }}</div>
                </div>
              </div>
            </div>
          </slot>
        </base-card>
        <base-card class="dash-top-card">
          <div class="dash-top-card__title">Top 商品</div>
          <div class="dash-top-list">
            <div v-for="(item, idx) in topProducts" :key="item.name" class="dash-top-item">
              <div class="dash-top-item__rank" :class="idx < 3 ? `dash-top-item__rank--${idx + 1}` : ''">{{ idx + 1 }}</div>
              <div class="dash-top-item__name">{{ item.name }}</div>
              <div class="dash-top-item__amount">{{ item.amount }}</div>
            </div>
          </div>
        </base-card>
      </div>
    </template>

    <!-- ============================================================ -->
    <!-- Layout: panels — KPI 通栏 + 左右双面板                       -->
    <!-- ============================================================ -->
    <template v-if="layout === 'panels'">
      <slot name="header-block" />
      <div v-if="showKpi" class="dash-kpi-row">
        <base-card v-for="kpi in sortedKpis" :key="kpi.label" class="dash-kpi-card">
          <div class="dash-kpi-card__icon" :style="{ background: kpi.color + '15', color: kpi.color }">{{ kpi.icon }}</div>
          <div class="dash-kpi-card__info">
            <div class="dash-kpi-card__label">{{ kpi.label }}</div>
            <div class="dash-kpi-card__value">{{ kpi.value }}</div>
            <div class="dash-kpi-card__trend" :class="`dash-kpi-card__trend--${kpi.trend}`">{{ kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→' }} {{ kpi.change }}</div>
          </div>
          <slot name="kpi-extra" :kpi="kpi" />
        </base-card>
      </div>
      <div class="dash-panels">
        <div class="dash-panel dash-panel--left">
          <base-card v-if="showChart" class="dash-chart-card">
            <div class="dash-chart-card__title">营收趋势（近7天）</div>
            <slot name="chart-custom">
              <div class="dash-chart">
                <div v-for="bar in chartBars" :key="bar.label" class="dash-chart__col">
                  <div class="dash-chart__bar" :style="{ height: bar.height + 'px' }" />
                  <div class="dash-chart__label">{{ bar.label }}</div>
                </div>
              </div>
            </slot>
          </base-card>
          <base-card v-if="showActivity" class="dash-activity-card">
            <div class="dash-activity-card__title">实时动态</div>
            <slot name="activity-custom">
              <div class="dash-activity-list">
                <div v-for="act in activities" :key="act.name + act.time" class="dash-activity-item">
                  <div class="dash-activity-item__avatar">{{ act.avatar }}</div>
                  <div class="dash-activity-item__info">
                    <div class="dash-activity-item__text"><strong>{{ act.name }}</strong> {{ act.action }}</div>
                    <div class="dash-activity-item__time">{{ act.time }}</div>
                  </div>
                </div>
              </div>
            </slot>
          </base-card>
        </div>
        <div class="dash-panel dash-panel--right">
          <base-card v-if="showTable" class="dash-orders-card">
            <div class="dash-orders-card__title">最近订单</div>
            <slot name="table-custom">
              <div class="dash-table" role="table">
                <div class="dash-table__head" role="rowgroup">
                  <div class="dash-table__row dash-table__row--header" role="row">
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">订单号</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">商品</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">客户</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">金额</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">状态</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">日期</div>
                  </div>
                </div>
                <div class="dash-table__body" role="rowgroup">
                  <div v-for="order in orders" :key="order.id" class="dash-table__row" role="row">
                    <div class="dash-table__cell" role="cell">{{ order.id }}</div>
                    <div class="dash-table__cell" role="cell">{{ order.product }}</div>
                    <div class="dash-table__cell" role="cell">{{ order.customer }}</div>
                    <div class="dash-table__cell" role="cell"><strong>{{ order.amount }}</strong></div>
                    <div class="dash-table__cell" role="cell"><span class="dash-status-tag" :class="`dash-status-tag--${order.status}`">{{ statusLabel(order.status) }}</span></div>
                    <div class="dash-table__cell" role="cell">{{ order.date }}</div>
                  </div>
                </div>
              </div>
            </slot>
          </base-card>
          <base-card v-if="showTable" class="dash-top-card">
            <div class="dash-top-card__title">Top 商品</div>
            <div class="dash-top-list">
              <div v-for="(item, idx) in topProducts" :key="item.name" class="dash-top-item">
                <div class="dash-top-item__rank" :class="idx < 3 ? `dash-top-item__rank--${idx + 1}` : ''">{{ idx + 1 }}</div>
                <div class="dash-top-item__name">{{ item.name }}</div>
                <div class="dash-top-item__amount">{{ item.amount }}</div>
              </div>
            </div>
          </base-card>
        </div>
      </div>
    </template>

    <!-- ============================================================ -->
    <!-- Layout: three-col — 左中右三栏（LED 大屏专用，允许自定义）    -->
    <!-- ============================================================ -->
    <template v-if="layout === 'three-col'">
      <slot name="header-block" />
      <div class="dash-three-col">
        <aside class="dash-col dash-col--left">
          <slot name="col-left" />
        </aside>
        <main class="dash-col dash-col--center">
          <slot name="col-center" />
        </main>
        <aside class="dash-col dash-col--right">
          <slot name="col-right" />
        </aside>
      </div>
    </template>

    <!-- ============================================================ -->
    <!-- Layout: bento — 自由网格卡片布局                              -->
    <!-- ============================================================ -->
    <template v-if="layout === 'bento'">
      <slot name="header-block" />
      <div class="dash-bento-grid">
        <template v-if="showKpi">
          <base-card v-for="(kpi, idx) in sortedKpis.slice(0, 4)" :key="kpi.label" class="dash-kpi-card dash-kpi-card--bento" :class="`dash-kpi-pos-${idx}`">
            <div class="dash-kpi-card__label">{{ kpi.label }}</div>
            <div class="dash-kpi-card__value">{{ kpi.value }}</div>
            <div class="dash-kpi-card__trend" :class="`dash-kpi-card__trend--${kpi.trend}`">{{ kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→' }} {{ kpi.change }}</div>
            <slot name="kpi-extra" :kpi="kpi" />
          </base-card>
        </template>
        <base-card v-if="showChart" class="dash-chart-card">
          <div class="dash-chart-card__title">营收趋势（近7天）</div>
          <slot name="chart-custom">
            <div class="dash-chart">
              <div v-for="bar in chartBars" :key="bar.label" class="dash-chart__col">
                <div class="dash-chart__bar" :style="{ height: bar.height + 'px' }" />
                <div class="dash-chart__label">{{ bar.label }}</div>
              </div>
            </div>
          </slot>
        </base-card>
        <base-card v-if="showActivity" class="dash-activity-card">
          <div class="dash-activity-card__title">实时动态</div>
          <slot name="activity-custom">
            <div class="dash-activity-list">
              <div v-for="act in activities" :key="act.name + act.time" class="dash-activity-item">
                <div class="dash-activity-item__avatar">{{ act.avatar }}</div>
                <div class="dash-activity-item__info">
                  <div class="dash-activity-item__text"><strong>{{ act.name }}</strong> {{ act.action }}</div>
                  <div class="dash-activity-item__time">{{ act.time }}</div>
                </div>
              </div>
            </div>
          </slot>
        </base-card>
        <base-card v-if="showTable" class="dash-top-card">
          <div class="dash-top-card__title">Top 商品</div>
          <div class="dash-top-list">
            <div v-for="(item, idx) in topProducts" :key="item.name" class="dash-top-item">
              <div class="dash-top-item__rank" :class="idx < 3 ? `dash-top-item__rank--${idx + 1}` : ''">{{ idx + 1 }}</div>
              <div class="dash-top-item__name">{{ item.name }}</div>
              <div class="dash-top-item__amount">{{ item.amount }}</div>
            </div>
          </div>
        </base-card>
        <base-card v-if="showTable" class="dash-orders-card">
          <div class="dash-orders-card__title">最近订单</div>
          <slot name="table-custom">
            <div class="dash-table" role="table">
              <div class="dash-table__head" role="rowgroup">
                <div class="dash-table__row dash-table__row--header" role="row">
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">订单号</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">商品</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">客户</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">金额</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">状态</div>
                  <div class="dash-table__cell dash-table__cell--header" role="columnheader">日期</div>
                </div>
              </div>
              <div class="dash-table__body" role="rowgroup">
                <div v-for="order in orders" :key="order.id" class="dash-table__row" role="row">
                  <div class="dash-table__cell" role="cell">{{ order.id }}</div>
                  <div class="dash-table__cell" role="cell">{{ order.product }}</div>
                  <div class="dash-table__cell" role="cell">{{ order.customer }}</div>
                  <div class="dash-table__cell" role="cell"><strong>{{ order.amount }}</strong></div>
                  <div class="dash-table__cell" role="cell"><span class="dash-status-tag" :class="`dash-status-tag--${order.status}`">{{ statusLabel(order.status) }}</span></div>
                  <div class="dash-table__cell" role="cell">{{ order.date }}</div>
                </div>
              </div>
            </div>
          </slot>
        </base-card>
      </div>
    </template>

    <!-- ============================================================ -->
    <!-- Layout: grid4 — 2×2 四区均分网格                              -->
    <!-- ============================================================ -->
    <template v-if="layout === 'grid4'">
      <slot name="header-block" />
      <div class="dash-grid4">
        <section class="dash-zone dash-zone--kpi">
          <div class="dash-zone__title">关键指标</div>
          <div class="dash-kpi-row">
            <base-card v-for="kpi in sortedKpis" :key="kpi.label" class="dash-kpi-card">
              <div class="dash-kpi-card__icon" :style="{ background: kpi.color + '15', color: kpi.color }">{{ kpi.icon }}</div>
              <div class="dash-kpi-card__info">
                <div class="dash-kpi-card__label">{{ kpi.label }}</div>
                <div class="dash-kpi-card__value">{{ kpi.value }}</div>
                <div class="dash-kpi-card__trend" :class="`dash-kpi-card__trend--${kpi.trend}`">{{ kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→' }} {{ kpi.change }}</div>
              </div>
              <slot name="kpi-extra" :kpi="kpi" />
            </base-card>
          </div>
        </section>
        <section class="dash-zone dash-zone--chart">
          <div class="dash-zone__title">营收趋势（近7天）</div>
          <base-card v-if="showChart" class="dash-chart-card">
            <slot name="chart-custom">
              <div class="dash-chart">
                <div v-for="bar in chartBars" :key="bar.label" class="dash-chart__col">
                  <div class="dash-chart__bar" :style="{ height: bar.height + 'px' }" />
                  <div class="dash-chart__label">{{ bar.label }}</div>
                </div>
              </div>
            </slot>
          </base-card>
        </section>
        <section class="dash-zone dash-zone--table">
          <div class="dash-zone__title">最近订单</div>
          <base-card v-if="showTable" class="dash-orders-card">
            <slot name="table-custom">
              <div class="dash-table" role="table">
                <div class="dash-table__head" role="rowgroup">
                  <div class="dash-table__row dash-table__row--header" role="row">
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">订单号</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">商品</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">客户</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">金额</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">状态</div>
                    <div class="dash-table__cell dash-table__cell--header" role="columnheader">日期</div>
                  </div>
                </div>
                <div class="dash-table__body" role="rowgroup">
                  <div v-for="order in orders" :key="order.id" class="dash-table__row" role="row">
                    <div class="dash-table__cell" role="cell">{{ order.id }}</div>
                    <div class="dash-table__cell" role="cell">{{ order.product }}</div>
                    <div class="dash-table__cell" role="cell">{{ order.customer }}</div>
                    <div class="dash-table__cell" role="cell"><strong>{{ order.amount }}</strong></div>
                    <div class="dash-table__cell" role="cell"><span class="dash-status-tag" :class="`dash-status-tag--${order.status}`">{{ statusLabel(order.status) }}</span></div>
                    <div class="dash-table__cell" role="cell">{{ order.date }}</div>
                  </div>
                </div>
              </div>
            </slot>
          </base-card>
        </section>
        <section class="dash-zone dash-zone--misc">
          <div class="dash-zone__title">实时动态</div>
          <base-card v-if="showActivity" class="dash-activity-card">
            <slot name="activity-custom">
              <div class="dash-activity-list">
                <div v-for="act in activities" :key="act.name + act.time" class="dash-activity-item">
                  <div class="dash-activity-item__avatar">{{ act.avatar }}</div>
                  <div class="dash-activity-item__info">
                    <div class="dash-activity-item__text"><strong>{{ act.name }}</strong> {{ act.action }}</div>
                    <div class="dash-activity-item__time">{{ act.time }}</div>
                  </div>
                </div>
              </div>
            </slot>
          </base-card>
          <base-card v-if="showTable" class="dash-top-card">
            <div class="dash-top-card__title">Top 商品</div>
            <div class="dash-top-list">
              <div v-for="(item, idx) in topProducts" :key="item.name" class="dash-top-item">
                <div class="dash-top-item__rank" :class="idx < 3 ? `dash-top-item__rank--${idx + 1}` : ''">{{ idx + 1 }}</div>
                <div class="dash-top-item__name">{{ item.name }}</div>
                <div class="dash-top-item__amount">{{ item.amount }}</div>
              </div>
            </div>
          </base-card>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '../components/BaseCard.vue'

// ---- Types ----
type LayoutType = 'default' | 'panels' | 'three-col' | 'bento' | 'grid4'

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
  color?: string
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
  layout?: LayoutType
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
}>(), {
  variant: 'classic',
  layout: 'default',
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
   Base Styles — shared across all layouts + variants
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
.dash-header { display: flex; justify-content: space-between; align-items: center; }
.dash-header__title { font-size: var(--dash-font-size-2xl, 28px); font-weight: 700; margin: 0; line-height: 1.2; }
.dash-header__subtitle { font-size: var(--dash-font-size-base, 14px); color: var(--dash-text-secondary, #6b7280); margin: 4px 0 0; }
.dash-header__actions { display: flex; gap: 8px; }
.dash-header__btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: var(--dash-radius-sm, 6px);
  font-size: var(--dash-font-size-sm, 13px); font-weight: 500; cursor: pointer;
  transition: all var(--dash-transition-fast, 0.15s ease);
  background: var(--dash-bg-card, #fff); border: 1px solid var(--dash-border-light, #e8e8e8);
  color: var(--dash-text-primary, #1a1a2e);
}
.dash-header__btn:hover { border-color: var(--dash-accent-blue, #1890ff); color: var(--dash-accent-blue, #1890ff); }
.dash-header__btn--primary { background: var(--dash-accent-blue, #1890ff); border-color: var(--dash-accent-blue, #1890ff); color: #fff; }
.dash-header__btn--primary:hover { background: #40a9ff; border-color: #40a9ff; color: #fff; }

/* ---- KPI Row ---- */
.dash-kpi-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--dash-spacing-md, 16px); }
.dash-kpi-card {
  display: flex; align-items: center; gap: 16px;
  padding: var(--dash-card-padding, 24px); background: var(--dash-bg-card, #fff);
  border-radius: var(--dash-card-radius, 12px); box-shadow: var(--dash-card-shadow, 0 1px 2px rgba(0,0,0,0.06));
  transition: box-shadow var(--dash-transition-fast, 0.15s ease);
}
.dash-kpi-card:hover { box-shadow: var(--dash-card-shadow-hover, 0 4px 12px rgba(0,0,0,0.1)); }
.dash-kpi-card__icon {
  width: var(--dash-kpi-icon-size, 48px); height: var(--dash-kpi-icon-size, 48px);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}
.dash-kpi-card__info { display: flex; flex-direction: column; gap: 2px; }
.dash-kpi-card__label { font-size: var(--dash-font-size-sm, 13px); color: var(--dash-text-secondary, #6b7280); }
.dash-kpi-card__value { font-size: var(--dash-font-size-2xl, 28px); font-weight: 700; line-height: 1.2; }
.dash-kpi-card__trend { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; }
.dash-kpi-card__trend--up { color: var(--dash-trend-up, #52c41a); }
.dash-kpi-card__trend--down { color: var(--dash-trend-down, #f5222d); }
.dash-kpi-card__trend--flat { color: var(--dash-trend-flat, #9ca3af); }

/* ---- Content Grid (default layout) ---- */
.dash-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: var(--dash-spacing-lg, 24px); }

/* ---- Chart Card ---- */
.dash-chart-card {
  background: var(--dash-bg-card, #fff); border-radius: var(--dash-card-radius, 12px);
  box-shadow: var(--dash-card-shadow, 0 1px 2px rgba(0,0,0,0.06)); padding: var(--dash-card-padding, 24px);
}
.dash-chart-card__title { font-size: var(--dash-font-size-lg, 16px); font-weight: 600; margin-bottom: 16px; }
.dash-chart { display: flex; align-items: flex-end; gap: 8px; height: 200px; padding: 16px 0; }
.dash-chart__col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; min-width: 30px; }
.dash-chart__bar {
  width: 100%; border-radius: 4px 4px 0 0;
  transition: height var(--dash-transition-base, 0.3s ease); min-width: 30px;
  background: linear-gradient(to top, var(--dash-accent-blue, #1890ff), #69c0ff);
}
.dash-chart__label { font-size: 11px; color: var(--dash-text-muted, #9ca3af); text-align: center; margin-top: 6px; }

/* ---- Activity Card ---- */
.dash-activity-card {
  background: var(--dash-bg-card, #fff); border-radius: var(--dash-card-radius, 12px);
  box-shadow: var(--dash-card-shadow, 0 1px 2px rgba(0,0,0,0.06)); padding: var(--dash-card-padding, 24px);
}
.dash-activity-card__title { font-size: var(--dash-font-size-lg, 16px); font-weight: 600; margin-bottom: 16px; }
.dash-activity-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
.dash-activity-item {
  display: flex; gap: 12px; align-items: center; padding: 10px 12px;
  border-radius: var(--dash-radius-sm, 6px); transition: background var(--dash-transition-fast, 0.15s ease);
}
.dash-activity-item:hover { background: var(--dash-bg-card-hover, #fafbfc); }
.dash-activity-item__avatar {
  width: var(--dash-activity-avatar-size, 36px); height: var(--dash-activity-avatar-size, 36px);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 16px; background: var(--dash-bg-card-hover, #fafbfc); flex-shrink: 0;
}
.dash-activity-item__info { flex: 1; min-width: 0; }
.dash-activity-item__text { font-size: var(--dash-font-size-base, 14px); }
.dash-activity-item__time { font-size: 11px; color: var(--dash-text-muted, #9ca3af); margin-top: 2px; }

/* ---- Table Grid (default layout) ---- */
.dash-table-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--dash-spacing-lg, 24px); }
.dash-orders-card, .dash-top-card {
  background: var(--dash-bg-card, #fff); border-radius: var(--dash-card-radius, 12px);
  box-shadow: var(--dash-card-shadow, 0 1px 2px rgba(0,0,0,0.06)); padding: var(--dash-card-padding, 24px);
}
.dash-orders-card__title, .dash-top-card__title { font-size: var(--dash-font-size-lg, 16px); font-weight: 600; margin-bottom: 16px; }

/* ---- Table ---- */
.dash-table { width: 100%; border-collapse: collapse; display: table; }
.dash-table__head { display: table-header-group; }
.dash-table__body { display: table-row-group; }
.dash-table__row { display: table-row; height: var(--dash-table-row-height, 48px); transition: background var(--dash-transition-fast, 0.15s ease); }
.dash-table__row--header { background: var(--dash-table-header-bg, #fafafa); }
.dash-table__cell { display: table-cell; padding: 12px 16px; border-bottom: 1px solid var(--dash-table-border, #f0f0f0); font-size: var(--dash-font-size-sm, 13px); vertical-align: middle; }
.dash-table__cell--header { font-weight: 600; color: var(--dash-text-secondary, #6b7280); }
.dash-table__body .dash-table__row:hover .dash-table__cell { background: var(--dash-table-row-hover, #f0f5ff); }

/* ---- Status Tag ---- */
.dash-status-tag { display: inline-flex; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; line-height: 1.6; }
.dash-status-tag--completed { background: #f0fdf4; color: #16a34a; }
.dash-status-tag--pending { background: #fefce8; color: #ca8a04; }
.dash-status-tag--processing { background: #eff6ff; color: #2563eb; }
.dash-status-tag--cancelled { background: #fef2f2; color: #dc2626; }

/* ---- Top List ---- */
.dash-top-list { display: flex; flex-direction: column; }
.dash-top-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--dash-table-border, #f0f0f0); }
.dash-top-item:last-child { border-bottom: none; }
.dash-top-item__rank {
  width: var(--dash-top-rank-size, 24px); height: var(--dash-top-rank-size, 24px);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; background: #f3f4f6; color: #6b7280; flex-shrink: 0;
}
.dash-top-item__rank--1 { background: #fef3c7; color: #b45309; }
.dash-top-item__rank--2 { background: #e5e7eb; color: #4b5563; }
.dash-top-item__rank--3 { background: #fed7aa; color: #c2410c; }
.dash-top-item__name { flex: 1; font-size: var(--dash-font-size-base, 14px); }
.dash-top-item__amount { font-weight: 600; font-size: var(--dash-font-size-base, 14px); }

/* ---- Responsive ---- */
@media (max-width: 1024px) {
  .dash-content-grid { grid-template-columns: 1fr; }
  .dash-table-grid { grid-template-columns: 1fr; }
  .dash-kpi-row { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  .dash-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .dash-panels { grid-template-columns: 1fr !important; }
  .dash-three-col { grid-template-columns: 1fr !important; }
  .dash-bento-grid { grid-template-columns: 1fr 1fr !important; }
  .dash-grid4 { grid-template-columns: 1fr !important; grid-template-areas: "kpi" "chart" "table" "misc" !important; }
}

/* ================================================
   Variant: classic (经典白色)
   ================================================ */
.dash-page--classic { --dash-bg-primary: #f5f7fa; --dash-bg-card: #fff; --dash-text-primary: #1a1a2e; --dash-accent-blue: #1890ff; }
.dash-page--classic .dash-table__body .dash-table__row:nth-child(even) .dash-table__cell { background: #fafafa; }
.dash-page--classic .dash-chart__bar { background: linear-gradient(to top, #1890ff, #69c0ff); }

/* ================================================
   Variant: dark (暗色霓虹)
   ================================================ */
.dash-page--dark {
  --dash-bg-primary: #0a0f1a; --dash-bg-card: #111827; --dash-bg-card-hover: #1a2332;
  --dash-text-primary: #e2e8f0; --dash-text-secondary: #94a3b8; --dash-text-muted: #64748b;
  --dash-border-light: #1f2937; --dash-table-header-bg: #0d1424; --dash-table-row-hover: #1a2332; --dash-table-border: #1f2937;
  background: linear-gradient(135deg, #0a0f1a, #0d1424);
}
.dash-page--dark .dash-kpi-card { box-shadow: 0 0 0 1px #1f2937; }
.dash-page--dark .dash-kpi-card__value { color: #00f0ff; text-shadow: 0 0 10px rgba(0,240,255,0.3); }
.dash-page--dark .dash-chart__bar { background: linear-gradient(to top, #00f0ff, #0080ff); box-shadow: 0 0 8px rgba(0,240,255,0.3); }
.dash-page--dark .dash-chart-card, .dash-page--dark .dash-activity-card, .dash-page--dark .dash-orders-card, .dash-page--dark .dash-top-card { box-shadow: 0 0 0 1px #1f2937; }
.dash-page--dark .dash-header__title { color: #e2e8f0; }
.dash-page--dark .dash-header__subtitle { color: #94a3b8; }
.dash-page--dark .dash-header__btn { background: #111827; border-color: #1f2937; color: #e2e8f0; }
.dash-page--dark .dash-header__btn:hover { border-color: #00f0ff; color: #00f0ff; }
.dash-page--dark .dash-header__btn--primary { background: rgba(0,240,255,0.15); border-color: rgba(0,240,255,0.3); color: #00f0ff; }
.dash-page--dark .dash-header__btn--primary:hover { background: rgba(0,240,255,0.25); }
.dash-page--dark .dash-table__row--header .dash-table__cell--header { background: #0d1424; color: #00f0ff; }
.dash-page--dark .dash-table__body .dash-table__row .dash-table__cell { border-color: #1f2937; }
.dash-page--dark .dash-status-tag--completed { background: rgba(0,240,255,0.1); color: #00f0ff; }
.dash-page--dark .dash-status-tag--pending { background: rgba(250,140,22,0.1); color: #fa8c16; }
.dash-page--dark .dash-status-tag--processing { background: rgba(0,128,255,0.1); color: #40a9ff; }
.dash-page--dark .dash-status-tag--cancelled { background: rgba(245,34,45,0.1); color: #f5222d; }
.dash-page--dark .dash-activity-item:hover { background: rgba(0,240,255,0.04); }
.dash-page--dark .dash-activity-item__avatar { background: rgba(0,240,255,0.08); }
.dash-page--dark .dash-top-item__rank { background: rgba(0,240,255,0.08); color: #64748b; }
.dash-page--dark .dash-top-item__rank--1 { background: rgba(0,240,255,0.15); color: #00f0ff; }
.dash-page--dark .dash-top-item__rank--2 { background: rgba(139,92,246,0.15); color: #a78bfa; }
.dash-page--dark .dash-top-item__rank--3 { background: rgba(250,140,22,0.15); color: #fa8c16; }
.dash-page--dark::before {
  content: ''; position: fixed; inset: 0;
  background: linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px; pointer-events: none; z-index: 0;
}
.dash-page--dark > * { position: relative; z-index: 1; }

/* ================================================
   Variant: minimal (极简无框)
   ================================================ */
.dash-page--minimal { --dash-bg-primary: #fff; --dash-bg-card: #fff; --dash-text-primary: #111827; --dash-card-shadow: none; --dash-card-shadow-hover: none; }
.dash-page--minimal .dash-kpi-card { border: none; padding: 16px 0; border-bottom: 1px solid #f3f4f6; border-radius: 0; }
.dash-page--minimal .dash-chart-card, .dash-page--minimal .dash-activity-card, .dash-page--minimal .dash-orders-card, .dash-page--minimal .dash-top-card { border: none; box-shadow: none; padding: 24px 0; }
.dash-page--minimal .dash-table__row--header .dash-table__cell--header { background: transparent; border-bottom: 2px solid #111827; color: #111827; }
.dash-page--minimal .dash-table__body .dash-table__row .dash-table__cell { border-color: #f3f4f6; }
.dash-page--minimal .dash-header__title { font-weight: 300; font-size: 32px; letter-spacing: -0.5px; }
.dash-page--minimal .dash-chart__bar { background: #111827; border-radius: 2px 2px 0 0; }
.dash-page--minimal .dash-status-tag { background: transparent; border: 1px solid currentColor; }
.dash-page--minimal .dash-header__btn { background: transparent; border-color: #e5e7eb; color: #111827; }
.dash-page--minimal .dash-header__btn:hover { border-color: #111827; }
.dash-page--minimal .dash-header__btn--primary { background: #111827; border-color: #111827; color: #fff; }
.dash-page--minimal .dash-header__btn--primary:hover { background: #374151; }
.dash-page--minimal .dash-activity-item__avatar { background: #f9fafb; }
.dash-page--minimal .dash-top-item__rank { background: #f9fafb; color: #9ca3af; }
.dash-page--minimal .dash-top-item__rank--1 { background: #f3f4f6; color: #111827; font-weight: 800; }
.dash-page--minimal .dash-top-item__rank--2 { background: #f3f4f6; color: #6b7280; }
.dash-page--minimal .dash-top-item__rank--3 { background: #f3f4f6; color: #9ca3af; }

/* ================================================
   Variant: bigscreen (LED 大屏 — 特殊处理)
   ================================================ */
.dash-page--bigscreen {
  --dash-bg-primary: #04143d; --dash-bg-card: rgba(4,30,80,0.6);
  --dash-text-primary: #e2e8f0; --dash-text-secondary: #8899bb; --dash-border-light: rgba(0,212,255,0.15);
  --dash-card-radius: 8px; --dash-table-header-bg: rgba(0,212,255,0.05);
  --dash-table-border: rgba(0,212,255,0.08); --dash-table-row-hover: rgba(0,212,255,0.04);
  max-width: 1920px; margin: 0 auto; padding: 0;
}
.dash-page--bigscreen .dash-header {
  justify-content: center; background: rgba(0,20,60,0.8);
  border-bottom: 1px solid rgba(0,212,255,0.2); padding: 16px 32px;
}
.dash-page--bigscreen .dash-header__title { font-size: 32px; color: #00d4ff; letter-spacing: 4px; text-shadow: 0 0 20px rgba(0,212,255,0.4); }
.dash-page--bigscreen .dash-header__subtitle { color: #8899bb; }
.dash-page--bigscreen .dash-header__btn { display: none; }
.dash-page--bigscreen .dash-kpi-card { box-shadow: 0 0 0 1px rgba(0,212,255,0.15); background: rgba(0,30,80,0.5); }
.dash-page--bigscreen .dash-kpi-card__value { font-size: 28px; color: #00d4ff; font-family: var(--dash-mono-family, monospace); text-shadow: 0 0 8px rgba(0,212,255,0.3); }
.dash-page--bigscreen .dash-kpi-card__label { color: #8899bb; font-size: 12px; }
.dash-page--bigscreen .dash-chart-card, .dash-page--bigscreen .dash-activity-card, .dash-page--bigscreen .dash-orders-card, .dash-page--bigscreen .dash-top-card { background: rgba(4,30,80,0.6); box-shadow: 0 0 0 1px rgba(0,212,255,0.15); }
.dash-page--bigscreen .dash-chart-card__title, .dash-page--bigscreen .dash-activity-card__title, .dash-page--bigscreen .dash-orders-card__title, .dash-page--bigscreen .dash-top-card__title { color: #00d4ff; }
.dash-page--bigscreen .dash-chart { height: 280px; }
.dash-page--bigscreen .dash-chart__bar { background: linear-gradient(to top, #00d4ff, #0066cc); box-shadow: 0 0 6px rgba(0,212,255,0.3); }
.dash-page--bigscreen .dash-table__row--header .dash-table__cell--header { background: rgba(0,212,255,0.05); color: #00d4ff; border-bottom: 1px solid rgba(0,212,255,0.2); }
.dash-page--bigscreen .dash-table__body .dash-table__row .dash-table__cell { border-color: rgba(0,212,255,0.08); color: #c0ccdd; }
.dash-page--bigscreen .dash-status-tag--completed { background: rgba(0,212,255,0.1); color: #00d4ff; }
.dash-page--bigscreen .dash-status-tag--pending { background: rgba(250,140,22,0.1); color: #fa8c16; }
.dash-page--bigscreen .dash-status-tag--processing { background: rgba(0,128,255,0.1); color: #40a9ff; }
.dash-page--bigscreen .dash-status-tag--cancelled { background: rgba(245,34,45,0.1); color: #f5222d; }
.dash-page--bigscreen .dash-activity-item:hover { background: rgba(0,212,255,0.04); }
.dash-page--bigscreen .dash-activity-item__avatar { background: rgba(0,212,255,0.08); }
.dash-page--bigscreen .dash-top-item { border-color: rgba(0,212,255,0.08); }
.dash-page--bigscreen .dash-top-item__rank { background: rgba(0,212,255,0.08); color: #8899bb; }
.dash-page--bigscreen .dash-top-item__rank--1 { background: rgba(0,212,255,0.2); color: #00d4ff; }
.dash-page--bigscreen .dash-top-item__rank--2 { background: rgba(139,92,246,0.15); color: #a78bfa; }
.dash-page--bigscreen .dash-top-item__rank--3 { background: rgba(250,140,22,0.15); color: #fa8c16; }
.dash-page--bigscreen::after {
  content: ''; position: fixed; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.01) 2px, rgba(0,212,255,0.01) 4px);
  pointer-events: none; z-index: 99;
}

/* ================================================
   Variant: glass (毛玻璃)
   ================================================ */
.dash-page--glass {
  --dash-bg-primary: #0f0f23; --dash-bg-card: rgba(255,255,255,0.04);
  --dash-text-primary: #e2e8f0; --dash-text-secondary: #94a3b8; --dash-border-light: rgba(255,255,255,0.08);
  background: linear-gradient(135deg, #0f0f23, #1a1a3e, #0f0f23);
}
.dash-page--glass .dash-kpi-card { backdrop-filter: blur(20px); box-shadow: 0 0 0 1px rgba(139,92,246,0.12); }
.dash-page--glass .dash-kpi-card:hover { box-shadow: 0 0 0 1px rgba(139,92,246,0.25), 0 0 20px rgba(139,92,246,0.08); }
.dash-page--glass .dash-kpi-card__value { color: #c4b5fd; }
.dash-page--glass .dash-chart-card, .dash-page--glass .dash-activity-card, .dash-page--glass .dash-orders-card, .dash-page--glass .dash-top-card { backdrop-filter: blur(20px); box-shadow: 0 0 0 1px rgba(255,255,255,0.06); }
.dash-page--glass .dash-chart__bar { background: linear-gradient(to top, #8b5cf6, #a78bfa); }
.dash-page--glass .dash-header__title { color: #e2e8f0; }
.dash-page--glass .dash-header__subtitle { color: #94a3b8; }
.dash-page--glass .dash-header__btn { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.2); color: #c4b5fd; }
.dash-page--glass .dash-header__btn:hover { border-color: rgba(139,92,246,0.4); color: #a78bfa; }
.dash-page--glass .dash-header__btn--primary { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.4); color: #c4b5fd; }
.dash-page--glass .dash-header__btn--primary:hover { background: rgba(139,92,246,0.3); }
.dash-page--glass .dash-table__row--header .dash-table__cell--header { background: rgba(139,92,246,0.05); color: #a78bfa; border-bottom-color: rgba(139,92,246,0.15); }
.dash-page--glass .dash-table__body .dash-table__row .dash-table__cell { border-color: rgba(255,255,255,0.05); color: #e2e8f0; }
.dash-page--glass .dash-chart-card__title, .dash-page--glass .dash-activity-card__title, .dash-page--glass .dash-orders-card__title, .dash-page--glass .dash-top-card__title { color: #c4b5fd; }
.dash-page--glass .dash-status-tag--completed { background: rgba(139,92,246,0.15); color: #a78bfa; }
.dash-page--glass .dash-status-tag--pending { background: rgba(250,140,22,0.1); color: #fb923c; }
.dash-page--glass .dash-status-tag--processing { background: rgba(96,165,250,0.1); color: #60a5fa; }
.dash-page--glass .dash-status-tag--cancelled { background: rgba(248,113,113,0.1); color: #f87171; }
.dash-page--glass .dash-activity-item:hover { background: rgba(139,92,246,0.04); }
.dash-page--glass .dash-activity-item__avatar { background: rgba(139,92,246,0.08); }
.dash-page--glass .dash-top-item { border-color: rgba(255,255,255,0.05); }
.dash-page--glass .dash-top-item__rank { background: rgba(139,92,246,0.08); color: #94a3b8; }
.dash-page--glass .dash-top-item__rank--1 { background: rgba(139,92,246,0.2); color: #c4b5fd; }
.dash-page--glass .dash-top-item__rank--2 { background: rgba(96,165,250,0.15); color: #60a5fa; }
.dash-page--glass .dash-top-item__rank--3 { background: rgba(250,140,22,0.12); color: #fb923c; }
.dash-page--glass::before {
  content: ''; position: fixed; width: 500px; height: 500px; top: -150px; right: -150px;
  background: radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%); border-radius: 50%; pointer-events: none; z-index: 0;
}
.dash-page--glass::after {
  content: ''; position: fixed; width: 400px; height: 400px; bottom: -100px; left: -100px;
  background: radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%); border-radius: 50%; pointer-events: none; z-index: 0;
}
.dash-page--glass > * { position: relative; z-index: 1; }

/* ================================================
   Variant: compact (紧凑高密)
   ================================================ */
.dash-page--compact {
  --dash-bg-primary: #fafafa; --dash-bg-card: #fff;
  --dash-spacing-lg: 12px; --dash-spacing-md: 8px; --dash-card-padding: 12px; --dash-card-radius: 8px;
  --dash-font-size-base: 12px; --dash-font-size-lg: 14px;
}
.dash-page--compact .dash-kpi-card { padding: 8px 12px; min-height: 60px; }
.dash-page--compact .dash-kpi-card__icon { width: 32px; height: 32px; font-size: 16px; border-radius: 6px; }
.dash-page--compact .dash-kpi-card__value { font-size: 18px; }
.dash-page--compact .dash-kpi-card__label { font-size: 11px; }
.dash-page--compact .dash-table__body .dash-table__row .dash-table__cell, .dash-page--compact .dash-table__row--header .dash-table__cell--header { padding: 6px 10px; font-size: 12px; }
.dash-page--compact .dash-table__row { height: 32px; }
.dash-page--compact .dash-activity-item { padding: 6px 8px; }
.dash-page--compact .dash-activity-item__avatar { width: 24px; height: 24px; font-size: 12px; }
.dash-page--compact .dash-activity-item__text { font-size: 12px; }
.dash-page--compact .dash-activity-item__time { font-size: 10px; }
.dash-page--compact .dash-header__title { font-size: 16px; }
.dash-page--compact .dash-header__subtitle { font-size: 12px; }
.dash-page--compact .dash-chart { height: 120px; }
.dash-page--compact .dash-chart__bar { min-width: 20px; }
.dash-page--compact .dash-chart-card__title, .dash-page--compact .dash-activity-card__title, .dash-page--compact .dash-orders-card__title, .dash-page--compact .dash-top-card__title { font-size: 13px; margin-bottom: 8px; }
.dash-page--compact .dash-header__btn { padding: 4px 10px; font-size: 12px; }
.dash-page--compact .dash-top-item { padding: 6px 0; }
.dash-page--compact .dash-top-item__rank { width: 18px; height: 18px; font-size: 10px; }
.dash-page--compact .dash-top-item__name, .dash-page--compact .dash-top-item__amount { font-size: 12px; }
.dash-page--compact .dash-status-tag { padding: 1px 6px; font-size: 11px; }
.dash-page--compact .dash-zone__title { font-size: 12px; }

/* sidebar layout 已移除，统一使用 default */

/* ================================================
   Layout: panels (双面板布局)
   ================================================ */
.dash-page--panels { padding: 0 24px 24px; gap: 16px; max-width: 100%; }
.dash-page--panels .dash-kpi-row { grid-template-columns: repeat(6, 1fr); }
.dash-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.dash-panel { display: flex; flex-direction: column; gap: 16px; }
.dash-panels .dash-chart-card, .dash-panels .dash-activity-card, .dash-panels .dash-orders-card, .dash-panels .dash-top-card { flex: 1; }

/* ================================================
   Layout: three-col (左中右三栏布局)
   ================================================ */
.dash-page--three-col { padding: 0; gap: 0; max-width: 100%; }
.dash-three-col { display: grid; grid-template-columns: 280px 1fr 320px; flex: 1; }
.dash-col { padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.dash-col--left { border-right: 1px solid var(--dash-border-light, rgba(0,212,255,0.1)); }
.dash-col--right { border-left: 1px solid var(--dash-border-light, rgba(0,212,255,0.1)); }
.dash-col--left .dash-kpi-row { grid-template-columns: 1fr; gap: 12px; }
.dash-col--left .dash-kpi-card { flex-direction: column; align-items: flex-start; gap: 8px; padding: 16px; }
.dash-col--left .dash-kpi-card__icon { width: 36px; height: 36px; font-size: 18px; }

/* ================================================
   Layout: bento (自由网格卡片布局)
   ================================================ */
.dash-page--bento { padding: 24px; gap: 16px; }
.dash-bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto auto;
  gap: 16px;
}
.dash-kpi-card--bento {
  flex-direction: column; align-items: flex-start; gap: 8px; padding: 24px;
}
.dash-kpi-pos-0 { grid-area: 1 / 1 / 2 / 2; }
.dash-kpi-pos-1 { grid-area: 1 / 2 / 2 / 3; }
.dash-kpi-pos-2 { grid-area: 1 / 3 / 2 / 4; }
.dash-kpi-pos-3 { grid-area: 1 / 4 / 2 / 5; }
.dash-bento-grid .dash-chart-card { grid-area: 2 / 1 / 3 / 3; }
.dash-bento-grid .dash-activity-card { grid-area: 2 / 3 / 3 / 5; }
.dash-bento-grid .dash-top-card { grid-area: 3 / 1 / 4 / 3; }
.dash-bento-grid .dash-orders-card { grid-area: 3 / 3 / 4 / 5; }

/* ================================================
   Layout: grid4 (2×2 四区均分网格)
   ================================================ */
.dash-page--grid4 { padding: 8px; gap: 8px; }
.dash-grid4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: "kpi chart" "table misc";
  gap: 8px; flex: 1;
}
.dash-zone {
  background: var(--dash-bg-card, #fff); border-radius: var(--dash-card-radius, 8px);
  box-shadow: var(--dash-card-shadow, 0 1px 1px rgba(0,0,0,0.04));
  padding: 10px 12px; display: flex; flex-direction: column; overflow: hidden;
}
.dash-zone__title { font-size: 12px; font-weight: 600; color: var(--dash-text-secondary, #6b7280); margin-bottom: 6px; flex-shrink: 0; }
.dash-zone--kpi { grid-area: kpi; }
.dash-zone--chart { grid-area: chart; }
.dash-zone--table { grid-area: table; }
.dash-zone--misc { grid-area: misc; }
.dash-page--grid4 .dash-kpi-row { grid-template-columns: repeat(3, 1fr); gap: 6px; }
.dash-page--grid4 .dash-kpi-card { padding: 8px 12px; min-height: 48px; flex-direction: column; align-items: flex-start; gap: 4px; }
.dash-page--grid4 .dash-kpi-card__icon { width: 28px; height: 28px; font-size: 14px; border-radius: 6px; }
.dash-page--grid4 .dash-kpi-card__value { font-size: 16px; }
.dash-page--grid4 .dash-kpi-card__label { font-size: 10px; }
.dash-page--grid4 .dash-chart { height: 100%; min-height: 80px; }
.dash-page--grid4 .dash-table__row { height: 28px; }
.dash-page--grid4 .dash-table__body .dash-table__row .dash-table__cell, .dash-page--grid4 .dash-table__row--header .dash-table__cell--header { padding: 4px 8px; font-size: 11px; }
.dash-page--grid4 .dash-status-tag { padding: 1px 6px; font-size: 10px; }
.dash-page--grid4 .dash-activity-item { padding: 4px 6px; gap: 6px; }
.dash-page--grid4 .dash-activity-item__avatar { width: 20px; height: 20px; font-size: 10px; }
.dash-page--grid4 .dash-activity-item__text { font-size: 11px; }
.dash-page--grid4 .dash-activity-item__time { font-size: 9px; }
.dash-page--grid4 .dash-top-item { padding: 4px 0; gap: 6px; }
.dash-page--grid4 .dash-top-item__rank { width: 16px; height: 16px; font-size: 9px; }
.dash-page--grid4 .dash-top-item__name, .dash-page--grid4 .dash-top-item__amount { font-size: 11px; }
.dash-page--grid4 .dash-zone--misc { display: flex; flex-direction: column; gap: 8px; }
.dash-page--grid4 .dash-zone--misc .dash-activity-card, .dash-page--grid4 .dash-zone--misc .dash-top-card { background: transparent; box-shadow: none; padding: 0; border-radius: 0; }
</style>
