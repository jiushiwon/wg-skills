# base-card — 根容器

> 所有组件的根容器。vue-base-skill 的"容器原则"：任何业务组件、表单、表格都必须放在 `<base-card>` 内。
> 详细规格见根目录 [base-card.md](../../base-card.md)。

## 核心要点

| API | 说明 |
|-----|------|
| `title` | 卡片标题（可选） |
| `padding` | `default` / `sm` / `none` |
| `#header-right` slot | 头部右侧（操作按钮） |
| `#footer` slot | 底部（确认/取消） |
| 默认 slot | 卡片主体 |

## Demos

- [html/01-basic.html](html/01-basic.html) — 基础用法
- [html/02-header-footer.html](html/02-header-footer.html) — 头部操作 + 底部操作
- [html/03-padding.html](html/03-padding.html) — 三种内边距

## 使用示例

```vue
<base-card title="商品管理">
  <template #header-right>
    <base-button type="primary">+ 新建商品</base-button>
  </template>

  <base-table :data="products" :columns="columns" />

  <template #footer>
    <base-button>取消</base-button>
    <base-button type="primary">保存</base-button>
  </template>
</base-card>
```