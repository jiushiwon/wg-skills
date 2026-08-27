# base-input 前缀场景

> 输入框左侧添加图标 / 文本 / 符号前缀。使用 `base-input` 的 `prefix` slot 配合全边框形态。

## 风格

- 容器 → 白色卡片，`radius: 0` 与页面背景齐平
- 输入框 → 8px 圆角 + 全边框
- 前缀 1 → SVG 图标（如邮箱 ✉️）
- 前缀 2 → 文本 + 左侧分割线（如 `+86` 区号）
- 前缀 3 → 强调符号（如 `¥` 货币）

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card radius=0
│ 前缀场景                             │
├─────────────────────────────────────┤
│ 邮箱（icon 前缀）                    │
│ ┌────────────────────────────────┐ │
│ │ ✉  __________________________  │ │ ← base-input prefix=icon
│ └────────────────────────────────┘ │
│                                     │
│ 手机号（文本前缀）                  │
│ ┌────┬───────────────────────────┐ │
│ │+86 │ __________________________│ │ ← base-input prefix=+86
│ └────┴───────────────────────────┘ │
│                                     │
│ 提现金额（符号前缀）                │
│ ┌────────────────────────────────┐ │
│ │ ¥  __________________________  │ │ ← base-input prefix=¥
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-input 参数

```vue
<!-- 邮箱 - icon 前缀 -->
<base-input
  v-model="form.email"
  label="邮箱（icon 前缀）"
  border="all"
  placeholder="请输入邮箱"
>
  <template #prefix>
    <svg class="prefix-icon" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2">
      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
      <path d="m3 7 9 6 9-6"></path>
    </svg>
  </template>
</base-input>

<!-- 手机号 - 文本前缀 +86 -->
<base-input
  v-model="form.phone"
  type="number"
  :maxlength="11"
  label="手机号（文本前缀）"
  border="all"
  placeholder="请输入手机号"
>
  <template #prefix>
    <text>+86</text>
  </template>
</base-input>

<!-- 金额 - 符号前缀 ¥ -->
<base-input
  v-model="form.amount"
  type="digit"
  label="提现金额（符号前缀）"
  border="all"
  placeholder="请输入金额"
>
  <template #prefix>
    <text style="font-weight:600;">¥</text>
  </template>
</base-input>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg-surface)` | 卡片背景、输入框背景 |
| `var(--color-border)` | 输入框边框、区号左侧分割线 |
| `var(--color-text-tertiary)` | 前缀图标颜色 |
| `var(--color-text)` | 文本前缀（+86 / ¥） |

## 适用场景

- 邮箱
- 手机号（带国际区号）
- 金额、币种
- 搜索框
- 单位输入

## 触发词

```markdown
/uniapp-base-skill 做一个带前缀图标的输入框
/uniapp-base-skill 做一个金额输入框
```

## 演示

[查看 HTML 演示](html/base-input-icon-prefix.html)
