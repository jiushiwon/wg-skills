# card-radar 雷达图卡片

> 原生 SVG 雷达图，多维能力 / 评分对比展示。含多层多边形网格 + 双数据对比。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 雷达直径 | 160 px |
| 多边形层级 | 4 层（20/40/60/80%） |
| 维度数 | 3 ~ 8（推荐 5~6） |
| 双数据 | 本人 vs 同行平均（虚线） |

## 适用场景

- 综合能力评估（HR / 绩效）
- 产品多维度评分
- 个人技能雷达
- 游戏角色属性图
- 健康多指标（体能 / 力量 / 柔韧）

## HTML 演示

[card-radar.html](../card-3-html/card-radar.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ totalScore }}<text class="unit"> / 综合分</text></text>
    </view>
    <view class="chart-meta">{{ rankText }}</view>
  </view>
  <view class="chart-body">
    <view class="radar-wrap">
      <svg viewBox="0 0 200 200">
        <!-- Concentric polygons -->
        <polygon v-for="r in ringLevels" :key="r"
          class="radar-grid"
          :points="hexagonPoints(r)" />

        <!-- Axes -->
        <line v-for="(label, i) in labels" :key="i"
          class="radar-axis-line"
          x1="100" y1="100"
          :x2="axisX(i)" :y2="axisY(i)" />

        <!-- Peer (dashed) -->
        <polygon class="radar-area-peer"
          :points="polygonPoints(peerValues)" />

        <!-- Self (solid) -->
        <polygon class="radar-area-self"
          :points="polygonPoints(selfValues)" />

        <!-- Labels -->
        <text v-for="(label, i) in labels" :key="`l-${i}`"
          :x="labelX(i)" :y="labelY(i)"
          text-anchor="middle">{{ label }}</text>
      </svg>
    </view>

    <view class="radar-stats">
      <view v-for="(label, i) in labels" :key="`s-${i}`" class="radar-stat-row">
        <text class="radar-stat-label">
          <view class="radar-stat-dot" />
          {{ label }}
        </text>
        <text class="radar-stat-val">{{ selfValues[i] }}</text>
      </view>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| totalScore | number | - | 综合分 |
| labels | string[] | - | 维度名 |
| selfValues | number[] | - | 本人分数 |
| peerValues | number[] | - | 同行分数（可选） |
| maxValue | number | 100 | 最大值 |
| ringLevels | number[] | [20,40,60,80] | 网格层百分比 |

## 变体参考

- 单数据 → `card-radar`（默认）
- 双数据对比 → `peerValues`（虚线层）
- 三方对比 → 三个 polygon 叠加
- 实心填充 → 提高 `fill-opacity` 透明度区分层级