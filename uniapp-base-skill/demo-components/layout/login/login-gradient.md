# 动态渐变背景登录

> 动态渐变背景 + 毛玻璃登录卡片 + 浮动光晕，适合创意、社交、年轻化 App

## 风格

- 背景 → 动态渐变 `linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4a90e2)`，400% 尺寸位移动画
- 浮动光晕 → 两个径向渐变圆形，`translate + scale` 浮动动画
- 头部 Logo → 毛玻璃小图标 + 应用名称，白色文字
- 标题 → 大标题 + 副标题，白色文字
- 登录卡片 → 白色半透明 `rgba(255,255,255,0.95)` + `backdrop-filter: blur(16px)`，小圆角 `4px`
- 输入框 → 下划线样式，透明背景，聚焦变主色
- 登录按钮 → 主色直角按钮，`4px` 圆角

## 页面结构

```
┌─────────────────────────────────────┐
│ ╔═════════════════════════════════╗ │ ← 动态渐变背景
│ ║  [◈] 考拉搞AI                    ║ │
│ ║                                 ║ │
│ ║  欢迎                            ║ │
│ ║  登录以继续使用                   ║ │
│ ║                                 ║ │
│ ║  ┌────────────────────────────┐ ║ │ ← 毛玻璃登录卡片
│ ║  │ 账号                        │ ║ │
│ ║  │ __________________________ │ ║ │
│ ║  │ 密码                        │ ║ │
│ ║  │ __________________________ │ ║ │
│ ║  │                            │ ║ │
│ ║  │        登 录                │ ║ │
│ ║  │ 忘记密码      注册账号      │ ║ │
│ ║  └────────────────────────────┘ ║ │
│ ╚═════════════════════════════════╝ │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 背景层 -->
<base-card
  :background="'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4a90e2)'"
  :background-size="'400% 400%'"
  :animation="'gradient-flow 12s ease infinite'"
/>

<!-- 头部 Logo 图标 -->
<base-card
  :width="'36px'"
  :height="'36px'"
  :border-radius="'8px'"
  :background="'rgba(255,255,255,0.2)'"
  :backdrop-filter="'blur(8px)'"
  :border="'1px solid var(--color-border)'"
/>

<!-- 登录卡片 -->
<base-card
  :background="'rgba(255,255,255,0.95)'"
  :backdrop-filter="'blur(16px)'"
  :border-radius="'4px'"
  :padding="'var(--space-6)'"
/>

<!-- 输入框 -->
<base-card
  :width="'100%'"
  :height="'48px'"
  :border="'none'"
  :border-bottom="'1px solid var(--color-border)'"
  :background="'transparent'"
  :focus-border-color="'var(--color-primary)'"
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

- 创意类 App
- 社交产品
- 年轻化品牌
- 需要强视觉冲击力的登录页

## 触发词

```markdown
/uniapp-base-skill 做一个渐变登录页
/uniapp-base-skill 做一个动态登录页
```

## 演示

[查看 HTML 演示](html/login-gradient.html)

## 注意事项

1. 动态渐变背景使用 `background-size: 400% 400%` + 位移动画，性能消耗较大，低端设备可简化。
2. 毛玻璃效果使用 `backdrop-filter: blur(16px)`，小程序和 App 端需测试兼容性。
3. HTML 演示使用 `div`/`input` 标签，实际 uniapp 开发请替换为 `view`/`input`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
5. 所有颜色使用主题变量，禁止写死色值。
