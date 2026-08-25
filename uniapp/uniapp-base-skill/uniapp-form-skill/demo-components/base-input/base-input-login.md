# base-input 账号密码登录

> 通用账号密码登录表单：账号 + 密码两行，使用 `base-input` 全边框形态。

## 风格

- 容器 → 白色卡片，`var(--radius-md)` 中圆角
- 输入框 → 8px 圆角 + 全边框，浅底灰留空感
- 密码框 → 右侧内嵌「隐藏/显示」切换
- 账号框 → 右侧内嵌清除按钮（输入时显示）
- 登录按钮 → 主色实心，`var(--radius-md)` 圆角

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card 8px
│ 账号密码登录                         │ ← 标题
├─────────────────────────────────────┤
│ * 账号                              │
│ ┌────────────────────────────────┐ │
│ │ _______________________  [×]   │ │ ← base-input border=all
│ └────────────────────────────────┘ │
│ ─────────────────────────────────── │
│ * 密码                              │
│ ┌────────────────────────────────┐ │
│ │ _______________________  [隐藏]│ │ ← base-input border=all showPassword
│ └────────────────────────────────┘ │
│                                     │
│ ┌────────────────────────────────┐ │
│ │            登 录               │ │ ← 主按钮
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-input 参数

```vue
<!-- 账号 -->
<base-input
  v-model="form.username"
  label="账号"
  required
  border="all"
  placeholder="请输入账号"
  show-clear
/>

<!-- 密码 -->
<base-input
  v-model="form.password"
  type="password"
  label="密码"
  required
  border="all"
  placeholder="请输入密码"
  show-password
/>

<!-- 登录按钮 -->
<base-card
  width="100%"
  height="44px"
  radius="var(--radius-md)"
  background="var(--color-primary)"
  clickable
  @click="onLogin"
>
  <text style="color:#fff;">登录</text>
</base-card>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-surface)` | 输入框背景、卡片背景 |
| `var(--color-primary)` | 主按钮背景 |
| `var(--color-border)` | 输入框边框 |
| `var(--color-error)` | 错误提示、必填星号 |
| `var(--radius-md)` | 输入框、按钮圆角 |

## 适用场景

- 账号密码登录
- 邮箱 + 密码登录
- 用户名 + 密码登录

## 触发词

```markdown
/uniapp-base-skill 做一个账号密码登录页
```

## 演示

[查看 HTML 演示](html/base-input-login.html)
