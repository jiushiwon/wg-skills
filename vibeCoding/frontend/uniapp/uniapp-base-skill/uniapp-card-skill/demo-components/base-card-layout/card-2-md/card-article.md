# card-article 文章卡片

> 资讯文章卡片，包含封面、分类角标、标题、摘要、作者头像、阅读/评论/收藏数。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | `var(--radius-md)` |
| 背景 | `var(--color-bg-surface)` |
| 阴影 | shadow-sm |
| 封面比例 | 16 : 9 |
| 标题行数 | 最多 2 行 |
| 摘要行数 | 最多 2 行 |

## 适用场景

- 资讯流、博客列表
- 公众号文章卡片
- 知乎专栏、Medium 风格

## HTML 演示

[card-article.html](../card-2-html/card-article.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :padding="0" :shadow="'shadow-sm'">
  <view class="article-cover">
    <image :src="article.cover" mode="aspectFill" />
    <text v-if="article.category" class="article-category">
      {{ article.category }}
    </text>
  </view>

  <view class="article-body">
    <text class="article-title">{{ article.title }}</text>
    <text class="article-summary">{{ article.summary }}</text>

    <view class="article-footer">
      <image class="article-avatar" :src="article.avatar" />
      <text class="article-author">{{ article.author }}</text>
      <view class="article-stats">
        <text><svg class="icon"><use href="#i-eye" /></svg> {{ article.views }}</text>
        <text><svg class="icon"><use href="#i-message-circle" /></svg> {{ article.comments }}</text>
        <text><svg class="icon"><use href="#i-bookmark" /></svg> {{ article.bookmarks }}</text>
      </view>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| cover | string | - | 封面 URL |
| category | string | - | 分类角标（可选） |
| title | string | - | 文章标题 |
| summary | string | - | 摘要 |
| author | string | - | 作者昵称 |
| avatar | string | - | 作者头像 URL |
| views | number | 0 | 阅读量 |
| comments | number | 0 | 评论数 |
| bookmarks | number | 0 | 收藏数 |

## 变体参考

- 有封面 → `card-article`（默认）
- 无封面纯文字 → `card-article`（cover 为空）
- 多图横滑 → 扩展为 `coverList: string[]`
- 视频文章 → `card-article`（封面叠加播放图标）