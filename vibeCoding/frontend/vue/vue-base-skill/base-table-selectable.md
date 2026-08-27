# base-table / selectable — 可选择

> 形态 8：通过 `selectable` 开启单选/多选。
> 支持行点击、checkbox 列、全选联动。
> **必须嵌入 base-card** 使用。

## 何时使用

- 批量操作（删除、导出、修改）
- 对比查看多条记录
- 提交时携带多条 ID

## Props 差异

```typescript
{
  selectable: true | 'single' | 'multiple',  // ← 默认 false
  selectedRowKeys: string[],                  // 受控选中 key 数组
  data, columns
}
```

## Events

```typescript
{
  on: {
    selectChange: (keys: string[], rows: T[]) => void,
    selectAll:     (selected: boolean, rows: T[]) => void,
    rowClick:      (row: T, index: number) => void
  }
}
```

## 代码

核心逻辑：

```typescript
function toggleRow(row: T) {
  const key = row[rowKey]
  const set = new Set(selectedRowKeys.value)
  set.has(key) ? set.delete(key) : set.add(key)
  emit('selectChange', [...set], data.value.filter(r => set.has(r[rowKey])))
}

function toggleAll() {
  const allKeys = data.value.map(r => r[rowKey])
  const allSelected = selectedRowKeys.value.length === allKeys.length
  const next = allSelected ? [] : allKeys
  emit('selectChange', next, allSelected ? [] : data.value)
}
```

模板关键片段：

```vue
<thead>
  <tr>
    <th v-if="selectable === 'multiple'" class="base-table__cell--checkbox">
      <input type="checkbox" :checked="isAllSelected"
        @change="toggleAll" />
    </th>
    <th v-for="col in columns">{{ col.title }}</th>
  </tr>
</thead>
<tbody>
  <tr v-for="(row, i) in data" :class="{ 'is-selected': isSelected(row) }">
    <td v-if="selectable === 'multiple'">
      <input type="checkbox" :checked="isSelected(row)"
        @change="toggleRow(row)" />
    </td>
    <td v-for="col in columns">{{ row[col.key] }}</td>
  </tr>
</tbody>
```

## 使用示例

```vue
<base-card title="商品管理">
  <template #header-right>
    <base-button type="primary" :disabled="selected.length === 0">
      批量上架 ({{ selected.length }})
    </base-button>
  </template>
  <base-table
    :data="products"
    :columns="columns"
    selectable="multiple"
    v-model:selectedRowKeys="selected"
  />
</base-card>
```

## HTML Demo

- [demo-components/base-table/html/08-selectable.html](demo-components/base-table/html/08-selectable.html)