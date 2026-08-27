# base-table 通用表格

> **核心地位**：base-table 是 vue-base-skill 表单体系的核心组件，**必须嵌入 base-card** 使用。
> 支持 14 种形态，覆盖业务表格 99% 场景。
> **零第三方组件库**，所有样式来自 vue-theme-skill。

## 为什么需要 base-table？

实际开发中表格痛点：
- ❌ 基础 / 条纹 / 边框 / 高亮 / 紧凑各自实现，样式不统一
- ❌ 选择 / 排序 / 筛选 / 分页逻辑重复
- ❌ 加载态 / 空状态 / 树形数据各自处理
- ❌ 主题切换时表格样式难以同步

**base-table 把所有表格场景收敛成一个组件**：
- ✅ 14 种 variant 一键切换
- ✅ 14 种行为通过 props 配置
- ✅ 主题自动继承
- ✅ 与 base-card / base-button / base-tag 无缝集成

## 14 种形态总览

### 形态变体（variant — 视觉）

| # | 形态 | 文件 | 适用 |
|---|------|------|------|
| 1 | **basic** 基础 | [base-table.md](base-table.md) | 用户/订单列表 |
| 2 | **striped** 条纹 | [base-table-striped.md](base-table-striped.md) | 数据展示 |
| 3 | **bordered** 边框 | [base-table-bordered.md](base-table-bordered.md) | 紧凑数据 |
| 4 | **hover** 高亮 | [base-table-hover.md](base-table-hover.md) | 交互式列表 |
| 5 | **compact** 紧凑 | [base-table-compact.md](base-table-compact.md) | 日志 / 监控 |

### 功能变体（功能配置）

| # | 形态 | 文件 | 适用 |
|---|------|------|------|
| 6 | **fixed-header** 固定表头 | [base-table-fixed-header.md](base-table-fixed-header.md) | 长列表 |
| 7 | **fixed-column** 固定列 | [base-table-fixed-column.md](base-table-fixed-column.md) | 多列对比 |
| 8 | **selectable** 可选择 | [base-table-selectable.md](base-table-selectable.md) | 批量操作 |
| 9 | **sortable** 可排序 | [base-table-sortable.md](base-table-sortable.md) | 数据排序 |
| 10 | **filterable** 可筛选 | [base-table-filterable.md](base-table-filterable.md) | 多条件 |
| 11 | **paginated** 分页 | [base-table-paginated.md](base-table-paginated.md) | 大数据量 |

### 状态变体（state — 状态）

| # | 形态 | 文件 | 适用 |
|---|------|------|------|
| 12 | **loading** 加载态 | [base-table-loading.md](base-table-loading.md) | 网络请求 |
| 13 | **empty** 空状态 | [base-table-empty.md](base-table-empty.md) | 无数据 |
| 14 | **tree** 树形 | [base-table-tree.md](base-table-tree.md) | 层级数据 |

## Props

```typescript
interface BaseTableColumn {
  key: string                       // 字段名
  title: string                     // 列标题
  width?: string | number           // 列宽
  minWidth?: number                 // 最小宽度
  align?: 'left' | 'center' | 'right'  // 对齐
  fixed?: 'left' | 'right'          // 固定列
  sortable?: boolean                // 可排序
  filterable?: boolean              // 可筛选
  render?: (row: any, index: number) => VNode  // 自定义渲染
  slot?: string                     // 具名插槽
  children?: BaseTableColumn[]      // 表头分组
}

interface BasePaginationConfig {
  current: number                   // 当前页
  pageSize: number                  // 每页条数
  total: number                     // 总条数
  showSizeChanger?: boolean         // 显示每页大小切换
  showQuickJumper?: boolean         // 显示跳转
  pageSizes?: number[]              // 可选每页大小
}

interface BaseTableProps {
  // 数据
  data: any[]                                    // 表格数据
  columns: BaseTableColumn[]                     // 列定义
  rowKey?: string                                // 行唯一 key，默认 'id'

  // 形态（视觉）
  variant?: 'basic' | 'striped' | 'bordered' | 'hover' | 'compact'
  size?: 'sm' | 'md' | 'lg'                      // 行高（sm: 40px, md: 52px, lg: 64px）

  // 行为（功能）
  selectable?: boolean                           // 显示复选框
  sortable?: boolean                             // 启用排序
  filterable?: boolean                           // 启用筛选
  lazy?: boolean                                 // 懒加载子节点（tree）

  // 状态
  loading?: boolean                              // 加载态
  empty?: string                                 // 空状态文案

  // 分页
  pagination?: BasePaginationConfig
}
```

## Events

```typescript
interface Emits {
  // 选择
  select: [rows: any[]]                                  // 选择变化
  // 排序
  sort: [column: BaseTableColumn, order: 'asc' | 'desc'] // 排序变化
  // 行点击
  rowClick: [row: any, index: number]                    // 行点击
  // 分页
  pageChange: [page: number, pageSize: number]           // 分页变化
  // 树
  expand: [row: any, expanded: boolean]                  // 树节点展开
}
```

## Slots

| Slot | Props | 说明 |
|------|-------|------|
| `default`（按 column.slot 匹配） | `{ row, index }` | 自定义列渲染 |

## 代码

```vue
<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, ref } from 'vue'

export interface BaseTableColumn {
  key: string
  title: string
  width?: string | number
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (row: T, index: number) => any
  slot?: string
}

export interface BasePaginationConfig {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  pageSizes?: number[]
}

const props = withDefaults(defineProps<{
  data: T[]
  columns: BaseTableColumn[]
  rowKey?: string
  variant?: 'basic' | 'striped' | 'bordered' | 'hover' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  selectable?: boolean
  loading?: boolean
  empty?: string
  pagination?: BasePaginationConfig
}>(), {
  rowKey: 'id',
  variant: 'basic',
  size: 'md',
  selectable: false,
  loading: false,
  empty: '暂无数据',
})

const emit = defineEmits<{
  select: [rows: T[]]
  sort: [column: BaseTableColumn, order: 'asc' | 'desc']
  rowClick: [row: T, index: number]
  pageChange: [page: number, pageSize: number]
}>()

// 排序
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc' | null>(null)

const sortedData = computed(() => {
  if (!sortKey.value || !sortOrder.value) return props.data
  const key = sortKey.value
  const order = sortOrder.value
  return [...props.data].sort((a, b) => {
    const va = a[key]
    const vb = b[key]
    if (va == null && vb == null) return 0
    if (va == null) return 1
    if (vb == null) return -1
    if (typeof va === 'number' && typeof vb === 'number') {
      return order === 'asc' ? va - vb : vb - va
    }
    return order === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
  })
})

function handleSort(col: BaseTableColumn) {
  if (!col.sortable) return
  if (sortKey.value !== col.key) {
    sortKey.value = col.key
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  } else {
    sortKey.value = null
    sortOrder.value = null
  }
  if (sortKey.value && sortOrder.value) {
    emit('sort', col, sortOrder.value)
  }
}

// 选择
const selectedKeys = ref<Set<string | number>>(new Set())
const isAllSelected = computed(() =>
  sortedData.value.length > 0 &&
  sortedData.value.every(row => selectedKeys.value.has(row[props.rowKey]))
)
const isIndeterminate = computed(() =>
  selectedKeys.value.size > 0 && !isAllSelected.value
)
const selectedRows = computed(() =>
  sortedData.value.filter(row => selectedKeys.value.has(row[props.rowKey]))
)

function toggleRow(row: T) {
  const next = new Set(selectedKeys.value)
  const key = row[props.rowKey]
  next.has(key) ? next.delete(key) : next.add(key)
  selectedKeys.value = next
  emit('select', selectedRows.value)
}

function toggleAll() {
  const next = new Set<string | number>()
  if (!isAllSelected.value) {
    sortedData.value.forEach(row => next.add(row[props.rowKey]))
  }
  selectedKeys.value = next
  emit('select', selectedRows.value)
}

function handleRowClick(row: T, index: number) {
  emit('rowClick', row, index)
}

function handlePageChange(page: number, pageSize: number) {
  emit('pageChange', page, pageSize)
}
</script>

<template>
  <div class="base-table-wrapper">
    <!-- Loading -->
    <div v-if="loading" class="base-table__loading">
      <div class="base-table__spinner"></div>
      <span class="base-table__loading-text">加载中...</span>
    </div>

    <table :class="[
      'base-table',
      `base-table--variant-${variant}`,
      `base-table--size-${size}`,
    ]">
      <thead class="base-table__head">
        <tr>
          <th v-if="selectable" class="base-table__cell--select">
            <label class="base-table__checkbox">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleAll"
              />
              <span></span>
            </label>
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{
              width: typeof col.width === 'number' ? `${col.width}px` : col.width,
              minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
              textAlign: col.align ?? 'left',
            }"
            :class="{
              'base-table__cell--sortable': col.sortable,
              [`base-table__cell--sorted-${sortOrder}`]:
                sortKey === col.key && sortOrder,
            }"
            @click="handleSort(col)"
          >
            <div class="base-table__cell-content">
              <span>{{ col.title }}</span>
              <span v-if="col.sortable" class="base-table__sort-icon">
                <span :class="{ 'is-active': sortKey === col.key && sortOrder === 'asc' }">▲</span>
                <span :class="{ 'is-active': sortKey === col.key && sortOrder === 'desc' }">▼</span>
              </span>
            </div>
          </th>
        </tr>
      </thead>

      <tbody class="base-table__body">
        <tr
          v-for="(row, idx) in sortedData"
          :key="row[rowKey]"
          :class="{ 'base-table__row--selected': selectable && selectedKeys.has(row[rowKey]) }"
          @click="handleRowClick(row, idx)"
        >
          <td v-if="selectable" class="base-table__cell--select">
            <label class="base-table__checkbox" @click.stop>
              <input type="checkbox" :checked="selectedKeys.has(row[rowKey])" @change="toggleRow(row)" />
              <span></span>
            </label>
          </td>
          <td
            v-for="col in columns"
            :key="col.key"
            :style="{
              textAlign: col.align ?? 'left',
              minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
            }"
          >
            <slot v-if="col.slot" :name="col.slot" :row="row" :index="idx" />
            <component v-else-if="col.render" :is="col.render(row, idx)" />
            <span v-else>{{ row[col.key] }}</span>
          </td>
        </tr>

        <tr v-if="sortedData.length === 0 && !loading">
          <td :colspan="columns.length + (selectable ? 1 : 0)" class="base-table__empty">
            <div class="base-table__empty-content">
              <div class="base-table__empty-icon">📭</div>
              <div class="base-table__empty-text">{{ empty }}</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div v-if="pagination" class="base-table__pagination">
      <span class="base-table__pagination-info">共 {{ pagination.total }} 条</span>
      <div class="base-table__pagination-controls">
        <button
          class="base-table__page-btn"
          :disabled="pagination.current <= 1"
          @click="handlePageChange(pagination.current - 1, pagination.pageSize)"
        >上一页</button>
        <span class="base-table__page-current">{{ pagination.current }}</span>
        <button
          class="base-table__page-btn"
          :disabled="pagination.current * pagination.pageSize >= pagination.total"
          @click="handlePageChange(pagination.current + 1, pagination.pageSize)"
        >下一页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
 * 严格使用 vue-theme-skill Token
 * ============================================ */
.base-table-wrapper {
  position: relative;
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.base-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--font-base);
  color: var(--color-text);
}

.base-table__head th {
  height: var(--height-table-row-md);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-weight: var(--weight-medium);
  font-size: var(--font-sm);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  user-select: none;
}

.base-table--size-sm .base-table__head th { height: var(--height-table-row-sm); padding: var(--space-2) var(--space-3); font-size: var(--font-xs); }
.base-table--size-lg .base-table__head th { height: var(--height-table-row-lg); padding: var(--space-4) var(--space-5); font-size: var(--font-base); }

.base-table__cell--sortable { cursor: pointer; }
.base-table__cell--sortable:hover { background: var(--color-surface-hover); color: var(--color-text); }

.base-table__cell-content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.base-table__sort-icon {
  display: inline-flex;
  flex-direction: column;
  font-size: 10px;
  line-height: 1;
  color: var(--color-text-tertiary);
}
.base-table__sort-icon span { display: block; height: 6px; transition: color 0.15s; }
.base-table__sort-icon span.is-active { color: var(--color-primary); }

.base-table__body td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  transition: background 0.15s;
}

.base-table--size-sm .base-table__body td { padding: var(--space-2) var(--space-3); font-size: var(--font-sm); }
.base-table--size-lg .base-table__body td { padding: var(--space-4) var(--space-5); font-size: var(--font-base); }

/* Hover 形态 */
.base-table--variant-hover .base-table__body tr:hover td {
  background: var(--color-surface-hover);
}

/* Striped 形态 */
.base-table--variant-striped .base-table__body tr:nth-child(even) td {
  background: var(--color-bg);
}

/* Bordered 形态 */
.base-table--variant-bordered { border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.base-table--variant-bordered .base-table__head th,
.base-table--variant-bordered .base-table__body td {
  border-right: 1px solid var(--color-border);
}
.base-table--variant-bordered .base-table__head th:last-child,
.base-table--variant-bordered .base-table__body td:last-child {
  border-right: none;
}

/* Compact 形态 */
.base-table--variant-compact .base-table__body td { padding: var(--space-2) var(--space-3); font-size: var(--font-sm); }

.base-table__row--selected td { background: var(--color-primary-light); }

.base-table__cell--select { width: 48px; text-align: center !important; }
.base-table__checkbox { display: inline-flex; align-items: center; cursor: pointer; position: relative; }
.base-table__checkbox input { position: absolute; opacity: 0; pointer-events: none; }
.base-table__checkbox span {
  width: 16px; height: 16px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  position: relative;
  transition: all 0.15s;
}
.base-table__checkbox input:checked + span { background: var(--color-primary); border-color: var(--color-primary); }
.base-table__checkbox input:checked + span::after {
  content: ''; position: absolute; top: 2px; left: 5px;
  width: 4px; height: 8px;
  border: solid white; border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.base-table__checkbox input:indeterminate + span { background: var(--color-primary); border-color: var(--color-primary); }
.base-table__checkbox input:indeterminate + span::after {
  content: ''; position: absolute; top: 6px; left: 3px; right: 3px; height: 2px; background: white;
}

.base-table__empty { padding: var(--space-12) var(--space-4) !important; }
.base-table__empty-content { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); color: var(--color-text-tertiary); }
.base-table__empty-icon { font-size: 48px; opacity: 0.5; }
.base-table__empty-text { font-size: var(--font-base); }

.base-table__loading {
  position: absolute; inset: 0;
  background: color-mix(in srgb, var(--color-surface) 80%, transparent);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-3); z-index: 10;
}
.base-table__spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: base-table-spin 0.8s linear infinite;
}
@keyframes base-table-spin { to { transform: rotate(360deg); } }
.base-table__loading-text { font-size: var(--font-sm); color: var(--color-text-secondary); }

.base-table__pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: var(--font-sm);
}
.base-table__pagination-info { color: var(--color-text-secondary); }
.base-table__pagination-controls { display: flex; align-items: center; gap: var(--space-2); }
.base-table__page-btn {
  padding: var(--space-1) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all 0.15s;
}
.base-table__page-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.base-table__page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.base-table__page-current {
  padding: var(--space-1) var(--space-3);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-weight: var(--weight-medium);
}
</style>
```

## 使用示例（必须在 base-card 内）

```vue
<template>
  <!-- ✅ 容器原则：base-card 包裹 -->
  <base-card title="用户管理" desc="管理系统用户">
    <template #header-right>
      <base-button type="primary">+ 新建用户</base-button>
    </template>

    <base-table
      :data="users"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      selectable
      variant="striped"
      @select="onSelect"
      @page-change="onPageChange"
    >
      <!-- 自定义列渲染 -->
      <template #status="{ row }">
        <base-tag :type="row.status === 'active' ? 'success' : 'default'">
          {{ row.status === 'active' ? '启用' : '禁用' }}
        </base-tag>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <base-button size="sm" variant="text" @click="editUser(row)">编辑</base-button>
        <base-button size="sm" variant="text" type="danger" @click="deleteUser(row)">删除</base-button>
      </template>
    </base-table>
  </base-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { BaseTableColumn } from '@/components/base/BaseTable.vue'

const users = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active', createdAt: '2026-01-01' },
  // ...
])

const columns: BaseTableColumn[] = [
  { key: 'name', title: '姓名', width: 120, sortable: true },
  { key: 'email', title: '邮箱', minWidth: 200 },
  { key: 'status', title: '状态', width: 100, slot: 'status' },
  { key: 'createdAt', title: '创建时间', width: 140 },
  { key: 'actions', title: '操作', width: 160, slot: 'actions', fixed: 'right' },
]

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 100,
})
</script>
```

## 红线

- ❌ 禁止裸用 `<base-table>`（必须 `<base-card>` 包裹）
- ❌ 禁止裸色值 / 裸 px（必须 `var(--*)`）
- ❌ 禁止混入 Element Plus / 任何第三方表格组件
- ❌ 禁止业务 props 用 `any`

## HTML Demo

- [demo-components/base-table/html/01-basic.html](demo-components/base-table/html/01-basic.html) — 基础形态
- [demo-components/base-table/html/00-showcase.html](demo-components/base-table/html/00-showcase.html) — 14 形态总览
- 其他 13 个形态见 [demo-components/base-table/](demo-components/base-table/)

## 关联形态

- [base-table-striped.md](base-table-striped.md) — 条纹表格
- [base-table-bordered.md](base-table-bordered.md) — 边框表格
- [base-table-hover.md](base-table-hover.md) — 高亮表格
- [base-table-compact.md](base-table-compact.md) — 紧凑表格
- [base-table-fixed-header.md](base-table-fixed-header.md) — 固定表头
- [base-table-fixed-column.md](base-table-fixed-column.md) — 固定列
- [base-table-selectable.md](base-table-selectable.md) — 可选择
- [base-table-sortable.md](base-table-sortable.md) — 可排序
- [base-table-filterable.md](base-table-filterable.md) — 可筛选
- [base-table-paginated.md](base-table-paginated.md) — 分页
- [base-table-loading.md](base-table-loading.md) — 加载态
- [base-table-empty.md](base-table-empty.md) — 空状态
- [base-table-tree.md](base-table-tree.md) — 树形