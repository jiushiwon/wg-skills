# base-table / fixed-column — 固定列

> 形态 7：通过 `sticky` 实现首/尾列固定。
> 列数多（> 8 列）时滚动时关键列保持可见。
> **必须嵌入 base-card** 使用。

## 何时使用

- 列数多（> 8 列）水平滚动
- 操作列（最右侧）需始终可见
- 主键列（如名称）需始终可见

## Props 差异

```typescript
{
  fixedColumn: 'left' | 'right' | 'both' | false  // ← 默认 false
  data, columns
}
```

## 代码

CSS 部分（基于 `bordered` 变体效果最佳）：

```css
.base-table__cell--sticky-left {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--color-bg);
  box-shadow: 1px 0 0 var(--color-border);
}
.base-table__cell--sticky-right {
  position: sticky;
  right: 0;
  z-index: 2;
  background: var(--color-bg);
  box-shadow: -1px 0 0 var(--color-border);
}
.base-table__head .base-table__cell--sticky-left,
.base-table__head .base-table__cell--sticky-right {
  z-index: 3;
}
```

通过 `column.fixed` 标记某列固定：

```typescript
const columns = [
  { key: 'id', title: 'ID', fixed: 'left' },
  { key: 'name', title: '姓名' },
  // ...更多列
  { key: 'action', title: '操作', fixed: 'right' }
]
```

## 使用示例

```vue
<base-card title="员工列表" padding="none">
  <div style="overflow-x: auto; max-width: 100%;">
    <base-table
      :data="employees"
      :columns="columns"
      variant="bordered"
    />
  </div>
</base-card>
```

## HTML Demo

- [demo-components/base-table/html/07-fixed-column.html](demo-components/base-table/html/07-fixed-column.html)