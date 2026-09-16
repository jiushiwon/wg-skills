# card-comment 评论卡片

> 评论展示卡片，包含头像、昵称、时间、内容、点赞。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | `var(--radius-md)` |
| 背景 | `var(--color-bg-surface)` |
| 阴影 | `var(--shadow-sm)` |

## 适用场景

- 评论区、留言板
- 问答详情
- 笔记评论

## HTML 演示

[card-comment.html](../card-2-html/card-comment.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-sm'">
  <view class="comment-item">
    <view class="comment-header">
      <image class="comment-avatar" :src="comment.avatar" />
      <view class="comment-info">
        <text class="comment-name">{{ comment.name }}</text>
        <text class="comment-time">{{ comment.time }}</text>
      </view>
    </view>
    <text class="comment-content">{{ comment.content }}</text>
    <view class="comment-action" v-if="showAction">
      <text>
        <svg class="icon"><use href="#i-heart" /></svg>
        {{ comment.likes }}
      </text>
      <text>
        <svg class="icon"><use href="#i-message-circle" /></svg>
        {{ comment.replies }}
      </text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| comment | object | - | 评论对象 |
| showAction | boolean | true | 显示操作 |
| showAvatar | boolean | true | 显示头像 |
