# card-basic 基础卡片

> 通用信息展示卡片，支持标题、描述、标签、操作栏。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |
| 内边距 | 16px |

## 适用场景

- 公告、通知展示
- 文章摘要、新闻列表
- 活动介绍、专题推荐
- 任何需要标题+描述+辅助信息的内容

## HTML 演示

[card-basic.html](html/card-basic.html)

## 组件代码

```vue
<base-card
  :radius="'var(--radius-md)'"
  :padding="'var(--spacing-lg)'"
  :shadow="'shadow-sm'"
>
  <view class="card-header">
    <text class="card-title">{{ title }}</text>
  </view>
  <text class="card-desc">{{ desc }}</text>
  <view class="card-tags" v-if="showTags">
    <text v-for="tag in tags" class="tag">{{ tag }}</text>
  </view>
  <view class="card-action" v-if="showAction">
    <text class="time">{{ time }}</text>
    <text class="action">查看详情</text>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 标题文字 |
| desc | string | - | 描述文字 |
| tags | array | [] | 标签数组 |
| showTag | boolean | false | 是否显示标签 |
| showAction | boolean | false | 是否显示操作栏 |
| time | string | - | 时间文字 |

## 变体参考

- 纯文字 → card-basic（去标签、去操作）
- 带标签 → card-basic（保留 tags）
- 带操作 → card-basic（保留 action）
