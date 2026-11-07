# base-form-item

> 表单项容器。负责标签显示、校验提示、必填标记。
>
> 必须作为 `<base-form>` 的直接子组件。

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` | `''` | 标签文本 |
| `prop` | `string` | `undefined` | 对应 model 的 key，用于校验联动 |
| `required` | `boolean` | `false` | 必填标记（星号），优先级高于 rules |
| `rules` | `FormRule[]` | `undefined` | 单项校验规则，覆盖 form 级 rules |
| `labelWidth` | `string \| number` | `undefined` | 覆盖 form 级 labelWidth |
| `help` | `string` | `''` | 帮助文本（灰色提示） |
| `error` | `string` | `''` | 外部错误信息（跳过校验引擎） |
| `showMessage` | `boolean` | `true` | 是否显示校验错误信息 |

## 事件 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `validate` | `{ valid: boolean, message: string }` | 校验完成 |

## 类型定义

```typescript
interface FormItemContext {
  prop?: string
  validate: () => Promise<{ valid: boolean; message: string }>
  resetField: () => void
  clearValidate: () => void
}
```

## 实现要点

### 1. 注入 FormContext 并注册

```typescript
import { inject, onMounted, onUnmounted, ref, computed } from 'vue'
import { formContextKey } from './injection-symbols'

const form = inject(formContextKey)

const validateMessage = ref('')
const validateState = ref<'success' | 'error' | ''>('')

const isRequired = computed(() => {
  if (props.required) return true
  const rules = props.rules ?? form?.rules?.[props.prop] ?? []
  return rules.some(r => r.required)
})

onMounted(() => {
  if (props.prop) {
    form?.addField({ prop: props.prop, validate, resetField, clearValidate })
  }
})

onUnmounted(() => {
  if (props.prop) {
    form?.removeField({ prop: props.prop, validate, resetField, clearValidate })
  }
})
```

### 2. 校验方法

```typescript
async function validate(): Promise<{ valid: boolean; message: string }> {
  if (!props.prop) return { valid: true, message: '' }

  const rules = props.rules ?? form?.rules?.[props.prop] ?? []
  if (rules.length === 0) return { valid: true, message: '' }

  const value = getNestedValue(form?.model, props.prop)

  for (const rule of rules) {
    const result = await runRule(rule, value, props.prop)
    if (!result.valid) {
      validateState.value = 'error'
      validateMessage.value = result.message
      form?.emit('validate', { prop: props.prop, valid: false, message: result.message })
      return result
    }
  }

  validateState.value = 'success'
  validateMessage.value = ''
  form?.emit('validate', { prop: props.prop, valid: true, message: '' })
  return { valid: true, message: '' }
}

function resetField() {
  if (!props.prop || !form?.model) return
  const defaultValue = getNestedValue(form.model.__defaults, props.prop)
  setNestedValue(form.model, props.prop, defaultValue)
  clearValidate()
}

function clearValidate() {
  validateState.value = ''
  validateMessage.value = ''
}
```

### 3. 渲染结构

```vue
<template>
  <div
    class="base-form-item"
    :class="[
      `base-form-item--${form?.layout}`,
      `base-form-item--${form?.size}`,
      {
        'base-form-item--error': validateState === 'error',
        'base-form-item--required': isRequired,
      },
    ]"
  >
    <!-- 标签（无原生 label，用 div + ARIA） -->
    <div
      v-if="label || $slots.label"
      class="base-form-item__label"
      role="label"
      :style="{ width: computedLabelWidth, textAlign: form?.labelAlign }"
    >
      <span v-if="isRequired" class="base-form-item__required">*</span>
      <slot name="label">{{ label }}</slot>
    </div>

    <!-- 内容区 -->
    <div class="base-form-item__content">
      <slot />

      <!-- 帮助文本 -->
      <div v-if="help && !validateMessage" class="base-form-item__help">
        {{ help }}
      </div>

      <!-- 校验错误信息 -->
      <div v-if="validateMessage && showMessage" class="base-form-item__error">
        {{ validateMessage }}
      </div>
    </div>
  </div>
</template>
```

### 4. 样式

```vue
<style scoped>
.base-form-item {
  display: flex;
  align-items: flex-start;
  min-height: var(--height-input-md); /* 40px */
}

.base-form-item__label {
  flex-shrink: 0;
  padding-right: var(--space-3);
  font-size: var(--font-base);
  color: var(--color-text-primary);
  line-height: var(--height-input-md);
  box-sizing: border-box;
}

.base-form-item__required {
  color: var(--color-danger);
  margin-right: var(--space-1);
}

.base-form-item__content {
  flex: 1;
  min-width: 0;
}

.base-form-item__help {
  margin-top: var(--space-1);
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}

.base-form-item__error {
  margin-top: var(--space-1);
  font-size: var(--font-xs);
  color: var(--color-danger);
  line-height: var(--leading-snug);
}

/* 错误态：输入框边框变红 */
.base-form-item--error :deep(.base-input__input),
.base-form-item--error :deep(.base-select__trigger),
.base-form-item--error :deep(.base-textarea__input) {
  border-color: var(--color-danger);
}

.base-form-item--error :deep(.base-input__input:focus),
.base-form-item--error :deep(.base-select__trigger:focus),
.base-form-item--error :deep(.base-textarea__input:focus) {
  box-shadow: 0 0 0 3px var(--color-danger-light);
}

/* vertical 布局 */
.base-form-item--vertical {
  flex-direction: column;
}

.base-form-item--vertical .base-form-item__label {
  text-align: left;
  padding-right: 0;
  margin-bottom: var(--space-1);
  width: auto;
  line-height: var(--leading-normal);
}

/* inline 布局 */
.base-form-item--inline {
  align-items: center;
}

.base-form-item--inline .base-form-item__content {
  display: flex;
  align-items: center;
}
</style>
```

### 5. 校验触发时机

```typescript
// 监听 model 变化，自动校验（trigger: 'change'）
watch(
  () => getNestedValue(form?.model, props.prop),
  () => {
    const rules = props.rules ?? form?.rules?.[props.prop] ?? []
    if (rules.some(r => r.trigger === 'change')) {
      validate()
    }
  }
)
```

### 6. 容器原则

```vue
<!-- 正确：base-form-item 在 base-form 内部 -->
<base-card title="用户信息">
  <base-form :model="form" :rules="rules">
    <base-form-item label="姓名" prop="name" required>
      <base-input v-model="form.name" />
    </base-form-item>
  </base-form>
</base-card>

<!-- 错误：base-form-item 游离 -->
<base-card title="用户信息">
  <base-form-item label="姓名" required>
    <base-input v-model="form.name" />
  </base-form-item>
</base-card>
```
