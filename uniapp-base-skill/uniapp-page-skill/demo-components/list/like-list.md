# 获赞与收藏

> 圆角卡片 + 间距分割，带 Tab 切换，适合互动记录列表

## 风格

- 圆角 → `var(--radius-lg)`
- 间距分割 → `var(--space-3)`
- 顶部 Tab 切换
- 阴影 → `var(--shadow-sm)`

## 页面结构

```
┌─────────────────────────────────────┐
│  赞    收藏    评论                  │ ← Tab 切换
├─────────────────────────────────────┤
│ [头像○]  用户名  时间                │
│          赞了你的作品                │
└─────────────────────────────────────┘  ← base-card
```

## base-card 参数

```vue
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 内容 -->
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 获赞列表
- 收藏列表
- 评论列表
- 互动消息
