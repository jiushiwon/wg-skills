# base-crud

> 增删改查页面组件。搜索筛选 + 表格 + 新增/编辑弹窗 + 删除确认。
>
> **必须**嵌入 `<base-card>` 使用。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | `Column[]` | `[]` | 表格列配置 |
| searchFields | `SearchField[]` | `[]` | 搜索字段配置 |
| formFields | `FormField[]` | `[]` | 表单字段配置 |
| data | `any[]` | `[]` | 表格数据 |
| loading | `boolean` | `false` | 加载状态 |
| pagination | `Pagination` | - | 分页配置 |
| showSearch | `boolean` | `true` | 是否显示搜索区 |
| showPagination | `boolean` | `true` | 是否显示分页 |
| addBtnText | `string` | `'新增'` | 新增按钮文字 |
| modalTitle | `string` | `'操作'` | 弹窗标题 |

## 类型定义

```typescript
interface Column {
  prop: string
  label: string
  width?: number
  formatter?: (row: any, column: Column, cell: any) => string
}

interface SearchField {
  type: 'input' | 'select' | 'datepicker'
  key: string
  placeholder?: string
  options?: { label: string; value: any }[]
}

interface FormField {
  type: 'input' | 'select' | 'datepicker' | 'textarea'
  key: string
  label: string
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
| add | `formData: object` | 新增保存 |
| edit | `row: object, formData: object` | 编辑保存 |
| delete | `row: object` | 删除确认 |
| page-change | `page: number, pageSize: number` | 分页变化 |

## 实现要点

### 渲染结构

```vue
<div class="base-crud-page">
  <!-- 搜索区 -->
  <div class="base-crud-page__search">
    <div class="base-crud-page__search-fields">
      <base-input v-for="field in searchFields" />
    </div>
    <div class="base-crud-page__search-btns">
      <span role="button">搜索</span>
      <span role="button">重置</span>
    </div>
  </div>

  <!-- 工具栏 -->
  <div class="base-crud-page__toolbar">
    <span role="button">新增</span>
  </div>

  <!-- 表格区 -->
  <div class="base-table" role="grid">
    <div class="base-table__head" role="row">
      <div v-for="col in columns" class="base-table__th" role="columnheader">{{ col.label }}</div>
      <div class="base-table__th">操作</div>
    </div>
    <div class="base-table__body">
      <div v-for="row in data" class="base-table__row" role="row">
        <div v-for="col in columns" class="base-table__td" role="gridcell">{{ row[col.prop] }}</div>
        <div class="base-crud-page__actions" role="gridcell">
          <span role="button">编辑</span>
          <span role="button">删除</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 分页区 -->
  <div class="base-crud-page__pagination">
    <span>共 {{ total }} 条</span>
    <div class="base-crud-page__pages">
      <span role="button">上一页</span>
      <span class="current">{{ page }}</span>
      <span role="button">下一页</span>
    </div>
  </div>

  <!-- 弹窗 -->
  <div v-if="modalVisible" class="base-crud-page__modal-overlay">
    <div class="base-crud-page__modal">
      <div class="base-crud-page__modal-header">
        <span>{{ modalMode === 'add' ? '新增' : '编辑' }} {{ modalTitle }}</span>
        <span role="button">x</span>
      </div>
      <div class="base-crud-page__modal-body">
        <div v-for="field in formFields" class="base-crud-page__form-item">
          <span>{{ field.label }}</span>
          <base-input v-if="field.type === 'input'" />
          <base-select v-else-if="field.type === 'select'" />
          <div v-else-if="field.type === 'textarea'" contenteditable role="textbox" />
        </div>
      </div>
      <div class="base-crud-page__modal-footer">
        <span role="button">取消</span>
        <span role="button">保存</span>
      </div>
    </div>
  </div>
</div>
```

## 约束

- **零 HTML5 标签**：表格用 `<div role="grid">`，按钮用 `<span role="button">`
- **容器原则**：必须嵌入 `<base-card>` 使用
