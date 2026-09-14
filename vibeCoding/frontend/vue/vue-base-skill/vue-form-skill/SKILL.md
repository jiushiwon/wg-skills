---
name: vue-form-skill
description: Vue 表单体系技能。基于「容器原则」，所有表单必须嵌入 base-card。提供 base-form（表单容器+校验）、base-form-item（表单项），并引用独立组件技能（vue-input-skill、vue-select-skill、vue-datepicker-skill 等）。纯 CSS 实现，零第三方组件库。触发词："Vue 表单"、"vue-form"、"做一个表单"、"表单校验"、"万能表单"、"契约驱动表单"。
trigger: |
  做一个表单 | 做一个登录表单 | 做一个搜索表单 | 做一个注册表单
  表单校验 | 表单验证 | 表单布局 | 表单容器
  万能表单 | 契约驱动表单 | 根据契约生成表单 | ERP 表单 | 动态表单 | schema 表单
---

# vue-form-skill

> **容器原则**：所有表单必须嵌入 `<base-card>`。无例外。  
> **零 HTML5 标签原则**：表单组件严禁使用原生 `<input>` `<select>` `<textarea>` 等标签。

Vue 表单体系技能，组装型技能，引用独立组件技能实现表单功能。

## 引用组件

| 独立技能 | 组件 | 说明 |
|----------|------|------|
| [vue-input-skill](../vue-input-skill/) | base-input | 输入框（文本/密码/搜索/文本域） |
| [vue-select-skill](../vue-select-skill/) | base-select | 选择器（单选/多选/搜索） |
| [vue-datepicker-skill](../vue-datepicker-skill/) | base-datepicker | 日期选择器 |
| [vue-checkbox-skill](../vue-checkbox-skill/) | base-checkbox | 复选框 |
| [vue-radio-skill](../vue-radio-skill/) | base-radio | 单选框 |
| [vue-switch-skill](../vue-switch-skill/) | base-switch | 开关 |
| [vue-upload-skill](../vue-upload-skill/) | base-upload | 上传 |
| base-form | 表单容器 | 数据管理/校验引擎/布局控制 |
| base-form-item | 表单项 | 标签/校验提示/必填标记 |
| base-form-render | 万能表单渲染器 | 契约驱动，自动生成表单 |

## 目录结构

```
vue-form-skill/
├── SKILL.md                   # 本文件（组装型入口）
├── base-form.md               # 表单容器
├── base-form-item.md          # 表单项
├── base-form-render.md       # 契约驱动渲染器
└── demo-components/          # 演示
```

> 注：其他组件已拆分为独立技能（vue-input-skill、vue-select-skill 等）

## 使用方式

### 基础表单

```vue
<template>
  <base-card title="用户信息">
    <base-form :model="form" :rules="rules">
      <base-form-item label="姓名" prop="name" required>
        <base-input v-model="form.name" placeholder="请输入姓名" />
      </base-form-item>
      <base-form-item label="邮箱" prop="email" required>
        <base-input v-model="form.email" placeholder="请输入邮箱" />
      </base-form-item>
      <base-form-item label="角色" prop="role">
        <base-select v-model="form.role" :options="roleOptions" placeholder="请选择角色" />
      </base-form-item>
    </base-form>
  </base-card>
</template>
```

### 契约驱动表单

```vue
<template>
  <base-card title="动态表单">
    <base-form-render :schema="formSchema" v-model="formData" />
  </base-card>
</template>

<script setup>
const formSchema = [
  { field: 'name', label: '姓名', type: 'input', required: true },
  { field: 'email', label: '邮箱', type: 'input', required: true },
  { field: 'birthday', label: '生日', type: 'datepicker' },
]
</script>
```

## 组件说明

### base-form

表单容器，提供数据管理、校验引擎、布局控制。

```vue
<base-form :model="formData" :rules="rules" label-width="80px">
  <!-- 表单项 -->
</base-form>
```

### base-form-item

表单项容器，提供标签、校验提示、必填标记。

```vue
<base-form-item label="用户名" prop="username" required error="请输入用户名">
  <base-input v-model="form.username" />
</base-form-item>
```

### base-form-render

根据 FormSchema 自动生成表单，一份契约同时驱动前端渲染与后端入参校验。

```typescript
interface FormSchema {
  field: string;      // 字段名
  label: string;      // 显示标签
  type: 'input' | 'select' | 'datepicker' | 'checkbox' | 'radio' | 'switch' | 'upload';
  required?: boolean;
  rules?: ValidationRule[];
  options?: { label: string; value: any }[];  // select/radio/checkbox 选项
  props?: Record<string, any>;  // 透传给组件
}
```

## 触发词

- "Vue 表单"
- "vue-form"
- "做一个表单"
- "表单校验"
- "万能表单"
- "契约驱动表单"
- "ERP 表单"
- "动态表单"
