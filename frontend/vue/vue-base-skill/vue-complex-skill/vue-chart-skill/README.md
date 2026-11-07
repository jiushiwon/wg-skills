# vue-chart-skill

Vue 3 Canvas 图表技能，零第三方依赖，纯 Canvas 2D 绘制，对标 ECharts 视觉品质。

## 功能特性

- ✅ 零依赖：纯 Canvas 2D API，不依赖 ECharts / Chart.js / D3
- ✅ 20 种图表形态：折线7种 + 柱状4种 + 饼图3种 + 散点/雷达/仪表盘/进度环/漏斗/热力图
- ✅ 入场动画：cubicOut 缓动 + 交错动画
- ✅ Tooltip：鼠标悬浮显示数据详情
- ✅ 图例交互：hover 高亮对应系列
- ✅ DPR 适配：高分屏自动缩放，始终清晰
- ✅ 主题色板：内置 ECharts 默认色板 + 柔和色板 + 暗色色板
- ✅ 响应式：容器尺寸变化自动重绘

## 引用组件

- vue-card-skill — 图表容器
- vue-theme-skill — 设计 Token

## 图表清单

| # | 图表 | 组件 | 适用场景 |
|---|------|------|---------|
| 1 | 基础/平滑/面积折线 | BaseLineChart | 趋势分析、时间序列 |
| 2 | 多线/堆叠/双轴折线 | BaseLineChart | 多指标对比 |
| 3 | 基础/分组/堆叠柱状 | BaseBarChart | 分类对比、业绩统计 |
| 4 | 环形/饼/南丁格尔 | BasePieChart | 占比分析、构成展示 |
| 5 | 散点/气泡图 | BaseScatterChart | 相关性分析 |
| 6 | 雷达图 | BaseRadarChart | 多维评估、能力对比 |
| 7 | 仪表盘 | BaseGaugeChart | KPI、完成率 |
| 8 | 进度环 | BaseProgressRing | 任务进度 |
| 9 | 漏斗图 | BaseFunnelChart | 转化分析 |
| 10 | 热力图 | BaseHeatmapChart | 时间分布、密度 |

## 使用方式

```vue
<script setup lang="ts">
import { BaseLineChart } from './components/BaseLineChart';
import type { LineChartOption } from './types/chart';

const option: LineChartOption = {
  title: { text: '月度趋势' },
  tooltip: { show: true },
  xAxis: { type: 'category', data: ['1月','2月','3月','4月','5月','6月'] },
  yAxis: { type: 'value' },
  series: [
    { name: '销售额', data: [120,200,150,180,230,210], smooth: true, area: true },
  ],
};
</script>

<template>
  <base-card title="销售数据">
    <BaseLineChart :option="option" :width="560" :height="320" />
  </base-card>
</template>
```

## 目录结构

```
vue-chart-skill/
├── SKILL.md              # 技能入口（触发词 + 完整使用文档）
├── README.md             # 本文件
├── types/
│   └── chart.ts          # 全量类型定义（20+ 接口）
├── composables/
│   ├── useCanvas.ts      # Canvas 初始化 + DPR 适配
│   ├── useTooltip.ts     # 鼠标 Tooltip 交互
│   ├── useAnimation.ts   # requestAnimationFrame 动画
│   └── draw-helpers.ts   # 绘图工具函数（60+ 函数）
├── components/
│   ├── BaseLineChart.vue   # 折线图（7 种形态）
│   ├── BaseBarChart.vue    # 柱状图（4 种形态）
│   ├── BasePieChart.vue    # 饼图（3 种形态）
│   ├── BaseScatterChart.vue  # 散点/气泡图
│   ├── BaseRadarChart.vue    # 雷达图
│   ├── BaseGaugeChart.vue    # 仪表盘
│   ├── BaseProgressRing.vue  # 进度环
│   ├── BaseFunnelChart.vue   # 漏斗图
│   └── BaseHeatmapChart.vue  # 热力图
└── demo-components/
    └── chart-showcase/html/00-showcase.html
```

## 触发词

- "vue 图表" / "vue-chart"
- "折线图" / "柱状图" / "饼图" / "散点图"
- "雷达图" / "仪表盘" / "进度环"
- "漏斗图" / "热力图" / "数据可视化"
