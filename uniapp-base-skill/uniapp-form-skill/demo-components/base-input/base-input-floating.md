# base-input 浮动标签

> Material Design 风格的浮动标签输入框：占位即标签，输入后浮起，常用于注册 / 信息收集 / App 启动引导。

## 风格

- 容器 → 白色卡片，`var(--radius-lg)` 大圆角
- 输入区 → 无边框，仅底部 1px 分割线（`border-bottom`）
- 标签 → 默认在输入框内（占位位置），输入/聚焦后浮起到上方 + 缩小 + 主色
- 错误态 → 底线变红 + 标签红 + 底部红字提示
- 提交按钮 → 主色实心，`var(--radius-md)` 圆角

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card 12px
│ 注册账号                            │
│ 请填写以下信息完成注册               │
├─────────────────────────────────────┤
│ 姓名                                │
│ ─────────────────────────────────── │
│ 姓名 (聚焦后浮起)                   │
│ ─────── 浮起后主色加粗 ────────     │
│ ─────────────────────────────────── │
│ 邮箱                                │
│ ─────────────────────────────────── │
│ 邮箱                                │
│ ─────────────────────────────────── │
│ 手机号                              │
│ ─────────────────────────────────── │
│ 手机号                              │
│ ─────────────────────────────────── │
│                                     │
│ ┌────────────────────────────────┐ │
│ │           下一步              │ │
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-input 参数

> 浮动标签属于视觉变体，可通过 `base-input` 的 `border="bottom"` 配合自定义样式实现。
> 推荐封装为 `<base-input-floating>` 子组件，行为统一。

```vue
<!-- 姓名 -->
<base-input-floating
  v-model="form.name"
  label="姓名"
  border="bottom"
/>

<!-- 邮箱 -->
<base-input-floating
  v-model="form.email"
  label="邮箱"
  type="email"
  border="bottom"
/>

<!-- 手机号（错误态） -->
<base-input-floating
  v-model="form.phone"
  label="手机号"
  type="number"
  :maxlength="11"
  border="bottom"
  error="手机号格式不正确"
/>

<!-- 提交按钮 -->
<base-card
  width="100%"
  height="44px"
  radius="var(--radius-md)"
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
| `var(--color-surface)` | 卡片背景 |
| `var(--color-border)` | 底部分割线 |
| `var(--color-primary)` | 聚焦底线、聚焦标签 |
| `var(--color-text-tertiary)` | 默认标签 |
| `var(--color-text-secondary)` | 已填标签 |
| `var(--color-error)` | 错误态底线 / 文字 |

## 适用场景

- 注册账号
- 信息收集
- App 启动引导
- 实名认证
- 表单填写引导

## 触发词

```markdown
/uniapp-base-skill 做一个浮动标签输入
/uniapp-base-skill 做一个注册账号页
```

## 演示

[查看 HTML 演示](html/base-input-floating.html)
