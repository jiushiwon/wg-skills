# vue-base-skill

> Vue 基础组件父技能。严格镜像 [uniapp-base-skill](../../uniapp/uniapp-base-skill/) 结构。

## 容器原则（核心）

> **所有组件必须由 base-card 包裹。无例外。**

## 4 个子技能

| 子技能 | 内容 | 状态 |
|--------|------|------|
| [vue-card-skill](vue-card-skill/SKILL.md) | base-card 容器 + 12 种卡片布局 | ✅ |
| [vue-button-skill](vue-button-skill/SKILL.md) | 6 type × 3 variant × 3 size 按钮 | ✅ |
| [vue-tag-skill](vue-tag-skill/SKILL.md) | 6 type × 3 variant 标签 | ✅ |
| [vue-table-skill](vue-table-skill/SKILL.md) | 14 种形态的通用表格 | ✅ |

## 设计 Token

所有组件统一引用 [vue-theme-skill](../vue-theme-skill/)：
- `--color-*` / `--space-*` / `--font-*` / `--height-*` / `--radius-*`
- 命名严格对齐 uniapp-theme-skill

**禁止**：硬编码任何颜色、间距、字号、行高、圆角值。

## 第三方组件库

❌ 禁止使用 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue 等。

## 快速上手

```vue
<template>
  <!-- 1. 引入 vue-theme-skill 的 tokens.css -->
  <!-- 2. 引入 vue-base-skill 的子组件 -->
  <vue-card-skill>
    <base-card title="商品管理">
      <template #header-right>
        <base-button type="primary">+ 新建</base-button>
      </template>

      <base-table
        :data="products"
        :columns="columns"
        variant="bordered"
        selectable="multiple"
      />
    </base-card>
  </vue-card-skill>
</template>
```

> ⚠️ 实际项目通过 npm / 自动导入加载子组件；以上仅为伪代码示意。

## 目录

```
vue-base-skill/
├── SKILL.md
├── README.md
├── references/
│   └── skill-matrix.md
├── vue-card-skill/
├── vue-button-skill/
├── vue-tag-skill/
└── vue-table-skill/
```

## 相关技能

- [vue-theme-skill](../vue-theme-skill/SKILL.md) — 主题与设计 Token
- [uniapp-base-skill](../../uniapp/uniapp-base-skill/SKILL.md) — 同构参考（uni-app 版）