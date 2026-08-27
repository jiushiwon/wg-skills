---
name: vue-table-skill
description: Vue 通用表格技能。Vue3 + TypeScript 泛型组件，内置 14 种形态（基础/条纹/边框/高亮/紧凑/固定表头/固定列/选择/排序/筛选/分页/加载/空态/树形）。零第三方组件库。
trigger: |
  帮我做一个表格 | 做一个数据表格 | 做一个带分页的表格
  做一个可排序表格 | 做一个可筛选表格 | 做一个可选择表格
  做一个树形表格 | 做一个固定表头表格 | 做一个固定列表格
  做一个条纹表格 | 做一个边框表格 | 做一个高亮表格 | 做一个紧凑表格
  做一个带加载的表格 | 做一个空状态表格
---

# vue-table-skill

> Vue 通用表格技能。Vue3 + TypeScript 泛型，内置 14 种形态，覆盖 95% 业务场景。零第三方组件库。

## 核心组件

| 组件 | 说明 |
|------|------|
| **base-table** | 通用表格（14 形态） |

## 14 种形态

| # | 能力 | 适用场景 |
|---|------|----------|
| 01 | basic（默认） | 最简数据展示 |
| 02 | striped | 数据展示、报表 |
| 03 | bordered | 库存、参数对比 |
| 04 | hover | 可点击列表 |
| 05 | compact | 日志、监控 |
| 06 | fixed-header | 长列表 |
| 07 | fixed-column | 多列横滚 |
| 08 | selectable | 批量操作 |
| 09 | sortable | 升降序 |
| 10 | filterable | 列筛选 |
| 11 | paginated | 分页 |
| 12 | loading | 加载态 |
| 13 | empty | 空状态 |
| 14 | tree | 树形结构 |

## 文件结构

```
vue-table-skill/
├── SKILL.md
├── README.md
├── base-table.md                         # 主规格
├── base-table-striped.md
├── base-table-bordered.md
├── base-table-hover.md
├── base-table-compact.md
├── base-table-fixed-header.md
├── base-table-fixed-column.md
├── base-table-selectable.md
├── base-table-sortable.md
├── base-table-filterable.md
├── base-table-paginated.md
├── base-table-loading.md
├── base-table-empty.md
└── demo-components/
    ├── shared/                            # 共享 demo CSS
    │   ├── tokens.css
    │   └── demo.css
    └── base-table/
        ├── README.md
        └── html/
            ├── 00-showcase.html           # 总览
            ├── 01-basic.html
            ├── ... (14 个 demo)
            └── 14-tree.html
```

## 核心 API

```typescript
interface BaseTableProps<T extends Record<string, any>> {
  data: T[]
  columns: ColumnDef<T>[]
  rowKey?: string
  variant?: 'basic' | 'striped' | 'bordered' | 'hover' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  selectable?: boolean | 'single' | 'multiple'
  selectedRowKeys?: string[]
  sortable?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc' | ''
  filterable?: boolean
  paginated?: boolean
  pagination?: { current, pageSize, total, pageSizes? }
  loading?: boolean
  emptyText?: string
  treeData?: boolean
}
```

## 容器原则

> **所有表格必须嵌入 `<base-card>`。无例外。**

```vue
<!-- ✅ 正确 -->
<base-card title="商品管理">
  <base-table :data="products" :columns="columns" />
</base-card>

<!-- ❌ 错误：游离的 base-table -->
<base-table :data="products" :columns="columns" />
```

## 设计 Token

```css
.base-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-base);
}
.base-table__head th {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: var(--space-3) var(--space-4);
}
.base-table__body td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-divider);
}
```

**禁止硬编码任何颜色 / 间距 / 字号值。**

## 第三方组件库

❌ 禁止 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue。

## 跨技能协同

- **base-card**（[vue-card-skill](../vue-card-skill/)）：所有表格的容器
- **base-tag**（[vue-tag-skill](../vue-tag-skill/)）：单元格内常用于状态展示
- **base-button**（[vue-button-skill](../vue-button-skill/)）：header-right 操作区
- **vue-theme-skill**（[../../vue-theme-skill/](../../vue-theme-skill/)）：所有 Token 来源