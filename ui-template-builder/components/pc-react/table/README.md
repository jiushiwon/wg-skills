# Table 表格组件

通用数据表格组件，支持排序、分页、选中、斑马纹等功能。

## 安装

```tsx
import Table from './table'
import './table.css'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | Column[] | [] | 列配置数组 |
| data | any[] | [] | 表格数据 |
| rowKey | string | 'id' | 行唯一标识字段 |
| stripe | boolean | true | 是否显示斑马纹 |
| border | boolean | false | 是否显示边框 |
| hoverable | boolean | true | 是否显示悬停效果 |
| emptyText | string | '暂无数据' | 空状态文字 |
| pagination | boolean | false | 是否显示分页 |
| pageSize | number | 10 | 每页条数 |
| currentPage | number | 1 | 当前页码 |

## Column 配置

```typescript
interface Column {
  key: string        // 字段名（对应数据key）
  title: string      // 列标题
  width?: string     // 列宽度
  align?: 'left' | 'center' | 'right'  // 对齐方式
  sortable?: boolean // 是否可排序
  render?: (value: any, row: any) => React.ReactNode  // 自定义渲染
}
```

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| onSort | (key, order) | 排序变化 |
| onRowClick | (row, index) | 行点击 |
| onPageChange | (page) | 页码变化 |

## 使用示例

### 基本用法

```tsx
import Table from './table'

const columns = [
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
  { key: 'email', title: '邮箱' }
]

const data = [
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com' }
]

<Table columns={columns} data={data} rowKey="id" />
```

### 带排序

```tsx
const columns = [
  { key: 'name', title: '姓名', sortable: true },
  { key: 'age', title: '年龄', sortable: true }
]

<Table
  columns={columns}
  data={data}
  onSort={(key, order) => console.log(key, order)}
/>
```

### 带分页

```tsx
<Table
  columns={columns}
  data={data}
  pagination
  pageSize={10}
  onPageChange={(page) => console.log(page)}
/>
```

### 自定义列内容

```tsx
const columns = [
  { key: 'name', title: '姓名' },
  {
    key: 'status',
    title: '状态',
    render: (value) => (
      <span className={`status status--${value}`}>
        {value === 'active' ? '启用' : '禁用'}
      </span>
    )
  },
  {
    key: 'actions',
    title: '操作',
    render: (_, row) => (
      <button onClick={() => handleEdit(row)}>编辑</button>
    )
  }
]
```

### 完整示例

```tsx
import { useState } from 'react'
import Table from './table'

function UserList() {
  const columns = [
    { key: 'name', title: '姓名', sortable: true },
    { key: 'email', title: '邮箱' },
    {
      key: 'status',
      title: '状态',
      render: (value) => (
        <span className={`badge badge--${value}`}>
          {value === 'active' ? '启用' : '禁用'}
        </span>
      )
    }
  ]

  const data = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
    { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive' }
  ]

  return (
    <Table
      columns={columns}
      data={data}
      rowKey="id"
      stripe
      border
      pagination
      pageSize={10}
      onSort={(key, order) => console.log('排序:', key, order)}
      onRowClick={(row) => console.log('点击:', row)}
    />
  )
}
```

## 样式变量

组件使用以下 CSS 变量：

```css
:root {
  --color-bg-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-primary: #333333;
  --primary-50: #f9fafb;
  --primary-100: #f3f4f6;
  --radius-card: 12px;
}
```
