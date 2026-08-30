# card-gauge 仪表盘卡片

> 原生 SVG 仪表盘（半圆 / 3/4 圆弧），展示数值状态。含渐变填充 + 指针 + 刻度。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 弧度 | 270°（3/4 圆，从 135° 到 45°） |
| 半径 | 110 px |
| 描边宽度 | 14 px |
| 渐变 | 三段（绿→蓝→橙） |
| 指针 | 三角形 + 中心 hub |
| 中心 | 36px 大数值 + 对比文案 |

## 适用场景

- 健康指数（HRV / 体能）
- CPU / 内存使用率
- 信用评分、风险指数
- 性能指标（SLA）
- 等级 / 进度（白金 / 黄金 / 白银）

## HTML 演示

[card-gauge.html](../card-3-html/card-gauge.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
    </view>
    <view class="chart-meta" :class="statusClass">{{ statusLabel }}</view>
  </view>
  <view class="chart-body">
    <svg viewBox="0 0 340 180">
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="#10b981"/>
          <stop offset="50%"  stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
      </defs>

      <!-- Track -->
      <path d="M startX,startY A 110 110 0 1 1 endX,endY"
        fill="none" stroke="#e2e8f0" stroke-width="14" stroke-linecap="round"/>

      <!-- Progress arc -->
      <path d="M startX,startY A 110 110 0 1 1 progX,progY"
        fill="none" stroke="url(#gaugeGrad)" stroke-width="14" stroke-linecap="round"/>

      <!-- Needle (triangle from center to value point) -->
      <path :d="needlePath" fill="#1e293b"/>

      <!-- Hub -->
      <circle cx="170" cy="150" r="8" fill="#1e293b"/>
    </svg>

    <view class="gauge-center">
      <text class="gauge-value">{{ value }}<text class="gauge-unit">/{{ maxValue }}</text></text>
      <text class="gauge-label">{{ compareText }}</text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| value | number | - | 当前值 |
| maxValue | number | 100 | 最大值 |
| unit | string | '' | 单位 |
| compareText | string | - | 对比文案 |
| status | 'poor'\|'normal'\|'good'\|'excellent' | 'good' | 状态 |
| color | GradientStops | 三段式 | 渐变 |

## 变体参考

- 3/4 圆 → `card-gauge`（默认，270°）
- 半圆 → 弧度改为 180°（从 180° 到 0°）
- 全圆 → 弧度改为 360°（带进度环）
- 多指针 → 多 needle 叠加（对比昨日/今日）