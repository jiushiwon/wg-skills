# 极简清爽登录

> 极简清爽：无圆角/小圆角、头部 Logo、下划线输入框，适合工具类、B端 App

## 风格

- 背景 → `var(--color-bg)` 纯白
- 头部 Logo → 小图标 `32px` + 应用名称横向排列
- 标题 → 大标题 + 副标题
- 输入框 → 下划线样式，无边框背景，聚焦变主色
- 登录按钮 → 直角主按钮，无投影，高度 `48px`
- 底部 → 忘记密码 / 注册账号 + 协议

## 页面结构

```
┌─────────────────────────────────────┐
│                                     │
│  [◈] 考拉搞AI                       │ ← 头部 Logo
│                                     │
│  欢迎回来                           │ ← 标题
│  请登录您的账号                      │ ← 副标题
│                                     │
│  账号                               │
│  ________________________________   │ ← 下划线输入框
│                                     │
│  密码                               │
│  ________________________________   │ ← 下划线输入框
│                                     │
│  ┌────────────────────────────────┐ │ ← 直角主按钮
│  │           登 录                 │ │
│  └────────────────────────────────┘ │
│                                     │
│  忘记密码？          注册账号        │
│                                     │
│  登录即代表同意《用户协议》...       │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- 头部 Logo -->
<base-card
  :display="'flex'"
  :align-items="'center'"
  :gap="'10px'"
/>

<!-- Logo 图标 -->
<base-card
  :width="'32px'"
  :height="'32px'"
  :border-radius="'8px'"
  :background="'var(--color-primary)'"
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
  :border-radius="'0'"
/>
```

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- 工具类 App
- B端产品
- 追求极简、清爽风格的产品

## 触发词

```markdown
/uniapp-base-skill 做一个极简登录页
/uniapp-base-skill 做一个清爽登录页
```

## 演示

[查看 HTML 演示](login/login-minimal.html)

## 注意事项

1. 输入框使用下划线样式，无背景色，聚焦时下划线变主色。
2. 登录按钮为直角，与整体极简风格一致。
3. HTML 演示使用 `div`/`input` 标签，实际 uniapp 开发请替换为 `view`/`input`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
5. 所有颜色使用主题变量，禁止写死色值。
