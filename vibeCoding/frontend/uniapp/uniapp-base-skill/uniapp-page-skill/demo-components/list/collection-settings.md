# 设置列表

> 大卡片套小卡片：大卡片圆角+间距，小卡片无圆角+border分割

## 风格

- 外层大卡片：圆角 `var(--radius-lg)` + 间距 `var(--space-4)`
- 内层小卡片：无圆角 `var(--radius-none)` + border 分割
- 支持开关和箭头两种右侧组件

## 页面结构

```
┌─────────────────────────────────────┐  ← 大卡片
│ ┌─────────────────────────────────┐│  ← 小卡片
│ │ [图标]  标题        [开关/→]  ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ [图标]  标题        [开关/→]  ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 外层大卡片 -->
<base-card
  :radius="'var(--radius-lg)'"
  :margin="'var(--space-4)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 内层设置项 -->
  <base-card
    :radius="'var(--radius-none)'"
    :margin="'0'"
    :padding="'var(--space-3) var(--space-4)'"
    :border="'1rpx solid var(--color-border)'"
    clickable
  >
    <!-- 设置项内容 -->
  </base-card>
</base-card>
```

## 主题变量

> 详见 [uniapp-theme-skill](https://github.com/jiushiwon/wg-skills/tree/main/uniapp-theme-skill)

## 适用场景

- 设置页面
- 个人中心
- 系统设置
- 偏好设置
