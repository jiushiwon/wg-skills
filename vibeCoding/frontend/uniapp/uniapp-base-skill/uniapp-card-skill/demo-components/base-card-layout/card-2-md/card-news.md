# card-news 新闻卡片（列表型）

> 新闻资讯列表卡片，左文右图布局，含标题、摘要、来源、阅读数、发布时间、热门标记。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | `var(--radius-md)` |
| 背景 | `var(--color-bg-surface)` |
| 阴影 | shadow-sm |
| 缩略图尺寸 | 100 × 70 px |
| 标题行数 | 最多 2 行 |

## 适用场景

- 新闻资讯流（今日头条、腾讯新闻）
- 公众号文章列表
- 行业资讯聚合页

## HTML 演示

[card-news.html](../card-2-html/card-news.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :padding="0" :shadow="'shadow-sm'">
  <view
    v-for="item in newsList"
    :key="item.id"
    class="news-item"
    @click="onTap(item)"
  >
    <view class="news-content">
      <view class="news-headline-row">
        <text class="news-headline">{{ item.headline }}</text>
        <text v-if="item.hot" class="news-hot">
          <svg class="icon"><use href="#i-trending-up" /></svg>
          热
        </text>
      </view>
      <text class="news-summary">{{ item.summary }}</text>
      <view class="news-meta">
        <text class="news-source">{{ item.source }}</text>
        <text class="divider">·</text>
        <text>{{ formatViews(item.views) }} 阅读</text>
        <text class="divider">·</text>
        <text>{{ item.time }}</text>
      </view>
    </view>
    <image v-if="item.thumb" class="news-thumb" :src="item.thumb" mode="aspectFill" />
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| headline | string | - | 新闻标题 |
| summary | string | - | 摘要 |
| source | string | - | 来源 |
| views | number | 0 | 阅读数 |
| time | string | - | 发布时间 |
| thumb | string | - | 缩略图（可选，无图纯文字版） |
| hot | boolean | false | 是否热门（红色"热"标签） |

## 变体参考

- 大图版 → `card-image`（卡片式）
- 列表型 → `card-news`（默认）
- 三图横排 → `card-news`（`thumbList: string[]` 扩展）
- 视频新闻 → `card-video`（封面 + 播放）