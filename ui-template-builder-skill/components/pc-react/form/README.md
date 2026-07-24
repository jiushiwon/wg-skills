# Form 表单组件

React 表单组件，包含表单容器、表单项、输入框等，支持受控模式。

## 安装

```tsx
import Form, { FormItem, Input } from './form'
import './form.css'
```

## 组件列表

| 组件 | 说明 |
|------|------|
| Form | 表单容器 |
| FormItem | 表单项 |
| Input | 文本输入 |

## Form Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | - | 表单内容 |
| model | object | 必填 | 表单数据对象 |
| rules | object | {} | 验证规则 |
| labelWidth | string/number | 80 | 标签宽度 |
| labelPosition | 'left'/'top' | 'top' | 标签位置 |
| onValidate | (valid: boolean) => void | - | 验证完成回调 |

## Form Methods

通过 ref 调用：

```tsx
const formRef = useRef<{ validate: () => Promise<boolean> }>(null)

// 验证
await formRef.current?.validate()

// 重置
formRef.current?.resetFields()
```

## FormItem Props

| 属性 | 类型 | 说明 |
|------|------|------|
| label | string | 标签文字 |
| name | string | 字段名 |
| rules | ValidationRule[] | 验证规则 |

## Input Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | string/number | - | 绑定值 |
| onChange | (value: string) => void | - | 值变化回调 |
| name | string | - | 字段名（受控模式） |
| placeholder | string | - | 占位符 |
| disabled | boolean | false | 禁用 |
| clearable | boolean | false | 可清空 |
| error | boolean | false | 错误状态 |

## 验证规则

```typescript
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { type: 'phone', message: '请输入正确的手机号', trigger: 'blur' }
  ]
}
```

| 规则 | 说明 |
|------|------|
| required | 必填 |
| min | 最小长度 |
| max | 最大长度 |
| type: 'email' | 邮箱格式 |
| type: 'phone' | 手机号格式 |
| type: 'url' | URL 格式 |
| pattern | 正则验证 |
| validator | 自定义同步验证 |
| asyncValidator | 自定义异步验证 |

## 使用示例

### 基础表单

```tsx
import { useState, useRef } from 'react'
import Form, { FormItem, Input } from './form'

function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const valid = await formRef.current?.validate()
    if (valid) {
      console.log('提交成功', formData)
    }
  }

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Form model={formData} rules={rules}>
      <FormItem label="用户名" name="username">
        <Input
          value={formData.username}
          onChange={(value) => handleChange('username', value)}
          placeholder="请输入用户名"
        />
      </FormItem>
      <FormItem label="密码" name="password">
        <Input
          type="password"
          value={formData.password}
          onChange={(value) => handleChange('password', value)}
          placeholder="请输入密码"
        />
      </FormItem>
      <button onClick={handleSubmit}>提交</button>
    </Form>
  )
}
```

### 带验证

```tsx
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

<Form model={formData} rules={rules} labelPosition="top">
  <FormItem label="用户名" name="username">
    <Input placeholder="请输入用户名" />
  </FormItem>
  <FormItem label="邮箱" name="email">
    <Input placeholder="请输入邮箱" />
  </FormItem>
</Form>
```

### 带清空按钮

```tsx
<FormItem label="用户名" name="username">
  <Input
    value={formData.username}
    onChange={(value) => handleChange('username', value)}
    placeholder="请输入用户名"
    clearable
  />
</FormItem>
```

### 标签在左侧

```tsx
<Form model={formData} labelWidth={80} labelPosition="left">
  <FormItem label="用户名" name="username">
    <Input />
  </FormItem>
</Form>
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
  --color-primary-light: #666666;
  --color-error: #ef4444;
  --primary-50: #f9fafb;
  --radius-input: 8px;
  --shadow-popup: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```
