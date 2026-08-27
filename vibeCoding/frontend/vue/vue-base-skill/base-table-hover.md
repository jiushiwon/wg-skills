# base-table / hover — 高亮表格

> 形态 4：通过 `variant="hover"` 切换。
> 鼠标悬停行高亮，便于交互。
> **必须嵌入 base-card** 使用。

## 何时使用

- 可点击列表（跳转详情）
- 可操作的数据行
- 需要视觉反馈

## Props 差异

```typescript
{
  variant: 'hover'  // ← 关键参数
  data, columns
}
```

通常配合 `@row-click` 事件：

```typescript
{
  on: {
    rowClick: (row, index) => router.push(`/detail/${row.id}`)
  }
}
```

## 代码

CSS 部分：

```css
.base-table--variant-hover .base-table__body tr:hover td {
  background: var(--color-surface-hover);
}
```

## 使用示例

```vue
<base-card title="任务列表">
  <base-table
    :data="tasks"
    :columns="columns"
    variant="hover"
    @row-click="goTaskDetail"
  />
</base-card>

<script setup>
function goTaskDetail(row: any) {
  router.push(`/task/${row.id}`)
}
</script>
```

## HTML Demo

- [demo-components/base-table/html/04-hover.html](demo-components/base-table/html/04-hover.html)