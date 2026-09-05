# vue-status-skill

> Vue 通用状态/标签/徽章组件，Vue3 + TypeScript，零第三方组件库。

## 快速上手

```vue
<base-card title="订单状态">
  <base-status type="success">已支付</base-status>
  <base-status type="warning">待处理</base-status>
  <base-status type="danger" closable>已取消</base-status>
</base-card>
```

## 7 种 type

| type | 用途 | 颜色 |
|------|------|------|
| `primary` | 主要操作 | 主色 |
| `success` | 成功 | 绿色 |
| `warning` | 警告 | 橙色 |
| `danger` | 危险 | 红色 |
| `info` | 信息 | 蓝色 |
| `default` | 默认 | 灰色 |
| `neutral` | 中性 | 黑色 |

## 5 种 variant

| variant | 描述 |
|---------|------|
| `solid` | 实心（默认） |
| `light` | 浅色 |
| `outline` | 描边 |
| `ghost` | 幽灵 |
| `dot` | 仅圆点 |

## 3 种 size

| size | 高度 |
|------|------|
| `sm` | 20px |
| `md` | 24px |
| `lg` | 28px |

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | `'default'` | 类型 |
| `variant` | `string` | `'solid'` | 变体 |
| `size` | `string` | `'md'` | 尺寸 |
| `shape` | `string` | `'round'` | 形状：round / square |
| `block` | `boolean` | `false` | 块级 |
| `customColor` | `string` | - | 自定义颜色 |
| `closable` | `boolean` | `false` | 可关闭 |
| `disabled` | `boolean` | `false` | 禁用 |
| `blink` | `boolean` | `false` | 闪烁动画 |
| `icon` | `string` | - | 图标 |
| `count` | `number` | - | 数字徽标 |
| `overflow` | `number` | `99` | 数字最大值 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `(event: MouseEvent) => void` | 点击 |
| `close` | `(event: MouseEvent) => void` | 关闭 |

## 容器原则

> **必须嵌入 `<base-card>` 使用。**

```vue
<base-card title="状态">
  <base-status type="success">已支付</base-status>
</base-card>
```

## 相关技能

- [vue-base-skill](../SKILL.md) — 父技能
- [vue-button-skill](../vue-button-skill/) — base-button 按钮
- [vue-card-skill](../vue-card-skill/) — base-card 容器
- [vue-table-skill](../vue-table-skill/) — 表格中的状态列
- [vue-theme-skill](../../vue-theme-skill/) — 主题 Token

## Demos

- [base-status.html](demo-components/base-status/html/base-status.html)
