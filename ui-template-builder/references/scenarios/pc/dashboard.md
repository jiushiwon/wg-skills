# 数据大屏模板

## 页面概述

数据可视化展示页面，用于实时监控、数据展示、统计报表等场景。

## 适用场景

- 运营数据大屏
- 监控系统
- 指挥中心
- 销售报表
- IoT设备监控

## 模板结构

```
dashboard/
├── index.vue           # 主页面
├── components/
│   ├── header.vue      # 顶部标题区
│   ├── stat-card.vue   # 数字指标卡
│   ├── chart-line.vue  # 折线图
│   ├── chart-bar.vue   # 柱状图
│   ├── chart-pie.vue  # 饼图/环形图
│   ├── chart-map.vue  # 地图
│   ├── rank-list.vue  # 排名列表
│   └── scroll-list.vue # 滚动列表
└── mock.json
```

## 布局变体

### 变体1：标准三栏

```
┌──────────────────────────────────────────┐
│              顶部标题区                    │
├────────┬─────────────┬───────────────────┤
│        │             │                   │
│  左    │    中       │      右           │
│  侧    │   图表      │      侧           │
│  列    │   区域      │      列           │
│        │             │                   │
│        │             │                   │
└────────┴─────────────┴───────────────────┘
```

### 变体2：左中右+底部

```
┌──────────────────────────────────────────┐
│              顶部标题区                    │
├────────┬─────────────┬───────────────────┤
│        │             │                   │
│  左    │    中       │      右           │
│  侧    │   地图      │      侧           │
│        │             │                   │
├────────┴─────────────┴───────────────────┤
│              底部图表区                    │
└──────────────────────────────────────────┘
```

### 变体3：单屏卡片

```
┌──────────────────────────────────────────┐
│              顶部标题区                    │
├──────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│  │指标│ │指标│ │指标│ │指标│            │
│  └────┘ └────┘ └────┘ └────┘            │
├──────────────────────────────────────────┤
│                                          │
│              主图表区                      │
│                                          │
├──────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │子图表│ │子图表│ │子图表│            │
│  └──────┘ └──────┘ └──────┘            │
└──────────────────────────────────────────┘
```

## 风格变体

### 风格1：科技深蓝

```scss
--bg-page: #0A0E27;
--bg-card: #0D1238;
--border: #1A237E;
--primary: #00D9FF;
--secondary: #7C4DFF;
--success: #00E676;
--warning: #FFAB00;
--danger: #FF5252;
--text-primary: #FFFFFF;
--text-secondary: #8892B0;
--glow: 0 0 10px rgba(0, 217, 255, 0.5);
```

**特点**：
- 深蓝背景
- 青色/紫色主色
- 发光效果
- 科技感强

**适用**：监控中心、指挥大屏

### 风格2：商务蓝

```scss
--bg-page: #0F172A;
--bg-card: #1E293B;
--border: #334155;
--primary: #3B82F6;
--secondary: #8B5CF6;
--text-primary: #F1F5F9;
--text-secondary: #94A3B8;
```

**特点**：
- 浅蓝灰背景
- 卡片式布局
- 商务感

**适用**：运营报表、销售数据

### 风格3：赛博朋克

```scss
--bg-page: #000000;
--bg-card: #0D0D0D;
--border: #1A1A1A;
--primary: #FF00FF;
--secondary: #00FFFF;
--accent: #FFFF00;
--glow-pink: 0 0 20px rgba(255, 0, 255, 0.6);
--glow-cyan: 0 0 20px rgba(0, 255, 255, 0.6);
```

**特点**：
- 纯黑背景
- 霓虹色块
- 强烈对比
- 未来感

**适用**：游戏数据、科技展示

### 风格4：山水国风

```scss
--bg-page: #0C1222;
--bg-card: #151E32;
--border: #2D3A4F;
--primary: #4ADE80;
--secondary: #22D3EE;
--text-primary: #E2E8F0;
--text-secondary: #94A3B8;
```

**特点**：
- 深色背景
- 云雾水墨元素
- 绿/青主色
- 国风意境

**适用**：文旅数据、景区监控

## 组件库

### 1. StatCard 指标卡片

```vue
<template>
  <div class="stat-card">
    <div class="stat-header">
      <span class="stat-title">{{ title }}</span>
      <span class="stat-icon" :style="{ color: color }">
        <component :is="icon" />
      </span>
    </div>
    <div class="stat-value">
      <span class="value">{{ formatNumber(value) }}</span>
      <span class="unit">{{ unit }}</span>
    </div>
    <div class="stat-trend" :class="trend > 0 ? 'up' : 'down'">
      <span>{{ trend > 0 ? '↑' : '↓' }}</span>
      <span>{{ Math.abs(trend) }}%</span>
      <span class="period">较{{ period }}</span>
    </div>
  </div>
</template>
```

**样式变体**：
- 数字滚动动画
- 发光边框
- 渐变背景

### 2. ChartLine 折线图

```vue
<template>
  <div class="chart-line">
    <div class="chart-header">
      <span class="chart-title">{{ title }}</span>
    </div>
    <div class="chart-body">
      <div ref="chartRef" class="echarts-container"></div>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  color: { type: String, default: '#00D9FF' }
})

// ECharts配置
const option = {
  grid: { left: 40, right: 20, top: 20, bottom: 20 },
  xAxis: {
    type: 'category',
    data: props.data.map(d => d.time),
    axisLine: { lineStyle: { color: '#334155' } },
    axisLabel: { color: '#94A3B8' }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#1E293B' } },
    axisLabel: { color: '#94A3B8' }
  },
  series: [{
    type: 'line',
    data: props.data.map(d => d.value),
    smooth: true,
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: props.color + '40' },
        { offset: 1, color: props.color + '00' }
      ])
    },
    lineStyle: { color: props.color },
    itemStyle: { color: props.color }
  }]
}
</script>
```

### 3. ChartPie 环形图

```vue
<template>
  <div class="chart-pie">
    <div ref="chartRef" class="echarts-container"></div>
    <div class="pie-center">
      <span class="center-value">{{ total }}</span>
      <span class="center-label">{{ centerLabel }}</span>
    </div>
  </div>
</template>
```

### 4. RankList 排名列表

```vue
<template>
  <div class="rank-list">
    <div
      v-for="(item, index) in list"
      :key="item.id"
      class="rank-item"
    >
      <span class="rank-index" :class="{ top: index < 3 }">
        {{ index + 1 }}
      </span>
      <span class="rank-name">{{ item.name }}</span>
      <span class="rank-value">{{ item.value }}</span>
      <div class="rank-bar">
        <div
          class="rank-bar-fill"
          :style="{ width: (item.value / maxValue * 100) + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>
```

### 5. MapVisual 地图可视化

```vue
<template>
  <div class="map-visual">
    <div ref="mapRef" class="map-container"></div>
    <div class="map-tooltip"></div>
  </div>
</template>

<script setup>
// 使用 ECharts 地图
import 'echarts/map/js/china.js'
// 或使用百度地图、高德地图SDK
</script>
```

## 动态效果

### 1. 数字滚动

```js
function animateNumber(el, start, end, duration) {
  const startTime = Date.now()
  const diff = end - start

  function update() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const current = start + diff * easeOutQuart(progress)
    el.textContent = formatNumber(Math.floor(current))

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}
```

### 2. 进场动画

```scss
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeInUp 0.5s ease-out forwards;
  animation-delay: var(--delay, 0s);
}
```

### 3. 数据刷新

```js
// 定时刷新数据
setInterval(() => {
  fetchData().then(data => {
    updateCharts(data)
    updateStats(data)
  })
}, 5000) // 5秒刷新
```

## Mock数据

```json
{
  "header": {
    "title": "运营数据大屏",
    "subtitle": "实时数据监控",
    "updateTime": "2024-01-01 12:00:00"
  },
  "stats": [
    {
      "id": "s1",
      "title": "今日订单",
      "value": 1234,
      "unit": "单",
      "trend": 12.5,
      "period": "昨日",
      "icon": "order",
      "color": "#00D9FF"
    },
    {
      "id": "s2",
      "title": "销售额",
      "value": 567890,
      "unit": "元",
      "trend": 8.3,
      "period": "昨日",
      "icon": "money",
      "color": "#00E676"
    }
  ],
  "lineChart": {
    "title": "销售额趋势",
    "data": [
      { "time": "00:00", "value": 1200 },
      { "time": "04:00", "value": 800 },
      { "time": "08:00", "value": 2500 },
      { "time": "12:00", "value": 5000 }
    ]
  },
  "pieChart": {
    "title": "订单占比",
    "data": [
      { "name": "待付款", "value": 100, "color": "#FF5252" },
      { "name": "待发货", "value": 200, "color": "#FFAB00" },
      { "name": "已完成", "value": 900, "color": "#00E676" }
    ]
  },
  "rankList": {
    "title": "销售排行",
    "data": [
      { "id": "1", "name": "商品A", "value": 5000 },
      { "id": "2", "name": "商品B", "value": 4200 },
      { "id": "3", "name": "商品C", "value": 3800 }
    ]
  }
}
```

## 常用图表库

| 库 | 特点 |
|---|------|
| ECharts | 功能全面，文档丰富 |
| AntV G2 | 轻量，设计感强 |
| Chart.js | 简单易用 |
| D3.js | 高度自定义 |

## 验证清单

- [ ] 数字滚动动画流畅
- [ ] 图表渲染正常
- [ ] 窗口resize自适应
- [ ] 深色主题无刺眼颜色
- [ ] 移动端展示正确
- [ ] 数据刷新正常
