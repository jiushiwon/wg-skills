---
name: vue-dashboard-skill
description: Vue3 高端数据看板技能。6种差异化风格（经典白色、暗色霓虹、极简无框、LED大屏、毛玻璃、紧凑高密）× 5种布局结构（default/panels/three-col/bento/grid4），卡片容器引用 vue-card-skill 的 base-card，图表引用 vue-chart-skill。触发词："Dashboard"、"数据看板"、"仪表盘"、"大屏"。
---

# Vue3 Dashboard Skill

高端数据看板页组件技能，支持 **6 种视觉风格 × 5 种布局结构**，适用于 SaaS 后台、数据中心大屏、实时监控等多种业务场景。

---

## 容器原则（铁律）

> **所有数据卡片必须基于 `base-card` 容器组件。**
> **例外：LED 大屏（three-col 布局）允许自定义组件，不要求 base-card。**

`base-card` 提供统一的圆角、阴影、内边距、hover 动效。禁止使用原生 `<div>` 模拟卡片外观（大屏除外）。

---

## 组件依赖

### 本技能内置组件（components/）

| 组件 | 用途 | 高频场景 |
|------|------|---------|
| `BaseCard` | 卡片容器（封装 vue-card-skill CSS，6维度参数） | 所有卡片，大屏除外 |
| `BaseProgressBar` | 水平进度条 | 预算执行率、指标达成率、出勤率 |
| `BaseHorizontalBar` | 横向条形图 | 账龄分析、成绩分布、资产统计 |
| `BaseCompareBars` | 双期对比条形图 | 同比/环比分析 |
| `BaseStatGrid` | 统计数字网格 | 班级统计、区域概览 |
| `BaseApprovalList` | 待办/审批列表 | 费用审批、待办事项 |
| `BaseBigKpi` | LED 大屏超大 KPI | 大屏场景数字展示 |
| `BaseKpiMini` | 迷你紧凑 KPI | 高密场景多指标展示 |
| `BaseSparkline` | SVG 迷你趋势图 | KPI 附属 sparkline |
| `BaseScrollFeed` | 实时滚动数据流 | 大屏实时交易/动态 |

### vue-chart-skill 图表组件

| 组件 | 用途 |
|------|------|
| `BaseLineChart` / `BaseBarChart` / `BasePieChart` | 折线/柱状/饼图（含环形图 donut 模式） |
| `BaseGaugeChart` / `BaseFunnelChart` / `BaseProgressRing` | 仪表盘/漏斗图/进度环 |

**零外部依赖的操作元素**：
- 操作按钮：使用原生 `<div class="dash-header__btn">` + SVG 图标
- 状态标签：使用原生 `<span class="dash-status-tag">` + CSS 变体类

---

## 双维度模型

### Variant（视觉风格）— 控制颜色、字体、阴影、特效

| # | 风格 | 核心差异 | 触发词 |
|---|------|----------|--------|
| 1 | **经典白色** | 白底蓝调，标准卡片阴影，斑马纹表格 | `classic`、`经典` |
| 2 | **暗色霓虹** | 深蓝黑底，青色霓虹发光，科技网格 | `dark`、`霓虹` |
| 3 | **极简无框** | 纯白无阴影，极细分割线，大量留白 | `minimal`、`极简` |
| 4 | **LED 大屏** | 深蓝底色，亮蓝强调，超大字号投屏 | `bigscreen`、`大屏` |
| 5 | **毛玻璃** | 暗色渐变底，紫色系，backdrop-filter | `glass`、`毛玻璃` |
| 6 | **紧凑高密** | 浅灰底色，缩小间距字号，最大信息密度 | `compact`、`紧凑` |

### Layout（结构布局）— 控制 DOM 结构、Grid 布局

| # | 布局 | 核心结构 | 推荐搭配 variant |
|---|------|----------|-----------------|
| 1 | **default** | 标准流式：header → kpi → content-grid → table-grid | classic / dark / minimal / compact |
| 2 | **panels** | KPI 通栏 + 左右双面板 | dark |
| 3 | **three-col** | 左中右三栏大屏投屏（大屏专用，允许自定义组件） | bigscreen |
| 4 | **bento** | 自由网格卡片，KPI 独立卡片 + 通栏图表/表格 | glass |
| 5 | **grid4** | 2×2 四区均分网格 | compact |

---

## 标准 DashboardPage 模板

> 完整模板见 [templates/DashboardPage.vue](./templates/DashboardPage.vue)。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `string` | `'classic'` | 视觉风格：classic / dark / minimal / bigscreen / glass / compact |
| `layout` | `LayoutType` | `'default'` | 结构布局：default / panels / three-col / bento / grid4 |
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

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `refresh` | 无 | 用户点击刷新按钮 |
| `export` | 无 | 用户点击导出按钮 |

### Slots

| Slot | 作用域 | 说明 |
|------|--------|------|
| `header-actions` | 无 | 页头操作区（替代默认的刷新/导出按钮） |
| `kpi-extra` | `{ kpi }` | KPI 卡片额外内容 |
| `chart-custom` | 无 | 替代默认的纯 CSS 柱状图（接入 ECharts 等） |
| `activity-custom` | 无 | 替代默认的动态列表 |
| `table-custom` | 无 | 替代默认的订单表格 |
| `col-left` | 无 | three-col 布局的左栏内容 |
| `col-center` | 无 | three-col 布局的中栏内容 |
| `col-right` | 无 | three-col 布局的右栏内容 |

### Types

```ts
type LayoutType = 'default' | 'panels' | 'three-col' | 'bento' | 'grid4'

interface KpiItem {
  label: string
  value: string
  trend: 'up' | 'down' | 'flat'
  change: string
  icon: string         // SVG 内联图标字符串
  color: string        // 主题色 hex
}

interface ActivityItem {
  avatar: string       // 头像内容（首字母/图标）
  name: string
  action: string
  time: string
  color?: string       // 可选，头像背景色
}

interface OrderItem {
  id: string
  product: string
  customer: string
  amount: string
  status: 'completed' | 'pending' | 'processing' | 'cancelled'
  date: string
}
```

---

## Layout 结构详解

### default — 标准流式

```
.dash-page--default (flex column)
├── .dash-header
├── .dash-kpi-row (grid: auto-fill)
│   └── base-card.dash-kpi-card × N
├── .dash-content-grid (grid: 2fr 1fr)
│   ├── base-card.dash-chart-card
│   └── base-card.dash-activity-card
└── .dash-table-grid (grid: 1fr 1fr)
    ├── base-card.dash-orders-card
    └── base-card.dash-top-card
```

### panels — 双面板

```
.dash-page--panels (flex column)
├── .dash-header
├── .dash-kpi-row (6 列)
└── .dash-panels (grid: 1fr 1fr)
    ├── .dash-panel--left
    │   ├── base-card.dash-chart-card
    │   └── base-card.dash-activity-card
    └── .dash-panel--right
        ├── base-card.dash-orders-card
        └── base-card.dash-top-card
```

### three-col — 左中右三栏（大屏专用）

```
.dash-page--three-col (flex column)
├── .dash-header
└── .dash-three-col (grid: 280px 1fr 320px)
    ├── .dash-col--left  → slot[name=col-left]
    ├── .dash-col--center → slot[name=col-center]
    └── .dash-col--right → slot[name=col-right]
```

> **大屏特殊说明**：three-col 布局使用 slot 注入内容，不要求 base-card。使用者可以在 slot 中放置任意自定义组件（如实时时钟、地图、大字号 KPI 等）。

### bento — 自由网格

```
.dash-page--bento (flex column)
├── .dash-header
└── .dash-bento-grid (grid: 4col × 3row, grid-area 定位)
    ├── base-card.dash-kpi-card--bento × 4 (第一行)
    ├── base-card.dash-chart-card (第二行左半)
    ├── base-card.dash-activity-card (第二行右半)
    ├── base-card.dash-top-card (第三行左半)
    └── base-card.dash-orders-card (第三行右半)
```

### grid4 — 2×2 四区均分

```
.dash-page--grid4 (flex column)
├── .dash-header
└── .dash-grid4 (grid: 1fr 1fr × 1fr 1fr)
    ├── .dash-zone--kpi (左上)
    │   └── base-card.dash-kpi-card × N (3×2 紧凑网格)
    ├── .dash-zone--chart (右上)
    │   └── base-card.dash-chart-card
    ├── .dash-zone--table (左下)
    │   └── base-card.dash-orders-card
    └── .dash-zone--misc (右下)
        ├── base-card.dash-activity-card
        └── base-card.dash-top-card
```

---

## 使用示例

### 基础用法

```vue
<DashboardPage
  variant="classic"
  layout="default"
  :kpis="kpis"
  :activities="activities"
  :orders="orders"
/>
```

### 布局切换

```vue
<!-- 侧边栏后台 -->
<DashboardPage variant="classic" layout="default" :kpis="kpis" />

<!-- 双面板监控 -->
<DashboardPage variant="dark" layout="panels" :kpis="kpis" />

<!-- LED 大屏（使用 slot 自定义内容） -->
<DashboardPage variant="bigscreen" layout="three-col">
  <template #col-left>
    <!-- 自定义左侧 KPI 指标 -->
  </template>
  <template #col-center>
    <!-- 自定义中栏图表 -->
  </template>
  <template #col-right>
    <!-- 自定义右侧动态/排行 -->
  </template>
</DashboardPage>
```

---

## 文件结构

```
vue-dashboard-skill/
├── SKILL.md                          # 本文件
├── README.md                         # 快速入门
├── templates/
│   └── DashboardPage.vue             # 核心组件模板（支持 6 种 layout）
└── demo-components/
    ├── shared/
    │   ├── tokens.css                # 设计 Token
    │   └── demo.css                  # 共享基础样式
    └── dashboard-page/
        └── html/
            ├── 00-showcase.html      # 6 种风格画廊
            ├── 01-classic.html       # default + classic
            ├── 02-dark.html          # panels + dark
            ├── 03-minimal.html       # default + minimal
            ├── 04-bigscreen.html     # three-col + bigscreen（允许自定义）
            ├── 05-glass.html         # bento + glass
            └── 06-compact.html       # grid4 + compact
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
└── vue-base-skill ─── base-card（大屏布局除外）
```

**零外部依赖的操作元素**：
- 操作按钮：原生 div + SVG 图标（无 base-button 依赖）
- 状态标签：原生 span + CSS 变体类（无 base-tag 依赖）
