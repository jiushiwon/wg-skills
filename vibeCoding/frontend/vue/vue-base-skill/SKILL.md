---
name: vue-base-skill
description: Vue 3 业务组件库（base-* 系列）。base-card 是根容器，所有其他组件（base-table / base-button / base-tag / base-input / base-radio / base-select 等）都必须由 base-card 包裹。零第三方组件库（禁止 Element Plus / Naive UI / Ant Design Vue），全部自研 + 严格依赖 vue-theme-skill Token。当用户提到"vue 卡片"、"vue 表格"、"vue 表单组件"、"vue 不使用 Element Plus"、"vue 自研组件"时触发。
---

# Vue Base Skill（Vue 业务组件库）

## ⚠️ 核心地位：base-card 是基石

> **base-card 是 vue-base-skill 的根容器，所有其他组件和页面都由它组合而成。**

```
┌─────────────────────────────────────┐
│  页面 = 多个 base-card + 布局       │
│  ┌─────────┐  ┌─────────┐            │
│  │base-card│  │base-card│            │
│  └─────────┘  └─────────┘            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  base-card = 容器属性 + 内容         │
│  ┌─────────────────────────────┐    │
│  │  背景/圆角/边框/阴影         │    │
│  │  ┌─────────────────────┐    │    │
│  │  │  base-table / 其他  │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**容器原则（红线）**：所有涉及内容容器的组件，都必须使用 `base-card` 作为容器。

## 目录结构

```
vue-base-skill/
├── SKILL.md                            # 本文件（总入口）
├── README.md
├── base-card.md                        # ⭐ 根容器组件（所有组件依赖）
├── base-button.md                      # 按钮组件
├── base-tag.md                         # 标签组件
├── base-table.md                       # 表格组件（本期重点）
├── base-table-striped.md               # 表格形态：条纹
├── base-table-bordered.md              # 表格形态：边框
├── base-table-hover.md                 # 表格形态：高亮
├── base-table-compact.md               # 表格形态：紧凑
├── base-table-fixed-header.md          # 表格形态：固定表头
├── base-table-fixed-column.md          # 表格形态：固定列
├── base-table-selectable.md            # 表格形态：可选择
├── base-table-sortable.md              # 表格形态：可排序
├── base-table-filterable.md            # 表格形态：可筛选
├── base-table-paginated.md             # 表格形态：分页
├── base-table-loading.md               # 表格形态：加载态
├── base-table-empty.md                 # 表格形态：空状态
├── base-table-tree.md                  # 表格形态：树形
├── references/
│   └── skill-matrix.md
└── demo-components/
    ├── base-card/
    │   ├── README.md
    │   └── html/                       # base-card HTML demo
    ├── base-button/
    │   ├── README.md
    │   └── html/
    ├── base-tag/
    │   ├── README.md
    │   └── html/
    └── base-table/
        ├── README.md                   # 14 形态总览
        └── html/                       # 14 个 HTML 演示
            ├── 00-showcase.html
            ├── 01-basic.html
            ├── 02-striped.html
            └── ... (14 个形态)
```

## 三大原则（绝不可违反）

### 1. 容器原则：所有组件依赖 base-card

```vue
<!-- ❌ 错误：裸用 div / 裸用组件 -->
<template>
  <base-table :data="users" :columns="columns" />
</template>

<!-- ✅ 正确：用 base-card 包裹 -->
<template>
  <base-card title="用户管理">
    <template #header-right>
      <base-button type="primary">+ 新建</base-button>
    </template>

    <base-table :data="users" :columns="columns" />
  </base-card>
</template>
```

### 2. 零第三方 UI 库

```
❌ 禁止：Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue / Quasar
✅ 自研：所有组件用 Vue 3 + TypeScript 手写
✅ Token：所有样式来自 vue-theme-skill
```

### 3. 严格依赖 vue-theme-skill

所有组件**不写裸色值 / 裸 px**，必须用 `var(--color-*)` / `var(--space-*)` 等。

## When to Use

- "vue 做一个卡片" → 引导到 base-card
- "vue 做一个表格" → 引导到 base-table
- "vue 表单组件" → 引导到 base-input / base-radio / base-select
- "vue 不使用 Element Plus" → 直接调起 vue-base-skill

**Not for**：
- ❌ 设计 Token（→ vue-theme-skill）
- ❌ 工程化骨架（→ vue-generate-skill）
- ❌ uniapp / 移动端 hybrid（→ uniapp-base-skill）

## 组件清单

| 组件 | 文件 | 状态 |
|------|------|------|
| **BaseCard**（根容器） | [base-card.md](base-card.md) | ✅ |
| BaseButton | [base-button.md](base-button.md) | ✅ |
| BaseTag | [base-tag.md](base-tag.md) | ✅ |
| **BaseTable**（本期重点） | [base-table.md](base-table.md) | ✅ 14 形态 |
| BaseInput | base-input.md | ⏳ 规划中 |
| BaseRadio | base-radio.md | ⏳ 规划中 |
| BaseSelect | base-select.md | ⏳ 规划中 |
| BaseForm | base-form.md | ⏳ 规划中 |
| BasePagination | base-pagination.md | ⏳ 规划中 |
| BaseAvatar | base-avatar.md | ⏳ 规划中 |

## 唤醒操作

```markdown
# 基础组件
/vue-base-skill 做一个卡片
/vue-base-skill 做一个按钮
/vue-base-skill 做一个标签

# 表格相关（14 形态）
/vue-base-skill 做一个表格
/vue-base-skill 做一个带分页的表格
/vue-base-skill 做一个可选择的表格
/vue-base-skill 做一个可排序的表格
/vue-base-skill 做一个可筛选的表格
/vue-base-skill 做一个固定表头的表格
/vue-base-skill 做一个固定列的表格
/vue-base-skill 做一个紧凑型表格
/vue-base-skill 做一个条纹表格表格
/vue-base-skill 做一个加载态表格
/vue-base-skill 做一个空状态表格
/vue-base-skill 做一个树形表格

# 组合
/vue-base-skill 做一个用户管理页：表格 + 表单 + 分页
/vue-base-skill 做一个订单列表：表格 + 筛选 + 状态标签
/vue-base-skill 做一个商品列表：表格 + 批量操作 + 导出
```

## 与其他 Skill 关系

```
vue-generate-skill（骨架：vite/tsconfig/pinia/请求层）
  └─→ vue-theme-skill（设计 Token：颜色/尺寸/圆角/阴影/多主题）
       └─→ vue-base-skill（业务组件库，本 Skill）
            ├─→ base-card（根容器）
            ├─→ base-button
            ├─→ base-tag
            ├─→ base-table（本期重点）
            └─→ 业务页面（用户管理、订单管理等）
```

**严格依赖**：
- vue-theme-skill（设计 Token）
- vue-generate-skill（工程化骨架，可选）

**不依赖**：
- ❌ Element Plus / 任何第三方 UI 库
- ❌ uniapp-* 系列（移动端用 uniapp-base-skill）

## 红线（绝不可违反）

1. ❌ 禁止引入第三方 UI 库（Element Plus / Naive UI 等）
2. ❌ 禁止业务组件内出现裸色值 / 裸 px
3. ❌ 禁止内容容器直接用 `<div>`（必须用 `<base-card>`）
4. ❌ 禁止跨端硬编码 rpx / rem（Vue 用 px + Token）
5. ❌ 禁止组件 props 用 `any`（必须 TypeScript 类型）
6. ❌ 禁止组件不写 `<script setup lang="ts">`
7. ❌ 禁止修改 vue-theme-skill 的 Token（必须复用）