# Vue Complex Skill

> 本技能**不实现具体组件**，仅作为入口，引用其他组件技能实现综合页面。

## 定位

本技能是一个**页面组合器**，通过引用现有组件技能来组装不同类型的管理后台页面。

## 引用关系

| 页面类型 | 引用的组件技能 |
|----------|----------------|
| 登录页 | vue-login-skill（8 种风格） |
| 列表页 | vue-table-skill + vue-input-skill + vue-select-skill + vue-datepicker-skill |
| 表单页 | vue-form-skill + vue-input-skill + vue-select-skill + vue-datepicker-skill |
| 详情页 | vue-card-skill + vue-input-skill |
| 仪表盘 | vue-card-skill + vue-table-skill |
| 设置页 | vue-form-skill + vue-card-skill |

## 使用方式

当需要某个综合页面时，引用对应组件技能进行组合：

```
列表页 → 引用 BaseTable + BaseInput + BaseSelect + BaseDatePicker
表单页 → 引用 BaseForm + BaseInput + BaseSelect + BaseButton
详情页 → 引用 BaseCard + BaseInput + BaseButton
```

## 触发词

- "Vue 综合页面"
- "管理后台页面"
- "列表页" / "表单页" / "详情页"
