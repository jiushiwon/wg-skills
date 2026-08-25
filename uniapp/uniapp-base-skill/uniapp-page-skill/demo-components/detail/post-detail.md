# 帖子详情

> 作者信息卡片 + 大图 + 正文 + 互动数据 + 评论区 + 底部评论栏，适合帖子、日记、文章详情

## 风格

- 圆角 → `var(--radius-lg)`
- 间距分割 → `var(--space-3)`
- 头像圆形 → `var(--radius-full)`
- 互动项 → 图标 + 数字
- 底部评论栏 → `position: sticky; bottom: 0`

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card
│ [头像] 宝石助手          [关注]     │
├─────────────────────────────────────┤  ← base-card
│ 广东｜竟然有属于自己的奇石你们知道吗？│
│ [帖子大图]                           │
│ 文章包括各种文体的著作...            │
│ [定位图标] 湖南 永州                         │
├─────────────────────────────────────┤  ← base-card
│ [心形图标] 2718   [星形图标] 1242   [分享图标] 分享            │
├─────────────────────────────────────┤  ← base-card
│ 评论 1242                            │
│ [头像] 石友9527          3小时前    │
│ 都不知道广东也有那么漂亮的石头！     │
├─────────────────────────────────────┤  ← 底部评论栏
│ [说点什么...]  [心形图标]2718  [星形图标]1242         │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 作者卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :padding="'var(--space-3) var(--space-4)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 头像 + 昵称 + 关注按钮 -->
</base-card>

<!-- 内容卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :padding="'0 var(--space-4) var(--space-4)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 标题 + 图片 + 正文 + 定位 -->
</base-card>

<!-- 互动卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 点赞/收藏/分享 -->
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 帖子详情
- 日记详情
- 文章详情
- 动态详情

## 触发词

```markdown
/uniapp-base-skill 做一个帖子详情页，作者信息，大图正文，点赞评论互动
```

## 演示

[查看 HTML 演示](html/post-detail.html)
