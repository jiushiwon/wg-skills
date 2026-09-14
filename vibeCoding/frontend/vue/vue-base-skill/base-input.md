# Base Input

输入容器组件，所有表单域组件（text / number / textarea / select / datepicker 等）的共同底层。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` / `v-model` | `string \| number` | — | 绑定值 |
| `placeholder` | `string` | — | 占位文本 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `clearable` | `boolean` | `false` | 可清空 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `prefix` / `suffix` | `string \| Component` | — | 前后置图标 / 文本 |

## Usage

```vue
<base-card title="用户信息">
  <base-input v-model="username" placeholder="请输入用户名" />
</base-card>
```

## 完整规格

→ [vue-form-skill/base-input.md](vue-form-skill/base-input.md)（14.7K，含 7 种 variant / 完整 Props / 校验 / 反例 vs 正例）

## 层级定位

```
vue-base-skill/             ← 公共根容器层
├── base-card.md            ← 内容容器（包裹业务）
└── base-input.md           ← 输入容器（承载输入交互，本文件）
```

base-input 与 base-card 并列公共根容器。所有需要用户输入的地方（form / table 编辑 / search / filter）都必须使用 `<base-input>`，禁止使用原生 `<input>` `<textarea>`。