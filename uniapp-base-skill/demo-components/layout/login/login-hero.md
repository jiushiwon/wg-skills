# 顶部主题图登录

> 顶部主题图 + Logo + 缓慢缩放动效 + 简洁表单，适合旅游、生活方式 App

## 风格

- 背景 → `var(--color-bg)` 纯白
- 顶部主题图 → 全宽背景图 + 渐变蒙层，高度 `260px`
- 主题图动效 → `scale(1)` 到 `scale(1.05)` 缓慢缩放，`15s` 周期
- Logo → 毛玻璃小方块 `48px`，圆角 `8px`
- 标题/副标题 → 白色文字，位于主题图底部
- 表单区 → 白色背景，账号密码输入框 + 登录按钮
- 输入框 → 浅灰背景 `var(--color-surface)`，圆角 `4px`
- 登录按钮 → 主色直角按钮，`4px` 圆角

## 页面结构

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │ ← 主题图区域
│ │  [图片背景 + 缓慢缩放动效]       │ │
│ │                                 │ │
│ │  [◈] 考拉搞AI                   │ │ ← Logo + 标题
│ │  让 AI 成为你的超级助手          │ │
│ └─────────────────────────────────┘ │
│                                     │
│  账号                               │
│  ┌────────────────────────────────┐ │ ← 输入框
│  │ ______________________________ │ │
│  └────────────────────────────────┘ │
│                                     │
│  密码                               │
│  ┌────────────────────────────────┐ │ ← 输入框
│  │ ______________________________ │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │ ← 登录按钮
│  │           登 录                 │ │
│  └────────────────────────────────┘ │
│                                     │
│  忘记密码          注册账号          │
│                                     │
│  登录即代表同意《用户协议》...       │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 主题图区域 -->
<base-card
  :height="'260px'"
  :overflow="'hidden'"
  :position="'relative'"
/>

<!-- 主题图背景 -->
<base-card
  :position="'absolute'"
  :inset="'0'"
  :background="'url(...) center/cover'"
  :animation="'hero-zoom 15s ease-in-out infinite'"
/>

<!-- 渐变蒙层 -->
<base-card
  :position="'absolute'"
  :inset="'0'"
  :background="'linear-gradient(180deg, rgba(74,144,226,0.3) 0%, rgba(0,0,0,0.4) 100%)'"
/>

<!-- Logo 图标 -->
<base-card
  :width="'48px'"
  :height="'48px'"
  :border-radius="'8px'"
  :background="'rgba(255,255,255,0.2)'"
  :backdrop-filter="'blur(8px)'"
  :border="'1px solid rgba(255,255,255,0.25)'"
/>

<!-- 输入框 -->
<base-card
  :width="'100%'"
  :height="'48px'"
  :border="'1px solid var(--color-border)'"
  :border-radius="'4px'"
  :background="'var(--color-surface)'"
  :padding="'0 var(--space-3)'"
/>

<!-- 登录按钮 -->
<base-card
  :width="'100%'"
  :height="'48px'"
  :background="'var(--color-primary)'"
  :color="'white'"
  :border-radius="'4px'"
/>
```

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- 旅游类 App
- 生活方式品牌
- 需要品牌故事感的登录页

## 触发词

```markdown
/uniapp-base-skill 做一个主题图登录页
/uniapp-base-skill 做一个大图登录页
```

## 演示

[查看 HTML 演示](login/login-hero.html)

## 注意事项

1. 主题图使用网络图片占位，实际项目应使用本地或 CDN 真实图片。
2. 缓慢缩放动效周期 `15s`，避免过于抢眼。
3. HTML 演示使用 `div`/`input`/`img` 标签，实际 uniapp 开发请替换为 `view`/`input`/`image`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
5. 所有颜色使用主题变量，禁止写死色值。
