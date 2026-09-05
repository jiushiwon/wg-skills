# base-form

> 表单容器。负责数据管理、校验引擎、布局控制。
>
> **必须被 `<base-card>` 包裹。**

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `model` | `Record<string, unknown>` | **必填** | 表单数据模型 |
| `rules` | `Record<string, FormRule[]>` | `undefined` | 校验规则，key 对应 model 的字段名 |
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` | 布局模式 |
| `labelWidth` | `string \| number` | `'100px'` | 标签宽度，horizontal 模式生效 |
| `labelAlign` | `'left' \| 'right'` | `'right'` | 标签文本对齐 |
| `disabled` | `boolean` | `false` | 全局禁用 |
| `readonly` | `boolean` | `false` | 全局只读 |
| `hideRequiredAsterisk` | `boolean` | `false` | 隐藏必填星号 |
| `showMessage` | `boolean` | `true` | 是否显示校验错误信息 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 统一尺寸 |

## 方法 Methods

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `validate` | `(callback?)` | `Promise<boolean>` | 校验全部字段 |
| `validateField` | `(props: string \| string[], callback?)` | `Promise<boolean>` | 校验指定字段 |
| `resetFields` | `(props?: string \| string[])` | `void` | 重置字段值和校验状态 |
| `clearValidate` | `(props?: string \| string[])` | `void` | 清除校验状态 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `validate` | `{ prop: string, valid: boolean, message: string }` | 单字段校验完成 |

## 类型定义

```typescript
interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  type?: 'string' | 'number' | 'boolean' | 'array' | 'date' | 'url' | 'email'
  validator?: (value: unknown, rule: FormRule) => boolean | string | Promise<boolean | string>
}

interface FormContext {
  model: Record<string, unknown>
  rules: Record<string, FormRule[]>
  layout: 'horizontal' | 'vertical' | 'inline'
  labelWidth: string
  labelAlign: 'left' | 'right'
  disabled: boolean
  readonly: boolean
  showMessage: boolean
  size: 'sm' | 'md' | 'lg'
  // 方法
  validate: () => Promise<boolean>
  validateField: (props: string | string[]) => Promise<boolean>
  resetFields: (props?: string | string[]) => void
  clearValidate: (props?: string | string[]) => void
  // 内部（FormItem 注册/注销）
  addField: (field: FormItemContext) => void
  removeField: (field: FormItemContext) => void
}
```

## 实现要点

### 1. 提供 FormContext

```typescript
import { provide, reactive, toRefs } from 'vue'
import { formContextKey } from './injection-symbols'

const props = withDefaults(defineProps<BaseFormProps>(), {
  layout: 'horizontal',
  labelWidth: '100px',
  labelAlign: 'right',
  disabled: false,
  readonly: false,
  hideRequiredAsterisk: false,
  showMessage: true,
  size: 'md',
})

const fields = reactive<FormItemContext[]>([])

const context: FormContext = reactive({
  ...toRefs(props),
  addField(field) { fields.push(field) },
  removeField(field) {
    const idx = fields.indexOf(field)
    if (idx > -1) fields.splice(idx, 1)
  },
  async validate() { /* ... */ },
  async validateField(props) { /* ... */ },
  resetFields(props) { /* ... */ },
  clearValidate(props) { /* ... */ },
})

provide(formContextKey, context)
```

### 2. 校验引擎

```typescript
// 使用 async-validator 风格的校验（自行实现，不引入第三方）
async function validateField(prop: string): Promise<{ valid: boolean; message: string }> {
  const value = getNestedValue(props.model, prop)
  const rules = props.rules?.[prop] ?? []

  for (const rule of rules) {
    // required 校验
    if (rule.required && isEmpty(value)) {
      return { valid: false, message: rule.message ?? `${prop} 不能为空` }
    }
    // min/max 校验
    if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
      return { valid: false, message: rule.message ?? `最少 ${rule.min} 个字符` }
    }
    // pattern 校验
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return { valid: false, message: rule.message ?? '格式不正确' }
    }
    // 自定义校验器
    if (rule.validator) {
      const result = await rule.validator(value, rule)
      if (result !== true) {
        return { valid: false, message: typeof result === 'string' ? result : rule.message ?? '校验失败' }
      }
    }
  }
  return { valid: true, message: '' }
}
```

### 3. 布局渲染

```vue
<template>
  <!-- 零 HTML5 标签：用 div + 事件冒泡代替原生表单提交 -->
  <div
    class="base-form"
    :class="[
      `base-form--${layout}`,
      `base-form--${size}`,
      { 'base-form--disabled': disabled },
    ]"
    role="form"
    @keydown.enter.prevent="handleEnterSubmit"
  >
    <slot />
  </div>
</template>

<style scoped>
.base-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4); /* 16px，表单项间距 */
}

.base-form--horizontal {
  /* label 左侧，input 右侧 */
}

.base-form--vertical {
  flex-direction: column;
}

.base-form--vertical :deep(.base-form-item) {
  flex-direction: column;
}

.base-form--vertical :deep(.base-form-item__label) {
  text-align: left;
  margin-bottom: var(--space-1);
  width: auto;
}

.base-form--inline {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-4);
}

.base-form--inline :deep(.base-form-item) {
  margin-bottom: 0;
}

.base-form--disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
```

### 4. 容器原则

```vue
<!-- 正确 -->
<base-card title="搜索条件">
  <base-form :model="searchForm" layout="inline">
    <base-form-item label="关键词">
      <base-input v-model="searchForm.keyword" />
    </base-form-item>
    <base-form-item>
      <base-button type="primary" @click="handleSearch">搜索</base-button>
    </base-form-item>
  </base-form>
</base-card>

<!-- 错误 -->
<base-form :model="searchForm">
  <base-form-item label="关键词">
    <base-input v-model="searchForm.keyword" />
  </base-form-item>
</base-form>
```
