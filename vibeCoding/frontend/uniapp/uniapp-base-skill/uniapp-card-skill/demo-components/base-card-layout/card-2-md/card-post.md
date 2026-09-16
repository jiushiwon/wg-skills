# card-post 动态卡片（朋友圈 / 微博）

> 社交动态卡片，包含头像、昵称、标签、时间、文字、多图九宫格、地理位置、互动操作。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | `var(--radius-md)` |
| 背景 | `var(--color-bg-surface)` |
| 阴影 | shadow-sm |
| 头像尺寸 | 40 × 40 px |
| 图片网格 | 3 列九宫格 |

## 适用场景

- 朋友圈、微博动态
- 小红书、Instagram 帖子
- 社区广场、个人主页时间线

## HTML 演示

[card-post.html](../card-2-html/card-post.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :padding="0" :shadow="'shadow-sm'">
  <view class="post-header">
    <image class="post-avatar" :src="post.avatar" />
    <view class="post-meta">
      <text class="post-name">
        {{ post.name }}
        <text v-if="post.isAuthor" class="post-name-tag">作者</text>
      </text>
      <text class="post-time">{{ post.time }}</text>
    </view>
  </view>

  <text class="post-content">{{ post.content }}</text>

  <view class="post-images">
    <image
      v-for="(img, i) in post.images.slice(0, 9)"
      :key="i"
      :src="img"
      mode="aspectFill"
    />
  </view>

  <view v-if="post.location" class="post-location">
    <svg class="icon"><use href="#i-map-pin" /></svg>
    <text>{{ post.location }}</text>
  </view>

  <view class="post-actions">
    <view class="post-action" @click="onLike">
      <svg class="icon"><use href="#i-heart" /></svg>
      <text>{{ post.likes }}</text>
    </view>
    <view class="post-action" @click="onComment">
      <svg class="icon"><use href="#i-message-circle" /></svg>
      <text>{{ post.comments }}</text>
    </view>
    <view class="post-action" @click="onShare">
      <svg class="icon"><use href="#i-share" /></svg>
      <text>分享</text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| avatar | string | - | 头像地址（支持首字 fallback） |
| name | string | - | 用户名 |
| time | string | - | 发布时间 |
| isAuthor | boolean | false | 是否显示"作者"标签 |
| content | string | - | 文字内容 |
| images | string[] | [] | 图片列表（最多 9 张） |
| location | string | - | 地理位置（可选） |
| likes | number | 0 | 点赞数 |
| comments | number | 0 | 评论数 |

## 变体参考

- 单图 → `card-post`（images 长度 = 1）
- 多图九宫格 → `card-post`（images 长度 = 4 / 6 / 9）
- 纯文字 → `card-post`（images = []）
- 含定位 → `card-post`（location 不为空）