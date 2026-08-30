# card-pie 环形饼图卡片

> 原生 SVG 环形饼图，展示占比分析。含中心数值 + 右侧彩色图例。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 环形直径 | 140 px |
| 描边宽度 | 6 px（stroke-width） |
| 中心 | 大数值 + 小标签 |
| 图例 | 4 项：颜色点 + 名称 + 数值 + 百分比 |

## 适用场景

- 流量来源、用户构成
- 消费分类、预算占比
- 任务分布、状态占比
- 商品类别销售占比

## HTML 演示

[card-pie.html](../card-3-html/card-pie.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ value }}</text>
    </view>
  </view>
  <view class="chart-body">
    <view class="donut-wrap">
      <svg class="donut-svg" viewBox="0 0 42 42">
        <circle
          v-for="(s, i) in segments" :key="i"
          cx="21" cy="21" r="15.915" fill="transparent"
          :stroke="s.color" stroke-width="6"
          :stroke-dasharray="`${s.pct} ${100 - s.pct}`"
          :stroke-dashoffset="-cumulativeOffset(i)"
        />
      </svg>
      <view class="donut-center">
        <text class="donut-center-num">{{ total }}</text>
        <text class="donut-center-label">{{ totalLabel }}</text>
      </view>
    </view>
    <view class="pie-legend">
      <view v-for="s in segments" :key="s.label" class="pie-legend-item">
        <view class="pie-legend-left">
          <view class="pie-legend-dot" :style="{ background: s.color }"/>
          <text>{{ s.label }}</text>
        </view>
        <view>
          <text class="pie-legend-val">{{ s.value }}</text>
          <text class="pie-legend-pct">{{ s.pct }}%</text>
        </view>
      </view>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| total | string | - | 中心主数 |
| totalLabel | string | - | 中心副标 |
| segments | {label, value, color, pct}[] | - | 段数据 |
| type | 'donut' \| 'pie' | 'donut' | 环形 / 饼 |

## 变体参考

- 环形 → `card-pie`（默认，donut）
- 实心饼 → `type: 'pie'`，移除中心
- 半环 → viewBox 截一半
- 多层嵌套 → 多个同心圆环（旭日图雏形）