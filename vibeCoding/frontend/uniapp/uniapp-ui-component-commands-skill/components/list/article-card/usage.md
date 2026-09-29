# article-card 使用示例

## 左侧缩略图模式

```vue
<article-card
  image="/static/article.jpg"
  title="文章标题"
  desc="文章描述"
  author="作者"
  date="2024-01-01"
  @click="goToDetail"
/>
```

## 封面图模式

```vue
<article-card
  mode="cover"
  image="/static/article.jpg"
  title="文章标题"
  author="作者"
  date="2024-01-01"
  views="1000"
/>
```
