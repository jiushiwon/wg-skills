# base-table / empty — 空状态

> 形态 13：通过 `empty` slot 或 prop 自定义空态。
> 显示插画 + 提示文案 + 可选操作。
> **必须嵌入 base-card** 使用。

## 何时使用

- 无数据
- 筛选结果为空
- 新建账号无内容

## Props 差异

```typescript
{
  data: T[],                            // 空数组时触发
  emptyText: string,                    // 默认 "暂无数据"
  emptyIcon: string,                    // 可选图标
  columns
}
```

## Slots

```typescript
{
  empty: () => any  // 完全自定义空态
}
```

## 代码

```vue
<div v-if="data.length === 0 && !loading" class="base-table__empty">
  <slot name="empty">
    <div class="base-table__empty-icon">{{ emptyIcon || '📭' }}</div>
    <div class="base-table__empty-text">{{ emptyText }}</div>
  </slot>
</div>
```

CSS：

```css
.base-table__empty {
  padding: var(--space-16) var(--space-4);
  text-align: center;
  color: var(--color-text-tertiary);
}
.base-table__empty-icon {
  font-size: var(--font-4xl);
  margin-bottom: var(--space-3);
  opacity: 0.5;
}
.base-table__empty-text {
  font-size: var(--font-base);
}
```

## 使用示例

基础用法：

```vue
<base-card title="商品列表">
  <base-table :data="[]" :columns="columns" empty-text="还没有商品，去添加一个吧" />
</base-card>
```

完全自定义：

```vue
<base-card title="订单管理">
  <base-table :data="orders" :columns="columns">
    <template #empty>
      <div class="my-empty">
        <img src="/empty.svg" />
        <p>暂无订单</p>
        <base-button type="primary" @click="goCreate">立即下单</base-button>
      </div>
    </template>
  </base-table>
</base-card>
```

## HTML Demo

- [demo-components/base-table/html/13-empty.html](demo-components/base-table/html/13-empty.html)