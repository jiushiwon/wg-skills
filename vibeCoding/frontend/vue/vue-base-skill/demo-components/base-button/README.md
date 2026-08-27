# base-button — 基础按钮

> 通用按钮组件，6 种 type × 5 种 variant × 3 种 size = 灵活组合。
> 详细规格见根目录 [base-button.md](../../base-button.md)。

## Props 矩阵

| 维度 | 可选值 |
|------|--------|
| `type` | default / primary / success / warning / danger / info |
| `variant` | solid（默认）/ outline / text |
| `size` | sm / md（默认）/ lg |
| `disabled` | boolean |
| `loading` | boolean |
| `block` | boolean（块级铺满） |

## Demos

- [html/01-types.html](html/01-types.html) — 5 种 type + 禁用态
- [html/02-variants.html](html/02-variants.html) — solid / outline / text
- [html/03-sizes.html](html/03-sizes.html) — sm / md / lg

## 使用示例

```vue
<base-card title="操作">
  <template #header-right>
    <base-button variant="text">取消</base-button>
    <base-button type="primary" @click="submit">保存</base-button>
  </template>

  <div class="demo-row">
    <base-button>默认</base-button>
    <base-button type="primary" variant="outline">主要描边</base-button>
    <base-button type="danger" :loading="saving">删除</base-button>
  </div>
</base-card>
```