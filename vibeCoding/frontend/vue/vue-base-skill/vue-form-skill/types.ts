/**
 * vue-form-skill 类型单一事实源
 *
 * 为什么单独抽出？
 * Vue 3 SFC 规则：<script setup> 不能包含 ES module exports（除 defineExpose）。
 * 原 6 个 .vue 文件都把 export interface / export const 写在 <script setup> 里，
 * 触发 compiler-sfc 编译错误。所有类型抽到本文件，由 .vue 用 import type 引入。
 */

// ───────────────────────── FormRule & Context ─────────────────────────

export interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  type?: 'string' | 'number' | 'email' | 'url' | 'array'
  validator?: (value: unknown, rule: FormRule) => boolean | string | Promise<boolean | string>
}

export interface FormItemContext {
  prop?: string
  validate: () => Promise<{ valid: boolean; message: string }>
  resetField: () => void
  clearValidate: () => void
}

export interface FormContext {
  model: Record<string, unknown>
  rules: Record<string, FormRule[]>
  layout: 'horizontal' | 'vertical' | 'inline'
  labelWidth: string
  labelAlign: 'left' | 'right'
  disabled: boolean
  readonly: boolean
  showMessage: boolean
  size: 'sm' | 'md' | 'lg'
  fields: FormItemContext[]
  validate: () => Promise<boolean>
  validateField: (props: string | string[]) => Promise<boolean>
  resetFields: (props?: string | string[]) => void
  clearValidate: (props?: string | string[]) => void
  addField: (field: FormItemContext) => void
  removeField: (field: FormItemContext) => void
}

export const formContextKey = Symbol('base-form-context')

// ───────────────────────── Props 类型 ─────────────────────────

export interface BaseFormProps {
  model: Record<string, unknown>
  rules?: Record<string, FormRule[]>
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  labelAlign?: 'left' | 'right'
  disabled?: boolean
  readonly?: boolean
  hideRequiredAsterisk?: boolean
  showMessage?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface BaseFormItemProps {
  label?: string
  prop?: string
  required?: boolean
  rules?: FormRule[]
  labelWidth?: string | number
  help?: string
  error?: string
  showMessage?: boolean
}

export interface BaseFormField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select' | 'switch' | 'checkbox' | 'radio' | 'datepicker' | 'upload' | 'custom'
  required?: boolean
  placeholder?: string
  options?: { label: string; value: unknown }[]
  rules?: FormRule[]
  disabled?: boolean
  readonly?: boolean
  help?: string
  span?: number
  props?: Record<string, unknown>
}

export interface BaseFormRenderProps {
  modelValue?: Record<string, unknown>
  fields: BaseFormField[]
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: string | number
  labelAlign?: 'left' | 'right'
  disabled?: boolean
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface BaseInputProps {
  modelValue?: string | number
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  maxlength?: number
  error?: boolean
}

export interface BaseSelectOption {
  label: string
  value: unknown
}

export interface BaseSelectProps {
  modelValue?: unknown
  options?: BaseSelectOption[]
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface BaseTextareaProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
  maxlength?: number
  size?: 'sm' | 'md' | 'lg'
}