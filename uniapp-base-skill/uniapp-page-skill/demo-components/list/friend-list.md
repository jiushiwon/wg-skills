# 好友列表

> 圆角卡片 + 间距分割，圆形头像，适合好友、联系人列表

## 风格

- 圆角 → `var(--radius-lg)` 或 `var(--radius-card)`
- 间距分割 → `var(--space-3)`
- 圆形头像 → `var(--radius-avatar)` = `var(--radius-full)`
- 阴影 → `var(--shadow-sm)`

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card
│ [头像○]  昵称             标签    │
│          签名                        │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
  clickable
>
  <!-- 内容 -->
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 好友列表
- 联系人列表
- 新的好友
- 粉丝列表
