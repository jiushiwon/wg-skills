# card-notify 通知卡片

> 通知列表卡片，包含图标、标题、描述、时间、徽标。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |

## 适用场景

- 系统通知列表
- 消息中心
- 活动提醒

## HTML 演示

[card-notify.html](html/card-notify.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-sm'">
  <view class="card-title" v-if="title">{{ title }}</view>
  <view class="notify-item" v-for="item in list">
    <view class="notify-icon" :style="{ background: item.iconBg }">
      <image :src="item.icon" />
    </view>
    <view class="notify-content">
      <view class="notify-title">
        {{ item.title }}
        <text class="notify-badge" v-if="item.badge">{{ item.badge }}</text>
      </view>
      <text class="notify-desc">{{ item.desc }}</text>
      <text class="notify-time" v-if="showTime">{{ item.time }}</text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 卡片标题 |
| list | array | [] | 通知列表 |
| showBadge | boolean | true | 显示徽标 |
| showTime | boolean | true | 显示时间 |
