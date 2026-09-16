# base-input 验证码格子（OTP）

> 6 位独立格子验证码输入，自动跳格 + 倒计时重发。

## 风格

- 容器 → 白色卡片，`var(--radius-md)` 中圆角
- 提示区 → 浅灰文字 + 加粗手机号
- 验证码格子 → 6 个 `1:1` 方块，间距 8px
  - 已填：白底 + 主色边框 + 加粗数字
  - 聚焦：白底 + 主色边框 + 主色光晕 + 闪烁光标
  - 空态：浅底 + 无边框
- 计数行 → 左侧「N/6」+ 右侧「Ns 后重发」（主色可点击）
- 提交按钮 → 主色胶囊（`var(--radius-full)`）

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card 8px
│ 验证码已发送至                       │
│ +86 138****8000，请输入 6 位短信验证码 │
├─────────────────────────────────────┤
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐    │
│ │ 8│ │ 2│ │ 5│ │▏ │ │  │ │  │    │ ← 6 个独立格子
│ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘    │
│                                     │
│ 3 / 6                  52s 后重发   │ ← 计数行
│                                     │
│ ┌────────────────────────────────┐ │
│ │           下一步              │ │ ← 胶囊主按钮
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-input 参数

> 验证码格子通常不使用 `base-input` 本身，而使用专属 `<base-otp>` 组件。
> 该组件由 `base-input` 的 `number` + `maxlength=6` 派生的视觉封装，行为一致。

```vue
<!-- 验证码格子（独立组件，由 base-input 派生） -->
<base-otp
  v-model="code"
  :length="6"
  type="number"
  placeholder="请输入验证码"
/>

<!-- 计数行 -->
<view class="otp-meta">
  <text style="color:var(--color-text-tertiary);">{{ code.length }} / 6</text>
  <text class="resend" @click="onResend">
    {{ countdown > 0 ? `${countdown}s 后重发` : '重新发送' }}
  </text>
</view>

<!-- 提交按钮 -->
<base-card
  width="100%"
  height="44px"
  radius="var(--radius-full)"
  background="var(--color-primary)"
  clickable
  @click="onNext"
>
  <text style="color:#fff;">下一步</text>
</base-card>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg-surface)` | 已填格子背景 |
| `var(--color-bg)` | 空态格子背景 |
| `var(--color-primary)` | 边框、光标、文字 |
| `var(--color-text-tertiary)` | 计数文字 |
| `var(--radius-md)` | 格子圆角 |

## 适用场景

- 支付验证码
- 绑定手机号
- 双因素登录
- 找回密码

## 触发词

```markdown
/uniapp-base-skill 做一个验证码输入页
/uniapp-base-skill 做一个 OTP 输入页
```

## 演示

[查看 HTML 演示](html/base-input-otp.html)
