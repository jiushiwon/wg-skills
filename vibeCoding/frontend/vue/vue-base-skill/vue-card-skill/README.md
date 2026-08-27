# vue-card-skill

> 基于「一切皆容器」思想的 Vue 卡片组件技能。核心：`base-card` 是所有组件的根容器。

## 快速上手

```vue
<template>
  <base-card title="商品管理">
    <template #header-right>
      <base-button type="primary">+ 新建商品</base-button>
    </template>

    <p>卡片内容区</p>

    <template #footer>
      <base-button>取消</base-button>
      <base-button type="primary">保存</base-button>
    </template>
  </base-card>
</template>
```

## 规格文档

- [base-card.md](base-card.md) — 根容器规格

## Demos

| Demo | 内容 |
|------|------|
| [html/01-basic.html](demo-components/base-card-layout/html/01-basic.html) | 基础卡片（带/不带标题） |
| [html/02-header-footer.html](demo-components/base-card-layout/html/02-header-footer.html) | 头部 + 底部操作区 |
| [html/03-padding.html](demo-components/base-card-layout/html/03-padding.html) | 三种内边距变体 |

## 容器原则（必读）

> 所有组件必须嵌入 `<base-card>`，无例外。

```vue
<!-- ✅ 正确 -->
<base-card title="用户列表">
  <base-table :data="users" :columns="columns" />
</base-card>

<!-- ❌ 错误 -->
<base-table :data="users" :columns="columns" />
```

## Token 对齐

颜色 / 间距 / 圆角 / 阴影全部来自 [vue-theme-skill](../../vue-theme-skill/)：

| 属性 | Token |
|------|-------|
| 背景 | `--color-surface` |
| 圆角 | `--radius-lg` |
| 内边距 | `--space-5` |
| 阴影 | 由 box-shadow 自定义（不在 token 中） |

## 相关技能

- [vue-base-skill](../SKILL.md) — 父技能
- [vue-button-skill](../vue-button-skill/SKILL.md) — 按钮
- [vue-tag-skill](../vue-tag-skill/SKILL.md) — 标签
- [vue-table-skill](../vue-table-skill/SKILL.md) — 表格
- [vue-theme-skill](../../vue-theme-skill/SKILL.md) — 主题 Token