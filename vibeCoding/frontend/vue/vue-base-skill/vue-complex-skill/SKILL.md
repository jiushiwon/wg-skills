---
name: vue-complex-skill
description: Vue3 综合页面技能，整合现有组件技能实现不同类型页面。引用 vue-input-skill、vue-select-skill、vue-datepicker-skill、vue-table-skill、vue-form-skill、vue-login-skill 等。触发词："Vue 综合页面"、"vue-complex"、"管理后台页面"。
---

# Vue Complex Skill

综合页面技能，通过引用现有组件技能实现不同类型的管理后台页面。

## 引用组件

| 组件技能 | 用途 |
|----------|------|
| vue-input-skill | 输入框 |
| vue-select-skill | 下拉选择器 |
| vue-datepicker-skill | 日期选择器 |
| vue-table-skill | 表格 |
| vue-form-skill | 表单 |
| vue-card-skill | 卡片 |
| vue-button-skill | 按钮 |
| vue-login-skill | 登录页 |
| vue-crud-skill | 增删改查页面 |

## 页面类型

### 1. 列表页 (List Page)

引用：vue-input-skill + vue-select-skill + vue-datepicker-skill + vue-table-skill

功能：搜索筛选 + 表格展示 + 分页

### 2. 表单页 (Form Page)

引用：vue-form-skill + vue-input-skill + vue-select-skill + vue-datepicker-skill + vue-button-skill

功能：数据新增/编辑表单

### 3. 详情页 (Detail Page)

引用：vue-card-skill + vue-input-skill + vue-button-skill

功能：数据查看 + 操作按钮

### 4. 仪表盘 (Dashboard)

引用：vue-card-skill + vue-table-skill

功能：统计卡片 + 数据图表

### 5. 设置页 (Settings)

引用：vue-form-skill + vue-card-skill + vue-button-skill

功能：系统设置表单项

### 6. 增删改查页 (CRUD Page)

引用：vue-table-skill + vue-form-skill + vue-input-skill + vue-select-skill + vue-datepicker-skill + vue-button-skill

功能：搜索筛选 + 表格展示 + 新增/编辑弹窗 + 删除确认 + 分页

## 使用方式

根据页面类型，选择引用对应组件：

```
# 列表页
引用: BaseInput + BaseSelect + BaseDatePicker + BaseTable

# 表单页
引用: BaseForm + BaseInput + BaseSelect + BaseDatePicker + BaseButton

# 详情页
引用: BaseCard + BaseInput + BaseButton

# 增删改查页
引用: BaseCrudPage (整合以上所有组件)
```

## 触发词

- "Vue 综合页面"
- "vue-complex"
- "管理后台页面"
- "列表页"
- "表单页"
- "详情页"
- "仪表盘"
- "设置页"
- "增删改查"
- "CRUD 页面"
