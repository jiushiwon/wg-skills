# 标准账号登录

> 标准账号登录页：Logo + 账号密码输入卡片 + 主按钮 + 第三方登录 + 协议

## 风格

- 背景 → `var(--color-bg)` 浅灰
- Logo → 渐变方形 `80px`，圆角 `20px`
- 登录卡片 → 白色背景，`var(--radius-lg)` 大圆角，`var(--shadow-sm)` 阴影
- 输入框 → 图标 + 输入框 + 密码可见切换，圆角 `12px`
- 登录按钮 → 渐变主色，`12px` 圆角，`52px` 高度
- 第三方登录 → 微信/QQ/微博圆形图标

## 页面结构

```
┌─────────────────────────────────────┐
│                                     │
│  ┌────┐                            │
│  │ A  │  考拉搞AI                   │ ← Logo 区
│  └────┘  登录即开启精彩体验          │
│                                     │
│  ┌────────────────────────────────┐ │ ← 登录卡片
│  │ 账号 [图标] ___________________  │ │
│  │ 密码 [图标] _____________ [图标]  │ │
│  └────────────────────────────────┘ │
│                                     │
│  [☑] 记住我        忘记密码？       │
│                                     │
│  ┌────────────────────────────────┐ │ ← 主按钮
│  │           登 录                 │ │
│  └────────────────────────────────┘ │
│                                     │
│        还没有账号？立即注册          │
│  ───────── 第三方登录 ─────────     │
│       [微信]  [QQ]  [微博]          │
│                                     │
│  登录即代表您同意《用户协议》...     │
└─────────────────────────────────────┘
```

## base-input + base-card 参数

> 输入框统一使用 [base-input](../../base-input.md)，与 [base-card](../../base-card.md) 同源（参数化外壳组件，包裹原生 input 元素）。

```vue
<!-- 登录卡片 -->
<base-card
  :background="'var(--color-surface)'"
  :border-radius="'var(--radius-lg)'"
  :padding="'var(--space-5)'"
  :shadow="'var(--shadow-sm)'"
>
  <!-- 账号输入 -->
  <base-input
    v-model="form.username"
    label="账号"
    required
    border="all"
    placeholder="请输入账号"
    show-clear
  />

  <!-- 密码输入 -->
  <base-input
    v-model="form.password"
    type="password"
    label="密码"
    required
    border="all"
    placeholder="请输入密码"
    show-password
  />
</base-card>

<!-- 登录按钮 -->
<base-card
  :width="'100%'"
  :height="'52px'"
  :border-radius="'var(--radius-md)'"
  :background="'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'"
  :shadow="'0 8px 24px rgba(74, 144, 226, 0.3)'"
  clickable
  @click="onLogin"
>
  <text style="color:#fff;">登录</text>
</base-card>
```

> 详细场景：参见 [base-input-login.md](../../base-input/base-input-login.md)

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- 通用 App 账号密码登录
- 需要支持多账号类型（手机号/邮箱/用户名）的产品
- 需要第三方登录入口的场景

## 触发词

```markdown
/uniapp-base-skill 做一个标准登录页
/uniapp-base-skill 做一个账号密码登录页
```

## 演示

[查看 HTML 演示](login/login.html)

## 注意事项

1. 输入框使用前缀 icon + 输入框 + 右侧显隐切换图标的组合结构。
2. 登录按钮圆角与输入框一致（`12px`），卡片使用更大的 `20px` 圆角。
3. HTML 演示使用 `div`/`input` 标签，实际 uniapp 开发请替换为 `view`/`input`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
5. 所有颜色使用主题变量，禁止写死色值。
