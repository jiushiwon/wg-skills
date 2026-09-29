# base-list-page

> 列表页组件。搜索筛选 + 表格 + 分页的综合页面。
>
> **必须**嵌入 `<base-card>` 使用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | `Column[]` | `[]` | 表格列配置 |
| searchFields | `SearchField[]` | `[]` | 搜索字段配置 |
| data | `any[]` | `[]` | 表格数据 |
| loading | `boolean` | `false` | 加载状态 |
| pagination | `Pagination` | - | 分页配置 |
| showSearch | `boolean` | `true` | 是否显示搜索区 |
| showPagination | `boolean` | `true` | 是否显示分页 |
| searchBtnText | `string` | `'搜索'` | 搜索按钮文字 |
| resetBtnText | `string` | `'重置'` | 重置按钮文字 |

## 类型定义

```typescript
interface Column {
  prop: string
  label: string
  width?: number
  fixed?: 'left' | 'right'
  formatter?: (row: any, column: Column, cell: any) => string
}

interface SearchField {
  type: 'input' | 'select' | 'datepicker'
  key: string
  placeholder?: string
  options?: { label: string; value: any }[]
}

interface Pagination {
  page: number
  pageSize: number
  total: number
}
```

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| search | `params: object` | 点击搜索 |
| reset | - | 点击重置 |
| page-change | `page: number, pageSize: number` | 分页变化 |

## 实现要点

### 渲染结构

```vue
<div class="base-list-page">
  <!-- 搜索区 -->
  <div class="base-list-page__search">
    <div class="base-list-page__search-fields">
      <div v-for="field in searchFields" class="base-list-page__search-field">
        <base-input v-if="field.type === 'input'" />
        <base-select v-else-if="field.type === 'select'" />
        <base-datepicker v-else-if="field.type === 'datepicker'" />
      </div>
    </div>
    <div class="base-list-page__search-btns">
      <span role="button" @click="handleSearch">{{ searchBtnText }}</span>
      <span role="button" @click="handleReset">{{ resetBtnText }}</span>
    </div>
  </div>

  <!-- 表格区（CSS Grid 实现） -->
  <div class="base-table" role="grid">
    <div class="base-table__head" role="row">
      <div v-for="col in columns" class="base-table__th" role="columnheader">{{ col.label }}</div>
    </div>
    <div class="base-table__body">
      <div v-for="(row, idx) in data" class="base-table__row" role="row">
        <div v-for="col in columns" class="base-table__td" role="gridcell">{{ row[col.prop] }}</div>
      </div>
    </div>
  </div>

  <!-- 分页区 -->
  <div class="base-list-page__pagination">
    <span>共 {{ pagination.total }} 条</span>
    <div class="base-list-page__pages">
      <span role="button" @click="handlePageChange(page - 1)">上一页</span>
      <span class="current">{{ page }}</span>
      <span role="button" @click="handlePageChange(page + 1)">下一页</span>
    </div>
  </div>
</div>
```

### 样式

```css
.base-list-page {
  background: var(--color-surface, #fff);
  border-radius: 8px;
  padding: 20px;
}

.base-list-page__search {
  display: flex;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
}

.base-table {
  display: flex;
  flex-direction: column;
}

.base-table__head {
  display: flex;
  background: var(--color-bg-secondary, #f5f7fa);
}

.base-table__th {
  flex: 1;
  padding: 12px;
  font-weight: 500;
}

.base-table__row {
  display: flex;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
}

.base-table__td {
  flex: 1;
  padding: 12px;
}

.base-list-page__pagination {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--color-border, #e4e7ed);
}
```

## 约束

- **零 HTML5 标签**：表格用 `<div role="grid">`，按钮用 `<span role="button">`
- **容器原则**：必须嵌入 `<base-card>` 使用
