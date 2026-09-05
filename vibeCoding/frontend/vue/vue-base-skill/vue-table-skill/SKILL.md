---
name: vue-table-skill
description: Vue 通用表格技能。Vue3 + TypeScript 泛型组件，23 种形态，3 个独立组件。对齐 vue-theme-skill / vue-style-skill / base-card 容器契约，禁止混入任何第三方 UI 库。强依赖 base-button / base-status / base-card。零 HTML5 标签，全部用 <div> <span> + CSS3 实现。支持固定列、操作列、排序、筛选、选择、展开、编辑、树形数据、虚拟滚动、拖拽排序等核心功能。
trigger: |
  帮我做一个表格
  做一个数据表格
  做一个用户表格
  做一个产品列表
  做一个订单表格
  做一个可排序的表格
  做一个可筛选的表格
  做一个带分页的表格
  做一个可选择行的表格
  做一个带固定列的表格
  做一个带操作列的表格
  做一个可编辑的表格
  做一个树形表格
  做一个加载中效果
  做一个分页组件
---

# vue-table-skill 表格技能

## 🎯 定位

Vue3 + TypeScript 泛型表格组件，支持 23 种形态，包含 3 个独立组件：
- `base-table` - 通用表格组件（23 种形态）
- `base-loading` - 加载中组件（7 种动画 / 5 种尺寸 / 5 种主题）
- `base-paginated` - 分页组件（5 种模式 / 3 种尺寸 / 3 种形状）

**核心约束**：
- ✅ 零 HTML5 标签（`<button>` `<input>` `<select>` `<table>` 全部禁用）
- ✅ 全部用 `<div>` `<span>` + CSS3 实现
- ✅ 强依赖 `<base-button>` `<base-status>` `<base-card>`
- ✅ 全部使用 `var(--*)` Token

---

## 📦 组件清单

### 1. base-table 通用表格（23 种形态）

| # | 形态 | 说明 | 参数 |
|---|------|------|------|
| 1 | 基础表格 | 默认形态 | - |
| 2 | 固定列 | 左/右固定列 | `fixed: 'left'\|'right'` |
| 3 | 操作列 | 编辑/删除/自定义 | `actions` |
| 4 | 可选择行 | 自定义复选框 | `selectable` |
| 5 | 可排序 | 表头排序 | `sortable` |
| 6 | 可筛选 | 列筛选 | `filterable` |
| 7 | 可展开行 | 详情展开 | `expandable` |
| 8 | 表头分组 | 多级表头 | `children` |
| 9 | 合并单元格 | 行列合并 | `spanMethod` |
| 10 | 行编辑 | 单元格编辑 | `editable` |
| 11 | 树形数据 | 树形结构 | `treeData` |
| 12 | 虚拟滚动 | 大数据量 | `virtual` |
| 13 | 拖拽排序 | 拖拽调整 | `dragSort` |
| 14 | 可调整列宽 | 拖拽列宽 | `resizable` |
| 15 | 汇总行 | 底部汇总 | `showSummary` |
| 16 | 斑马纹 | 隔行变色 | `striped` |
| 17 | 边框 | 带边框 | `bordered` |
| 18 | 悬停高亮 | 鼠标悬停 | `hover` |
| 19 | 紧凑模式 | 减少内边距 | `compact` |
| 20 | 固定表头 | 表头固定 | `height` |
| 21 | 加载中 | 加载状态 | `loading` |
| 22 | 空状态 | 无数据 | `emptyText` |
| 23 | 分页表格 | 内置分页 | `pagination` |

**文档**：[base-table.md](./base-table.md)

### 2. base-loading 加载中（7 种动画）

| 动画 | 说明 |
|------|------|
| dots | 三点弹跳（默认） |
| bar | 条状横扫 |
| ring | 圆环旋转 |
| pulse | 脉冲扩散 |
| wave | 波浪起伏 |
| cube | 方块翻转（3D） |
| ripple | 涟漪扩散 |

**类型 / 5 种**：container / fullscreen / section / inline / overlay
**尺寸 / 5 种**：xs / sm / md / lg / xl
**主题 / 5 种**：primary / success / warning / danger / info

**文档**：[base-loading.md](./base-loading.md)

### 3. base-paginated 分页（5 种模式）

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| classic | 经典分页（数字按钮 + 上下页） | 桌面端默认 |
| button | 按钮组（首末页 + 上下页） | 卡片风格 |
| dropdown | 下拉页码 | 页数多时 |
| simple | 简洁模式 | 移动端 |
| scroll | 滚动加载 | 无限滚动 |

**尺寸 / 3 种**：sm / md / lg
**形状 / 3 种**：round / square / circle
**主题 / 5 种**：primary / success / warning / danger / info
**位置 / 3 种**：left / center / right

**文档**：[base-paginated.md](./base-paginated.md)

---

## 🚀 快速开始

### 基础表格

```vue
<template>
  <base-card title="用户列表">
    <base-table :data="users" :columns="columns" hover />
  </base-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const columns = [
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
  { key: 'email', title: '邮箱' },
]

const users = ref([
  { name: '张三', age: 28, email: 'zhangsan@example.com' },
  { name: '李四', age: 32, email: 'lisi@example.com' },
])
</script>
```

### 带固定列、操作列、状态列

```vue
<template>
  <base-card title="用户管理">
    <base-table
      :data="users"
      :columns="columns"
      hover
      striped
      bordered
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </base-card>
</template>

<script setup lang="ts">
const columns = [
  { key: 'name', title: '姓名', fixed: 'left', width: 120 },
  { key: 'age', title: '年龄', sortable: true, width: 100 },
  {
    key: 'status',
    title: '状态',
    width: 120,
    render: (row) => h(BaseStatus, {
      type: row.active ? 'success' : 'default',
      variant: 'light',
      size: 'sm',
    }, () => row.active ? '启用' : '禁用'),
  },
  {
    key: 'action',
    title: '操作',
    fixed: 'right',
    width: 240,
    actions: [
      { label: '查看', type: 'primary', variant: 'outline', event: 'view' },
      { label: '编辑', type: 'primary', event: 'edit' },
      { label: '删除', type: 'danger', variant: 'outline', event: 'delete' },
    ],
  },
]
</script>
```

### 表格 + 分页 + 加载

```vue
<template>
  <base-card title="订单管理">
    <base-loading :loading="loading" mode="dots" text="加载订单...">
      <base-table :data="orders" :columns="columns" hover />
    </base-loading>

    <base-paginated
      :current="pagination.current"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      show-total
      show-size-changer
      show-quick-jumper
      position="right"
      @page-change="handlePageChange"
    />
  </base-card>
</template>
```

---

## ⚠️ 容器原则

> **所有组件必须嵌入 `<base-card>` 使用。**

```vue
<!-- ✅ 正确 -->
<base-card title="用户列表">
  <base-table :data="users" :columns="columns" />
</base-card>

<!-- ❌ 错误 -->
<base-table :data="users" :columns="columns" />
```

---

## 🚫 红线

- ❌ 禁止裸用组件（必须 `<base-card>` 包裹）
- ❌ 禁止裸色值 / 裸 px（必须 `var(--*)`）
- ❌ 禁止使用 `<button>` `<input>` `<select>` `<table>` `<th>` `<td>` 等 HTML5 标签
- ❌ 禁止自写按钮样式（必须用 `<base-button>`）
- ❌ 禁止自写状态标签（必须用 `<base-status>`）
- ❌ 禁止混入 Element Plus / 任何第三方组件库

---

## 🔗 依赖关系

```
vue-table-skill
├── base-table（强依赖 base-button + base-status + base-card）
├── base-loading（依赖 base-card）
└── base-paginated（强依赖 base-button + base-card）

依赖：
├── vue-button-skill（base-button）
├── vue-status-skill（base-status）
├── vue-card-skill（base-card）
└── vue-theme-skill（CSS Variables）
```

---

## 📁 文件结构

```
vue-table-skill/
├── SKILL.md            # 技能入口
├── README.md           # 说明文档
├── base-table.md       # 表格组件文档
├── base-loading.md     # 加载组件文档
├── base-paginated.md   # 分页组件文档
└── demo-components/
    └── base-table/
        └── html/
            ├── base-table.html         # 表格 Demo（16 个）
            ├── base-loading.html       # 加载 Demo（6 个）
            ├── base-paginated.html     # 分页 Demo（9 个）
            ├── demo.css                # 共享样式
            ├── demo.js                 # 表格渲染
            ├── paginated.js            # 分页渲染
            └── loading.js              # 加载渲染
```

---

## 📚 参考

- [vue-theme-skill](../vue-theme-skill/) — 主题变量
- [vue-style-skill](../vue-style-skill/) — 样式规范
- [vue-button-skill](../vue-button-skill/) — base-button
- [vue-status-skill](../vue-status-skill/) — base-status
- [vue-card-skill](../vue-card-skill/) — base-card