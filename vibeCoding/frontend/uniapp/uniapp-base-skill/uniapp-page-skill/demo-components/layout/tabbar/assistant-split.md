# AI 助手分栏 TabBar

> 左侧独立 AI 助手入口 + 右侧连体工具组，适合 AI 助手、健康管理类 App

## 风格

- 左侧 AI 助手 → 圆形头像按钮 `56px` + 脉冲呼吸圈动画
- 右侧工具组 → 药丸形容器，内部工具项均分
- 背景 → `var(--color-bg-surface)` 纯白
- 选中态 → 浅主色背景 `rgba(20, 184, 166, 0.1)` + 主色文字
- 位置 → `bottom: 24px` 左右留边距悬浮

## 页面结构

```
┌─────────────────────────────────────┐
│  健康助手                           │
│  ┌───────────────────────────────┐  │
│  │ 你好呀～ 我是你的健康管家       │  │
│  │ 饮食、饮水、运动、体重、睡眠    │  │
│  │ 都可以随时告诉我帮你记录。      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌────┐  ┌─────────────────────┐   │ ← 分栏 TabBar
│  │ AI │  │ 待办  [数据]  我的    │   │
│  │ ◉  │  └─────────────────────┘   │
│  └────┘                               │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 分栏 TabBar 容器 -->
<base-card
  :position="'fixed'"
  :bottom="'24px'"
  :left="'var(--space-4)'"
  :right="'var(--space-4)'"
  :display="'flex'"
  :align-items="'center'"
  :justify-content="'space-between'"
  :gap="'var(--space-3)'"
/>

<!-- 左侧 AI 助手按钮 -->
<base-card
  :width="'56px'"
  :height="'56px'"
  :border-radius="'var(--radius-full)'"
  :background="'var(--color-bg-surface)'"
  :border="'1px solid rgba(20, 184, 166, 0.2)'"
  :shadow="'0 8px 24px rgba(20, 184, 166, 0.2)'"
/>

<!-- 右侧连体工具组 -->
<base-card
  :flex="'1'"
  :display="'flex'"
  :align-items="'center'"
  :background="'var(--color-bg-surface)'"
  :border-radius="'var(--radius-full)'"
  :padding="'6px'"
  :shadow="'0 8px 24px rgba(0,0,0,0.08)'"
/>
```

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- AI 助手类 App
- 健康管理类 App
- 智能陪伴、记录类产品

## 触发词

```markdown
/uniapp-base-skill 做一个 AI 助手分栏 TabBar
/uniapp-base-skill 做一个左侧 AI 助手右侧工具组的底部导航
```

## 演示

[查看 HTML 演示](html/assistant-split.html)

## 注意事项

1. AI 助手按钮使用 `::before` 伪元素绘制脉冲圈，营造呼吸感。
2. 脉冲动画使用 CSS `@keyframes pulse`，低性能设备可关闭。
3. HTML 演示使用 `div`/`img` 标签，实际 uniapp 开发请替换为 `view`/`image`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
