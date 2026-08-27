# base-table / tree — 树形表格

> 形态 14：通过 `treeData` 字段开启树形结构。
> 支持展开/折叠 + 缩进层级。
> **必须嵌入 base-card** 使用。

## 何时使用

- 组织架构、菜单权限
- 文件目录、分类层级
- 评论回复树

## Props 差异

```typescript
{
  treeData: boolean,           // ← 默认 false
  childrenKey: string,         // 默认 'children'
  defaultExpandAll: boolean,   // 默认 false
  indentSize: number,          // 默认 16px
  data, columns
}
```

## 数据结构

```typescript
interface TreeRow extends Record<string, any> {
  id: string
  children?: TreeRow[]
}
```

## Events

```typescript
{
  on: {
    expand: (expanded: boolean, row: T) => void
  }
}
```

## 代码

```typescript
function flattenTree(rows: TreeRow[], level = 0, expanded = new Set<string>()): Array<TreeRow & { __level: number }> {
  const result: any[] = []
  for (const row of rows) {
    result.push({ ...row, __level: level })
    if (row[childrenKey] && expanded.has(row.id)) {
      result.push(...flattenTree(row[childrenKey], level + 1, expanded))
    }
  }
  return result
}

function toggle(row: TreeRow) {
  expanded.has(row.id) ? expanded.delete(row.id) : expanded.add(row.id)
  emit('expand', expanded.has(row.id), row)
}
```

模板（缩进通过 padding-left 实现）：

```vue
<tr v-for="row in flatRows" :key="row.id">
  <td v-for="col in columns"
    :style="col.key === columns[0].key ? {
      paddingLeft: `calc(var(--space-3) + ${row.__level * indentSize}px)`
    } : {}">
    <span v-if="col.key === columns[0].key && row[childrenKey]?.length"
      class="base-table__tree-toggle"
      @click="toggle(row)">
      {{ expanded.has(row.id) ? '▼' : '▶' }}
    </span>
    {{ row[col.key] }}
  </td>
</tr>
```

## 使用示例

```vue
<base-card title="组织架构">
  <base-table
    :data="orgTree"
    :columns="columns"
    tree-data
    default-expand-all
    @expand="onExpand"
  />
</base-card>
```

## HTML Demo

- [demo-components/base-table/html/14-tree.html](demo-components/base-table/html/14-tree.html)