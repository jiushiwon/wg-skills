# base-input 禁用 / 只读

> 订单详情、提交后表单、不可修改字段。使用 `base-input` 的 `disabled` / `readonly` 形态。

## 风格

- 容器 → 扁平卡片（`radius: 0`），与页面背景齐平
- 输入框 → 8px 圆角 + 全边框，灰底（`var(--color-bg)`）
- 只读 vs 禁用 → 只读灰文字，禁用更浅灰 + 不可聚焦
- 标签 → 右侧状态标签（只读 / 禁用）
- 字段间 → 分割线分隔

## 页面结构

```
┌─────────────────────────────────────┐  ← base-card radius=0
│ 订单详情                             │
├─────────────────────────────────────┤
│ 订单号                              │
│ ┌────────────────────────────────┐ │
│ │ 20260818001           [只读]  │ │ ← base-input readonly
│ └────────────────────────────────┘ │
│ ─────────────────────────────────── │
│ 商品名称                            │
│ ┌────────────────────────────────┐ │
│ │ 已下架商品            [禁用]  │ │ ← base-input disabled
│ └────────────────────────────────┘ │
│ ─────────────────────────────────── │
│ 收货地址                            │
│ ┌────────────────────────────────┐ │
│ │ 北京市朝阳区 xxx 路 1 号      │ │ ← base-input disabled
│ └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## base-input 参数

```vue
<!-- 只读字段 -->
<base-input
  v-model="order.id"
  label="订单号"
  readonly
  border="all"
  placeholder="20260818001"
/>

<!-- 禁用字段 -->
<base-input
  v-model="order.productName"
  label="商品名称"
  disabled
  border="all"
  placeholder="已下架商品"
/>

<base-input
  v-model="order.address"
  label="收货地址"
  disabled
  border="all"
  placeholder="北京市朝阳区 xxx 路 1 号"
/>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-bg)` | 禁用 / 只读字段背景 |
| `var(--color-border)` | 输入框边框、分割线 |
| `var(--color-text-tertiary)` | 禁用文字、状态标签 |
| `var(--color-text-secondary)` | 只读文字 |

## 适用场景

- 订单详情
- 提交后只读表单
- 不可修改字段
- 售后记录
- 个人信息展示

## 触发词

```markdown
/uniapp-base-skill 做一个订单详情页（只读）
/uniapp-base-skill 做一个只读表单
```

## 演示

[查看 HTML 演示](html/base-input-disabled.html)
