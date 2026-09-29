# Vue List Page Skill

Vue3 列表页组件，整合搜索筛选+表格+分页的综合页面。

## 引用组件

- vue-input-skill
- vue-select-skill
- vue-datepicker-skill
- vue-table-skill

## 功能

- 搜索筛选区（输入框、选择器、日期选择）
- 表格展示
- 分页组件

## 使用

```vue
<BaseListPage
  :columns="columns"
  :search-fields="searchFields"
  :data="data"
  :pagination="pagination"
  @search="loadData"
/>
```

## 触发词

"Vue 列表页"、"vue-list-page"、"列表筛选页"
