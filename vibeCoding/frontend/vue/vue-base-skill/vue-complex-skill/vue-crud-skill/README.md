# vue-crud-skill

Vue3 增删改查页面技能，整合搜索+工具栏+表格+弹窗表单+确认+Toast 的完整 CRUD 页面。

## 功能特性

- ✅ 搜索筛选（基础 + 高级展开/收起）
- ✅ 表格展示（复选框全选/半选、排序、斑马纹、空状态）
- ✅ 工具栏（新增、批量删除、导出、刷新）
- ✅ 新增/编辑弹窗（双列表单网格、校验必填+格式）
- ✅ 删除确认弹窗（单条 + 批量）
- ✅ Toast 操作反馈（成功/失败/警告）
- ✅ 分页（页码、pageSize 选择器、页码跳转）
- ✅ 加载遮罩（动画 spinner）
- ✅ 自定义单元格 Slot（`#cell-{prop}`）
- ✅ `useCrud` Composable（搜索/排序/选择/弹窗/CRUD 逻辑全内置）
- ✅ 响应式布局
- ✅ 多主题支持（Design Token）

## 引用组件

- vue-table-skill — 表格（排序/空状态/加载遮罩）
- vue-form-skill — 表单校验（rules 驱动）
- vue-input-skill — 输入框
- vue-select-skill — 选择器
- vue-datepicker-skill — 日期选择器
- vue-button-skill — 按钮
- vue-checkbox-skill — 复选框（全选/半选）
- vue-status-skill — 状态标签
- vue-tag-skill — 角色标签
- vue-switch-skill — 开关
- vue-toast-skill — Toast 提示
- vue-dialog-skill — 确认弹窗

## 使用方式

```vue
<script setup>
import { BaseCrudPage, useCrud } from './components/crud';

const crud = useCrud({
  loadData: (params) => request.get('/api/users', { params }),
  onAdd: (data) => request.post('/api/users', data),
  onEdit: (row, data) => request.put(`/api/users/${row.id}`, data),
  onDelete: (row) => request.delete(`/api/users/${row.id}`),
});
</script>

<template>
  <BaseCrudPage
    :columns="columns"
    :search-fields="searchFields"
    :form-fields="formFields"
    :data="crud.data.value"
    :loading="crud.loading.value"
    :pagination="crud.pagination.value"
    modal-title="用户"
    @search="crud.search"
    @add="crud.add"
    @edit="crud.edit"
    @delete="crud.remove"
    @batch-delete="crud.batchRemove"
    @page-change="crud.changePage"
  />
</template>
```

## 文件结构

```
vue-crud-skill/
├── SKILL.md              # AI 触发文档 + 完整组件代码
├── README.md             # 本文件（人类可读）
├── base-crud.md          # 组件规范（Props/Events/Types）
└── demo-components/
    └── crud-page/
        └── html/
            └── 00-showcase.html   # 纯 HTML 演示（6 主题、全交互）
```

## Demo

See [00-showcase.html](demo-components/crud-page/html/00-showcase.html)
