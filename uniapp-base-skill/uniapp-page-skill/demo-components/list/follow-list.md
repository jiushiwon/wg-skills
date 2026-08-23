# 关注列表

> 圆角卡片 + 间距分割，方形封面图，适合关注、订阅列表

## 风格

- 圆角 → `var(--radius-lg)`
- 间距分割 → `var(--space-3)`
- 方形封面图 → `var(--radius-sm)`
- 阴影 → `var(--shadow-sm)`

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card
│ [封面□]  标题                      │
│          描述               更新时间 │
└─────────────────────────────────────┘
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

- 关注列表
- 订阅号
- 频道列表
- 公众号列表
