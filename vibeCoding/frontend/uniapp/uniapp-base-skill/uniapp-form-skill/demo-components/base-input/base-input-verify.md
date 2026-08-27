# base-input 短信验证码

> 绑定手机号 / 短信验证场景：手机号 + 验证码两行，使用 `base-input` 底线分隔形态。

## 风格

- 容器 → 扁平卡片（`radius: 0`），与页面背景融为一体
- 输入框 → 底线分隔，圆角 0，垂直堆叠
- 验证码按钮 → 内嵌在验证码输入框右侧，圆角胶囊（`var(--radius-full)`）
- 错误提示 → 红色边框 + 红色文字
- 提交按钮 → 主色实心，`var(--radius-md)` 圆角

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card radius=0
│ 绑定手机号                           │
├─────────────────────────────────────┤
│ * 手机号                            │
│ ─────────────────────────────────── │
│ ____________________________________ │
│ ─────────────────────────────────── │
│                                     │
│ * 验证码                            │
│ ─────────────────────────────────── │
│ ___________________  [发送验证码]   │
│ ─────────────────────────────────── │
│                                     │
│ ┌────────────────────────────────┐ │
│ │            提 交               │ │
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-input 参数

```vue
<!-- 手机号 -->
<base-input
  v-model="form.phone"
  type="number"
  :maxlength="11"
  label="手机号"
  required
  border="bottom"
  placeholder="请输入手机号"
/>

<!-- 验证码（带发送按钮） -->
<base-input
  v-model="form.code"
  type="number"
  :maxlength="6"
  label="验证码"
  required
  border="bottom"
  placeholder="请输入验证码"
>
  <template #suffix>
    <view class="send-btn" :class="{ disabled: countdown > 0 }" @click="onSendCode">
      <text>{{ countdown > 0 ? `${countdown}s 后重发` : '发送验证码' }}</text>
    </view>
  </template>
</base-input>

<!-- 提交按钮 -->
<base-card
  width="100%"
  height="44px"
  radius="var(--radius-md)"
  background="var(--color-primary)"
  clickable
  @click="onSubmit"
>
  <text style="color:#fff;">提交</text>
</base-card>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg-surface)` | 卡片背景 |
| `var(--color-primary)` | 验证码按钮文字、主按钮背景 |
| `var(--color-text-tertiary)` | 倒计时文字 |
| `var(--color-error)` | 错误态边框与文字 |

## 适用场景

- 绑定手机号
- 短信验证码登录
- 找回密码
- 二次验证

## 触发词

```markdown
/uniapp-base-skill 做一个手机验证页
/uniapp-base-skill 做一个短信验证码页面
```

## 演示

[查看 HTML 演示](html/base-input-verify.html)
