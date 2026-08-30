# card-line-multi 折线图 · 多线对比

> 多条折线对比（本月 / 上月 / 平均），含彩色图例与样式区分。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 主线宽度 | 2.5 px（突出当前） |
| 副线宽度 | 1.5 px |
| 样式 | 实线 / 虚线 / 半透明 |
| 高亮 | 当前线末端圆点 |
| 图例 | 彩色短线 + 名称 |

## 适用场景

- 多产品线销售对比
- 多部门业绩排行
- 多渠道流量分析
- 同比 / 环比

## HTML 演示

[card-line-multi.html](../card-3-html/card-line-multi.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <text class="chart-title">{{ title }}</text>
    <text class="chart-value">{{ value }}</text>
  </view>

  <view class="chart-legend">
    <view v-for="l in lines" :key="l.name" class="chart-legend-item">
      <view class="chart-legend-dot" :style="{ background: l.color }"/>
      <text>{{ l.name }}</text>
    </view>
  </view>

  <view class="chart-body">
    <svg class="chart-svg" :viewBox="`0 0 ${W} ${H}`">
      <path
        v-for="(l, i) in lines" :key="i"
        :class="l.active ? 'line-current' : l.dashed ? 'line-avg' : 'line-last'"
        :stroke="l.color"
        :d="pathOf(l.data)"
      />
    </svg>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| value | string | - | 主数值 |
| lines | Line[] | - | 多线数据 |
| labels | string[] | - | X 轴标签 |

**Line 子结构**：
| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 名称（图例） |
| color | string | 颜色 |
| data | number[] | 数值 |
| dashed | boolean | 是否虚线 |
| active | boolean | 是否主线（高亮） |

## 变体参考

- 2 线对比 → `card-line-multi`（本月 vs 上月）
- 3 线对比 → + 平均线（虚线）
- 4+ 线对比 → 调色板使用浅色调，避免视觉混乱