# card-line-area 折线图 · 堆叠面积图

> 多层面积堆叠图，展示各组成部分的累计变化。适合渠道分布、能量来源等场景。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 层数 | 2~5 层（推荐 3 层） |
| 填充透明度 | 0.85 |
| 图例 | 彩色方块 + 名称 |
| 累计 | 顶部数字 + 涨跌 |

## 适用场景

- 渠道访问占比（搜索 / 直接 / 社交）
- 能量来源构成（电 / 水 / 燃气）
- 收入来源拆分
- 用户来源构成

## HTML 演示

[card-line-area.html](../card-3-html/card-line-area.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <text class="chart-title">{{ title }}</text>
    <view class="chart-value-row">
      <text class="chart-value">{{ total }}</text>
      <text class="chart-meta">{{ trend }}</text>
    </view>
  </view>

  <view class="chart-legend">
    <view v-for="(l, i) in legend" :key="i" class="chart-legend-item">
      <view class="chart-legend-dot" :style="{ background: colors[i] }"/>
      <text>{{ l }}</text>
    </view>
  </view>

  <view class="chart-body">
    <svg viewBox="0 0 340 160">
      <!-- Build cumulative baselines -->
      <path
        v-for="(layer, i) in stackedLayers" :key="i"
        :class="`area-${i + 1}`"
        :d="areaPath(layer.upper, layer.lower)"
      />
    </svg>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| total | string | - | 累计总数 |
| trend | string | - | 涨跌 |
| series | number[][] | - | 多层数据（从底层到顶层） |
| colors | string[] | - | 颜色数组 |
| legend | string[] | - | 图例名 |
| labels | string[] | - | X 轴标签 |

## 变体参考

- 2 层堆叠 → `card-line-area`（精简版）
- 3 层堆叠 → 默认（搜索 / 直接 / 社交）
- 5 层堆叠 → 完整分布
- 时间累积 → 展示每周新增累计