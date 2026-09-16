# card-topic 话题卡片

> 社区话题卡片，含话题头图、话题名、描述、讨论数、参与人数、参与按钮。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | `var(--radius-md)` |
| 背景 | `var(--color-bg-surface)` |
| 阴影 | shadow-sm |
| 头图高度 | 80 px |
| 头图样式 | 渐变色（可配置） |

## 适用场景

- 微博/小红书话题广场
- 知乎热榜话题
- 社区 #标签 入口

## HTML 演示

[card-topic.html](../card-2-html/card-topic.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :padding="0" :shadow="'shadow-sm'">
  <view class="topic-banner" :style="bannerStyle"></view>
  <view class="topic-body">
    <view class="topic-name-row">
      <svg class="icon"><use href="#i-hash" /></svg>
      <text class="topic-name">{{ topic.name }}</text>
      <text v-if="topic.badge" class="topic-badge">{{ topic.badge }}</text>
    </view>
    <text class="topic-desc">{{ topic.desc }}</text>
    <view class="topic-stats">
      <text class="topic-stat">
        <svg class="icon"><use href="#i-message-square" /></svg>
        {{ formatNum(topic.discussions) }} 讨论
      </text>
      <text class="topic-stat">
        <svg class="icon"><use href="#i-users" /></svg>
        {{ formatNum(topic.participants) }} 参与
      </text>
      <text class="topic-join" @click="onJoin">参与话题</text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| name | string | - | 话题名 |
| desc | string | - | 话题描述 |
| discussions | number | 0 | 讨论数 |
| participants | number | 0 | 参与人数 |
| badge | string | - | 角标（可选，如"推荐"/"热门"） |
| bannerColor | string[] | - | 头图渐变色（默认橙→粉） |

## 变体参考

- 带头图 → `card-topic`（默认）
- 无头图 → `card-topic`（隐藏 banner）
- 已加入 → `card-topic`（按钮文案改为"已加入"，置灰）
- 超级话题 → 角标 `badge: '超级'`（红色高亮）