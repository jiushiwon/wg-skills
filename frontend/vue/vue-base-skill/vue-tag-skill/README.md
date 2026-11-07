# vue-tag-skill

> 状态标记、分类标签、计数指示器。6 type × 3 variant。

## 快速上手

```vue
<base-card title="商品详情">
  <div class="demo-row">
    <base-tag type="danger" variant="solid">NEW</base-tag>
    <base-tag>限时折扣</base-tag>
    <base-tag type="success">现货</base-tag>
  </div>
</base-card>

<base-card title="订单状态">
  <div class="demo-row">
    <base-tag type="warning">待付款</base-tag>
    <base-tag type="info">待发货</base-tag>
    <base-tag type="primary">配送中</base-tag>
    <base-tag type="success">已完成</base-tag>
    <base-tag type="danger">已取消</base-tag>
  </div>
</base-card>
```

## 规格文档

- [base-tag.md](base-tag.md) — 标签规格

## Demos

| Demo | 内容 |
|------|------|
| [html/01-types.html](demo-components/base-tag/html/01-types.html) | 6 type × 3 variant 全矩阵 |
| [html/02-usecases.html](demo-components/base-tag/html/02-usecases.html) | 业务场景（订单状态 / 分类 / 计数） |

## Token 对齐

| 属性 | Token |
|------|-------|
| 内边距 | `--space-1` `--space-2` |
| 字号 | `--font-xs`(12px) |
| 圆角 | `--radius-sm`(4px) |
| 主色 | `--color-primary-light` / `--color-primary-dark` |
| 成功 | `--color-success-light` / `--color-success-dark` |

## 容器原则

标签通常作为表格/列表的单元格内容，必须嵌入 `<base-card>`：

```vue
<base-card title="订单">
  <base-table :data="orders" :columns="columns" />
  <!-- columns 中可渲染 <base-tag type="warning">待付款</base-tag> -->
</base-card>
```

## 相关技能

- [vue-base-skill](../SKILL.md) — 父技能
- [vue-card-skill](../vue-card-skill/SKILL.md) — 容器
- [vue-table-skill](../vue-table-skill/SKILL.md) — 表格（标签常作为单元格内容）
- [vue-theme-skill](../../vue-theme-skill/SKILL.md) — 主题 Token