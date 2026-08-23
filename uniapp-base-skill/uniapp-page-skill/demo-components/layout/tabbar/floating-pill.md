# 悬浮药丸 TabBar

> 底部居中悬浮药丸 + 毛玻璃 + 圆角，适合健康、生活、工具类 App

## 风格

- 背景 → `rgba(255,255,255,0.95)` 半透明白 + `backdrop-filter: blur(16px)`
- 形状 → 胶囊形 `border-radius: 999px`
- 位置 → `bottom: 24px` 居中悬浮，不贴底边
- Tab 项 → 图标 + 文字横向排列，选中后主色填充
- 阴影 → `0 12px 40px rgba(0,0,0,0.12)`
- 交互 → 点击切换 active 状态，按压缩小反馈

## 页面结构

```
┌─────────────────────────────────────┐
│  健康生活                           │
│  ┌───────────────────────────────┐  │
│  │ 今日步数                       │  │
│  │ 已完成 8,432 步，目标 10,000 步 │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 饮水记录                       │  │
│  │ 今日饮水 1,200ml，继续保持      │  │
│  └───────────────────────────────┘  │
│                                     │
│       ┌─────────────────────┐       │ ← 悬浮药丸 TabBar
│       │ [🏠]首页  [⚡]运动  [👤] │       │
│       └─────────────────────┘       │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 悬浮药丸容器 -->
<base-card
  :position="'fixed'"
  :bottom="'24px'"
  :left="'50%'"
  :transform="'translateX(-50%)'"
  :display="'flex'"
  :gap="'4px'"
  :background="'rgba(255,255,255,0.95)'"
  :backdrop-filter="'blur(16px)'"
  :border="'1px solid rgba(0,0,0,0.06)'"
  :border-radius="'999px'"
  :padding="'6px'"
  :shadow="'0 12px 40px rgba(0,0,0,0.12)'"
/>

<!-- Tab 项 -->
<base-card
  :display="'flex'"
  :align-items="'center'"
  :gap="'6px'"
  :padding="'10px 14px'"
  :border-radius="'999px'"
  :color="'var(--color-text-secondary)'"
  :active-background="'var(--color-primary)'"
  :active-color="'white'"
/>
```

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- 健康、运动类 App
- 生活、工具类 App
- 需要精致感和呼吸感的页面

## 触发词

```markdown
/uniapp-base-skill 做一个悬浮药丸 TabBar
/uniapp-base-skill 做一个居中悬浮的底部导航
```

## 演示

[查看 HTML 演示](html/floating-pill.html)

## 注意事项

1. 悬浮 TabBar 不贴底边，需给页面内容预留足够底部间距。
2. Tab 项文字使用 `white-space: nowrap` 防止换行。
3. HTML 演示使用 `div` 标签，实际 uniapp 开发请替换为 `view`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
