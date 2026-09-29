---
name: vue-chart-skill
description: Vue 3 Canvas 图表技能，零第三方依赖，纯 Canvas 2D 绘制。包含折线图、柱状图、饼图、散点图、雷达图、仪表盘、进度环、漏斗图、热力图共 14 种图表，对标 ECharts 视觉品质。触发词："vue 图表"、"vue-chart"、"折线图"、"柱状图"、"饼图"、"仪表盘"、"数据可视化"。
---

# Vue Chart Skill

> **容器原则**：图表必须嵌入 `<base-card>` 使用
> **零第三方依赖**：纯 Canvas 2D API 绘制，不依赖 ECharts / Chart.js / D3
> **视觉品质**：对标 ECharts 5.x，支持动画、Tooltip、图例交互

零依赖 Canvas 图表组件库，通过原生 Canvas 2D API 实现主流数据可视化图表。

## 引用组件

| 组件技能 | 用途 |
|----------|------|
| vue-card-skill | 图表容器（base-card） |
| vue-theme-skill | 设计 Token（颜色变量） |

## 图表清单

### 折线图系列（7 种形态）

| # | 形态 | 组件 | 参数 mode | 适用场景 |
|---|------|------|-----------|---------|
| 1 | 基础折线 | BaseLineChart | 默认 | 趋势分析、时间序列 |
| 2 | 平滑曲线 | BaseLineChart | smooth: true | 平滑趋势展示 |
| 3 | 面积填充 | BaseLineChart | area: true | 量化趋势、流量分析 |
| 4 | 多线对比 | BaseLineChart | 多 series | 本月 vs 上月 vs 平均 |
| 5 | 堆叠面积 | BaseLineChart | stack | 累计趋势、构成变化 |
| 6 | 双 Y 轴 | BaseLineChart | yAxisIndex | 量纲不同的指标对比 |
| 7 | 带数值标注 | BaseLineChart | showDot + label | 精确数值展示 |

### 柱状图系列（4 种形态）

| # | 形态 | 组件 | 适用场景 |
|---|------|------|---------|
| 8 | 基础柱状 | BaseBarChart | 分类对比、业绩统计 |
| 9 | 分组柱状 | BaseBarChart | 多系列并排对比 |
| 10 | 堆叠柱状 | BaseBarChart | 构成分析、累计对比 |
| 11 | 带数值标签 | BaseBarChart | 精确数值对比 |

### 饼图系列（3 种形态）

| # | 形态 | 组件 | 适用场景 |
|---|------|------|---------|
| 12 | 环形图 | BasePieChart type="donut" | 占比分析、来源构成 |
| 13 | 饼图 | BasePieChart type="pie" | 比例展示 |
| 14 | 南丁格尔玫瑰图 | BasePieChart roseType="radius" | 分类差异大时使用 |

### 其他图表

| # | 图表 | 组件 | 适用场景 |
|---|------|------|---------|
| 15 | 散点图 / 气泡图 | BaseScatterChart | 相关性分析、分布展示 |
| 16 | 雷达图 | BaseRadarChart | 多维度能力评估、对比 |
| 17 | 仪表盘 | BaseGaugeChart | 单指标完成率、KPI |
| 18 | 进度环 | BaseProgressRing | 任务进度、完成率 |
| 19 | 漏斗图 | BaseFunnelChart | 转化分析、流程损耗 |
| 20 | 热力图 | BaseHeatmapChart | 时间分布、密度分析 |

## 核心架构

```
vue-chart-skill/
├── SKILL.md              # 本文件
├── README.md
├── types/
│   └── chart.ts          # 全量类型定义
├── composables/
│   ├── useCanvas.ts      # Canvas 初始化 + DPR
│   ├── useTooltip.ts     # 鼠标 Tooltip
│   ├── useAnimation.ts   # 动画驱动
│   └── draw-helpers.ts   # 绘图工具函数库
├── components/
│   ├── BaseLineChart.vue
│   ├── BaseBarChart.vue
│   ├── BasePieChart.vue
│   ├── BaseScatterChart.vue
│   ├── BaseRadarChart.vue
│   ├── BaseGaugeChart.vue
│   ├── BaseProgressRing.vue
│   ├── BaseFunnelChart.vue
│   └── BaseHeatmapChart.vue
└── demo-components/
    └── chart-showcase/html/00-showcase.html
```

## 使用方式

### 折线图

```vue
<script setup lang="ts">
import { BaseLineChart } from './components/BaseLineChart';
import type { LineChartOption } from './types/chart';

const option: LineChartOption = {
  title: { text: '月度销售额趋势' },
  tooltip: { show: true, trigger: 'axis' },
  legend: { show: true },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '2024年',
      data: [120, 200, 150, 180, 230, 210],
      smooth: true,
      area: true,
      areaOpacity: 0.15,
    },
    {
      name: '2023年',
      data: [80, 160, 120, 140, 190, 170],
      lineStyle: 'dashed',
      smooth: true,
    },
  ],
};
</script>

<template>
  <base-card title="销售数据">
    <BaseLineChart :option="option" :width="560" :height="320" />
  </base-card>
</template>
```

### 柱状图

```vue
<script setup lang="ts">
import { BaseBarChart } from './components/BaseBarChart';
import type { BarChartOption } from './types/chart';

const option: BarChartOption = {
  title: { text: '部门业绩对比' },
  tooltip: { show: true },
  legend: { show: true },
  xAxis: {
    type: 'category',
    data: ['技术部', '市场部', '销售部', '运营部', '产品部'],
  },
  yAxis: { type: 'value' },
  series: [
    { name: 'Q1', data: [120, 90, 150, 80, 70] },
    { name: 'Q2', data: [140, 110, 170, 95, 85] },
  ],
};
</script>

<template>
  <base-card title="部门业绩">
    <BaseBarChart :option="option" :width="560" :height="320" />
  </base-card>
</template>
```

### 饼图

```vue
<script setup lang="ts">
import { BasePieChart } from './components/BasePieChart';
import type { PieChartOption } from './types/chart';

const option: PieChartOption = {
  title: { text: '流量来源分析' },
  tooltip: { show: true },
  legend: { show: true },
  series: [{
    name: '流量来源',
    type: 'donut',
    data: [
      { name: '直接访问', value: 335 },
      { name: '邮件营销', value: 310 },
      { name: '联盟广告', value: 234 },
      { name: '视频广告', value: 135 },
      { name: '搜索引擎', value: 1548 },
    ],
  }],
};
</script>

<template>
  <base-card title="流量来源">
    <BasePieChart :option="option" :width="460" :height="340" />
  </base-card>
</template>
```

### 仪表盘

```vue
<script setup lang="ts">
import { BaseGaugeChart } from './components/BaseGaugeChart';
import type { GaugeChartOption } from './types/chart';

const option: GaugeChartOption = {
  series: [{
    name: '完成率',
    data: [{ name: '完成率', value: 72.5 }],
    min: 0,
    max: 100,
    splitNumber: 10,
    axisLine: {
      lineStyle: {
        color: [[0.3, '#67e0e3'], [0.7, '#37a2da'], [1, '#fd666d']],
        width: 18,
      },
    },
    detail: {
      formatter: (v: number) => v.toFixed(1) + '%',
      fontSize: 28,
      fontWeight: 'bold',
    },
  }],
};
</script>

<template>
  <base-card title="系统状态">
    <BaseGaugeChart :option="option" :width="340" :height="280" />
  </base-card>
</template>
```

### 进度环

```vue
<script setup lang="ts">
import { BaseProgressRing } from './components/BaseProgressRing';
import type { ProgressRingOption } from './types/chart';

const option: ProgressRingOption = {
  percent: 78,
  size: 120,
  strokeWidth: 10,
  roundCap: true,
  color: [[0, '#36d1dc'], [1, '#5b86e5']],
  content: {
    title: '完成率',
    value: '78%',
    valueStyle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  },
};
</script>

<template>
  <base-card :padding="24">
    <BaseProgressRing :option="option" />
  </base-card>
</template>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| option | 图表配置对象 | - | 各图表对应的 Option 类型 |
| width | `number` | `560` | 图表宽度（px） |
| height | `number` | `320` | 图表高度（px） |

## 技术特性

### Canvas 初始化（DPR 适配）

```typescript
// 自动处理高分屏
const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);
```

### 动画系统

- 入场动画：数据点从 0 渲染到目标值（800ms cubicOut 缓动）
- 交错动画：柱状图/漏斗图各元素依次出现
- 可通过 `animation.enabled: false` 关闭

### Tooltip 系统

- 鼠标悬浮自动检测最近数据点
- 显示系列名 + 数值 + 百分比（饼图）
- 深色背景 + 圆角 + 阴影，对标 ECharts 样式

### 图例交互

- 底部/顶部图例
- 鼠标 hover 高亮对应系列

## 主题色板

默认使用 ECharts 5.x 色板：

```typescript
const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#44d9b5',
];
```

可通过 series.color 或 series[].data[].color 自定义颜色。

## 万能守则

-  禁止使用 ECharts / Chart.js / D3 等第三方图表库
-  禁止裸色值（canvas 绘制前必须从 `draw-helpers.ts` 获取颜色）
-  禁止图表裸用（必须 `<base-card>` 容器包裹）
-  禁止无动画（默认开启入场动画，可关闭但不推荐）
-  禁止无 Tooltip（数据点必须可交互）

## 触发词

- "vue 图表"
- "vue-chart"
- "折线图" / "柱状图" / "饼图"
- "散点图" / "气泡图" / "雷达图"
- "仪表盘" / "进度环" / "漏斗图" / "热力图"
- "数据可视化" / "图表组件"
- "Canvas 图表"
