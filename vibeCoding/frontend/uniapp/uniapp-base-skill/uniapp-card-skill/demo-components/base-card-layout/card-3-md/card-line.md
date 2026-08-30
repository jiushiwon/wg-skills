# card-line 折线图卡片

> 原生 SVG 平滑折线图，展示数据趋势。含主数值、涨跌指示、渐变填充。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 标题区 | 24px 数值 + 12px 涨跌 |
| 图表区 | 高度 160 px |
| 网格 | 3 条虚线（40/80/120） |
| 曲线 | 平滑贝塞尔 + 渐变填充 |
| 高亮 | 末端圆点 + tooltip |

## 适用场景

- 销售 / GMV / 营收趋势
- 活跃用户、留存曲线
- 心率 / 步数 / 体重等健康数据
- 股价、汇率走势

## HTML 演示

[card-line.html](../card-3-html/card-line.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ value }}</text>
    </view>
    <view class="chart-meta" :class="{ 'is-down': trend.direction === 'down' }">
      <svg class="chart-meta-arrow"><use href="#i-trend-up"/></svg>
      <text>{{ trend.value }}</text>
      <text class="chart-meta-sep">{{ trend.compareText }}</text>
    </view>
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
| trend | { value, direction, compareText } | - | 涨跌信息 |
| series | number[] | - | 数值序列 |
| labels | string[] | - | X 轴标签 |
| color | string | '#3b82f6' | 主色 |
| smooth | boolean | true | 平滑曲线 |

## 变体参考

- 单线 → `card-line`（默认）
- 双线对比 → 两条 path + 颜色区分
- 阶梯线 → `smooth: false`，折线直角连接
- 大数据量 → 折线 + 区域选中（hover 高亮）