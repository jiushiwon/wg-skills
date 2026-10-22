# article-card 使用示例

> 卡片外壳由根容器 `BaseCard` 提供（圆角、背景、边框），业务侧只传内容。

## 左侧缩略图模式

```vue
<template>
<article-card
  image="/static/article.jpg"
  title="文章标题"
  desc="文章描述"
  author="作者"
  date="2024-01-01"
  @click="goToDetail"
/>
</template>


```

## 封面图模式

```vue
<template>
<article-card
  mode="cover"
  image="/static/article.jpg"
  title="文章标题"
  author="作者"
  date="2024-01-01"
  views="1000"
/>
</template>


```

## 说明

- `mode` 决定图片位置：`thumb` 在左侧，`cover` 在顶部通栏。
- `image` 加载失败时自动隐藏图片区，标题与描述照常展示。
- `views` 展示为「阅读 {views}」。
