# base-table / filterable — 可筛选

> 形态 10：通过 `filterable` 开启列筛选。
> 支持输入筛选 + 下拉筛选。
> **必须嵌入 base-card** 使用。

## 何时使用

- 列内值较多需要快速定位
- 状态/类型/分类字段筛选
- 配合搜索使用

## Props 差异

```typescript
{
  filterable: boolean,     // ← 默认 false
  data, columns
}
```

列级配置：

```typescript
{
  key: 'status',
  title: '状态',
  filterable: true,
  filterOptions: [         // 下拉筛选项
    { label: '全部', value: '' },
    { label: '启用', value: 'active' },
    { label: '禁用', value: 'inactive' }
  ],
  filterType: 'input' | 'select' | 'date-range'  // 筛选 UI 类型
}
```

## Events

```typescript
{
  on: {
    filterChange: (filters: Record<string, any>) => void
  }
}
```

## 代码

筛选行（独立一行）：

```vue
<tr v-if="filterable" class="base-table__filter-row">
  <th v-if="selectable" />
  <th v-for="col in columns">
    <input v-if="col.filterType === 'input'"
      v-model="filters[col.key]"
      class="base-table__filter-input"
      :placeholder="`筛选 ${col.title}`"
      @input="emitFilter" />
    <select v-else-if="col.filterType === 'select'"
      v-model="filters[col.key]"
      @change="emitFilter">
      <option v-for="opt in col.filterOptions" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </th>
</tr>
```

## 使用示例

```vue
<base-card title="订单管理">
  <base-table
    :data="orders"
    :columns="columns"
    filterable
    @filter-change="onFilter"
  />
</base-card>

<script setup>
async function onFilter(filters: Record<string, any>) {
  const { data } = await api.getOrders(filters)
  orders.value = data
}
</script>
```

## HTML Demo

- [demo-components/base-table/html/10-filterable.html](demo-components/base-table/html/10-filterable.html)