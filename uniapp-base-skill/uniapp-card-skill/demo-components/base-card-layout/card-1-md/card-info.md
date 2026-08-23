# card-info 信息卡片

> 统计数据展示，包含统计网格、详情列表、进度条。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |

## 适用场景

- 个人中心统计
- 数据看板
- 任务进度

## HTML 演示

[card-info.html](html/card-info.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-sm'">
  <view class="card-title" v-if="title">{{ title }}</view>
  <!-- 统计网格 -->
  <view class="stat-grid" v-if="type === 'stats'" :style="{ gridTemplateColumns: 'repeat(' + columns + ', 1fr)' }">
    <view class="stat-item" v-for="item in data">
      <text class="stat-value">{{ item.value }}</text>
      <text class="stat-label">{{ item.label }}</text>
    </view>
  </view>
  <!-- 详情列表 -->
  <view class="info-list" v-else-if="type === 'detail'">
    <view class="info-row" v-for="row in data">
      <text class="info-label">{{ row.label }}</text>
      <text class="info-value" :class="{ primary: row.primary }">{{ row.value }}</text>
    </view>
  </view>
  <!-- 进度条 -->
  <view class="progress-section" v-else-if="type === 'progress'">
    <view class="info-row">
      <text class="info-label">{{ label }}</text>
      <text class="info-value">{{ current }}/{{ total }}</text>
    </view>
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: (current/total*100) + '%' }"></view>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | 'stats' | 类型 stats/detail/progress/tags/rating |
| data | array | [] | 数据 |
| columns | number | 3 | 统计列数 |
| showBorder | boolean | true | 显示分割线 |
