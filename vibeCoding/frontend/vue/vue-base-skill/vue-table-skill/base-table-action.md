# Base Table Action

表格操作列组件，提供后置操作按钮（编辑、删除、查看等）。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| actions | array | [] | 操作按钮配置 |
| align | string | left | 对齐方式 |

## Actions 配置

```javascript
[
  { label: '编辑', event: 'edit', type: 'primary' },
  { label: '删除', event: 'delete', type: 'danger' },
  { label: '查看', event: 'view' }
]
```

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| edit | row | 编辑点击 |
| delete | row | 删除点击 |
| view | row | 查看点击 |

## Usage

```html
<base-table-action :actions="actions" @edit="handleEdit" @delete="handleDelete" />
```

## 按钮类型

| 类型 | 说明 |
|------|------|
| primary | 主要操作 |
| danger | 危险操作 |
| default | 默认 |
| text | 文字按钮 |
