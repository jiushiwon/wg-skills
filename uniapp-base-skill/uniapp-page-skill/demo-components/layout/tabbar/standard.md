# 标准图标文字 TabBar

> 标准图标 + 文字 + 顶部细线，通用性最强，适合大多数 App

## 风格

- 背景 → `var(--color-surface)` 纯白
- 顶部边框 → `1px solid var(--color-border)`
- 布局 → `justify-content: space-around`，5 个 Tab 均分
- 图标 → `22px`，文字 → `11px`
- 选中态 → `var(--color-primary)` 主色高亮
- 安全区 → `padding-bottom: env(safe-area-inset-bottom, 8px)`

## 页面结构

```
┌─────────────────────────────────────┐
│  工作台                             │
│  ┌────┐  待办事项                 │
│  └────┘  今日有 3 个任务待处理     │
│  ┌────┐  消息通知                 │
│  └────┘  收到 2 条新消息          │
│                                     │
│  ┌────────────────────────────────┐ │ ← base-card 容器
│  │  [🏠]    [⭐]    [💬]    [👤]   │ ← TabBar
│  │  首页    发现    消息    我的   │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- TabBar 外层容器 -->
<base-card
  :position="'fixed'"
  :bottom="'0'"
  :left="'0'"
  :right="'0'"
  :height="'64px'"
  :background="'var(--color-surface)'"
  :border-top="'1px solid var(--color-border)'"
  :shadow="'var(--shadow-top)'"
/>

<!-- Tab 项 -->
<base-card
  :flex="'1'"
  :display="'flex'"
  :flex-direction="'column'"
  :align-items="'center'"
  :gap="'4px'"
  :color="'var(--color-text-tertiary)'"
  :active-color="'var(--color-primary)'"
/>
```

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- 通用型 App
- 工具类、办公类 App
- 电商、资讯、社交等大多数产品

## 触发词

```markdown
/uniapp-base-skill 做一个标准 TabBar
/uniapp-base-skill 做一个底部图标文字导航
```

## 演示

[查看 HTML 演示](html/standard.html)

## 注意事项

1. 这是最常见、最安全的 TabBar 形式，兼容性最好。
2. Tab 项使用 `flex: 1` 均分，保证各屏幕宽度下对齐。
3. HTML 演示使用 `div` 标签，实际 uniapp 开发请替换为 `view`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
