# vue-table-skill 表格技能

> Vue 通用表格技能，支持 23 种形态，包含 3 个独立组件。
> 零 HTML5 标签（`<button>` `<input>` `<select>` `<table>`），全部用 `<div>` `<span>` + CSS3 实现。
> 强依赖：[`base-button`](../vue-button-skill/) + [`base-status`](../vue-status-skill/) + [`base-card`](../vue-card-skill/)。

## 📦 组件清单

| 组件 | 说明 | 文档 |
|------|------|------|
| `base-table` | 通用表格组件（23 种形态） | [base-table.md](./base-table.md) |
| `base-loading` | 加载中组件（7 种动画 / 5 种尺寸 / 5 种主题） | [base-loading.md](./base-loading.md) |
| `base-paginated` | 分页组件（5 种模式 / 3 种尺寸） | [base-paginated.md](./base-paginated.md) |

## 🚀 快速开始

### 1. 基础表格

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

### 2. 带固定列和操作列的表格

```vue
<template>
  <base-card title="用户管理">
    <base-table
      :data="users"
      :columns="columns"
      hover
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </base-card>
</template>

<script setup lang="ts">
const columns = [
  { key: 'name', title: '姓名', fixed: 'left', width: 120 },
  { key: 'age', title: '年龄', width: 100 },
  { key: 'email', title: '邮箱', minWidth: 200 },
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

### 3. 表格 + 分页

```vue
<template>
  <base-card title="用户管理">
    <base-table :data="users" :columns="columns" hover />

    <base-paginated
      :current="pagination.current"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      show-total
      show-size-changer
      position="right"
      @page-change="handlePageChange"
    />
  </base-card>
</template>
```

### 4. 加载状态

```vue
<template>
  <base-card title="用户列表">
    <base-loading :loading="loading" mode="dots" text="加载中..." />
  </base-card>
</template>
```

---

## 🎨 形态展示

### base-table 形态（23 种）

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

### base-paginated 形态

| 形态 | 说明 | 参数 |
|------|------|------|
| 经典模式 | 传统分页 | `mode="classic"` |
| 按钮模式 | 现代风格（首末页 + 上下页） | `mode="button"` |
| 下拉模式 | 页数多时 | `mode="dropdown"` |
| 简洁模式 | 移动端友好 | `mode="simple"` |
| 滚动模式 | 无限滚动 | `mode="scroll"` |
| 小/中/大 | 3 种尺寸 | `size="sm"\|"md"\|"lg"` |
| 形状 | 圆角/方形/圆形 | `shape` |
| 主题 | primary/success/warning/danger/info | `theme` |
| 左/中/右 | 3 种位置 | `position` |
| 带边框 | 边框样式 | `bordered` |
| 带背景 | 背景样式 | `background` |
| 自定义下拉 | 无 select | 内置 |
| 自定义输入 | 无 input | 内置 |
| 禁用 | 全局禁用 | `disabled` |

### base-loading 形态

| 形态 | 说明 | 参数 |
|------|------|------|
| dots | 三点弹跳 | `mode="dots"` |
| bar | 条状横扫 | `mode="bar"` |
| ring | 圆环旋转 | `mode="ring"` |
| pulse | 脉冲扩散 | `mode="pulse"` |
| wave | 波浪起伏 | `mode="wave"` |
| cube | 方块翻转 | `mode="cube"` |
| ripple | 涟漪扩散 | `mode="ripple"` |
| container | 容器加载 | `type="container"` |
| fullscreen | 全屏加载 | `type="fullscreen"` |
| section | 区域加载 | `type="section"` |
| inline | 行内加载 | `type="inline"` |
| overlay | 覆盖加载 | `type="overlay"` |
| xs/sm/md/lg/xl | 5 种尺寸 | `size` |
| primary/success/... | 5 种主题 | `theme` |
| 自定义颜色 | 自定义 | `customColor` |
| 自定义图标 | 自定义 | `icon` slot |
| 自定义文案 | 自定义 | `text` slot |

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

## 📋 Demo

- [base-table.html](./demo-components/base-table/html/base-table.html) — 16 个表格 demo
- [base-paginated.html](./demo-components/base-table/html/base-paginated.html) — 9 个分页 demo
- [base-loading.html](./demo-components/base-table/html/base-loading.html) — 6 个加载 demo

## 🔗 依赖关系

```
vue-table-skill
├── base-table（强依赖 base-button + base-status）
├── base-loading
└── base-paginated（强依赖 base-button）

依赖：
├── vue-button-skill（base-button）
├── vue-status-skill（base-status）
├── vue-card-skill（base-card）
└── vue-theme-skill（CSS Variables）
```

---

## 📚 参考

- [vue-theme-skill](../vue-theme-skill/) — 主题变量
- [vue-style-skill](../vue-style-skill/) — 样式规范
- [vue-button-skill](../vue-button-skill/) — base-button
- [vue-status-skill](../vue-status-skill/) — base-status
- [vue-card-skill](../vue-card-skill/) — base-card