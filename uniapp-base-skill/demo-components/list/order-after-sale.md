# 订单列表

> 圆角卡片 + 间距分割，带状态栏和操作按钮，适合订单、售后列表

## 风格

- 圆角 → `var(--radius-lg)`
- 间距分割 → `var(--space-3)`
- 顶部状态栏
- 底部操作按钮
- 阴影 → `var(--shadow-sm)`

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card
│  店铺名                 处理中      │  ← 状态栏
├─────────────────────────────────────┤
│ [商品图]  商品标题                  │
│          规格              ¥9999    │
├─────────────────────────────────────┤
│                    [按钮] [按钮]   │  ← 操作栏
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-3)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 订单内容 -->
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 订单列表
- 售后列表
- 物流跟踪
- 进度查询
