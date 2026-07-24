# Pagination 分页组件

独立分页组件，支持 3 种风格，可与 Table 组件配合使用。

## 安装

```tsx
import Pagination from './pagination'
import './pagination.css'
```

## 使用示例

```tsx
function App() {
  const handleChange = (page, pageSize) => {
    console.log('页码变化:', page, pageSize)
  }

  return (
    <Pagination
      current={1}
      pageSize={10}
      total={156}
      onChange={handleChange}
      showTotal
      showQuickJumper
      variant="default" // default | rounded | modern
    />
  )
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| current | number | 1 | 当前页码 |
| pageSize | number | 10 | 每页条数 |
| total | number | 0 | 总数据量 |
| onChange | (page: number, pageSize: number) => void | - | 页码变化回调 |
| variant | 'default' \| 'rounded' \| 'modern' | 'default' | 风格 |
| showQuickJumper | boolean | false | 是否显示快速跳转 |
| showTotal | boolean | false | 是否显示总条数 |
| pagerCount | number | 7 | 最多显示的页码按钮数 |
| pageSizeOptions | number[] | [10,20,50,100] | 每页条数选项 |
| onPageSizeChange | (pageSize: number) => void | - | 每页条数变化回调 |

## 风格

### default - 简约风格
- 简洁的分页样式
- 适合后台管理系统

### rounded - 圆角胶囊
- 圆角胶囊按钮
- 渐变色激活状态
- 适合 C 端产品

### modern - 现代紧凑
- 紧凑的布局
- 更小的按钮尺寸
- 适合数据密集型后台
