# card-line-metric 折线图 · 迷你指标卡

> 多指标列表卡片，每行包含图标 + 名称 + 数值 + 涨跌 + 右侧迷你折线（sparkline）。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 指标项 | 4 行（可定制 1-6 行） |
| 图标区 | 36×36，圆角 8，浅色背景 |
| 数值 | 18px 粗体 |
| Sparkline | 80×32，无轴、无标签 |

## 适用场景

- Dashboard 概览（4-6 个核心指标）
- 数据后台首页
- 运营报告卡

## HTML 演示

[card-line-metric.html](../card-3-html/card-line-metric.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="metric-head">
    <text class="metric-title">{{ title }}</text>
  </view>
  <view class="metric-list">
    <view v-for="m in metrics" :key="m.name" class="metric-row">
      <view class="metric-icon" :class="iconClass(m.sparkColor)">
        <svg><use :href="m.icon"/></svg>
      </view>
      <view class="metric-body">
        <text class="metric-name">{{ m.name }}</text>
        <view class="metric-value-row">
          <text class="metric-value">{{ m.value }}</text>
          <text class="metric-trend" :class="m.trend.direction">
            <svg class="metric-trend-arrow">
                  <use :href="m.trend.direction === 'up' ? '#i-trend-up' : '#i-trend-down'"/>
                </svg>
            {{ m.trend.value }}
          </text>
        </view>
      </view>
      <svg class="metric-spark" :class="sparkClass(m.sparkColor)" viewBox="0 0 80 32">
        <path class="spark-fill" :d="areaPath(m.sparkData)"/>
        <path class="spark-path" :d="linePath(m.sparkData)"/>
      </svg>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 卡片标题 |
| metrics | Metric[] | - | 指标列表（1-6 条） |

**Metric 子结构**：
| 字段 | 类型 | 说明 |
|------|------|------|
| icon | string | 图标名（i-users 等） |
| name | string | 指标名称 |
| value | string | 数值（已格式化） |
| trend | { value, direction } | 涨跌信息 |
| sparkData | number[] | 折线数据 |
| sparkColor | 'blue'\|'green'\|'orange'\|'purple' | 颜色主题 |

## 变体参考

- 4 行 → `card-line-metric`（默认）
- 2-3 行精简 → 减少指标项
- 6 行完整版 → 加分割线 hover 效果
- 横向卡片 → 1 行 2 个 metric（左右布局）