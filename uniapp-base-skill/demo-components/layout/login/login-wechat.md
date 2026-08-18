# 一键登录风格

> 微信一键登录风格：Logo + 主操作按钮 + 次要按钮 + 其他方式 + 协议

## 风格

- 背景 → 浅蓝渐变 `linear-gradient(180deg, #e8f4fd 0%, var(--color-bg) 50%)`
- Logo → 白色方形 `90px`，圆角 `20px`，带阴影
- 主按钮 → 微信绿 `var(--color-wechat)`，胶囊形，带微信图标
- 次要按钮 → 白色背景 + 主色边框，胶囊形
- 其他方式 → 账号密码 / 邮箱圆形图标

## 页面结构

```
┌─────────────────────────────────────┐
│                                     │
│  ┌────┐                            │
│  │ ◈  │  考拉搞AI                   │ ← Logo 区
│  └────┘  一键登录，即刻开始          │
│                                     │
│  ┌────────────────────────────────┐ │ ← 微信一键登录按钮
│  │     [微信] 微信一键登录          │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │ ← 手机号登录按钮
│  │          手机号登录              │ │
│  └────────────────────────────────┘ │
│                                     │
│  ───────── 其他方式 ─────────       │
│       [🔒]        [✉️]              │
│     账号密码      邮箱              │
│                                     │
│  登录即代表您同意《用户协议》...     │
└─────────────────────────────────────┘
```

## base-card 参数

```vue
<!-- Logo 卡片 -->
<base-card
  :width="'90px'"
  :height="'90px'"
  :border-radius="'var(--radius-lg)'"
  :background="'var(--color-surface)'"
  :shadow="'var(--shadow-sm)'"
/>

<!-- 微信一键登录按钮 -->
<base-card
  :width="'100%'"
  :height="'52px'"
  :border-radius="'var(--radius-full)'"
  :background="'var(--color-wechat)'"
  :color="'white'"
  :shadow="'0 8px 24px rgba(7, 193, 96, 0.3)'"
/>

<!-- 次要按钮 -->
<base-card
  :width="'100%'"
  :height="'52px'"
  :border-radius="'var(--radius-full)'"
  :background="'var(--color-surface)'"
  :border="'1px solid var(--color-primary)'"
  :color="'var(--color-primary)'"
/>

<!-- 其他方式图标 -->
<base-card
  :width="'48px'"
  :height="'48px'"
  :border-radius="'50%'"
  :background="'var(--color-surface)'"
  :shadow="'var(--shadow-sm)'"
/>
```

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- 微信生态 App
- 第三方授权登录场景
- 希望降低登录门槛的产品

## 触发词

```markdown
/uniapp-base-skill 做一个微信登录页
/uniapp-base-skill 做一个一键登录页
```

## 演示

[查看 HTML 演示](login/login-wechat.html)

## 注意事项

1. 主按钮使用微信绿 `#07c160`，应通过 `uniapp-theme-skill` 变量管理。
2. 按钮均为胶囊形 `999px`，与登录页其他风格区分。
3. HTML 演示使用 `div` 标签，实际 uniapp 开发请替换为 `view`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
5. 所有颜色使用主题变量，禁止写死色值。
