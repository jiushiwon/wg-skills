---
name: vue-base-skill
description: Vue 基础组件父技能。基于「一切皆容器」思想，容器原则：所有组件必须由 base-card 承载。提供通用基础规范 + 嵌套业务子技能（card / button / tag / table）。
trigger: |
  # 父技能触发
  vue base 是什么 | vue 基础组件规范 | vue-base-skill 怎么用
  容器原则 | 所有组件必须 base-card 包裹
---

# vue-base-skill（Vue 基础组件父技能）

> **容器原则**：所有组件、表单、表格都必须嵌入 `<base-card>`。base-card 是根容器，无例外。
>
> 本技能严格镜像 [uniapp-base-skill](../../uniapp/uniapp-base-skill/) 结构：父技能（规范层）+ 4 个业务化子技能。

## 子技能地图

| 子技能 | 职责 | 入口 |
|--------|------|------|
| **vue-card-skill** | base-card 根容器 | [SKILL.md](vue-card-skill/SKILL.md) |
| **vue-button-skill** | base-button 按钮组件 | [SKILL.md](vue-button-skill/SKILL.md) |
| **vue-tag-skill** | base-tag 标签组件 | [SKILL.md](vue-tag-skill/SKILL.md) |
| **vue-table-skill** | base-table 表格组件（14 形态） | [SKILL.md](vue-table-skill/SKILL.md) |

## 设计 Token

所有子技能统一引用 [vue-theme-skill](../vue-theme-skill/) 提供的 CSS 变量：

| 类别 | 命名规范 | 示例 |
|------|----------|------|
| 颜色 | `--color-{name}` / `--color-{name}-{50~950}` | `--color-primary-500` |
| 间距 | `--space-{n}` | `--space-4`(16px) |
| 字号 | `--font-{size}` | `--font-base`(14px) |
| 行高 | `--height-{comp}-{size}` | `--height-button-md`(36px) |
| 圆角 | `--radius-{size}` | `--radius-lg`(8px) |

**禁止硬编码任何颜色 / 间距 / 字号 / 行高 / 圆角值。**

## 容器原则（铁律）

> **任何业务组件、表单、表格都必须嵌入 `<base-card>`。无例外。**

```vue
<!-- ✅ 正确 -->
<base-card title="商品管理">
  <base-table :data="products" :columns="columns" />
</base-card>

<!-- ❌ 错误：游离的 base-table -->
<base-table :data="products" :columns="columns" />
```

理由：
1. 全局视觉一致性（间距、阴影、圆角）
2. 为 `header-right` / `footer` 插槽提供容器
3. 业务区块边界明确，便于布局与响应式

## 第三方组件库禁令

> **禁止使用任何第三方 Vue UI 库**（Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue 等）。

如需弹窗、Drawer、Tabs 等组件 → 在 vue-base-skill 内扩展对应子技能，而非引入第三方。

## 命名对齐矩阵（与 uniapp-theme-skill / uniapp-base-skill 完全对齐）

```
vue-theme-skill      ←  uniapp-theme-skill
vue-base-skill       ←  uniapp-base-skill
vue-card-skill       ←  uniapp-card-skill
vue-button-skill     ←  (扩展，未来可独立)
vue-tag-skill        ←  (扩展，未来可独立)
vue-table-skill      ←  (扩展，未来可独立)
```

跨技能命名严格保持一致：组件、Token、文件结构、容器原则。

## 目录结构

```
vue-base-skill/
├── SKILL.md                     # 本文件（父技能入口）
├── README.md
├── references/                  # 跨子技能通用规范
│   └── skill-matrix.md
├── vue-card-skill/              # 业务子技能 1
│   ├── SKILL.md
│   ├── README.md
│   ├── base-card.md
│   └── demo-components/base-card-layout/
├── vue-button-skill/            # 业务子技能 2
│   ├── SKILL.md
│   ├── README.md
│   ├── base-button.md
│   └── demo-components/base-button/
├── vue-tag-skill/               # 业务子技能 3
│   ├── SKILL.md
│   ├── README.md
│   ├── base-tag.md
│   └── demo-components/base-tag/
└── vue-table-skill/             # 业务子技能 4
    ├── SKILL.md
    ├── README.md
    ├── base-table.md
    ├── base-table-*.md (10 变体)
    └── demo-components/base-table/ + shared/
```

## 如何使用

1. **需要 base-card 容器** → 进入 [vue-card-skill](vue-card-skill/SKILL.md)
2. **需要按钮** → 进入 [vue-button-skill](vue-button-skill/SKILL.md)
3. **需要标签** → 进入 [vue-tag-skill](vue-tag-skill/SKILL.md)
4. **需要表格** → 进入 [vue-table-skill](vue-table-skill/SKILL.md)
5. **跨技能协同疑问** → 查看 [references/skill-matrix.md](references/skill-matrix.md)