# vue-table-skill

> Vue3 + TypeScript 泛型表格。14 种形态，零第三方组件库。

## 快速上手

基础：

```vue
<base-card title="商品管理">
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

## 规格文档

| 文档 | 内容 |
|------|------|
| [base-table.md](base-table.md) | 主规格 + 完整 Props |
| [base-table-striped.md](base-table-striped.md) | 形态 2 |
| [base-table-bordered.md](base-table-bordered.md) | 形态 3 |
| [base-table-hover.md](base-table-hover.md) | 形态 4 |
| [base-table-compact.md](base-table-compact.md) | 形态 5 |
| [base-table-fixed-header.md](base-table-fixed-header.md) | 形态 6 |
| [base-table-fixed-column.md](base-table-fixed-column.md) | 形态 7 |
| [base-table-selectable.md](base-table-selectable.md) | 形态 8 |
| [base-table-sortable.md](base-table-sortable.md) | 形态 9 |
| [base-table-filterable.md](base-table-filterable.md) | 形态 10 |
| [base-table-paginated.md](base-table-paginated.md) | 形态 11 |
| [base-table-loading.md](base-table-loading.md) | 形态 12 |
| [base-table-empty.md](base-table-empty.md) | 形态 13 |
| [base-table-tree.md](base-table-tree.md) | 形态 14 |

## Demos

| Demo | 形态 |
|------|------|
| [html/00-showcase.html](demo-components/base-table/html/00-showcase.html) | 总览（5 形态一次看完） |
| [html/01-basic.html](demo-components/base-table/html/01-basic.html) | 基础 |
| [html/02-striped.html](demo-components/base-table/html/02-striped.html) | 条纹 |
| [html/03-bordered.html](demo-components/base-table/html/03-bordered.html) | 边框 |
| [html/04-hover.html](demo-components/base-table/html/04-hover.html) | 高亮 |
| [html/05-compact.html](demo-components/base-table/html/05-compact.html) | 紧凑 |
| [html/06-fixed-header.html](demo-components/base-table/html/06-fixed-header.html) | 固定表头 |
| [html/07-fixed-column.html](demo-components/base-table/html/07-fixed-column.html) | 固定列 |
| [html/08-selectable.html](demo-components/base-table/html/08-selectable.html) | 可选择 |
| [html/09-sortable.html](demo-components/base-table/html/09-sortable.html) | 可排序 |
| [html/10-filterable.html](demo-components/base-table/html/10-filterable.html) | 可筛选 |
| [html/11-paginated.html](demo-components/base-table/html/11-paginated.html) | 分页 |
| [html/12-loading.html](demo-components/base-table/html/12-loading.html) | 加载中 |
| [html/13-empty.html](demo-components/base-table/html/13-empty.html) | 空状态 |
| [html/14-tree.html](demo-components/base-table/html/14-tree.html) | 树形 |

## Token 对齐

| 属性 | Token |
|------|-------|
| 表头背景 | `--color-bg-secondary` |
| 表头文字 | `--color-text-secondary` |
| 单元格内边距 | `--space-3` `--space-4` |
| 单元格字号 | `--font-base` |
| 行下边框 | `--color-divider` |

## 容器原则（必读）

> **所有表格必须嵌入 `<base-card>`。无例外。**

```vue
<base-card title="商品列表">
  <base-table :data="products" :columns="columns" />
</base-card>
```

## 相关技能

- [vue-base-skill](../SKILL.md) — 父技能
- [vue-card-skill](../vue-card-skill/SKILL.md) — base-card 容器
- [vue-button-skill](../vue-button-skill/SKILL.md) — 表格头操作按钮
- [vue-tag-skill](../vue-tag-skill/SKILL.md) — 单元格内状态标签
- [vue-theme-skill](../../vue-theme-skill/SKILL.md) — 主题 Token