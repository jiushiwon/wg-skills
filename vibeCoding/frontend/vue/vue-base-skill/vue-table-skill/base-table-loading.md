# base-table / loading — 加载中

> 形态 12：通过 `loading` 开启加载态。
> 显示骨架屏 / spinner + 覆盖层。
> **必须嵌入 base-card** 使用。

## 何时使用

- 数据请求中
- 切换分页/筛选时
- 避免空白闪烁

## Props 差异

```typescript
{
  loading: boolean,    // ← 默认 false
  loadingText: string, // 可选，默认 "加载中..."
  data, columns
}
```

## 代码

覆盖层 + 骨架行（CSS）：

```css
.base-table--loading .base-table__body {
  position: relative;
  pointer-events: none;
}
.base-table--loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  z-index: 4;
}
.base-table__skeleton {
  height: 16px;
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 0%,
    var(--color-bg-tertiary) 50%,
    var(--color-bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: base-table-skeleton 1.5s infinite;
  border-radius: var(--radius-sm);
}
@keyframes base-table-skeleton {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

模板：

```vue
<div v-if="loading" class="base-table__loading">
  <div v-for="i in skeletonRows" class="base-table__skeleton-row">
    <div v-for="col in columns" class="base-table__skeleton" />
  </div>
</div>
```

## 使用示例

```vue
<base-card title="商品列表">
  <base-table
    :data="products"
    :columns="columns"
    :loading="pending"
    loading-text="加载商品中..."
  />
</base-card>

<script setup>
const { data: products, pending } = await useFetch('/api/products')
</script>
```

## HTML Demo

- [demo-components/base-table/html/12-loading.html](demo-components/base-table/html/12-loading.html)