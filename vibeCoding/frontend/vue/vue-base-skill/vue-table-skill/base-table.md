# base-table 表格组件

> 通用表格组件，支持固定列、操作列、排序、筛选、选择、展开、编辑、树形数据等 20+ 种形态。
> **必须嵌入 base-card** 使用。
> **零 HTML5 标签**：禁止使用 `<button>` `<input>` `<select>` `<table>` 等原生标签，全部用 `<div>` `<span>` + CSS3 实现。
> **强依赖**：`base-button`（vue-button-skill）+ `base-status`（vue-status-skill）+ `base-card`（vue-card-skill）。

## 为什么需要 base-table？

实际开发中表格痛点：
- ❌ 需要固定列时原生 `<table>` 不支持
- ❌ 操作列（编辑/删除）需要手动实现
- ❌ 排序、筛选、选择功能每个项目重复造轮子
- ❌ 原生 `<input>` `<select>` 样式不可控

**base-table 把所有表格场景收敛成一个组件**：
- ✅ 固定列（左/右）+ 阴影分层
- ✅ 操作列（编辑/删除/自定义），复用 base-button
- ✅ 状态列（启用/禁用/审核），复用 base-status
- ✅ 排序/筛选/选择/展开/编辑
- ✅ 20+ 种形态，按需组合
- ✅ 自定义复选框/下拉/输入（纯 div + CSS3）

---

## 形态速览（23 种）

| # | 名称 | 关键 prop |
|---|------|-----------|
| 1 | 基础表格 | `:data` `:columns` |
| 2 | 固定列 | `columns[i].fixed: 'left'/'right'` |
| 3 | 操作列 | `columns[i].actions` |
| 4 | 可选择行 | `selectable` |
| 5 | 可排序 | `columns[i].sortable` |
| 6 | 可筛选 | `columns[i].filterable` |
| 7 | 可展开行 | `expandable` |
| 8 | 表头分组 | `columns[i].children` |
| 9 | 合并单元格 | `:span-method` |
| 10 | 行编辑 | `editable` |
| 11 | 树形数据 | `treeData` |
| 12 | 虚拟滚动 | `virtual` `:height` |
| 13 | 拖拽排序 | `dragSort` |
| 14 | 可调整列宽 | `resizable` |
| 15 | 汇总行 | `showSummary` |
| 16 | 斑马纹 | `striped` |
| 17 | 边框 | `bordered` |
| 18 | 悬停高亮 | `hover` |
| 19 | 紧凑模式 | `compact` |
| 20 | 固定表头 | `:height` |
| 21 | 加载中 | `:loading` |
| 22 | 空状态 | `emptyText` |
| 23 | 分页表格 | `:pagination` |

---

## 效果展示

### 1. 基础表格

```vue
<base-table :data="users" :columns="columns" />
```

### 2. 固定列（左侧/右侧）

```vue
<base-table :data="users" :columns="fixedColumns" />
```

```typescript
const columns = [
  { key: 'name', title: '姓名', fixed: 'left', width: 120 },
  { key: 'age', title: '年龄', width: 100 },
  { key: 'email', title: '邮箱', width: 200 },
  { key: 'address', title: '地址', minWidth: 200 },
  { key: 'action', title: '操作', fixed: 'right', width: 220 },
]
```

### 3. 操作列（依赖 base-button）

```vue
<base-table :data="users" :columns="columns" @action="handleAction" />
```

```typescript
const columns = [
  { key: 'name', title: '姓名' },
  { key: 'status', title: '状态' },
  {
    key: 'action',
    title: '操作',
    fixed: 'right',
    width: 240,
    actions: [
      { label: '查看', type: 'primary', variant: 'outline', event: 'view', icon: 'eye' },
      { label: '编辑', type: 'primary', event: 'edit', icon: 'edit' },
      { label: '删除', type: 'danger', variant: 'outline', event: 'delete', icon: 'trash' },
    ],
  },
]
```

### 4. 状态列（依赖 base-status）

```typescript
const columns = [
  {
    key: 'status',
    title: '订单状态',
    width: 120,
    render: (row) => {
      const map = {
        paid: { type: 'success', text: '已支付' },
        pending: { type: 'warning', text: '待支付' },
        shipped: { type: 'info', text: '已发货' },
        done: { type: 'primary', text: '已完成' },
        refunded: { type: 'danger', text: '已退款' },
      }
      const cfg = map[row.status] || map.pending
      return h(BaseStatus, { type: cfg.type, variant: 'light', size: 'sm' }, () => cfg.text)
    },
  },
]
```

### 5. 可选择行（自定义复选框，纯 div+CSS3）

```vue
<base-table
  :data="users"
  :columns="columns"
  selectable
  :selected-keys="selectedKeys"
  @selection-change="handleSelectionChange"
/>
```

### 6. 可排序

```vue
<base-table
  :data="users"
  :columns="columns"
  :default-sort="{ key: 'age', order: 'asc' }"
  @sort-change="handleSortChange"
/>
```

```typescript
const columns = [
  { key: 'name', title: '姓名', sortable: true },
  { key: 'age', title: '年龄', sortable: true },
  { key: 'email', title: '邮箱' },
]
```

### 7. 可筛选

```vue
<base-table
  :data="users"
  :columns="columns"
  @filter-change="handleFilterChange"
/>
```

```typescript
const columns = [
  { key: 'name', title: '姓名' },
  {
    key: 'status',
    title: '状态',
    filterable: true,
    filters: [
      { text: '启用', value: 'active' },
      { text: '禁用', value: 'inactive' },
    ],
  },
]
```

### 8. 可展开行

```vue
<base-table :data="users" :columns="columns" expandable>
  <template #expanded-row="{ row }">
    <div>详细信息：{{ row }}</div>
  </template>
</base-table>
```

### 9. 表头分组

```vue
<base-table :data="users" :columns="groupedColumns" />
```

```typescript
const columns = [
  { key: 'name', title: '姓名' },
  {
    title: '个人信息',
    children: [
      { key: 'age', title: '年龄' },
      { key: 'gender', title: '性别' },
    ],
  },
  {
    title: '联系方式',
    children: [
      { key: 'email', title: '邮箱' },
      { key: 'phone', title: '电话' },
    ],
  },
]
```

### 10. 合并单元格

```vue
<base-table :data="users" :columns="columns" :span-method="spanMethod" />
```

```typescript
function spanMethod({ row, column, rowIndex, columnIndex }: SpanMethodProps) {
  if (columnIndex === 0) {
    if (rowIndex % 2 === 0) {
      return { rowspan: 2, colspan: 1 }
    } else {
      return { rowspan: 0, colspan: 0 }
    }
  }
}
```

### 11. 行编辑（自定义 div-input）

```vue
<base-table :data="users" :columns="editableColumns" editable />
```

```typescript
const columns = [
  { key: 'name', title: '姓名', editable: true, editType: 'input' },
  { key: 'age', title: '年龄', editable: true, editType: 'number' },
  {
    key: 'status',
    title: '状态',
    editable: true,
    editType: 'select',
    editOptions: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' },
    ],
  },
]
```

### 12. 树形数据

```vue
<base-table :data="treeData" :columns="columns" row-key="id" />
```

```typescript
const treeData = [
  {
    id: 1,
    name: '部门 A',
    children: [
      { id: 11, name: '子部门 A-1' },
      { id: 12, name: '子部门 A-2' },
    ],
  },
  { id: 2, name: '部门 B' },
]
```

### 13. 虚拟滚动

```vue
<base-table :data="largeData" :columns="columns" virtual :height="400" />
```

### 14. 拖拽排序

```vue
<base-table :data="users" :columns="columns" drag-sort @drag-end="handleDragEnd" />
```

### 15. 可调整列宽

```vue
<base-table :data="users" :columns="resizableColumns" resizable />
```

### 16. 汇总行

```vue
<base-table :data="orders" :columns="columns" show-summary :summary-method="summaryMethod" />
```

### 17-23. 斑马纹 / 边框 / 悬停 / 紧凑 / 固定表头 / 加载 / 空状态 / 分页

```vue
<base-table :data="users" :columns="columns" striped bordered hover compact :height="300" :loading="loading" empty-text="暂无数据" />
```

---

## 使用示例（必须在 base-card 内）

```vue
<template>
  <base-card title="用户管理">
    <base-table
      :data="users"
      :columns="columns"
      :loading="loading"
      selectable
      :selected-keys="selectedKeys"
      hover
      striped
      bordered
      @selection-change="handleSelectionChange"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <base-paginated
      :current="pagination.current"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      show-total
      show-size-changer
      position="right"
      @page-change="handlePageChange"
    />
  </base-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const columns = [
  { key: 'name', title: '姓名', fixed: 'left', width: 120 },
  { key: 'age', title: '年龄', sortable: true, width: 100 },
  { key: 'email', title: '邮箱', minWidth: 200 },
  {
    key: 'status',
    title: '状态',
    width: 120,
    render: (row: Record<string, unknown>) => {
      const map: Record<string, { type: string; text: string }> = {
        active: { type: 'success', text: '启用' },
        inactive: { type: 'default', text: '禁用' },
      }
      const cfg = map[String(row.status)] || map.inactive
      return h(BaseStatus, { type: cfg.type, variant: 'light', size: 'sm' }, () => cfg.text)
    },
  },
  {
    key: 'action',
    title: '操作',
    fixed: 'right',
    width: 240,
    actions: [
      { label: '查看', type: 'primary', variant: 'outline', event: 'view' },
      { label: '编辑', type: 'primary', event: 'edit' },
      { label: '删除', type: 'danger', variant: 'outline', event: 'delete' },
    ],
  },
]

const users = ref([])
const loading = ref(false)
const selectedKeys = ref<number[]>([])
const pagination = ref({ current: 1, pageSize: 10, total: 0 })

function handleSelectionChange(keys: number[]) {
  selectedKeys.value = keys
}
function handleEdit(row: Record<string, unknown>) {
  console.log('编辑', row)
}
function handleDelete(row: Record<string, unknown>) {
  console.log('删除', row)
}
function handleAction(event: string, row: Record<string, unknown>) {
  console.log(event, row)
}
function handlePageChange(page: number) {
  pagination.value.current = page
}
</script>
```

---

## 容器原则

> **表格组件必须嵌入 `<base-card>`。**

```vue
<!-- ✅ 正确 -->
<base-card title="用户列表">
  <base-table :data="users" :columns="columns" />
</base-card>

<!-- ❌ 错误 -->
<base-table :data="users" :columns="columns" />
```

---

## 红线

- ❌ 禁止裸用 `<base-table>`（必须 `<base-card>` 包裹）
- ❌ 禁止裸色值 / 裸 px（必须 `var(--*)`）
- ❌ 禁止使用 `<button>` `<input>` `<select>` `<table>` `<th>` `<td>` 等 HTML5 标签（必须 `<div>` `<span>` + CSS3）
- ❌ 禁止自写按钮样式（必须用 `<base-button>`）
- ❌ 禁止自写状态标签（必须用 `<base-status>`）
- ❌ 禁止混入 Element Plus / 任何第三方表格组件

---

## Props

```typescript
import type { VNode } from 'vue'

interface BaseTableColumn<T = Record<string, unknown>> {
  key: string                                                              // 列字段名
  title: string                                                            // 列标题
  width?: string | number                                                  // 列宽度
  minWidth?: number                                                        // 最小宽度
  maxWidth?: number                                                        // 最大宽度
  align?: 'left' | 'center' | 'right'                                      // 对齐方式
  fixed?: 'left' | 'right'                                                // 固定列
  sortable?: boolean                                                       // 可排序
  sortOrder?: 'asc' | 'desc'                                              // 当前排序
  filterable?: boolean                                                     // 可筛选
  filters?: { text: string; value: unknown }[]                            // 筛选选项
  editable?: boolean                                                       // 可编辑
  editType?: 'input' | 'select' | 'number' | 'date' | 'textarea'         // 编辑类型
  editOptions?: { label: string; value: unknown }[]                        // 编辑选项
  render?: (row: T, index: number) => VNode | string                       // 自定义渲染
  slot?: string                                                            // 插槽名称
  children?: BaseTableColumn<T>[]                                          // 表头分组
  actions?: BaseTableAction[]                                              // 操作列配置
  className?: string                                                       // 自定义单元格类
}

interface BaseTableAction {
  label: string                                                            // 按钮文本
  type?: 'primary' | 'default' | 'success' | 'warning' | 'danger' | 'text' // 按钮类型
  variant?: 'solid' | 'outline' | 'ghost' | 'text' | 'link'               // 按钮变体
  size?: 'sm' | 'md' | 'lg'                                              // 按钮尺寸
  event: string                                                            // 事件名称
  icon?: string                                                            // 图标
  disabled?: (row: Record<string, unknown>) => boolean                     // 是否禁用
  hidden?: (row: Record<string, unknown>) => boolean                       // 是否隐藏
}

interface BaseTablePagination {
  current: number
  pageSize: number
  total: number
}

interface BaseTableProps<T = Record<string, unknown>> {
  // 核心
  data: T[]
  columns: BaseTableColumn<T>[]

  // 固定列
  fixed?: boolean                                                          // 启用固定列（自动检测 fixed 属性）

  // 选择
  selectable?: boolean                                                     // 可选择行
  selectedKeys?: (string | number)[]                                       // 已选中的行 key
  rowKey?: string                                                          // 行数据的唯一标识字段，默认 'id'

  // 排序
  defaultSort?: { key: string; order: 'asc' | 'desc' }                    // 默认排序

  // 筛选
  filters?: Record<string, unknown>                                        // 筛选条件

  // 展开
  expandable?: boolean                                                     // 可展开行
  defaultExpandAll?: boolean                                               // 默认展开所有

  // 合并
  spanMethod?: (params: SpanMethodProps) => { rowspan: number; colspan: number }

  // 编辑
  editable?: boolean                                                       // 可编辑行

  // 树形
  treeData?: boolean                                                       // 树形数据（自动检测 children 字段）
  indent?: number                                                          // 缩进宽度，默认 24
  defaultExpandAllRows?: boolean                                           // 默认展开所有树节点

  // 虚拟滚动
  virtual?: boolean                                                        // 启用虚拟滚动
  height?: number | string                                                 // 表格高度（启用虚拟滚动时必填）
  itemHeight?: number                                                      // 行高，默认 48

  // 拖拽
  dragSort?: boolean                                                       // 可拖拽排序

  // 列宽调整
  resizable?: boolean                                                      // 可调整列宽

  // 汇总
  showSummary?: boolean                                                    // 显示汇总行
  summaryMethod?: (params: { data: T[]; columns: BaseTableColumn<T>[] }) => Record<string, unknown>

  // 样式
  size?: 'sm' | 'md' | 'lg'                                              // 表格整体尺寸
  striped?: boolean                                                        // 斑马纹
  bordered?: boolean                                                       // 边框
  hover?: boolean                                                          // 悬停高亮
  compact?: boolean                                                        // 紧凑模式
  rounded?: boolean                                                        // 圆角
  shadow?: boolean                                                         // 阴影

  // 状态
  loading?: boolean                                                        // 加载中
  loadingText?: string                                                     // 加载文案
  emptyText?: string                                                       // 空状态文案
  emptyIcon?: string                                                       // 空状态图标

  // 分页
  pagination?: BaseTablePagination

  // 自定义
  rowClassName?: (row: T, index: number) => string                         // 自定义行类名
  cellClassName?: (row: T, column: BaseTableColumn<T>, index: number) => string  // 自定义单元格类名
}

interface SpanMethodProps {
  row: Record<string, unknown>
  column: BaseTableColumn
  rowIndex: number
  columnIndex: number
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `T[]` | **必填** | 表格数据 |
| `columns` | `BaseTableColumn[]` | **必填** | 列配置 |
| `selectable` | `boolean` | `false` | 可选择行 |
| `selectedKeys` | `(string\|number)[]` | `[]` | 已选中的行 key |
| `rowKey` | `string` | `'id'` | 行数据的唯一标识字段 |
| `defaultSort` | `{ key, order }` | `undefined` | 默认排序 |
| `filters` | `Record<string, unknown>` | `{}` | 筛选条件 |
| `expandable` | `boolean` | `false` | 可展开行 |
| `defaultExpandAll` | `boolean` | `false` | 默认展开所有 |
| `spanMethod` | `(params) => { rowspan, colspan }` | `undefined` | 合并单元格方法 |
| `editable` | `boolean` | `false` | 可编辑行 |
| `treeData` | `boolean` | `false` | 树形数据 |
| `indent` | `number` | `24` | 缩进宽度 |
| `virtual` | `boolean` | `false` | 启用虚拟滚动 |
| `height` | `number\|string` | `undefined` | 表格高度 |
| `itemHeight` | `number` | `48` | 虚拟行高 |
| `dragSort` | `boolean` | `false` | 可拖拽排序 |
| `resizable` | `boolean` | `false` | 可调整列宽 |
| `showSummary` | `boolean` | `false` | 显示汇总行 |
| `summaryMethod` | `(params) => Record<string, unknown>` | `undefined` | 汇总方法 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 表格整体尺寸 |
| `striped` | `boolean` | `false` | 斑马纹 |
| `bordered` | `boolean` | `false` | 边框 |
| `hover` | `boolean` | `false` | 悬停高亮 |
| `compact` | `boolean` | `false` | 紧凑模式 |
| `rounded` | `boolean` | `false` | 圆角 |
| `shadow` | `boolean` | `false` | 阴影 |
| `loading` | `boolean` | `false` | 加载中 |
| `loadingText` | `string` | `'加载中...'` | 加载文案 |
| `emptyText` | `string` | `'暂无数据'` | 空状态文案 |
| `emptyIcon` | `string` | `undefined` | 空状态图标 |
| `pagination` | `{ current, pageSize, total }` | `undefined` | 分页配置 |
| `rowClassName` | `(row, index) => string` | `undefined` | 自定义行类名 |
| `cellClassName` | `(row, column, index) => string` | `undefined` | 自定义单元格类名 |

---

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `selectionChange` | `(keys: (string\|number)[]) => void` | 选择行变化 |
| `sortChange` | `(sort: { key: string; order: 'asc'\|'desc' }) => void` | 排序变化 |
| `filterChange` | `(filters: Record<string, unknown>) => void` | 筛选变化 |
| `expandChange` | `(row: T, expanded: boolean) => void` | 展开行变化 |
| `rowClick` | `(row: T, index: number) => void` | 行点击 |
| `rowDblclick` | `(row: T, index: number) => void` | 行双击 |
| `cellClick` | `(row: T, column: BaseTableColumn, index: number) => void` | 单元格点击 |
| `cellEdit` | `(row: T, key: string, value: unknown) => void` | 单元格编辑完成 |
| `action` | `(event: string, row: T) => void` | 操作列事件 |
| `dragEnd` | `(fromIndex: number, toIndex: number) => void` | 拖拽结束 |
| `resize` | `(key: string, width: number) => void` | 列宽调整 |
| `pageChange` | `(page: number) => void` | 分页变化 |

---

## Slots

| 插槽 | 参数 | 说明 |
|------|------|------|
| `header` | `{ column: BaseTableColumn }` | 自定义表头 |
| `cell` | `{ row: T, column: BaseTableColumn, index: number }` | 自定义单元格 |
| `expanded-row` | `{ row: T, index: number }` | 展开行内容 |
| `empty` | - | 空状态内容 |
| `loading` | - | 加载中内容 |
| `append` | - | 表格底部追加内容 |

---

## 强依赖

| 依赖 | 来自 | 用途 |
|------|------|------|
| `<base-button>` | vue-button-skill | 操作列按钮、复选框 |
| `<base-status>` | vue-status-skill | 状态列标签 |
| `<base-loading>` | vue-table-skill | 加载中遮罩 |
| `<base-paginated>` | vue-table-skill | 表格内嵌分页 |
| `<base-card>` | vue-card-skill | 表格容器 |

---

## 固定列实现

固定列使用 `position: sticky` 实现，无需额外配置，只需在 columns 中设置 `fixed` 属性。

**实现要点：**
- 左侧固定列：`position: sticky; left: 0; z-index: 10;`
- 右侧固定列：`position: sticky; right: 0; z-index: 10;`
- 固定列需要设置背景色，避免内容穿透
- 固定列需要添加阴影效果，提升层次感

---

## 操作列实现

操作列通过 `actions` 配置，**复用 `<base-button>`**，无需自写按钮样式。

```typescript
const columns = [
  { key: 'name', title: '姓名' },
  {
    key: 'action',
    title: '操作',
    fixed: 'right',
    width: 240,
    actions: [
      { label: '查看', type: 'primary', variant: 'outline', event: 'view', icon: 'eye' },
      { label: '编辑', type: 'primary', event: 'edit', icon: 'edit' },
      { label: '删除', type: 'danger', variant: 'outline', event: 'delete', icon: 'trash' },
    ],
  },
]
```

**操作按钮配置：**
```typescript
interface BaseTableAction {
  label: string                                                            // 按钮文本
  type?: 'primary' | 'default' | 'success' | 'warning' | 'danger' | 'text' // 按钮类型
  variant?: 'solid' | 'outline' | 'ghost' | 'text' | 'link'               // 按钮变体
  size?: 'sm' | 'md' | 'lg'                                              // 按钮尺寸
  event: string                                                            // 事件名称
  icon?: string                                                            // 图标
  disabled?: (row: Record<string, unknown>) => boolean                     // 是否禁用
  hidden?: (row: Record<string, unknown>) => boolean                       // 是否隐藏
}
```

---

## 自定义复选框（无 input）

全表使用 `<div>` + CSS3 绘制复选框：

```css
.base-table__checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.base-table__checkbox--checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.base-table__checkbox--checked::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
}
```

---

## 实现要点

```vue
<template>
  <div :class="[
    'base-table',
    `base-table--size-${size}`,
    { 'base-table--striped': striped },
    { 'base-table--bordered': bordered },
    { 'base-table--hover': hover },
    { 'base-table--compact': compact },
    { 'base-table--rounded': rounded },
    { 'base-table--shadow': shadow },
    { 'base-table--loading': loading },
  ]">
    <!-- 加载中 -->
    <div v-if="loading" class="base-table__loading">
      <base-loading :loading="true" :text="loadingText" inline />
    </div>

    <!-- 表格容器 -->
    <div
      class="base-table__container"
      :style="height ? { height: typeof height === 'number' ? `${height}px` : height, overflow: 'auto' } : {}"
    >
      <!-- 表头 -->
      <div class="base-table__header">
        <div
          v-for="(row, ri) in headerRows"
          :key="ri"
          class="base-table__row base-table__row--header"
        >
          <!-- 选择列（全选） -->
          <div v-if="selectable" class="base-table__cell base-table__cell--checkbox">
            <span
              :class="[
                'base-table__checkbox',
                { 'base-table__checkbox--checked': isAllSelected },
                { 'base-table__checkbox--indeterminate': isIndeterminate },
              ]"
              role="checkbox"
              :aria-checked="isAllSelected"
              tabindex="0"
              @click="handleSelectAll"
              @keydown.enter="handleSelectAll"
              @keydown.space.prevent="handleSelectAll"
            />
          </div>

          <!-- 展开列 -->
          <div v-if="expandable" class="base-table__cell base-table__cell--expand" />

          <!-- 树形缩进占位 -->
          <div v-if="treeData" class="base-table__cell base-table__cell--tree" />

          <!-- 数据列 -->
          <div
            v-for="cell in row.cells"
            :key="cell.key"
            :class="[
              'base-table__cell',
              `base-table__cell--${cell.align || 'left'}`,
              { 'base-table__cell--fixed-left': cell.fixed === 'left' },
              { 'base-table__cell--fixed-right': cell.fixed === 'right' },
              { 'base-table__cell--sortable': cell.sortable },
              { 'base-table__cell--filterable': cell.filterable },
              { 'base-table__cell--resizable': resizable },
            ]"
            :style="getCellStyle(cell)"
            :colspan="cell.colspan"
            :rowspan="cell.rowspan"
            @click="cell.sortable && handleSort(cell.key)"
          >
            <span class="base-table__cell-content">
              {{ cell.title }}

              <!-- 排序图标 -->
              <span v-if="cell.sortable" class="base-table__sort-icon">
                <span :class="{ 'base-table__sort-active': sortKey === cell.key && sortOrder === 'asc' }">▲</span>
                <span :class="{ 'base-table__sort-active': sortKey === cell.key && sortOrder === 'desc' }">▼</span>
              </span>

              <!-- 筛选图标 -->
              <span
                v-if="cell.filterable"
                class="base-table__filter-icon"
                role="button"
                aria-label="筛选"
                tabindex="0"
                @click.stop="toggleFilter(cell.key)"
                @keydown.enter.stop="toggleFilter(cell.key)"
              >
                <span class="base-table__filter-icon-shape" />
              </span>
            </span>

            <!-- 筛选面板 -->
            <div v-if="cell.filterable && activeFilter === cell.key" class="base-table__filter-panel">
              <div
                v-for="filter in cell.filters"
                :key="String(filter.value)"
                :class="[
                  'base-table__filter-option',
                  { 'base-table__filter-option--active': filterValues[cell.key] === filter.value },
                ]"
                @click="handleFilter(cell.key, filter.value)"
              >
                <span class="base-table__filter-checkmark" />
                {{ filter.text }}
              </div>
              <div class="base-table__filter-divider" />
              <div class="base-table__filter-clear" @click="handleFilter(cell.key, undefined)">
                清空
              </div>
            </div>

            <!-- 列宽调整 -->
            <span v-if="resizable" class="base-table__resize-handle" @mousedown.stop="startResize(cell, $event)" />
          </div>
        </div>
      </div>

      <!-- 表体 -->
      <div class="base-table__body">
        <template v-for="(row, index) in displayData" :key="getRowKey(row, index)">
          <!-- 数据行 -->
          <div
            :class="[
              'base-table__row',
              'base-table__row--data',
              { 'base-table__row--selected': isSelected(row) },
              { 'base-table__row--expanded': isExpanded(row) },
              { 'base-table__row--draggable': dragSort },
              rowClassName?.(row, index),
            ]"
            :draggable="dragSort"
            @click="handleRowClick(row, index)"
            @dblclick="handleRowDblclick(row, index)"
            @dragstart="dragSort && handleDragStart(index, $event)"
            @dragover.prevent="dragSort && handleDragOver(index)"
            @drop.prevent="dragSort && handleDrop(index)"
          >
            <!-- 选择列 -->
            <div v-if="selectable" class="base-table__cell base-table__cell--checkbox">
              <span
                :class="[
                  'base-table__checkbox',
                  { 'base-table__checkbox--checked': isSelected(row) },
                ]"
                role="checkbox"
                :aria-checked="isSelected(row)"
                tabindex="0"
                @click.stop="handleSelect(row)"
                @keydown.enter.stop="handleSelect(row)"
                @keydown.space.prevent.stop="handleSelect(row)"
              />
            </div>

            <!-- 展开列 -->
            <div v-if="expandable" class="base-table__cell base-table__cell--expand">
              <span
                :class="[
                  'base-table__expand-btn',
                  { 'base-table__expand-btn--expanded': isExpanded(row) },
                ]"
                role="button"
                :aria-label="isExpanded(row) ? '收起' : '展开'"
                tabindex="0"
                @click.stop="toggleExpand(row)"
                @keydown.enter.stop="toggleExpand(row)"
              >
                <span class="base-table__expand-btn-shape" />
              </span>
            </div>

            <!-- 树形缩进 -->
            <div v-if="treeData" class="base-table__cell base-table__cell--tree">
              <span
                v-for="i in row._level"
                :key="i"
                class="base-table__tree-indent"
                :style="{ width: `${indent}px` }"
              />
              <span
                v-if="row.children?.length"
                :class="[
                  'base-table__tree-toggle',
                  { 'base-table__tree-toggle--expanded': isTreeExpanded(row) },
                ]"
                role="button"
                :aria-label="isTreeExpanded(row) ? '收起' : '展开'"
                tabindex="0"
                @click.stop="toggleTree(row)"
                @keydown.enter.stop="toggleTree(row)"
              >
                <span class="base-table__tree-toggle-shape" />
              </span>
            </div>

            <!-- 数据列 -->
            <div
              v-for="column in displayColumns"
              :key="column.key"
              :class="[
                'base-table__cell',
                `base-table__cell--${column.align || 'left'}`,
                { 'base-table__cell--fixed-left': column.fixed === 'left' },
                { 'base-table__cell--fixed-right': column.fixed === 'right' },
                { 'base-table__cell--editable': column.editable },
                cellClassName?.(row, column, index),
              ]"
              :style="getCellStyle(column)"
              @click="handleCellClick(row, column, index)"
            >
              <!-- 操作列：复用 base-button -->
              <template v-if="column.actions">
                <div class="base-table__actions">
                  <base-button
                    v-for="action in column.actions"
                    v-show="!action.hidden?.(row)"
                    :key="action.event"
                    :type="action.type || 'default'"
                    :variant="action.variant || 'solid'"
                    :size="size === 'lg' ? 'md' : 'sm'"
                    :icon="action.icon"
                    :disabled="action.disabled?.(row)"
                    @click="handleAction(action.event, row)"
                  >
                    {{ action.label }}
                  </base-button>
                </div>
              </template>

              <!-- 编辑模式：自定义 div-input -->
              <template v-else-if="column.editable && isEditing(row, column.key)">
                <div class="base-table__edit-wrap">
                    <div
                      v-if="column.editType === 'input' || column.editType === 'number'"
                      class="base-table__edit-input"
                      role="textbox"
                      contenteditable="true"
                      @blur="handleEditBlur(row, column.key, $event)"
                      @keydown.enter.prevent="($event.target as HTMLElement).blur()"
                    >{{ row[column.key] }}</div>

                    <!-- 自定义下拉选择（无 select） -->
                    <div
                      v-else-if="column.editType === 'select'"
                      class="base-table__edit-select"
                      tabindex="0"
                      @click="toggleEditSelect(column.key)"
                      @blur="closeEditSelect"
                    >
                      <span class="base-table__edit-select-label">
                        {{ getEditOptionLabel(column, row[column.key]) }}
                      </span>
                      <span class="base-table__edit-select-arrow">▾</span>

                      <div v-if="activeEditSelect === column.key" class="base-table__edit-select-panel">
                        <div
                          v-for="option in column.editOptions"
                          :key="String(option.value)"
                          :class="[
                            'base-table__edit-select-option',
                            { 'base-table__edit-select-option--active': row[column.key] === option.value },
                          ]"
                          @mousedown.prevent="handleEditSelect(row, column.key, option.value)"
                        >
                          {{ option.label }}
                        </div>
                      </div>
                    </div>
                  </div>
              </template>

              <!-- 自定义渲染 -->
              <template v-else-if="column.render">
                <component :is="column.render(row, index)" />
              </template>

              <!-- 插槽 -->
              <template v-else-if="column.slot">
                <slot :name="column.slot" :row="row" :column="column" :index="index" />
              </template>

              <!-- 默认渲染 -->
              <template v-else>
                <span class="base-table__cell-text">{{ row[column.key] }}</span>
              </template>
            </div>
          </div>

          <!-- 展开行 -->
          <div v-if="expandable && isExpanded(row)" class="base-table__row base-table__row--expanded-content">
            <div class="base-table__expanded-row">
              <slot name="expanded-row" :row="row" :index="index" />
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-if="displayData.length === 0" class="base-table__empty">
          <slot name="empty">
            <div class="base-table__empty-icon">
              <span class="base-table__empty-icon-shape" />
            </div>
            <div class="base-table__empty-text">{{ emptyText }}</div>
          </slot>
        </div>
      </div>

      <!-- 汇总行 -->
      <div v-if="showSummary" class="base-table__footer">
        <div class="base-table__row base-table__row--summary">
          <div v-if="selectable" class="base-table__cell base-table__cell--checkbox" />
          <div v-if="expandable" class="base-table__cell base-table__cell--expand" />
          <div v-if="treeData" class="base-table__cell base-table__cell--tree" />
          <div
            v-for="column in displayColumns"
            :key="column.key"
            class="base-table__cell"
            :style="getCellStyle(column)"
          >
            <span class="base-table__cell-text">{{ summaryData[column.key] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <base-paginated
      v-if="pagination"
      :current="pagination.current"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      position="right"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import BaseButton from '../vue-button-skill/BaseButton.vue'
import BaseStatus from '../vue-status-skill/BaseStatus.vue'
import BaseLoading from './BaseLoading.vue'
import BasePaginated from './BasePaginated.vue'

const props = withDefaults(defineProps<BaseTableProps>(), {
  selectable: false,
  selectedKeys: () => [],
  rowKey: 'id',
  expandable: false,
  defaultExpandAll: false,
  editable: false,
  virtual: false,
  itemHeight: 48,
  indent: 24,
  dragSort: false,
  resizable: false,
  showSummary: false,
  size: 'md',
  striped: false,
  bordered: false,
  hover: false,
  compact: false,
  rounded: false,
  shadow: false,
  loading: false,
  loadingText: '加载中...',
  emptyText: '暂无数据',
})

const emit = defineEmits<Emits>()

// 排序状态
const sortKey = ref(props.defaultSort?.key || '')
const sortOrder = ref<'asc' | 'desc'>(props.defaultSort?.order || 'asc')

// 筛选状态
const activeFilter = ref<string | null>(null)
const filterValues = ref<Record<string, unknown>>({ ...(props.filters || {}) })

// 展开状态
const expandedKeys = ref<Set<string | number>>(new Set())

// 编辑状态
const editingCell = ref<{ row: unknown; key: string } | null>(null)
const activeEditSelect = ref<string | null>(null)

// 树形展开状态
const treeExpandedKeys = ref<Set<string | number>>(new Set())

// 拖拽状态
const dragFromIndex = ref<number | null>(null)

// 列宽调整状态
const resizingColumn = ref<{ key: string; startX: number; startWidth: number } | null>(null)
const columnWidths = ref<Record<string, number>>({})

// 计算显示的列（展开分组列）
const displayColumns = computed(() => {
  const result: BaseTableColumn[] = []
  for (const column of props.columns) {
    if (column.children) {
      result.push(...column.children)
    } else {
      result.push(column)
    }
  }
  return result
})

// 计算是否有分组列
const hasGroupedColumns = computed(() => {
  return props.columns.some((col) => col.children)
})

// 计算多级表头行
const headerRows = computed(() => {
  const rows: { cells: BaseTableColumn[]; depth: number }[] = []
  const maxDepth = getMaxDepth(props.columns, 1)
  for (let d = 1; d <= maxDepth; d++) {
    rows.push({ cells: flattenAtDepth(props.columns, d), depth: d })
  }
  return rows
})

function getMaxDepth(cols: BaseTableColumn[], depth: number): number {
  let max = depth
  for (const col of cols) {
    if (col.children) {
      max = Math.max(max, getMaxDepth(col.children, depth + 1))
    }
  }
  return max
}

function flattenAtDepth(cols: BaseTableColumn[], depth: number): BaseTableColumn[] {
  const result: BaseTableColumn[] = []
  for (const col of cols) {
    if (!col.children && depth === 1) {
      result.push(col)
    } else if (col.children) {
      if (depth === 1) {
        result.push({ ...col, rowspan: getMaxDepth(cols, 1) })
      } else {
        result.push(...flattenAtDepth(col.children, depth - 1))
      }
    }
  }
  return result
}

// 树形扁平化
const flatTreeData = computed(() => {
  if (!props.treeData) return props.data.map((r, i) => ({ ...r, _level: 0, _index: i }))
  const result: Array<Record<string, unknown> & { _level: number; _index: number; _parentKey?: string | number }> = []
  let counter = 0
  const walk = (nodes: unknown[], level: number, parentKey?: string | number) => {
    for (const node of nodes) {
      const n = node as Record<string, unknown>
      const key = getRowKey(n, counter)
      result.push({ ...n, _level: level, _index: counter, _parentKey: parentKey })
      counter++
      const children = n.children as unknown[] | undefined
      if (children?.length && (!props.defaultExpandAllRows ? treeExpandedKeys.value.has(key) : true)) {
        walk(children, level + 1, key)
      }
    }
  }
  walk(props.data, 0)
  return result
})

// 计算显示的数据（树形 + 排序 + 筛选）
const displayData = computed(() => {
  let data: Array<Record<string, unknown>> = props.treeData ? (flatTreeData.value as Array<Record<string, unknown>>) : [...props.data]

  // 筛选
  for (const [key, value] of Object.entries(filterValues.value)) {
    if (value !== undefined && value !== null) {
      data = data.filter((row) => row[key] === value)
    }
  }

  // 排序
  if (sortKey.value) {
    data.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]
      const order = sortOrder.value === 'asc' ? 1 : -1
      if (aVal === bVal) return 0
      return aVal > bVal ? order : -order
    })
  }

  return data
})

// 全选状态
const isAllSelected = computed(() => {
  return displayData.value.length > 0 && displayData.value.every((row) => isSelected(row))
})

// 半选状态
const isIndeterminate = computed(() => {
  const selectedCount = displayData.value.filter((row) => isSelected(row)).length
  return selectedCount > 0 && selectedCount < displayData.value.length
})

// 汇总数据
const summaryData = computed(() => {
  if (!props.summaryMethod) return {}
  return props.summaryMethod({ data: props.data, columns: displayColumns.value })
})

// 获取行 key
function getRowKey(row: Record<string, unknown>, index: number): string | number {
  return (row[props.rowKey] ?? index) as string | number
}

// 判断是否选中
function isSelected(row: Record<string, unknown>): boolean {
  const key = getRowKey(row, 0)
  return props.selectedKeys.includes(key)
}

// 判断是否展开
function isExpanded(row: Record<string, unknown>): boolean {
  const key = getRowKey(row, 0)
  return expandedKeys.value.has(key)
}

// 判断树形是否展开
function isTreeExpanded(row: Record<string, unknown>): boolean {
  const key = getRowKey(row, 0)
  return treeExpandedKeys.value.has(key)
}

// 判断是否编辑中
function isEditing(row: Record<string, unknown>, key: string): boolean {
  return editingCell.value?.row === row && editingCell.value?.key === key
}

// 获取单元格样式
function getCellStyle(column: BaseTableColumn): Record<string, string> {
  const style: Record<string, string> = {}
  if (columnWidths.value[column.key]) {
    style.width = `${columnWidths.value[column.key]}px`
    style.minWidth = `${columnWidths.value[column.key]}px`
  } else if (column.width) {
    style.width = typeof column.width === 'number' ? `${column.width}px` : column.width
  }
  if (column.minWidth) {
    style.minWidth = `${column.minWidth}px`
  }
  if (column.maxWidth) {
    style.maxWidth = `${column.maxWidth}px`
  }
  return style
}

// 选择行
function handleSelect(row: Record<string, unknown>) {
  const keys = [...props.selectedKeys]
  const key = getRowKey(row, 0)
  const index = keys.indexOf(key)
  if (index > -1) {
    keys.splice(index, 1)
  } else {
    keys.push(key)
  }
  emit('selectionChange', keys)
}

// 全选
function handleSelectAll() {
  if (isAllSelected.value) {
    emit('selectionChange', [])
  } else {
    const keys = displayData.value.map((row) => getRowKey(row, 0))
    emit('selectionChange', keys)
  }
}

// 排序
function handleSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sortChange', { key: sortKey.value, order: sortOrder.value })
}

// 筛选
function toggleFilter(key: string) {
  activeFilter.value = activeFilter.value === key ? null : key
}

function handleFilter(key: string, value: unknown) {
  if (value === undefined) {
    delete filterValues.value[key]
  } else {
    filterValues.value[key] = value
  }
  filterValues.value = { ...filterValues.value }
  activeFilter.value = null
  emit('filterChange', { ...filterValues.value })
}

// 展开行
function toggleExpand(row: Record<string, unknown>) {
  const key = getRowKey(row, 0)
  const newExpanded = new Set(expandedKeys.value)
  if (newExpanded.has(key)) {
    newExpanded.delete(key)
  } else {
    newExpanded.add(key)
  }
  expandedKeys.value = newExpanded
  emit('expandChange', row, newExpanded.has(key))
}

// 树形展开
function toggleTree(row: Record<string, unknown>) {
  const key = getRowKey(row, 0)
  const newExpanded = new Set(treeExpandedKeys.value)
  if (newExpanded.has(key)) {
    newExpanded.delete(key)
  } else {
    newExpanded.add(key)
  }
  treeExpandedKeys.value = newExpanded
}

// 行点击
function handleRowClick(row: Record<string, unknown>, index: number) {
  emit('rowClick', row, index)
}

// 行双击
function handleRowDblclick(row: Record<string, unknown>, index: number) {
  emit('rowDblclick', row, index)
}

// 单元格点击
function handleCellClick(row: Record<string, unknown>, column: BaseTableColumn, index: number) {
  if (column.editable) {
    editingCell.value = { row, key: column.key }
  }
  emit('cellClick', row, column, index)
}

// 编辑失焦
function handleEditBlur(row: Record<string, unknown>, key: string, event: Event) {
  const target = event.target as HTMLElement
  const value = target.textContent || ''
  row[key] = value
  editingCell.value = null
  emit('cellEdit', row, key, value)
}

// 编辑下拉
function toggleEditSelect(key: string) {
  activeEditSelect.value = activeEditSelect.value === key ? null : key
}

function closeEditSelect() {
  activeEditSelect.value = null
}

function getEditOptionLabel(column: BaseTableColumn, value: unknown): string {
  const option = column.editOptions?.find((o) => o.value === value)
  return option?.label ?? String(value ?? '')
}

function handleEditSelect(row: Record<string, unknown>, key: string, value: unknown) {
  row[key] = value
  editingCell.value = null
  activeEditSelect.value = null
  emit('cellEdit', row, key, value)
}

// 操作列事件
function handleAction(event: string, row: Record<string, unknown>) {
  emit(event as any, row)
  emit('action', event, row)
}

// 拖拽
function handleDragStart(index: number, event: DragEvent) {
  dragFromIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleDragOver(_index: number) {
  // 视觉反馈可在此扩展
}

function handleDrop(toIndex: number) {
  if (dragFromIndex.value !== null && dragFromIndex.value !== toIndex) {
    emit('dragEnd', dragFromIndex.value, toIndex)
  }
  dragFromIndex.value = null
}

// 分页变化
function handlePageChange(page: number) {
  emit('pageChange', page)
}

// 列宽调整
function startResize(column: BaseTableColumn, event: MouseEvent) {
  const startWidth = (event.target as HTMLElement).parentElement?.getBoundingClientRect().width ?? 100
  resizingColumn.value = { key: column.key, startX: event.clientX, startWidth }
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(event: MouseEvent) {
  if (!resizingColumn.value) return
  const delta = event.clientX - resizingColumn.value.startX
  const newWidth = Math.max(50, resizingColumn.value.startWidth + delta)
  columnWidths.value = { ...columnWidths.value, [resizingColumn.value.key]: newWidth }
}

function stopResize() {
  if (resizingColumn.value) {
    emit('resize', resizingColumn.value.key, columnWidths.value[resizingColumn.value.key] || 0)
  }
  resizingColumn.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<style scoped>
.base-table {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* 容器 */
.base-table__container {
  overflow-x: auto;
  overflow-y: auto;
}

/* 表格行 */
.base-table__row {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s;
  position: relative;
}

.base-table__row--header {
  background: var(--color-bg-secondary);
  font-weight: var(--weight-semibold);
  position: sticky;
  top: 0;
  z-index: 10;
}

.base-table__row--summary {
  background: var(--color-bg-secondary);
  font-weight: var(--weight-semibold);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.base-table__row--selected {
  background: var(--color-primary-light);
}

.base-table__row--expanded-content {
  background: var(--color-bg-secondary);
}

.base-table__row--draggable {
  cursor: move;
}

/* 单元格 */
.base-table__cell {
  flex: 1;
  min-width: 0;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-sm);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
}

.base-table__cell--left { text-align: left; }
.base-table__cell--center { text-align: center; justify-content: center; }
.base-table__cell--right { text-align: right; justify-content: flex-end; }

.base-table__cell-content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.base-table__cell-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 固定列 */
.base-table__cell--fixed-left {
  position: sticky;
  left: 0;
  z-index: 5;
  background: inherit;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
}

.base-table__cell--fixed-right {
  position: sticky;
  right: 0;
  z-index: 5;
  background: inherit;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.06);
}

.base-table__row--header .base-table__cell--fixed-left,
.base-table__row--header .base-table__cell--fixed-right {
  background: var(--color-bg-secondary);
}

.base-table__row--summary .base-table__cell--fixed-left,
.base-table__row--summary .base-table__cell--fixed-right {
  background: var(--color-bg-secondary);
}

/* 选择列（无 input） */
.base-table__cell--checkbox {
  flex: none;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-table__checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.base-table__checkbox:hover {
  border-color: var(--color-primary);
}

.base-table__checkbox:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.base-table__checkbox--checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.base-table__checkbox--checked::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
}

.base-table__checkbox--indeterminate {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.base-table__checkbox--indeterminate::after {
  content: '';
  width: 8px;
  height: 2px;
  background: white;
  border-radius: 1px;
}

/* 展开列 */
.base-table__cell--expand {
  flex: none;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-table__expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.base-table__expand-btn:hover {
  background: var(--color-bg-hover);
}

.base-table__expand-btn-shape {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-right: 2px solid var(--color-text-secondary);
  border-bottom: 2px solid var(--color-text-secondary);
  transform: rotate(-45deg);
  transition: transform 0.2s;
}

.base-table__expand-btn--expanded .base-table__expand-btn-shape {
  transform: rotate(45deg);
}

/* 树形 */
.base-table__cell--tree {
  flex: none;
  display: flex;
  align-items: center;
  padding: var(--space-3) 0;
}

.base-table__tree-indent {
  display: inline-block;
  height: 1px;
}

.base-table__tree-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.base-table__tree-toggle:hover {
  background: var(--color-bg-hover);
}

.base-table__tree-toggle-shape {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid var(--color-text-secondary);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  transition: transform 0.2s;
}

.base-table__tree-toggle--expanded .base-table__tree-toggle-shape {
  transform: rotate(90deg);
}

/* 排序 */
.base-table__cell--sortable {
  cursor: pointer;
  user-select: none;
}

.base-table__cell--sortable:hover {
  background: var(--color-bg-hover);
}

.base-table__sort-icon {
  display: inline-flex;
  flex-direction: column;
  margin-left: var(--space-1);
  font-size: 10px;
  line-height: 1;
  color: var(--color-text-muted);
  gap: 1px;
}

.base-table__sort-active {
  color: var(--color-primary);
}

/* 筛选 */
.base-table__cell--filterable {
  position: relative;
}

.base-table__filter-icon {
  margin-left: var(--space-1);
  cursor: pointer;
  color: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.base-table__filter-icon:hover {
  color: var(--color-primary);
  background: var(--color-bg-hover);
}

.base-table__filter-icon-shape {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 2px solid currentColor;
  border-radius: 2px;
  position: relative;
}

.base-table__filter-icon-shape::after {
  content: '';
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
}

.base-table__filter-panel {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 140px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  padding: var(--space-2) 0;
}

.base-table__filter-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: var(--font-sm);
}

.base-table__filter-option:hover {
  background: var(--color-bg-hover);
}

.base-table__filter-checkmark {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.base-table__filter-option--active .base-table__filter-checkmark {
  background: var(--color-primary);
  border-color: var(--color-primary);
  position: relative;
}

.base-table__filter-option--active .base-table__filter-checkmark::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.base-table__filter-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-1) 0;
}

.base-table__filter-clear {
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
  transition: color 0.2s;
}

.base-table__filter-clear:hover {
  color: var(--color-primary);
}

/* 操作列 */
.base-table__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: nowrap;
}

/* 编辑模式（无 input / select） */
.base-table__edit-wrap {
  width: 100%;
}

.base-table__edit-input {
  width: 100%;
  min-height: var(--height-input-sm);
  padding: 0 var(--space-2);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
  outline: none;
  line-height: var(--height-input-sm);
}

.base-table__edit-input:focus {
  border-color: var(--color-primary-hover);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.base-table__edit-select {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: var(--height-input-sm);
  padding: 0 var(--space-2);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  cursor: pointer;
  outline: none;
  font-size: var(--font-sm);
}

.base-table__edit-select-arrow {
  margin-left: var(--space-2);
  font-size: 10px;
  color: var(--color-text-muted);
  transition: transform 0.2s;
}

.base-table__edit-select:focus .base-table__edit-select-arrow {
  transform: rotate(180deg);
}

.base-table__edit-select-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  padding: var(--space-1) 0;
}

.base-table__edit-select-option {
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: var(--font-sm);
}

.base-table__edit-select-option:hover {
  background: var(--color-bg-hover);
}

.base-table__edit-select-option--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

/* 展开行 */
.base-table__expanded-row {
  padding: var(--space-4) var(--space-6);
  width: 100%;
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
}

/* 空状态 */
.base-table__empty {
  padding: var(--space-10) var(--space-4);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.base-table__empty-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
}

.base-table__empty-icon-shape {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-radius: var(--radius-md);
  position: relative;
}

.base-table__empty-icon-shape::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 12px;
  height: 3px;
  background: var(--color-border);
  border-radius: 2px;
  transform: rotate(-45deg);
}

.base-table__empty-text {
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

/* 加载中 */
.base-table__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  z-index: 20;
}

/* 列宽调整 */
.base-table__cell--resizable .base-table__resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.2s;
}

.base-table__cell--resizable .base-table__resize-handle:hover,
.base-table__cell--resizable .base-table__resize-handle:active {
  background: var(--color-primary);
}

/* 尺寸 */
.base-table--size-sm .base-table__cell { padding: var(--space-2) var(--space-3); font-size: var(--font-xs); }
.base-table--size-lg .base-table__cell { padding: var(--space-4) var(--space-5); font-size: var(--font-base); }

/* 悬停高亮 */
.base-table--hover .base-table__row--data:hover {
  background: var(--color-bg-hover);
}

/* 斑马纹 */
.base-table--striped .base-table__row--data:nth-child(even) {
  background: var(--color-bg-secondary);
}
.base-table--striped .base-table__row--data:nth-child(even):hover {
  background: var(--color-bg-hover);
}

/* 边框 */
.base-table--bordered {
  border: 1px solid var(--color-border);
}

.base-table--bordered .base-table__row {
  border-bottom: 1px solid var(--color-border);
}

.base-table--bordered .base-table__cell {
  border-right: 1px solid var(--color-border);
}

.base-table--bordered .base-table__cell:last-child {
  border-right: none;
}

/* 紧凑模式 */
.base-table--compact .base-table__cell {
  padding: var(--space-2) var(--space-3);
}

/* 圆角 */
.base-table--rounded {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 阴影 */
.base-table--shadow {
  box-shadow: var(--shadow-md);
}
</style>
```

---

## 依赖说明

| 组件 | 来源 | 触发时机 |
|------|------|----------|
| `<base-button>` | vue-button-skill | 操作列 |
| `<base-status>` | vue-status-skill | 状态列（通过 render 渲染） |
| `<base-loading>` | base-loading.md | 加载遮罩 |
| `<base-paginated>` | base-paginated.md | 表格分页 |
| `<base-card>` | vue-card-skill | 表格容器 |

---

## 相关技能

- [vue-base-skill](../SKILL.md) — 父技能
- [vue-button-skill](../vue-button-skill/) — base-button
- [vue-status-skill](../vue-status-skill/) — base-status
- [vue-card-skill](../vue-card-skill/) — base-card
- [vue-theme-skill](../../vue-theme-skill/) — Token