# 毛玻璃背景 TabBar

> 底部毛玻璃背景 + 圆角顶部 + 中央播放按钮，适合音乐、播客、生活类 App

## 风格

- 背景 → `rgba(255,255,255,0.72)` 半透明 + `backdrop-filter: blur(20px)`
- 顶部圆角 → `24px 24px 0 0`
- 边框 → `1px solid rgba(255,255,255,0.5)`
- 位置 → 底部悬浮，左右留 `12px` 边距
- 中央按钮 → 主色圆形播放按钮 `42px`，带投影
- 选中态 → `var(--color-primary)` 高亮

## 页面结构

```
┌─────────────────────────────────────┐
│  音乐馆                             │
│  ┌───────────────────────────────┐  │
│  │ 今日推荐                       │  │
│  │ ████████████░░░░░░░░░░        │  │
│  └───────────────────────────────┘  │
│  ┌────┐  轻音乐合集               │
│  └────┘  适合专注与放松            │
│                                     │
│  ┌────────────────────────────────┐ │ ← base-card 容器
│  │ 首页   发现   [▶]   喜欢   我的 │ ← TabBar
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- TabBar 外层容器 -->
<base-card
  :position="'fixed'"
  :bottom="'0'"
  :left="'var(--space-3)'"
  :right="'var(--space-3)'"
  :height="'68px'"
  :background="'rgba(255,255,255,0.72)'"
  :backdrop-filter="'blur(20px)'"
  :border-radius="'24px 24px 0 0'"
  :border="'1px solid rgba(255,255,255,0.5)'"
  :shadow="'0 -8px 32px rgba(139, 92, 246, 0.12)'"
/>

<!-- 中央播放按钮 -->
<base-card
  :width="'42px'"
  :height="'42px'"
  :border-radius="'var(--radius-full)'"
  :background="'var(--color-primary)'"
  :shadow="'0 4px 12px rgba(139, 92, 246, 0.35)'"
/>
```

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- 音乐播放器
- 播客/电台 App
- 高端生活类 App
- 需要强调核心播放操作的产品

## 触发词

```markdown
/uniapp-base-skill 做一个毛玻璃 TabBar
/uniapp-base-skill 做一个音乐播放器的底部导航
```

## 演示

[查看 HTML 演示](html/blur.html)

## 注意事项

1. `backdrop-filter` 在小程序和 App 端需测试兼容性，低版本可能不生效。
2. 中央按钮通过 `position: relative` 提升层级，位于毛玻璃底座上方。
3. HTML 演示使用 `div` 标签，实际 uniapp 开发请替换为 `view`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
