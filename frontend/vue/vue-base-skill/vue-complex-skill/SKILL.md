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
| vue-dashboard-skill | 数据看板页面 |
| vue-chart-skill | 图表组件（折线/柱状/饼图/散点/雷达/仪表盘/进度环/漏斗/热力图） |
| vue-chat-skill | AI 对话页面 |
| vue-upload-integration-skill | 上传全链路集成（表单+上传+后端契约） |

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

引用：vue-card-skill + vue-table-skill + vue-chart-skill

功能：统计卡片 + 数据图表（折线/柱状/饼图/仪表盘）

### 5. 设置页 (Settings)

引用：vue-form-skill + vue-card-skill + vue-button-skill

功能：系统设置表单项

### 7. 数据看板页 (Dashboard)

引用：vue-card-skill + vue-table-skill + vue-button-skill + vue-tag-skill + vue-chart-skill

功能：KPI 指标卡片 + 图表（折线/柱状/饼图/仪表盘/进度环） + 活动流 + 快捷操作

### 8. AI 对话页 (Chat)

引用：vue-card-skill + vue-button-skill

功能：消息列表 + 代码块 + 流式输出 + 侧边历史 + 输入区

### 9. 上传集成页 (Upload Integration)

引用：vue-upload-skill + vue-form-skill + vue-button-skill + vue-tag-skill

功能：头像设置 / 商品发布（图片上传+裁剪+压缩） / 文件管理器 / 批量导入

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
- "看板"
- "Dashboard"
- "数据看板"
- "Chat"
- "AI 对话"
- "聊天界面"
- "上传集成"
- "上传表单"
- "商品发布"
- "文件管理"
- "头像设置"
- "批量导入"
