<template>
  <!-- ponytail: 用真正的 <form> 替代 <div role="form">，
       让 button native-type="submit" 点击触发 @submit 事件；
       @submit.prevent 自动阻止浏览器默认 form GET 到当前 URL 的行为。
       onEnter 仍然保留：base-input 用 role="textbox" 模拟输入，
       原生 form 不会响应 role="textbox" 的 Enter，必须手动调 doSubmit。-->
  <form
    ref="formRef"
    class="base-form"
    :class="[
      `base-form--${layout}`,
      `base-form--${size}`,
      { 'base-form--disabled': disabled },
    ]"
    @submit.prevent="doSubmit"
    @keydown.enter="onEnter"
  >
    <slot />
  </form>
</template>

<script setup lang="ts">
import { reactive, provide, ref } from 'vue'
import {
  formContextKey,
  type BaseFormProps,
  type FormContext,
  type FormItemContext,
  type FormRule,
} from '../types'

const props = withDefaults(defineProps<BaseFormProps>(), {
  rules: () => ({}),
  layout: 'horizontal',
  labelWidth: '100px',
  labelAlign: 'right',
  disabled: false,
  readonly: false,
  hideRequiredAsterisk: false,
  showMessage: true,
  size: 'md',
})

const emit = defineEmits<{
  submit: [values: Record<string, unknown>]
  validate: [payload: { prop: string; valid: boolean; message: string }]
  reset: []
}>()

// ponytail: 通过 provide 提供 FormContext,BaseFormItem 通过 inject 获取。fields 数组由 BaseFormItem 在 onMounted 注册。
const fields = reactive<FormItemContext[]>([])

function addField(field: FormItemContext): void {
  fields.push(field)
}

function removeField(field: FormItemContext): void {
  const idx = fields.indexOf(field)
  if (idx > -1) fields.splice(idx, 1)
}

function normalizeLabelWidth(v: string | number): string {
  return typeof v === 'number' ? `${v}px` : v
}

const context: FormContext = reactive({
  model: props.model,
  rules: props.rules,
  layout: props.layout,
  labelWidth: normalizeLabelWidth(props.labelWidth),
  labelAlign: props.labelAlign,
  disabled: props.disabled,
  readonly: props.readonly,
  showMessage: props.showMessage,
  size: props.size,
  fields,
  validate,
  validateField,
  resetFields,
  clearValidate,
  addField,
  removeField,
})

provide(formContextKey, context)

async function validate(): Promise<boolean> {
  if (fields.length === 0) return true
  const results = await Promise.all(fields.map((f) => f.validate()))
  return results.every((r) => r.valid)
}

async function validateField(propsName: string | string[]): Promise<boolean> {
  const names = Array.isArray(propsName) ? propsName : [propsName]
  const targets = fields.filter((f) => f.prop && names.includes(f.prop))
  if (targets.length === 0) return true
  const results = await Promise.all(targets.map((f) => f.validate()))
  return results.every((r) => r.valid)
}

function resetFields(propsName?: string | string[]): void {
  const names = propsName ? (Array.isArray(propsName) ? propsName : [propsName]) : null
  fields
    .filter((f) => !names || (f.prop && names.includes(f.prop)))
    .forEach((f) => f.resetField())
  emit('reset')
}

function clearValidate(propsName?: string | string[]): void {
  const names = propsName ? (Array.isArray(propsName) ? propsName : [propsName]) : null
  fields
    .filter((f) => !names || (f.prop && names.includes(f.prop)))
    .forEach((f) => f.clearValidate())
}

const formRef = ref<HTMLElement | null>(null)

function onEnter(e: KeyboardEvent): void {
  const target = e.target as HTMLElement
  if (target.getAttribute('role') !== 'textbox') return
  if (target.getAttribute('role') === 'textbox' && target.getAttribute('data-multiline') === 'true') return
  e.preventDefault()
  doSubmit()
}

async function doSubmit(): Promise<void> {
  const valid = await validate()
  if (valid) {
    emit('submit', JSON.parse(JSON.stringify(props.model)))
  }
}

void formRef
</script>

<style scoped>
.base-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
  width: 100%;
}

.base-form--vertical {
  flex-direction: column;
}

.base-form--inline {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-3, 12px);
}

.base-form--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.base-form--sm :deep(.base-form-item) { font-size: var(--font-size-sm, 14px); }
.base-form--lg :deep(.base-form-item) { font-size: var(--font-size-base, 16px); }
</style>
