<template>
  <div
    class="base-form-item"
    :class="[
      `base-form-item--${formContext?.layout ?? 'horizontal'}`,
      `base-form-item--${formContext?.size ?? 'md'}`,
      { 'base-form-item--error': validateState === 'error' },
    ]"
  >
    <div
      v-if="label || $slots.label"
      class="base-form-item__label"
      role="label"
      :style="labelStyle"
    >
      <span v-if="showRequiredMark" class="base-form-item__required">*</span>
      <slot name="label">{{ label }}</slot>
    </div>
    <div class="base-form-item__content">
      <slot />
      <div v-if="help && !validateMessage" class="base-form-item__help">{{ help }}</div>
      <div v-if="validateMessage && showMessage" class="base-form-item__error">{{ validateMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount, ref } from 'vue'
import {
  formContextKey,
  type BaseFormItemProps,
  type FormContext,
  type FormItemContext,
  type FormRule,
} from '../types'

const props = withDefaults(defineProps<BaseFormItemProps>(), {
  label: '',
  required: false,
  showMessage: true,
  help: '',
  error: '',
})

const formContext = inject<FormContext | null>(formContextKey, null)

const validateMessage = ref('')
const validateState = ref<'success' | 'error' | ''>('')

const showRequiredMark = computed(() => {
  if (formContext?.hideRequiredAsterisk) return false
  if (props.required) return true
  const rules = currentRules.value
  return rules.some((r) => r.required)
})

const currentRules = computed<FormRule[]>(() => {
  if (props.rules) return props.rules
  if (props.prop && formContext?.rules?.[props.prop]) return formContext.rules[props.prop]
  return []
})

const showMessage = computed(() => props.error === '' && (props.showMessage ?? formContext?.showMessage ?? true))

const labelStyle = computed(() => {
  const width = props.labelWidth ?? formContext?.labelWidth
  if (!width) return {}
  return {
    width: typeof width === 'number' ? `${width}px` : width,
    textAlign: (formContext?.labelAlign as 'left' | 'right') ?? 'right',
  }
})

function getValue(): unknown {
  if (!props.prop || !formContext) return undefined
  return formContext.model[props.prop]
}

function setValue(v: unknown): void {
  if (!props.prop || !formContext) return
  formContext.model[props.prop] = v
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.length === 0
  if (Array.isArray(value)) return value.length === 0
  return false
}

async function runRule(rule: FormRule, value: unknown): Promise<{ valid: boolean; message: string }> {
  if (rule.required && isEmpty(value)) {
    return { valid: false, message: rule.message ?? `${props.prop} 不能为空` }
  }
  if (rule.type === 'email' && typeof value === 'string' && value.length > 0) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    if (!ok) return { valid: false, message: rule.message ?? '邮箱格式不正确' }
  }
  if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
    return { valid: false, message: rule.message ?? `最少 ${rule.min} 个字符` }
  }
  if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
    return { valid: false, message: rule.message ?? `最多 ${rule.max} 个字符` }
  }
  if (rule.len !== undefined && typeof value === 'string' && value.length !== rule.len) {
    return { valid: false, message: rule.message ?? `长度必须为 ${rule.len}` }
  }
  if (rule.pattern && typeof value === 'string' && value.length > 0 && !rule.pattern.test(value)) {
    return { valid: false, message: rule.message ?? '格式不正确' }
  }
  if (rule.validator) {
    const r = await rule.validator(value, rule)
    if (r !== true) return { valid: false, message: typeof r === 'string' ? r : rule.message ?? '校验失败' }
  }
  return { valid: true, message: '' }
}

async function validate(): Promise<{ valid: boolean; message: string }> {
  if (props.error) {
    validateState.value = 'error'
    validateMessage.value = props.error
    return { valid: false, message: props.error }
  }
  if (!props.prop) return { valid: true, message: '' }
  const rules = currentRules.value
  if (rules.length === 0) {
    clearValidate()
    return { valid: true, message: '' }
  }
  const value = getValue()
  for (const rule of rules) {
    const result = await runRule(rule, value)
    if (!result.valid) {
      validateState.value = 'error'
      validateMessage.value = result.message
      return result
    }
  }
  validateState.value = 'success'
  validateMessage.value = ''
  return { valid: true, message: '' }
}

function resetField(): void {
  if (!props.prop || !formContext) return
  // ponytail: 不存 __defaults，重置为 undefined 即可，业务应在外部自行管理默认值。
  setValue(undefined)
  clearValidate()
}

function clearValidate(): void {
  validateState.value = ''
  validateMessage.value = ''
}

const itemContext: FormItemContext = { prop: props.prop, validate, resetField, clearValidate }

onMounted(() => {
  if (props.prop && formContext) {
    formContext.addField(itemContext)
  }
})

onBeforeUnmount(() => {
  if (props.prop && formContext) {
    formContext.removeField(itemContext)
  }
})
</script>

<style scoped>
.base-form-item {
  display: flex;
  align-items: flex-start;
  min-height: var(--height-input-md, 40px);
}

.base-form-item__label {
  flex-shrink: 0;
  padding-right: var(--space-3, 12px);
  font-size: var(--font-size-base, 14px);
  color: var(--color-text, #303133);
  line-height: var(--height-input-md, 40px);
  box-sizing: border-box;
}

.base-form-item__required {
  color: var(--color-danger, #f56c6c);
  margin-right: var(--space-1, 4px);
}

.base-form-item__content {
  flex: 1;
  min-width: 0;
}

.base-form-item__help {
  margin-top: var(--space-1, 4px);
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-placeholder, #909399);
}

.base-form-item__error {
  margin-top: var(--space-1, 4px);
  font-size: var(--font-size-xs, 12px);
  color: var(--color-danger, #f56c6c);
}

.base-form-item--vertical {
  flex-direction: column;
}
.base-form-item--vertical .base-form-item__label {
  text-align: left;
  padding-right: 0;
  margin-bottom: var(--space-1, 4px);
  width: auto;
  line-height: 1.5;
}

.base-form-item--inline {
  align-items: center;
}

.base-form-item--error :deep([role="textbox"]) {
  border-color: var(--color-danger, #f56c6c);
}
</style>
