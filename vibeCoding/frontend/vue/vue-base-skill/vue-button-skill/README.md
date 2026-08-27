# vue-button-skill

> 通用按钮组件，6 type × 3 variant × 3 size 灵活组合。零第三方组件库。

## 快速上手

```vue
<base-card title="操作">
  <template #header-right>
    <base-button>取消</base-button>
    <base-button type="primary" @click="submit">保存</base-button>
  </template>

  <div class="demo-row">
    <base-button>默认</base-button>
    <base-button type="primary" variant="outline">描边</base-button>
    <base-button type="danger" :loading="saving">删除</base-button>
  </div>
</base-card>
```

## 规格文档

- [base-button.md](base-button.md) — 按钮规格

## Demos

| Demo | 内容 |
|------|------|
| [html/01-types.html](demo-components/base-button/html/01-types.html) | 5 种 type + 禁用态 |
| [html/02-variants.html](demo-components/base-button/html/02-variants.html) | solid / outline / text |
| [html/03-sizes.html](demo-components/base-button/html/03-sizes.html) | sm / md / lg |

## Token 对齐

| 属性 | Token |
|------|-------|
| 行高 | `--height-button-md`(36px) |
| 内边距 | `--space-4` |
| 圆角 | `--radius-md` |
| 主色 | `--color-primary` |
| 危险 | `--color-danger` |

## 容器原则

按钮组必须嵌入 `<base-card>`：

```vue
<base-card title="表单">
  <template #footer>
    <base-button>取消</base-button>
    <base-button type="primary">提交</base-button>
  </template>
</base-card>
```

## 相关技能

- [vue-base-skill](../SKILL.md) — 父技能
- [vue-card-skill](../vue-card-skill/SKILL.md) — base-card 容器
- [vue-theme-skill](../../vue-theme-skill/SKILL.md) — 主题 Token