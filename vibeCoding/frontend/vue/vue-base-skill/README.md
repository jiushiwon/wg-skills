# vue-base-skill

> Vue 基础组件父技能。严格镜像 [uniapp-base-skill](../../uniapp/uniapp-base-skill/) 结构。

## 容器原则（核心铁律）

> **所有组件必须由 base-card 包裹。无例外。**

## 🚫 零 HTML5 标签原则（.md 文档约束）

> **所有 `.md` 文档中的实现代码严禁使用 HTML5 原生标签**（`<button>` `<table>` `<input>` `<select>` `<textarea>` `<checkbox>` `<radio>` `<form>` `<tr>` `<td>` `<th>` `<option>` 等）。
>
> **必须**：
> - 按钮 → `<base-button>` 组件
> - 标签/徽章 → `<base-status>` 组件
> - 复选框/单选框 → `<div role="checkbox|radio">` + CSS3
> - 输入框 → `<div contenteditable>` + CSS3
> - 下拉选择 → `<div>` + 自定义面板 + CSS3
> - 表格 → `<div>` + flex/grid
>
> **唯一例外**：`demo-components/**/*.html` Demo 文件允许使用 HTML5 标签（用于用户查看运行效果）。
>
> 完整规范见 [SKILL.md](./SKILL.md) → 「🚫 零 HTML5 标签铁律」。

## 6 个子技能（+1 扩展）

| 子技能 | 内容 | 状态 |
|--------|------|------|
| [vue-card-skill](vue-card-skill/SKILL.md) | base-card 容器 + 12 种卡片布局 | ✅ |
| [vue-button-skill](vue-button-skill/SKILL.md) | 6 type × 5 variant × 3 size 按钮 | ✅ |
| [vue-tag-skill](vue-tag-skill/SKILL.md) | 6 type × 3 variant 标签 | ✅ |
| [vue-status-skill](vue-status-skill/SKILL.md) | 7 type × 5 variant × 3 size 状态/徽章 | ✅ 新增 |
| [vue-table-skill](vue-table-skill/SKILL.md) | 23 种形态的通用表格 + 加载 + 分页 | ✅ |
| [vue-form-skill](vue-form-skill/SKILL.md) | base-form 表单体系（8 组件）+ 校验引擎 | ✅ 新增 |

## 设计 Token

所有组件统一引用 [vue-theme-skill](../vue-theme-skill/)：
- `--color-*` / `--space-*` / `--font-*` / `--height-*` / `--radius-*` / `--weight-*` / `--leading-*`
- 命名严格对齐 uniapp-theme-skill

**禁止**：硬编码任何颜色、间距、字号、行高、圆角值。

## 第三方组件库

❌ 禁止使用 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue 等。

## 快速上手

```vue
<template>
  <base-card title="商品管理">
    <template #header-right>
      <base-button type="primary" variant="solid">+ 新建</base-button>
    </template>

    <base-table
      :data="products"
      :columns="columns"
      variant="bordered"
      selectable
    />
  </base-card>
</template>
```

## 目录

```
vue-base-skill/
├── SKILL.md                # 父技能入口（含零 HTML5 标签铁律）
├── README.md
├── references/
│   └── skill-matrix.md
├── vue-card-skill/
├── vue-button-skill/
├── vue-tag-skill/
├── vue-status-skill/       # 状态/徽章
└── vue-table-skill/        # 表格/分页/加载
```

## 相关技能

- [vue-theme-skill](../vue-theme-skill/SKILL.md) — 主题与设计 Token
- [uniapp-base-skill](../../uniapp/uniapp-base-skill/SKILL.md) — 同构参考（uni-app 版）