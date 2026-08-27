# base-table — 通用表格

> Vue3 通用表格组件，基于 Generic TypeScript 实现。
> 内置 14 种形态，覆盖 95% 业务场景，零第三方组件库。
> 详细规格见根目录 [base-table.md](../../base-table.md) + 各变体 `.md`。

## 14 种形态一览

| # | variant / 能力 | 适用场景 | 文档 |
|---|----------------|----------|------|
| 00 | 总览 | 一页看完所有形态 | [html/00-showcase.html](html/00-showcase.html) |
| 01 | basic（默认） | 最简数据展示 | [html/01-basic.html](html/01-basic.html) |
| 02 | striped | 数据展示、报表 | [html/02-striped.html](html/02-striped.html) |
| 03 | bordered | 库存、参数对比 | [html/03-bordered.html](html/03-bordered.html) |
| 04 | hover | 可点击列表 | [html/04-hover.html](html/04-hover.html) |
| 05 | compact | 日志、监控 | [html/05-compact.html](html/05-compact.html) |
| 06 | fixed-header | 长列表 | [html/06-fixed-header.html](html/06-fixed-header.html) |
| 07 | fixed-column | 多列横滚 | [html/07-fixed-column.html](html/07-fixed-column.html) |
| 08 | selectable | 批量操作 | [html/08-selectable.html](html/08-selectable.html) |
| 09 | sortable | 升降序 | [html/09-sortable.html](html/09-sortable.html) |
| 10 | filterable | 列筛选 | [html/10-filterable.html](html/10-filterable.html) |
| 11 | paginated | 分页 | [html/11-paginated.html](html/11-paginated.html) |
| 12 | loading | 加载态 | [html/12-loading.html](html/12-loading.html) |
| 13 | empty | 空状态 | [html/13-empty.html](html/13-empty.html) |
| 14 | tree | 树形结构 | [html/14-tree.html](html/14-tree.html) |

## 核心 API

```typescript
interface BaseTableProps<T extends Record<string, any>> {
  data: T[]
  columns: Array<{
    key: string
    title: string
    width?: string | number
    fixed?: 'left' | 'right'
    sortable?: boolean
    filterType?: 'input' | 'select' | 'date-range'
    filterOptions?: Array<{ label: string; value: any }>
    render?: (row: T) => any
  }>
  rowKey?: string                 // 默认 'id'
  variant?: 'basic' | 'striped' | 'bordered' | 'hover' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  selectable?: boolean | 'single' | 'multiple'
  selectedRowKeys?: string[]
  sortable?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc' | ''
  filterable?: boolean
  paginated?: boolean
  pagination?: { current: number, pageSize: number, total: number, ... }
  loading?: boolean
  emptyText?: string
  treeData?: boolean
  defaultExpandAll?: boolean
}
```

## 使用示例

基础：

```vue
<base-card title="商品列表">
  <base-table :data="products" :columns="columns" />
</base-card>
```

分页 + 排序 + 选中：

```vue
<base-card title="订单管理">
  <template #header-right>
    <base-button type="primary" :disabled="!selected.length">
      批量导出（{{ selected.length }}）
    </base-button>
  </template>
  <base-table
    :data="orders"
    :columns="columns"
    variant="bordered"
    selectable="multiple"
    sortable
    paginated
    v-model:selectedRowKeys="selected"
    :pagination="{ current, pageSize, total }"
    @page-change="onPageChange"
  />
</base-card>
```

## 容器原则

**所有表格必须嵌入 base-card**。无例外：

```vue
<!-- ✅ 正确 -->
<base-card title="商品"><base-table ... /></base-card>

<!-- ❌ 错误 -->
<base-table ... />
```