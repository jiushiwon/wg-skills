# Form 表单组件

通用表单组件，包含表单容器、表单项、输入框、下拉选择等。

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| Form | form.vue | 表单容器 |
| FormItem | form-item.vue | 表单项（带校验） |
| Input | input.vue | 文本输入 |
| Select | select.vue | 下拉选择 |

## Form Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| model | Object | 必填 | 表单数据对象 |
| rules | Object | {} | 表单验证规则 |
| labelWidth | String | '80px' | 标签宽度 |
| labelPosition | String | 'left' | 标签位置 left/top |

## Form Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| validate | valid | 验证完成事件 |

## Form Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| validate | - | 验证所有字段 |
| validateField | prop | 验证单个字段 |
| clearValidate | props | 清除验证 |
| resetFields | - | 重置表单 |

## FormItem Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | String | '' | 标签文字 |
| prop | String | '' | 对应字段名 |
| rules | Array | [] | 验证规则 |

## 支持的验证规则

| 规则 | 说明 |
|------|------|
| required | 必填 |
| min | 最小长度 |
| max | 最大长度 |
| type: 'email' | 邮箱格式 |
| type: 'phone' | 手机号格式 |
| validator | 自定义同步验证 |
| asyncValidator | 自定义异步验证 |

## Input Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | String | '' | 绑定值 |
| type | String | 'text' | 输入类型 |
| placeholder | String | '请输入' | 占位符 |
| disabled | Boolean | false | 禁用 |
| clearable | Boolean | false | 可清空 |
| maxlength | Number | -1 | 最大长度 |
| prefixIcon | String | '' | 前置图标 |
| suffixIcon | String | '' | 后置图标 |

## Select Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | String | '' | 绑定值 |
| options | Array | [] | 选项数组 |
| placeholder | String | '请选择' | 占位符 |
| disabled | Boolean | false | 禁用 |
| labelKey | String | 'label' | 显示字段 |
| valueKey | String | 'value' | 值字段 |

## 使用示例

### 基础表单

```vue
<template>
  <t-form ref="formRef" :model="formData" :rules="rules">
    <t-form-item label="用户名" prop="username">
      <t-input v-model="formData.username" placeholder="请输入用户名" />
    </t-form-item>
    <t-form-item label="邮箱" prop="email">
      <t-input v-model="formData.email" placeholder="请输入邮箱" />
    </t-form-item>
    <t-form-item label="城市" prop="city">
      <t-select v-model="formData.city" :options="cityOptions" />
    </t-form-item>
    <t-form-item>
      <t-button type="primary" @click="handleSubmit">提交</t-button>
    </t-form-item>
  </t-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import TForm from './form.vue'
import TFormItem from './form-item.vue'
import TInput from './input.vue'
import TSelect from './select.vue'
import TButton from '../button/button.vue'

const formRef = ref(null)

const formData = reactive({
  username: '',
  email: '',
  city: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  city: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ]
}

const cityOptions = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
]

async function handleSubmit() {
  const valid = await formRef.value.validate()
  if (valid) {
    console.log('提交成功', formData)
  }
}
</script>
```

### 带图标的输入框

```vue
<t-input
  v-model="username"
  placeholder="请输入用户名"
  prefix-icon="👤"
  clearable
/>
```

### 标签在上方

```vue
<t-form :model="formData" label-position="top">
  <t-form-item label="用户名" prop="username">
    <t-input v-model="formData.username" />
  </t-form-item>
</t-form>
```

## 样式变量

组件使用以下 CSS 变量：

```css
:root {
  --color-bg-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-placeholder: #9ca3af;
  --color-text-tertiary: #9ca3af;
  --color-primary: #333333;
  --color-error: #ef4444;
  --primary-50: #f9fafb;
  --radius-input: 8px;
  --shadow-popup: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```
