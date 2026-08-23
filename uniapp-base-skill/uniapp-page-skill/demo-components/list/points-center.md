# 升值中心

> 圆角卡片 + 间距分割，带头部数据展示，适合积分、资产中心

## 风格

- 圆角 → `var(--radius-lg)`
- 间距分割 → `var(--space-4)`
- 头部渐变背景
- 数据统计卡片

## 页面结构

```
┌─────────────────────────────────────┐
│           当前积分                  │  ← 头部渐变背景
│            12,850                  │
│           积分明细 ›               │
├─────────────────────────────────────┤
│   今日收入  │  本月收入  │  连续天数 │
├─────────────────────────────────────┤
│ [图标]  任务标题              +10  │ ← base-card
│         任务描述                     │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 头部 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-4)'"
  :background="'var(--color-primary)'"
>
  <!-- 积分展示 -->
</base-card>

<!-- 任务项 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-4)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 任务内容 -->
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 积分中心
- 资产中心
- 会员中心
- 钱包页面
