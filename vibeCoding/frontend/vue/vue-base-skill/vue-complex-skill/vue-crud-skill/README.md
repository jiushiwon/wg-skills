# vue-crud-skill

Vue3 增删改查页面技能，整合搜索+表格+表单+弹窗的完整 CRUD 页面。

## 功能特性

- ✅ 搜索筛选
- ✅ 表格展示
- ✅ 新增/编辑弹窗
- ✅ 删除确认
- ✅ 分页
- ✅ 响应式设计

## 引用组件

- vue-table-skill - 表格
- vue-form-skill - 表单
- vue-input-skill - 输入框
- vue-select-skill - 选择器
- vue-datepicker-skill - 日期选择器
- vue-button-skill - 按钮

## 使用方式

```vue
<BaseCrudPage
  :columns="columns"
  :search-fields="searchFields"
  :form-fields="formFields"
  :data="data"
  :loading="loading"
  :pagination="pagination"
  @search="loadData"
  @add="handleAdd"
  @edit="handleEdit"
  @delete="handleDelete"
/>
```

## Demo

See [00-showcase.html](demo-components/crud-page/html/00-showcase.html)
