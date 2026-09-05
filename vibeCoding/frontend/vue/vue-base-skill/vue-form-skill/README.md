# vue-form-skill

> Vue 表单体系技能。8 个核心组件，覆盖 99% 业务表单场景。零第三方组件库。

## 容器原则（核心铁律）

> **所有表单必须由 base-card 包裹。无例外。**

## 🚫 零 HTML5 标签原则（.md 文档约束）

> **所有 `.md` 文档中的实现代码严禁使用 HTML5 原生标签**（`<input>` `<select>` `<textarea>` `<form>` `<label>` `<button>` 等）。
>
> **必须**：
> - 输入框 → `<div contenteditable>` + CSS3
> - 下拉选择 → `<div>` + 自定义面板 + CSS3
> - 复选框/单选框 → `<div role="checkbox|radio">` + CSS3
> - 开关 → `<div role="switch">` + CSS3
> - 表单 → `<div role="form">` + 事件冒泡
>
> **唯一例外**：`demo-components/**/*.html` Demo 文件允许使用 HTML5 标签（用于用户查看运行效果）。
>
> 完整规范见 [SKILL.md](./SKILL.md) → 「🚫 零 HTML5 标签铁律」。

## 组件列表（8 个）

| 组件 | 说明 | 文件 |
|------|------|------|
| base-form | 表单容器（数据管理、校验引擎、布局控制） | [base-form.md](base-form.md) |
| base-form-item | 表单项（标签、校验提示、必填标记） | [base-form-item.md](base-form-item.md) |
| base-input | 输入框（文本、密码、搜索、文本域） | [base-input.md](base-input.md) |
| base-select | 选择器（单选、多选、搜索过滤） | [base-select.md](base-select.md) |
| base-checkbox | 复选框（单个、复选组） | [base-checkbox.md](base-checkbox.md) |
| base-radio | 单选框（单选组） | [base-radio.md](base-radio.md) |
| base-switch | 开关 | [base-switch.md](base-switch.md) |
| base-datepicker | 日期选择器（日期、日期范围、月份、年份） | [base-datepicker.md](base-datepicker.md) |

## 设计 Token

所有组件统一引用 [vue-theme-skill](../../vue-theme-skill/)：
- `--color-*` / `--space-*` / `--font-*` / `--height-*` / `--radius-*` / `--weight-*` / `--leading-*`
- 命名严格对齐 uniapp-theme-skill / uniapp-form-skill

**禁止**：硬编码任何颜色、间距、字号、行高、圆角值。

## 第三方组件库

❌ 禁止使用 Element Plus / Naive UI / Ant Design Vue / Vuetify / PrimeVue 等。

## 快速开始

```vue
<template>
  <base-card title="用户信息">
    <base-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <base-form-item label="姓名" prop="name" required>
        <base-input v-model="form.name" placeholder="请输入姓名" />
      </base-form-item>

      <base-form-item label="邮箱" prop="email" required>
        <base-input v-model="form.email" placeholder="请输入邮箱" />
      </base-form-item>

      <base-form-item label="性别" prop="gender" required>
        <base-radio-group v-model="form.gender" :options="genderOptions" />
      </base-form-item>

      <base-form-item label="爱好" prop="hobbies">
        <base-checkbox-group v-model="form.hobbies" :options="hobbyOptions" />
      </base-form-item>

      <base-form-item label="状态" prop="status">
        <base-switch v-model="form.status" />
      </base-form-item>

      <base-form-item label="生日" prop="birthday">
        <base-datepicker v-model="form.birthday" />
      </base-form-item>

      <base-form-item>
        <base-button type="primary" @click="handleSubmit">提交</base-button>
        <base-button @click="handleReset">重置</base-button>
      </base-form-item>
    </base-form>
  </base-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const formRef = ref()

const form = reactive({
  name: '',
  email: '',
  gender: '',
  hobbies: [],
  status: false,
  birthday: null,
})

const rules = {
  name: [
    { required: true, message: '请输入姓名' },
    { min: 2, max: 20, message: '姓名需 2-20 个字符' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱' },
  ],
  gender: [
    { required: true, message: '请选择性别' },
  ],
}

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

const hobbyOptions = [
  { label: '阅读', value: 'reading' },
  { label: '运动', value: 'sports' },
  { label: '音乐', value: 'music' },
]

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('提交数据:', form)
  }
}

function handleReset() {
  formRef.value?.resetFields()
}
</script>
```

## 校验规则

详见 [references/validation-rules.md](references/validation-rules.md)

## 容器原则

所有表单必须嵌入 `<base-card>`。无例外。

```vue
<!-- 正确 -->
<base-card title="用户信息">
  <base-form :model="form">
    <base-form-item label="姓名" prop="name">
      <base-input v-model="form.name" />
    </base-form-item>
  </base-form>
</base-card>

<!-- 错误 -->
<base-form :model="form">
  <base-form-item label="姓名">
    <base-input v-model="form.name" />
  </base-form-item>
</base-form>
```

## 红线

- ❌ 禁止裸用 `<base-form>`（必须 `<base-card>` 包裹）
- ❌ 禁止裸色值 / 裸 px（必须 `var(--*)`）
- ❌ 禁止混入 Element Plus / 任何第三方表单组件
- ❌ 禁止用 `any` 类型
