# Table List 表格列表

PC端数据表格列表页面，支持搜索、筛选、分页、批量操作。

## 风格

| 风格 | 文件 | 特点 |
|------|------|------|
| 默认风格 | style-1-default.tsx | 简洁线条，蓝色按钮 |
| 优雅风格 | style-2-elegant.tsx | 渐变按钮，圆角胶囊 |
| 深色科技 | style-3-dark.tsx | 深蓝背景，霓虹点缀 |

## 使用

```tsx
import TableList from './style-1-default'
import './style-1.css'

const columns = [
  { key: 'name', title: '姓名' },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态' }
]

const data = [
  { id: 1, name: '张三', email: 'test@example.com', status: '正常' }
]

export default function Page() {
  return (
    <TableList
      title="用户管理"
      columns={columns}
      data={data}
      showSearch
      showAddButton
      onAdd={() => {}}
    />
  )
}
```
