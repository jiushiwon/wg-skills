# vue-base-skill — Vue 3 业务组件库

> **base-card 是根容器**，所有其他组件（base-table / base-button / base-tag / base-input / base-radio / base-select 等）都必须由 base-card 包裹。
> **零第三方组件库**，全部自研 + 严格依赖 vue-theme-skill Token。

## 架构

```
vue-generate-skill（骨架）
  └─→ vue-theme-skill（设计 Token）
       └─→ vue-base-skill（业务组件库，本 Skill）
            ├─→ base-card（根容器）
            ├─→ base-button
            ├─→ base-tag
            ├─→ base-table（本期重点，14 形态）
            └─→ 业务页面
```

## 三大原则

1. **容器原则**：所有内容必须用 `<base-card>` 包裹
2. **零第三方 UI 库**：自研所有组件
3. **严格 Token 化**：所有样式来自 vue-theme-skill

## 核心组件（根 .md 文件）

| 组件 | 规范文档 | Demos |
|------|---------|-------|
| **BaseCard**（根容器） | [base-card.md](base-card.md) | [demo-components/base-card/](demo-components/base-card/) |
| BaseButton | [base-button.md](base-button.md) | [demo-components/base-button/](demo-components/base-button/) |
| BaseTag | [base-tag.md](base-tag.md) | [demo-components/base-tag/](demo-components/base-tag/) |
| **BaseTable**（14 形态） | [base-table.md](base-table.md) | [demo-components/base-table/](demo-components/base-table/) |

## BaseTable 14 种形态

| # | 形态 | 规范文档 | HTML Demo |
|---|------|---------|-----------|
| 1 | basic 基础 | [base-table.md](base-table.md) | [01-basic.html](demo-components/base-table/html/01-basic.html) |
| 2 | striped 条纹 | [base-table-striped.md](base-table-striped.md) | [02-striped.html](demo-components/base-table/html/02-striped.html) |
| 3 | bordered 边框 | [base-table-bordered.md](base-table-bordered.md) | [03-bordered.html](demo-components/base-table/html/03-bordered.html) |
| 4 | hover 高亮 | [base-table-hover.md](base-table-hover.md) | [04-hover.html](demo-components/base-table/html/04-hover.html) |
| 5 | compact 紧凑 | [base-table-compact.md](base-table-compact.md) | [05-compact.html](demo-components/base-table/html/05-compact.html) |
| 6 | fixed-header 固定表头 | [base-table-fixed-header.md](base-table-fixed-header.md) | [06-fixed-header.html](demo-components/base-table/html/06-fixed-header.html) |
| 7 | fixed-column 固定列 | [base-table-fixed-column.md](base-table-fixed-column.md) | [07-fixed-column.html](demo-components/base-table/html/07-fixed-column.html) |
| 8 | selectable 可选择 | [base-table-selectable.md](base-table-selectable.md) | [08-selectable.html](demo-components/base-table/html/08-selectable.html) |
| 9 | sortable 可排序 | [base-table-sortable.md](base-table-sortable.md) | [09-sortable.html](demo-components/base-table/html/09-sortable.html) |
| 10 | filterable 可筛选 | [base-table-filterable.md](base-table-filterable.md) | [10-filterable.html](demo-components/base-table/html/10-filterable.html) |
| 11 | paginated 分页 | [base-table-paginated.md](base-table-paginated.md) | [11-paginated.html](demo-components/base-table/html/11-paginated.html) |
| 12 | loading 加载态 | [base-table-loading.md](base-table-loading.md) | [12-loading.html](demo-components/base-table/html/12-loading.html) |
| 13 | empty 空状态 | [base-table-empty.md](base-table-empty.md) | [13-empty.html](demo-components/base-table/html/13-empty.html) |
| 14 | tree 树形 | [base-table-tree.md](base-table-tree.md) | [14-tree.html](demo-components/base-table/html/14-tree.html) |
| 0 | showcase 总览 | — | [00-showcase.html](demo-components/base-table/html/00-showcase.html) |

## 快速开始

### 1. 安装 vue-theme-skill

```bash
# 已安装可跳过
cp -r vue-theme-skill/templates/src/styles your-project/src/
```

### 2. 复制本 Skill 组件规范

阅读 `base-card.md` → `base-button.md` → `base-tag.md` → `base-table.md` → 对应形态 .md

### 3. 在 main.ts 全局注册

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import '@/styles/tokens.css'  // 必须最先

import BaseCard from '@/components/BaseCard.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseTable from '@/components/BaseTable.vue'
import BaseTag from '@/components/BaseTag.vue'

const app = createApp(App)
app.component('BaseCard', BaseCard)
app.component('BaseButton', BaseButton)
app.component('BaseTable', BaseTable)
app.component('BaseTag', BaseTag)
app.mount('#app')
```

### 4. 使用（容器原则）

```vue
<template>
  <!-- ✅ 容器原则：base-card 包裹 -->
  <base-card title="用户管理">
    <template #header-right>
      <base-button type="primary">+ 新建</base-button>
    </template>

    <base-table
      :data="users"
      :columns="columns"
      :pagination="pagination"
      selectable
      variant="striped"
    />
  </base-card>
</template>
```

## 详细文档

- [SKILL.md](SKILL.md) — 完整规范
- [base-card.md](base-card.md) — ⭐ 根容器组件（必读）
- [base-table.md](base-table.md) — 表格组件 14 形态
- [references/skill-matrix.md](references/skill-matrix.md) — 技能矩阵
- [demo-components/](demo-components/) — 各组件 demo