# base-table / paginated — 分页

> 形态 11：通过 `paginated` + `pagination` 配置开启分页。
> 客户端分页（本地数据）+ 服务端分页（远端 total）。
> **必须嵌入 base-card** 使用。

## 何时使用

- 数据量 > 单页容量
- 需要明确的「第 X 页 / 共 Y 页」
- 后端返回 total，前端只发 page/size

## Props 差异

```typescript
{
  paginated: boolean,    // ← 默认 false
  pagination: {
    current: number,     // 当前页（v-model）
    pageSize: number,     // 每页条数（v-model）
    total: number,       // 总条数
    pageSizes: number[], // 可选 [10, 20, 50, 100]
    showSizeChanger: boolean,
    showTotal: boolean
  },
  data, columns          // 客户端模式传全部数据
}
```

## Events

```typescript
{
  on: {
    pageChange:    (current: number, pageSize: number) => void,
    sizeChange:    (current: number, pageSize: number) => void
  }
}
```

## 代码

客户端分页（对 `data` 切片）：

```typescript
const paginatedData = computed(() => {
  if (serverPagination.value) return data.value
  const start = (current.value - 1) * pageSize.value
  return data.value.slice(start, start + pageSize.value)
})
```

分页器（嵌入 base-card 的 footer 区域）：

```vue
<template v-if="paginated">
  <div class="base-table__pagination">
    <span class="base-table__pagination-total">
      共 {{ total }} 条
    </span>
    <button :disabled="current === 1" @click="goPage(1)">«</button>
    <button :disabled="current === 1" @click="goPage(current - 1)">‹</button>
    <span>{{ current }} / {{ totalPages }}</span>
    <button :disabled="current === totalPages" @click="goPage(current + 1)">›</button>
    <button :disabled="current === totalPages" @click="goPage(totalPages)">»</button>
    <select v-model="pageSize" @change="onSizeChange">
      <option v-for="s in pageSizes" :value="s">{{ s }} / 页</option>
    </select>
  </div>
</template>
```

## 使用示例

```vue
<base-card title="商品列表">
  <base-table
    :data="products"
    :columns="columns"
    paginated
    :pagination="{ current: 1, pageSize: 10, total: products.length }"
  />
</base-card>
```

服务端分页：

```vue
<base-card title="订单管理">
  <base-table
    :data="orders"
    :columns="columns"
    paginated
    :pagination="{
      current: query.page,
      pageSize: query.size,
      total: total
    }"
    @page-change="onPageChange"
  />
</base-card>
```

## HTML Demo

- [demo-components/base-table/html/11-paginated.html](demo-components/base-table/html/11-paginated.html)