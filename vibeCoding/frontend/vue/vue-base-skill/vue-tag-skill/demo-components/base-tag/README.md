# base-tag — 标签

> 状态标记、分类标签、计数指示器。
> 详细规格见根目录 [base-tag.md](../../base-tag.md)。

## Props 矩阵

| 维度 | 可选值 |
|------|--------|
| `type` | default / primary / success / warning / danger / info |
| `variant` | light（默认）/ outline / solid |
| `closable` | boolean（显示关闭 ×） |
| `size` | sm / md |

## Demos

- [html/01-types.html](html/01-types.html) — 6 type × 3 variant 全矩阵
- [html/02-usecases.html](html/02-usecases.html) — 业务场景（订单状态 / 分类 / 计数）

## 使用示例

```vue
<base-card title="商品详情">
  <div class="demo-row">
    <base-tag type="danger" variant="solid">NEW</base-tag>
    <base-tag>限时折扣</base-tag>
    <base-tag type="success">现货</base-tag>
  </div>
</base-card>
```