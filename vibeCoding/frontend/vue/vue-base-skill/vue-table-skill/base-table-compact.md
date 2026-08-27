# base-table / compact — 紧凑表格

> 形态 5：通过 `variant="compact"` 切换。
> 行高更小、字号更小，一屏显示更多数据。
> **必须嵌入 base-card** 使用。

## 何时使用

- 日志列表
- 监控数据
- 密集型信息展示

## Props 差异

```typescript
{
  variant: 'compact'  // ← 关键参数
  data, columns
}
```

通常配合 `size="sm"`：

```typescript
{
  size: 'sm',  // 40px 行高
  variant: 'compact',
}
```

## 代码

CSS 部分：

```css
.base-table--variant-compact .base-table__body td {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-sm);
}
```

## 使用示例

```vue
<base-card title="系统日志">
  <base-table
    :data="logs"
    :columns="columns"
    variant="compact"
    size="sm"
  />
</base-card>
```

## HTML Demo

- [demo-components/base-table/html/05-compact.html](demo-components/base-table/html/05-compact.html)