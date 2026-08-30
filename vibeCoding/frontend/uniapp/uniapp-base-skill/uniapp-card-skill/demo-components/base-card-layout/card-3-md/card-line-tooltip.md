# card-line-tooltip 折线图 · 节点 tooltip

> 折线图 + 数据节点圆点 + 活动节点 tooltip。展示"关键时刻"的具体数值。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 节点圆点 | 直径 6px（默认）、10px（激活） |
| 激活节点 | 实心蓝色 + 白色描边 |
| 引导线 | 垂直虚线，连接激活点到 X 轴 |
| Tooltip | 绝对定位，深色背景 + 倒三角箭头 |

## 适用场景

- 服务器响应时间（异常时刻）
- 股价关键点提示
- 性能监控（异常事件标注）
- 异常数据点高亮

## HTML 演示

[card-line-tooltip.html](../card-3-html/card-line-tooltip.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <text class="chart-title">{{ title }}</text>
    <view class="chart-value-row">
      <text class="chart-value">{{ value }}</text>
    </view>
  </view>

  <view class="chart-body">
    <svg class="chart-svg" :viewBox="`0 0 ${W} ${H}`">
      <path class="line-path" :d="pathD"/>
      <path class="area-fill" :d="pathD + `L ${W} ${H} L 0 ${H} Z`"/>

      <!-- Data point dots -->
      <circle
        v-for="(v, i) in series" :key="i"
        :cx="dotX(i)" :cy="dotY(i)" r="3"
        :class="i === activeIndex ? 'node-dot is-active' : 'node-dot'"
      />

      <!-- Vertical guide at active dot -->
      <line
        v-if="activeIndex !== null"
        :x1="dotX(activeIndex)" :y1="dotY(activeIndex)"
        :x2="dotX(activeIndex)" :y2="H"
        stroke="#3b82f6" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>
    </svg>

    <!-- Tooltip overlay -->
    <view v-if="activeIndex !== null" class="tooltip-box"
      :style="{ left: dotX(activeIndex) + 'px', top: (dotY(activeIndex) - 50) + 'px' }">
      <text class="tooltip-label">{{ tooltip.label }}</text>
      <text class="tooltip-value">{{ tooltip.value }}</text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| value | string | - | 主数值 |
| series | number[] | - | 数值序列 |
| labels | string[] | - | X 轴标签 |
| activeIndex | number \| null | - | 高亮节点 |
| tooltip | { label, value } | - | tooltip 内容 |

## 变体参考

- 单点高亮 → `card-line-tooltip`（默认）
- 多点高亮 → `activeIndexes: number[]`，多个 tooltip
- 范围高亮 → 高亮一段区域（如 P95）
- 阈值线 → 添加水平参考线（基线 / 阈值）