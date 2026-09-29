<template>
  <BaseForm
    ref="formRef"
    v-model="model"
    :rules="computedRules"
    :layout="layout"
    :label-width="labelWidth"
    :label-align="labelAlign"
    :disabled="disabled"
    :readonly="readonly"
    :size="size"
    class="base-form-render"
    role="form"
    @submit="(v: Record<string, unknown>) => emit('submit', v)"
  >
    <template v-for="field in fields" :key="field.key">
      <slot :name="`field-${field.key}`" :field="field" :value="model[field.key]">
        <BaseFormItem
          :label="field.label"
          :prop="field.key"
          :required="field.required"
          :help="field.help"
          :style="gridStyle(field)"
        >
          <component
            :is="resolveComponent(field.type)"
            v-bind="resolveFieldProps(field)"
            :model-value="model[field.key]"
            @update:model-value="(v: unknown) => setField(field.key, v)"
          />
        </BaseFormItem>
      </slot>
    </template>

    <slot />
    <div v-if="$slots.footer" class="base-form-render__footer">
      <slot name="footer" />
    </div>
  </BaseForm>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseForm from './BaseForm.vue'
import BaseFormItem from './BaseFormItem.vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'
import BaseTextarea from './BaseTextarea.vue'
import type { BaseFormField, BaseFormRenderProps, FormRule } from '../types'

const props = withDefaults(defineProps<BaseFormRenderProps>(), {
  modelValue: () => ({}),
  layout: 'horizontal',
  labelWidth: '100px',
  labelAlign: 'right',
  disabled: false,
  readonly: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submit: [value: Record<string, unknown>]
  validate: [payload: { prop: string; valid: boolean; message: string }]
}>()

const model = ref<Record<string, unknown>>({ ...buildDefaults(), ...props.modelValue })

function buildDefaults(): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const f of props.fields) {
    obj[f.key] = f.type === 'select' ? null : ''
  }
  return obj
}

watch(model, (v) => emit('update:modelValue', { ...v }), { deep: true })
watch(
  () => props.modelValue,
  (v) => {
    model.value = { ...model.value, ...v }
  },
  { deep: true }
)

const computedRules = computed<Record<string, FormRule[]>>(() => {
  const result: Record<string, FormRule[]> = {}
  for (const f of props.fields) {
    const list: FormRule[] = []
    if (f.required) list.push({ required: true, message: `${f.label}不能为空`, trigger: 'change' })
    if (f.rules) list.push(...f.rules)
    if (list.length > 0) result[f.key] = list
  }
  return result
})

function resolveComponent(type: BaseFormField['type']): unknown {
  switch (type) {
    case 'textarea':
      return BaseTextarea
    case 'select':
      return BaseSelect
    case 'switch':
    case 'checkbox':
    case 'radio':
    case 'datepicker':
    case 'upload':
    case 'custom':
    case 'input':
    default:
      return BaseInput
  }
}

function resolveFieldProps(field: BaseFormField): Record<string, unknown> {
  const base: Record<string, unknown> = {
    placeholder: field.placeholder ?? `请输入${field.label}`,
    disabled: field.disabled,
    readonly: field.readonly,
    ...(field.props ?? {}),
  }
  if (field.type === 'select') {
    return { ...base, options: field.options ?? [] }
  }
  return base
}

function setField(key: string, value: unknown): void {
  model.value[key] = value
}

function gridStyle(field: BaseFormField): Record<string, string> {
  if (!field.span) return {}
  const width = (field.span / 24) * 100
  return { width: `${width}%` }
}

const formRef = ref<InstanceType<typeof BaseForm> | null>(null)

async function validate(): Promise<boolean> {
  return (await formRef.value?.validate()) ?? true
}

async function validateField(keys: string | string[]): Promise<boolean> {
  return (await formRef.value?.validateField(keys)) ?? true
}

function resetFields(keys?: string | string[]): void {
  formRef.value?.resetFields(keys)
}

function clearValidate(keys?: string | string[]): void {
  formRef.value?.clearValidate(keys)
}

function getModel(): Record<string, unknown> {
  return { ...model.value }
}

defineExpose({ validate, validateField, resetFields, clearValidate, getModel })
</script>

<style scoped>
.base-form-render {
  width: 100%;
}

.base-form-render__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3, 12px);
  margin-top: var(--space-4, 16px);
  padding-top: var(--space-4, 16px);
  border-top: 1px solid var(--color-border, #ebeef5);
}
</style>
