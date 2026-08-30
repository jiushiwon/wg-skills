# card-video 视频卡片

> 视频信息卡片，包含封面、播放按钮、时长、标题、作者、播放/点赞数。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | `var(--radius-md)` |
| 背景 | `var(--color-bg-surface)` |
| 阴影 | shadow-sm |
| 封面比例 | 16 : 10 |
| 播放按钮 | 56 × 56 px 圆形 |

## 适用场景

- 视频列表（横版 16:10）
- 课程预览、教程推荐
- 直播回放、短视频卡片

## HTML 演示

[card-video.html](../card-2-html/card-video.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :padding="0" :shadow="'shadow-sm'">
  <view class="video-cover" @click="onPlay">
    <image :src="video.cover" mode="aspectFill" />
    <view v-if="video.tag" class="video-tag">{{ video.tag }}</view>
    <view class="video-duration">{{ video.duration }}</view>
    <view class="video-play">
      <svg class="icon"><use href="#i-play" /></svg>
    </view>
  </view>

  <view class="video-body">
    <text class="video-title">{{ video.title }}</text>
    <view class="video-meta">
      <text class="video-author">{{ video.author }}</text>
      <view class="video-stats">
        <text><svg class="icon"><use href="#i-eye" /></svg> {{ formatNum(video.views) }}</text>
        <text><svg class="icon"><use href="#i-thumbs-up" /></svg> {{ video.likes }}</text>
        <text><svg class="icon"><use href="#i-clock" /></svg> {{ video.time }}</text>
      </view>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| cover | string | - | 封面 URL |
| duration | string | - | 时长 mm:ss |
| title | string | - | 视频标题（自动 2 行截断） |
| author | string | - | 作者昵称 |
| views | number | 0 | 播放数 |
| likes | number | 0 | 点赞数 |
| time | string | - | 发布时间 |
| tag | string | - | 角标文字（可选，如"教程"） |

## 变体参考

- 横版 16:10 → `card-video`（默认）
- 竖版 9:16 → 自定义 `aspect-ratio` 通过 prop 扩展
- 带角标 → `card-video`（tag 不为空）
- 直播态 → 替换 `i-play` 为 `i-live`（红点 + LIVE 文字）