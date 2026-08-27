# base-table / bordered — 边框表格

> 形态 3：通过 `variant="bordered"` 切换。
> 单元格带边框，整体更紧凑、规整。
> **必须嵌入 base-card** 使用。

## 何时使用

- 库存表格、价格表
- 配置项表、参数对比
- 数据密集型场景
- 需要清晰单元格分隔

## Props 差异

```typescript
{
  variant: 'bordered'  // ← 关键参数
  data, columns
}
```

## 代码

CSS 部分：

```css
.base-table--variant-bordered {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.base-table--variant-bordered .base-table__head th,
.base-table--variant-bordered .base-table__body td {
  border-right: 1px solid var(--color-border);
}
.base-table--variant-bordered .base-table__head th:last-child,
.base-table--variant-bordered .base-table__body td:last-child {
  border-right: none;
}
```

## 使用示例

```vue
<base-card title="商品库存表">
  <base-table
    :data="products"
    :columns="columns"
    variant="bordered"
  />
</base-card>
```

## HTML Demo

- [demo-components/base-table/html/03-bordered.html](demo-components/base-table/html/03-bordered.html)