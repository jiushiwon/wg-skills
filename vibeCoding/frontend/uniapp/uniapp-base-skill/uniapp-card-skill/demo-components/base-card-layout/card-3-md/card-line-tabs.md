# card-line-tabs 折线图 · Tab 切换时段

> 顶部带 Tab 切换的折线图，支持 7天 / 30天 / 90天 / 全部等不同时段数据切换。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| Tab 栏 | 4 段等宽切换，激活态主色填充 |
| 主数值 | 22px |
| 图表区 | 高度 140 px（比基础版略矮，给 Tab 让空间） |

## 适用场景

- 访问量趋势（7/30/90天切换）
- 销售统计（日 / 周 / 月）
- 活跃用户趋势
- 健康指标（24h / 7d / 30d）

## HTML 演示

[card-line-tabs.html](../card-3-html/card-line-tabs.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ value }}</text>
    </view>
    <view class="chart-meta">
      <svg class="chart-meta-arrow"><use href="#i-trend-up"/></svg>
      <text>{{ trend.value }}</text>
      <text class="chart-meta-sep">{{ trend.compareText }}</text>
    </view>
  </view>

  <view class="chart-tabs">
    <text
      v-for="t in tabs" :key="t"
      class="chart-tab" :class="{ 'is-active': t === activeTab }"
      @click="onTabChange(t)">{{ t }}</text>
  </view>

  <view class="chart-body">
    <svg class="chart-svg" :viewBox="`0 0 ${W} ${H}`">
      <path class="line-path" :d="pathD" />
      <path class="area-fill" :d="pathD + `L ${W} ${H} L 0 ${H} Z`" />
    </svg>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| value | string | - | 主数值 |
| trend | { value, direction, compareText } | - | 涨跌 |
| tabs | string[] | - | 时段选项 |
| activeTab | string | - | 当前时段 |
| seriesByTab | Record<string, number[]> | - | 各时段数据 |

## 变体参考

- 4 段 tab → `card-line-tabs`（默认：7/30/90/全部）
- 2 段 tab → 简化版（昨日 / 今日）
- 5 段 tab → 含本年 / 去年对比