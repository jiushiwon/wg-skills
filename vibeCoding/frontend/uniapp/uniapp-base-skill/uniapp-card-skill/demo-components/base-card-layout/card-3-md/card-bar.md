# card-bar 柱状图卡片

> 原生 SVG 柱状图，支持高亮当前项 + 数值标签 + 类别标签。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 标题区 | 22px 数值 + 时段切换 tab |
| 图表区 | 高度 160 px |
| 柱条宽度 | 32 px，圆角 4 px |
| 高亮 | 当前柱填主色，其他浅色 |
| 数值 | 柱顶上方 11 px 文字 |
| 类别 | 柱下方 10 px 文字 |

## 适用场景

- 月度 / 周度业绩对比
- 分类销量排行
- 任务完成数对比
- 用户增长柱状

## HTML 演示

[card-bar.html](../card-3-html/card-bar.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-value">{{ value }}<text class="unit">/{{ activeLabel }}</text></text>
    </view>
    <view class="chart-tabs">
      <text
        v-for="t in tabs" :key="t"
        class="chart-tab" :class="{ 'is-active': t === currentTab }"
        @click="onTab(t)">{{ t }}</text>
    </view>
  </view>
  <view class="chart-body">
    <svg class="chart-svg" :viewBox="`0 0 ${W} ${H}`">
      <rect
        v-for="(v, i) in data" :key="i"
        :x="i * stepX + offset" :y="H - v * scale"
        :width="barW" :height="v * scale"
        rx="4"
        :class="i === activeIndex ? 'bar-active' : 'bar-default'"
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
| data | number[] | - | 数值数组 |
| labels | string[] | - | 类别标签 |
| activeIndex | number | - | 高亮索引 |
| unit | string | '' | 单位 |
| color | string | '#3b82f6' | 高亮色 |

## 变体参考

- 单色 → `card-bar`（默认）
- 渐变柱条 → 用 `linearGradient` 填充
- 水平柱 → `direction: 'horizontal'`
- 堆叠柱 → 多 `data` 数组合并
- 排名 Top → 前 3 高亮（金/银/铜）