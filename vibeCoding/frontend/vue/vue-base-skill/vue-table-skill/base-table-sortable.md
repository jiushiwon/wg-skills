# base-table / sortable — 可排序

> 形态 9：通过 `sortable` 开启列排序。
> 支持服务端排序 + 客户端排序。
> **必须嵌入 base-card** 使用。

## 何时使用

- 需要按某列升降序查看
- 数字、日期、状态字段排序
- 用户主动整理列表

## Props 差异

```typescript
{
  sortable: boolean,                 // ← 默认 false
  sortBy: string,                    // 当前排序列 key
  sortOrder: 'asc' | 'desc' | '',    // 当前排序方向
  data, columns
}
```

也可在 `columns` 中按列开启：

```typescript
{
  key: 'price',
  title: '价格',
  sortable: true  // 列级配置
}
```

## Events

```typescript
{
  on: {
    sortChange: (sortBy: string, order: 'asc' | 'desc' | '') => void
  }
}
```

## 代码

```typescript
function handleSort(col: Column) {
  if (!col.sortable) return
  let nextOrder: 'asc' | 'desc' | '' = 'asc'
  if (sortBy.value === col.key) {
    nextOrder = sortOrder.value === 'asc' ? 'desc'
              : sortOrder.value === 'desc' ? '' : 'asc'
  }
  sortBy.value = col.key
  sortOrder.value = nextOrder
  emit('sortChange', col.key, nextOrder)
}
```

排序图标（CSS + 伪元素）：

```css
.base-table__sort-icon {
  display: inline-block;
  margin-left: var(--space-2);
  opacity: 0.4;
  transition: opacity 0.2s;
}
.base-table__cell--sortable {
  cursor: pointer;
  user-select: none;
}
.base-table__cell--sortable:hover .base-table__sort-icon {
  opacity: 1;
}
.base-table__cell--sorted .base-table__sort-icon {
  opacity: 1;
  color: var(--color-primary);
}
```

## 使用示例

```vue
<base-card title="商品列表">
  <base-table
    :data="products"
    :columns="columns"
    sortable
    v-model:sortBy="sortKey"
    v-model:sortOrder="sortOrder"
    @sort-change="onSort"
  />
</base-card>

<script setup>
async function onSort(key: string, order: string) {
  // 服务端排序
  const { data } = await api.getProducts({ sortBy: key, order })
  products.value = data
}
</script>
```

## HTML Demo

- [demo-components/base-table/html/09-sortable.html](demo-components/base-table/html/09-sortable.html)