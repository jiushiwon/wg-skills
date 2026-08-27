# Vue 技能矩阵 — skill-matrix.md

> vue-base-skill / vue-theme-skill / 未来扩展技能的协同说明。
> 解决"哪个技能做什么、谁依赖谁、命名如何对齐"。

## 1. Vue 技能集合地图

```
vibeCoding/frontend/vue/
├── vue-theme-skill/          # 主题：HSL tokens + 8 套预设主题
└── vue-base-skill/           # 基础组件库（依赖 vue-theme-skill）
    ├── base-card              # 根容器（容器原则）
    ├── base-button           # 按钮
    ├── base-tag              # 标签
    ├── base-table            # 表格（14 形态）
    └── (规划中)
        ├── base-input        # 输入框
        ├── base-radio        # 单选
        ├── base-checkbox     # 多选
        ├── base-select       # 下拉
        ├── base-form         # 表单容器（依赖 base-input 系列）
        ├── base-pagination    # 独立分页器
        └── base-avatar       # 头像
```

## 2. 依赖关系（必须遵守）

```
vue-theme-skill（基础层，无依赖）
       ↓ 提供 --color-* / --space-* / --font-* / --radius-*
vue-base-skill（组件层，强依赖 vue-theme-skill）
       ↓ 提供 base-card / base-button / base-tag / base-table
未来 vue-business-skill（业务层，依赖 vue-base-skill）
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

> 完整 token 列表见 [vue-theme-skill/templates/src/styles/tokens.css](../../vue-theme-skill/templates/src/styles/tokens.css)。

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

理由：保证全局视觉一致性（间距、阴影、圆角）；为后续 header-right / footer 插槽提供容器。

## 6. 跨技能触发词稳定

| 触发词 | 触发的技能 | 备注 |
|--------|-----------|------|
| `/vue-theme` | vue-theme-skill | 主题/Token 相关 |
| `/vue-base` | vue-base-skill | 基础组件相关 |
| `/vue-skill` | 两个技能 | 同时涉及主题和组件 |

## 7. 与其他技能的对齐参考

| Vue 技能 | 对齐参考 | 来源 |
|----------|----------|------|
| vue-theme-skill | uniapp-theme-skill | 命名 + token 体系完全对齐 |
| vue-base-skill | uniapp-base-skill | `.md` 根目录结构 + demo-components 目录 |
| 未来 vue-form-skill | uniapp-form-skill | 待对齐 |
| 未来 vue-page-skill | uniapp-page-components-skill | 待对齐 |

## 8. 第三方组件库禁令

> **禁止使用任何第三方 Vue UI 库**（Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue 等）。
> 原因：保持主题可控、避免样式冲突、减小 bundle 体积。

如需弹窗、Drawer、Tabs 等组件 → 在 vue-base-skill 内扩展对应组件，而非引入第三方。

## 9. 版本兼容

| 版本 | 状态 | 说明 |
|------|------|------|
| 0.1.0 | ✅ 已发布 | base-card / base-button / base-tag / base-table（14 形态） |
| 0.2.0 | 🚧 规划中 | base-input / base-radio / base-checkbox / base-select |
| 0.3.0 | 🚧 规划中 | base-form / base-pagination |
| 1.0.0 | 🚧 规划中 | 业务层组件 + 完整页面模板 |