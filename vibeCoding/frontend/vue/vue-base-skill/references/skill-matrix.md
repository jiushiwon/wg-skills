# Vue 技能矩阵 — skill-matrix.md

> vue-base-skill / vue-theme-skill 的协同说明。解决"哪个技能做什么、谁依赖谁、命名如何对齐"。

## 1. Vue 技能集合地图

```
vibeCoding/frontend/vue/
├── vue-theme-skill/                       # 主题：HSL tokens + 8 套预设主题
└── vue-base-skill/                        # 基础组件父技能（依赖 vue-theme-skill）
    ├── SKILL.md, README.md
    ├── references/skill-matrix.md         # 本文件
    ├── vue-card-skill/                    # 业务子技能 1（容器）
    │   ├── SKILL.md, README.md
    │   ├── base-card.md                   # 根容器规格
    │   └── demo-components/base-card-layout/
    ├── vue-button-skill/                  # 业务子技能 2（按钮）
    │   ├── SKILL.md, README.md
    │   ├── base-button.md
    │   └── demo-components/base-button/
    ├── vue-tag-skill/                     # 业务子技能 3（标签）
    │   ├── SKILL.md, README.md
    │   ├── base-tag.md
    │   └── demo-components/base-tag/
    └── vue-table-skill/                   # 业务子技能 4（表格）
        ├── SKILL.md, README.md
        ├── base-table.md + 10 变体 .md
        └── demo-components/{shared, base-table}/
```

> **关键原则**：父技能根目录**不放置任何业务组件 .md**，所有组件 .md 都下沉到对应子技能内。这是为了**严格对齐 uniapp-base-skill 结构**（其根目录的 `base-card.md` / `base-input.md` 视为"跨场景通用基础"，未来若提炼通用基线也可下沉）。

## 2. 依赖关系（必须遵守）

```
vue-theme-skill（基础层，无依赖）
       ↓ 提供 --color-* / --space-* / --font-* / --radius-*
vue-base-skill（父技能层，强依赖 vue-theme-skill）
       ↓ 规范 + 容器原则 + 4 个子技能入口
  ├── vue-card-skill        （容器基底）
  ├── vue-button-skill      （按钮）
  ├── vue-tag-skill         （标签）
  └── vue-table-skill       （表格）
```

**禁止反向依赖**：vue-theme-skill 不得引用 vue-base-skill 的任何变量。

## 3. Token 命名对齐矩阵（vue-theme-skill ↔ uniapp-theme-skill）

| 类别 | 命名规范 | 示例 |
|------|----------|------|
| 颜色 | `--color-{name}` | `--color-primary`, `--color-success` |
| 颜色阶 | `--color-{name}-{50~950}` | `--color-primary-500` |
| 间距 | `--space-{n}` | `--space-1`(4px) → `--space-16`(64px) |
| 字号 | `--font-{size}` | `--font-xs`, `--font-base`, `--font-4xl` |
| 行高 | `--height-{comp}-{size}` | `--height-button-md`(36px) |
| 圆角 | `--radius-{size}` | `--radius-sm`, `--radius-lg` |

> 完整 token 列表见 [vue-theme-skill](../vue-theme-skill/templates/src/styles/tokens.css)。

## 4. 组件 ↔ Token 使用对照表

| 组件 | 主要使用 token | 不允许 |
|------|----------------|--------|
| base-card | `--color-surface`, `--space-5`, `--radius-lg` | 硬编码 `#fff` / `16px` |
| base-button | `--color-primary*`, `--space-3/4`, `--height-button-md`, `--radius-md` | 硬编码 hex / `36px` |
| base-tag | `--color-success-light` 等语义色，`--font-xs`, `--radius-sm` | 硬编码色值 |
| base-table | `--color-bg-secondary`, `--color-divider`, `--space-3/4` | 硬编码 `#fafafa` |

## 5. 容器原则（vue-base-skill 铁律）

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

## 6. 子技能结构（参考 uniapp-base-skill）

每个子技能内部：

```
<子技能>/
├── SKILL.md                 # 总入口 + trigger
├── README.md                # 用户视角的快速上手
├── <业务组件>.md            # 组件规格（每个组件一个 .md）
└── demo-components/
    └── <组件名>/
        ├── README.md        # demo 索引（可选）
        └── html/*.html      # HTML demo
```

- 组件 .md 命名：`base-{组件名}.md`（如 `base-card.md`）
- 变体 .md 命名：`base-{组件}-{形态}.md`（如 `base-table-striped.md`）
- demo 目录命名：`demo-components/<组件名>/`（小驼峰变体可用连字符，如 `base-card-layout`）

## 7. 跨技能触发词稳定

| 触发词 | 触发的技能 | 备注 |
|--------|-----------|------|
| `/vue-theme` | vue-theme-skill | 主题/Token 相关 |
| `/vue-base` | vue-base-skill | 父技能（导航/规范） |
| `/vue-card` | vue-card-skill | base-card 相关 |
| `/vue-button` | vue-button-skill | base-button 相关 |
| `/vue-tag` | vue-tag-skill | base-tag 相关 |
| `/vue-table` | vue-table-skill | base-table 相关 |

## 8. 与其他技能的对齐参考

| Vue 技能 | 对齐参考 | 来源 |
|----------|----------|------|
| vue-theme-skill | uniapp-theme-skill | 命名 + token 体系完全对齐 |
| vue-base-skill | uniapp-base-skill | 父技能 + 嵌套子技能子三层结构 |
| vue-card-skill | uniapp-card-skill | 业务卡片 + demo-components |
| vue-button-skill | (扩展，未来独立) | — |
| vue-tag-skill | (扩展，未来独立) | — |
| vue-table-skill | (扩展，未来独立) | — |

## 9. 第三方组件库禁令

> **禁止使用任何第三方 Vue UI 库**（Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue 等）。
> 原因：保持主题可控、避免样式冲突、减小 bundle 体积。

如需弹窗、Drawer、Tabs 等组件 → 在 vue-base-skill 内扩展对应子技能，而非引入第三方。

## 10. 版本兼容

| 版本 | 状态 | 说明 |
|------|------|------|
| 0.1.0 | ✅ 已发布 | 父技能 + card / button / tag / table 4 个子技能 |
| 0.2.0 | 🚧 规划中 | vue-form-skill（input / radio / checkbox / select / form） |
| 0.3.0 | 🚧 规划中 | vue-popup-skill / vue-page-skill |
| 1.0.0 | 🚧 规划中 | 业务层组件 + 完整页面模板 |