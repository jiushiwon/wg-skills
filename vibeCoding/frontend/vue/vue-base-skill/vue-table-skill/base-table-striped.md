# base-table / striped — 条纹表格

> 形态 2：通过 `variant="striped"` 切换。
> 偶数行加背景色，便于扫读对比。
> **必须嵌入 base-card** 使用。

## 何时使用

- 数据展示、报表
- 需要对比多行数据
- 列表条目较多（> 5 行）

## 与基础形态的区别

| 维度 | basic | striped |
|------|-------|---------|
| 偶数行背景 | 无 | `var(--color-bg)` |
| 行 hover | 无 | 可叠加 hover 效果 |
| 视觉密度 | 简洁 | 略高 |

## Props 差异

基础形态所有 props 适用，本形态无额外 props：

```typescript
{
  variant: 'striped'  // ← 关键参数
  data, columns       // 必需
}
```

## 代码

完整代码见 [base-table.md](base-table.md)。本形态通过 `variant="striped"` 切换，CSS 部分：

```css
/* striped 形态 */
.base-table--variant-striped .base-table__body tr:nth-child(even) td {
  background: var(--color-bg);
}
```

## 使用示例

```vue
<template>
  <!-- ✅ 必须 base-card 包裹 -->
  <base-card title="订单列表">
    <base-table
      :data="orders"
      :columns="columns"
      variant="striped"
    />
  </base-card>
</template>
```

## HTML Demo

- [demo-components/base-table/html/02-striped.html](demo-components/base-table/html/02-striped.html) — 完整 HTML 演示