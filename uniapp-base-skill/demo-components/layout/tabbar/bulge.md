# 中间凸起 TabBar

> 底部中间凸起 + 主色发布按钮，适合社区、内容平台类 App

## 风格

- 背景 → `var(--color-surface)` 纯白
- 顶部圆角 → `24px`
- 中间凸起 → 伪元素圆形 `80px`，制造凹陷视觉效果
- 主按钮 → 渐变 `var(--color-primary)` 到 `#6bb3ff`，圆形 `56px`
- 阴影 → `var(--shadow-lg)` 顶部投影营造悬浮感
- 安全区 → `padding-bottom: env(safe-area-inset-bottom, 12px)`

## 页面结构

```
┌─────────────────────────────────────┐
│  首页                               │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐   │
│  │卡片│  │卡片│  │卡片│  │卡片│   │
│  └────┘  └────┘  └────┘  └────┘   │
│                                     │
│  ┌────────────────────────────────┐ │ ← base-card 容器
│  │  首页    探索   [发布]   商城   我的  │ ← TabBar
│  │              ●                   │ ← 中间凸起主按钮
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
  :height="'80px'"
  :background="'var(--color-surface)'"
  :border-radius="'24px 24px 0 0'"
  :shadow="'var(--shadow-lg)'"
/>

<!-- 中间凸起发布按钮 -->
<base-card
  :width="'56px'"
  :height="'56px'"
  :border-radius="'var(--radius-full)'"
  :background="'linear-gradient(135deg, var(--color-primary), #6bb3ff)'"
  :shadow="'0 6px 16px rgba(74, 144, 226, 0.4)'"
/>
```

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- 社区首页
- 内容平台
- 短视频/图文创作 App
- 需要强化发布/创作入口的产品

## 触发词

```markdown
/uniapp-base-skill 做一个中间凸起的 TabBar
/uniapp-base-skill 做一个带发布按钮的底部导航
```

## 演示

[查看 HTML 演示](tabbar/bulge.html)

## 注意事项

1. 中间凸起使用 `::before` 伪元素绘制圆形背景，与主按钮形成层级关系。
2. Tab 项使用 `flex: 1` 均分宽度，中间按钮使用负边距向上偏移。
3. HTML 演示使用 `div` 标签，实际 uniapp 开发请替换为 `view`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
