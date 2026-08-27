# base-table / fixed-header — 固定表头

> 形态 6：通过 `max-height` 容器 + `sticky` 表头实现。
> 滚动时表头始终在顶部。
> **必须嵌入 base-card** 使用。

## 何时使用

- 长列表（> 20 行）
- 大数据量页面
- 用户需要频繁查看列名

## 实现方式

base-table **本身不限制容器高度**，由父级 base-card 控制：

```css
.base-table-wrapper {
  max-height: 380px;   /* ← 由父级或外层容器设置 */
  overflow-y: auto;
}
.base-table__head th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-bg-secondary);
}
```

## 使用示例

```vue
<base-card title="商品列表（50+ 行）" padding="none">
  <div style="max-height: 400px; overflow-y: auto;">
    <base-table
      :data="products"
      :columns="columns"
    />
  </div>
</base-card>
```

或者通过 base-card 的 prop 控制：

```vue
<base-card title="商品列表" :padding="'none'">
  <base-table :data="products" :columns="columns" fixed-header />
</base-card>
```

> 注：实际使用可通过 `<div class="table-scroll-area">` 包裹 base-table 实现滚动。

## HTML Demo

- [demo-components/base-table/html/06-fixed-header.html](demo-components/base-table/html/06-fixed-header.html)