# base-form-render

> 契约驱动的万能表单渲染器。根据 `FormSchema`（契约）自动生成表单：数据模型、校验规则、表单 UI。
>
> 必须被 `<base-card>` 包裹。契约规范见 [references/form-contract.md](references/form-contract.md)。

## 定位

| 维度 | base-form | base-form-render |
|------|-----------|------------------|
| 驱动方式 | 手写模板 + 手写 rules | 契约（FormSchema）自动渲染 |
| 适用场景 | 定制交互、固定表单 | ERP / 后台 CRUD、动态字段 |
| 组件声明 | 手动写每个 base-form-item | 契约 fields 数组自动生成 |
| 校验规则 | 手写 rules | 契约 required/type 自动推导 |

> **一句话**：`base-form-render` 是 `base-form` + 各控件 + 校验规则推导器的「契约化封装」。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `Record<string, unknown>` | `{}` | 表单数据模型（v-model） |
| `schema` | `FormSchema` | **必填** | 表单契约 |
| `disabled` | `boolean` | `false` | 全局禁用（覆盖 schema.disabled） |
| `readonly` | `boolean` | `false` | 全局只读 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `Record<string, unknown>` | 数据变化 |
| `submit` | `Record<string, unknown>` | 回车/提交触发（校验通过后） |
| `validate` | `{ prop: string, valid: boolean, message: string }` | 单字段校验完成 |

## 方法 Methods

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `validate` | `(callback?)` | `Promise<boolean>` | 校验全部字段 |
| `validateField` | `(props: string \| string[])` | `Promise<boolean>` | 校验指定字段 |
| `resetFields` | `(props?: string \| string[])` | `void` | 重置为契约默认值 |
| `clearValidate` | `(props?: string \| string[])` | `void` | 清除校验状态 |
| `getModel` | `()` | `Record<string, unknown>` | 获取当前表单数据 |

## 插槽 Slots

| 插槽 | 说明 |
|------|------|
| `default` | 追加到契约字段之后的自定义区块 |
| `footer` | 底部操作区（提交/重置按钮） |
| `field-{prop}` | 覆盖某个字段的渲染（如 `#field-description`） |

## 类型定义

```typescript
import type { FormSchema, FormField, FieldType } from './references/form-contract'

interface BaseFormRenderProps {
  modelValue?: Record<string, unknown>
  schema: FormSchema
  disabled?: boolean
  readonly?: boolean
}

/** 字段类型 → 组件名映射 */
const COMPONENT_MAP: Record<FieldType, string> = {
  input: 'base-input',
  textarea: 'base-input',
  password: 'base-input',
  number: 'base-input',
  email: 'base-input',
  phone: 'base-input',
  idcard: 'base-input',
  select: 'base-select',
  radio: 'base-radio-group',
  checkbox: 'base-checkbox-group',
  switch: 'base-switch',
  datepicker: 'base-datepicker',
  upload: 'base-upload',
}

/** input 系字段 → base-input 的 type */
const INPUT_TYPE_MAP: Partial<Record<FieldType, string>> = {
  input: 'text',
  textarea: 'textarea',
  password: 'password',
}
```

## 实现要点

### 1. 自动生成 model 与 rules

```typescript
import { ref, computed, watch, provide } from 'vue'
import { buildModelFromSchema, deriveRules } from './references/form-contract'

const props = withDefaults(defineProps<BaseFormRenderProps>(), {
  modelValue: () => ({}),
  disabled: false,
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submit: [value: Record<string, unknown>]
  validate: [payload: { prop: string; valid: boolean; message: string }]
}>()

// 内部 model：初始化时用契约默认值填充，再覆盖外部传入的值
const model = ref<Record<string, unknown>>({
  ...buildModelFromSchema(props.schema),
  ...props.modelValue,
})

// 自动推导的校验规则
const rules = computed<Record<string, FormRule[]>>(() => {
  const result: Record<string, FormRule[]> = {}
  props.schema.fields.forEach((field) => {
    result[field.prop] = deriveRules(field)
  })
  return result
})

// 双向同步
watch(model, (val) => emit('update:modelValue', val), { deep: true })
watch(() => props.modelValue, (val) => { model.value = { ...model.value, ...val } }, { deep: true })
```

### 2. 渲染结构（动态分发）

```vue
<template>
  <!-- 零 HTML5 标签：用 div 承载，禁止原生 form -->
  <div
    class="base-form-render"
    :class="[
      `base-form-render--${schema.layout ?? 'horizontal'}`,
      `base-form-render--${schema.columns ?? 1}col`,
    ]"
    role="form"
    @keydown.enter.prevent="handleEnterSubmit"
  >
    <!-- 内部复用 base-form 提供校验引擎 -->
    <base-form
      ref="formRef"
      :model="model"
      :rules="rules"
      :layout="schema.layout ?? 'horizontal'"
      :label-width="schema.labelWidth ?? '100px'"
      :label-align="schema.labelAlign ?? 'right'"
      :disabled="disabled || schema.disabled"
      :readonly="readonly"
      :size="schema.size ?? 'md'"
    >
      <template v-for="field in schema.fields" :key="field.prop">
        <!-- 单个字段的专属覆盖插槽 -->
        <slot :name="`field-${field.prop}`" :field="field" :value="model[field.prop]">
          <base-form-item
            :label="field.label"
            :prop="field.prop"
            :required="field.required"
            :help="field.help"
            :style="gridStyle(field)"
          >
            <component
              :is="resolveComponent(field.type)"
              v-bind="resolveFieldProps(field)"
              :model-value="model[field.prop]"
              @update:model-value="(v) => setField(field.prop, v)"
            />
          </base-form-item>
        </slot>
      </template>

      <!-- 自定义追加区块 -->
      <slot />

      <!-- 底部操作区 -->
      <div v-if="$slots.footer" class="base-form-render__footer">
        <slot name="footer" />
      </div>
    </base-form>
  </div>
</template>
```

### 3. 组件分发与字段 Props 解析

```typescript
function resolveComponent(type: FieldType): string {
  return COMPONENT_MAP[type] ?? 'base-input'
}

function resolveFieldProps(field: FormField): Record<string, unknown> {
  const base = {
    placeholder: field.placeholder ?? `请输入${field.label}`,
    disabled: field.disabled,
    readonly: field.readonly,
  }

  switch (field.type) {
    case 'textarea':
      return { ...base, type: 'textarea', rows: field.rows ?? 4, maxlength: field.maxlength }
    case 'password':
      return { ...base, type: 'password', showPassword: true, maxlength: field.maxlength }
    case 'input':
      return { ...base, type: 'text', maxlength: field.maxlength }
    case 'number':
    case 'email':
    case 'phone':
    case 'idcard':
      // 数字/邮箱/手机号/身份证 都渲染为文本输入，校验由 rules 的 pattern 负责
      return { ...base, type: 'text', maxlength: field.maxlength }
    case 'select':
      return {
        ...base,
        options: field.options ?? [],
        multiple: field.multiple ?? false,
        searchable: field.searchable ?? false,
        clearable: true,
      }
    case 'radio':
    case 'checkbox':
      return { ...base, options: field.options ?? [] }
    case 'datepicker':
      return { ...base, type: field.dateType ?? 'date', clearable: true }
    case 'upload':
      return {
        ...base,
        maxCount: field.maxCount,
        accept: field.accept,
      }
    case 'switch':
      return { disabled: field.disabled }
    default:
      return base
  }
}

function setField(prop: string, value: unknown) {
  model.value[prop] = value
}

function gridStyle(field: FormField): Record<string, string> {
  const columns = props.schema.columns ?? 1
  if (columns <= 1 || !field.span) return {}
  const width = (field.span / 24) * 100
  return { width: `${width}%` }
}
```

### 4. 校验与提交

```typescript
const formRef = ref<InstanceType<typeof import('./base-form.vue')['default']>>()

async function validate(): Promise<boolean> {
  return formRef.value?.validate() ?? true
}

async function validateField(props: string | string[]): Promise<boolean> {
  return formRef.value?.validateField(props) ?? true
}

function resetFields(props?: string | string[]) {
  formRef.value?.resetFields(props)
}

function clearValidate(props?: string | string[]) {
  formRef.value?.clearValidate(props)
}

function getModel(): Record<string, unknown> {
  return { ...model.value }
}

function handleEnterSubmit() {
  // 回车触发提交（默认仅在有 footer 时）
}
```

### 5. 样式

```vue
<style scoped>
.base-form-render {
  width: 100%;
}

.base-form-render__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

/* 多列布局：字段按 span 横向排布 */
.base-form-render--2col :deep(.base-form) {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space-4);
}

.base-form-render--3col :deep(.base-form) {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space-4);
}
</style>
```

### 6. 容器原则

```vue
<!-- 正确：base-form-render 必须被 base-card 包裹 -->
<base-card title="新增商品">
  <base-form-render v-model="goodsForm" :schema="goodsSchema" />
</base-card>

<!-- 错误：游离的 base-form-render -->
<base-form-render v-model="goodsForm" :schema="goodsSchema" />
```

## 完整示例

```vue
<template>
  <base-card title="新增商品">
    <base-form-render
      ref="formRenderRef"
      v-model="goodsForm"
      :schema="goodsSchema"
    >
      <template #footer>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <base-button @click="handleReset">重置</base-button>
          <base-button type="primary" @click="handleSubmit">提交</base-button>
        </div>
      </template>
    </base-form-render>
  </base-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { goodsSchema } from '@/contracts/goods.contract'
import { createGoods } from '@/api/goods'

const formRenderRef = ref()
const goodsForm = ref<Record<string, unknown>>({})

async function handleSubmit() {
  const valid = await formRenderRef.value?.validate()
  if (!valid) return
  await createGoods(goodsForm.value)
}

function handleReset() {
  formRenderRef.value?.resetFields()
}
</script>
```

## 动态契约（字段由后端下发）

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get } from '@/api/request'
import type { FormSchema } from '@/components/form/types'

const schema = ref<FormSchema>({ fields: [] })
const form = ref<Record<string, unknown>>({})

onMounted(async () => {
  // 后端下发表单契约，前端动态渲染（ERP 常见：不同品类字段不同）
  const res = await get<FormSchema>('/form/schema?type=goods')
  schema.value = res.data
})
</script>

<template>
  <base-card title="动态表单">
    <base-form-render v-model="form" :schema="schema" />
  </base-card>
</template>
```

## 红线

- ❌ 禁止游离使用（必须 `<base-card>` 包裹）
- ❌ 禁止在 `base-form-render` 内手写校验规则（由契约自动推导，自定义走 `field.rules`）
- ❌ 禁止 `any` 类型
- ❌ 禁止引入第三方表单库（动态组件分发只用本技能体系的 `base-*` 组件）
