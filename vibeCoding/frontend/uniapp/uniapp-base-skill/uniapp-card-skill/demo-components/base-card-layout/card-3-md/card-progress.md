# card-progress 进度环卡片

> 原生 SVG 进度环，展示完成度。含中心百分比 + 右侧任务列表。

## 形态特征

| 特征 | 值 |
|------|-----|
| 容器 | `base-card` |
| 进度环直径 | 132 px |
| 描边宽度 | 6 px（stroke-width） |
| 中心 | 28px 百分比 + 11px 标签 |
| 任务列表 | 3~5 项，含状态图标 + 优先级 |

## 适用场景

- 今日任务完成度
- 学习进度、阅读进度
- 项目里程碑
- 健身目标完成度
- 课程进度

## HTML 演示

[card-progress.html](../card-3-html/card-progress.html)

## 组件代码

```vue
<base-card :padding="0">
  <view class="chart-head">
    <view>
      <text class="chart-title">{{ title }}</text>
      <text class="chart-subtitle">{{ current }} / {{ total }} 已完成</text>
    </view>
  </view>
  <view class="chart-body">
    <view class="progress-ring-wrap">
      <svg viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.915"
          fill="transparent" stroke="#e2e8f0" stroke-width="6"/>
        <circle cx="21" cy="21" r="15.915"
          fill="transparent" :stroke="color" stroke-width="6"
          stroke-linecap="round"
          :stroke-dasharray="`${percent} ${100 - percent}`"/>
      </svg>
      <view class="progress-ring-center">
        <text class="progress-ring-pct">{{ percent }}%</text>
        <text class="progress-ring-label">已完成</text>
      </view>
    </view>
    <view class="task-list">
      <view v-for="t in tasks" :key="t.id" class="task-item">
        <view class="task-check" :class="{ 'is-pending': !t.done }">
          <svg><use :href="t.done ? '#i-check' : '#i-clock'"/></svg>
        </view>
        <text class="task-text" :class="{ 'is-done': t.done }">{{ t.text }}</text>
        <text class="task-priority" :class="{ 'is-high': t.priority === 'high' }">
          {{ t.done ? '已完' : t.priority === 'high' ? '高' : '普' }}
        </text>
      </view>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 图表标题 |
| current | number | - | 当前完成数 |
| total | number | - | 总数 |
| unit | string | '项' | 单位 |
| color | string | '#3b82f6' | 主色 |
| size | 'sm' \| 'lg' | 'lg' | 尺寸 |
| tasks | Task[] | - | 任务列表 |

## 变体参考

- 单环 → `card-progress`（默认）
- 多层环 → 多个 `<circle>` 同心，叠加不同 `percent`
- 半环 → 截取 50% SVG 高度
- 多色 → 不同段不同颜色（已完成/进行中/未开始）