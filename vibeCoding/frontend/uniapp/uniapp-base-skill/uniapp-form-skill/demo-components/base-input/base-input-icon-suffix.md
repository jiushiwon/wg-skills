# base-input 后缀场景

> 输入框右侧添加清除 icon / 验证码按钮 / 单位文本 / 标签胶囊。使用 `base-input` 的 `suffix` slot + 浅底填充形态。

## 风格

- 容器 → 白色卡片，`var(--radius-md)` 中圆角
- 输入框 → 8px 圆角 + 浅底（`var(--color-bg-soft)`）无边框
- 后缀 1 → 清除 icon（圆形 ✕，输入时显示）
- 后缀 2 → 验证码按钮（主色文字 + 左侧分割线）
- 后缀 3 → 单位文本（次级灰）
- 后缀 4 → 标签胶囊（主色背景 + 白字）

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card 8px
│ 后缀场景                             │
├─────────────────────────────────────┤
│ 邮箱（icon 后缀清除）                │
│ ┌────────────────────────────────┐ │
│ │ __________________________ ✕   │ │ ← base-input suffix=clear
│ └────────────────────────────────┘ │
│                                     │
│ 手机号（按钮后缀）                  │
│ ┌─────────────────────┬───────────┐ │
│ │ ___________________ │ 发送验证码│ │ ← base-input suffix=btn
│ └─────────────────────┴───────────┘ │
│                                     │
│ 金额（文本后缀）                    │
│ ┌────────────────────────────────┐ │
│ │ __________________________ 元 │ │ ← base-input suffix=text
│ └────────────────────────────────┘ │
│                                     │
│ 邀请码（胶囊后缀）                  │
│ ┌────────────────────────────────┐ │
│ │ __________________________[优]│ │ ← base-input suffix=chip
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-input 参数

```vue
<!-- 邮箱 - 清除 icon -->
<base-input
  v-model="form.email"
  label="邮箱（icon 后缀清除）"
  border="none"
  placeholder="请输入邮箱"
  show-clear
/>

<!-- 手机号 - 验证码按钮 -->
<base-input
  v-model="form.phone"
  type="number"
  :maxlength="11"
  label="手机号（按钮后缀）"
  border="none"
  placeholder="请输入手机号"
>
  <template #suffix>
    <view class="suffix-btn" :class="{ disabled: countdown > 0 }" @click="onSendCode">
      <text>{{ countdown > 0 ? `${countdown}s` : '发送验证码' }}</text>
    </view>
  </template>
</base-input>

<!-- 金额 - 单位文本 -->
<base-input
  v-model="form.amount"
  type="digit"
  label="金额（文本后缀）"
  border="none"
  placeholder="请输入金额"
>
  <template #suffix>
    <text style="color:var(--color-text-tertiary);font-size:13px;">元</text>
  </template>
</base-input>

<!-- 邀请码 - 标签胶囊 -->
<base-input
  v-model="form.code"
  label="邀请码（胶囊后缀）"
  border="none"
  placeholder="请输入邀请码"
>
  <template #suffix>
    <view class="code-chip">
      <text>优</text>
    </view>
  </template>
</base-input>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg-soft)` | 浅底输入框背景 |
| `var(--color-primary)` | 验证码按钮、胶囊背景 |
| `var(--color-text-tertiary)` | 单位文本、清除 icon |
| `var(--color-border)` | 验证码按钮左侧分割线 |

## 适用场景

- 表单清除按钮
- 验证码按钮
- 单位显示
- 邀请奖励标签
- 数字步进器

## 触发词

```markdown
/uniapp-base-skill 做一个带验证码按钮的输入框
/uniapp-base-skill 做一个带清除按钮的输入框
```

## 演示

[查看 HTML 演示](html/base-input-icon-suffix.html)
