import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react'
import { validateField as runValidateField, ValidationRule as CommonValidationRule } from '../common/validators'
import './form.css'

// 表单验证规则（复用通用规则类型）
export interface ValidationRule extends CommonValidationRule {}

// 表单字段
export interface FormField {
  name: string
  value: any
  error?: string
  rules?: ValidationRule[]
}

// 表单上下文
interface FormContextType {
  model: Record<string, any>
  rules?: Record<string, ValidationRule[]>
  labelWidth?: string | number
  labelPosition?: 'left' | 'top'
  variant?: 'default' | 'filled' | 'outline'
  registerField: (name: string, field: FormField) => void
  unregisterField: (name: string) => void
  validateField: (name: string) => Promise<boolean>
  validateAll: () => Promise<boolean>
  clearValidate: (names?: string[]) => void
  resetFields: (names?: string[]) => void
  setFieldValue: (name: string, value: any) => void
  getFieldValue: (name: string) => any
}

const FormContext = createContext<FormContextType | null>(null)

// 表单 Props
export interface FormProps {
  children: ReactNode
  model: Record<string, any>
  rules?: Record<string, ValidationRule[]>
  labelWidth?: string | number
  labelPosition?: 'left' | 'top'
  /** 表单风格：default-默认线条 | filled-填充背景 | outline-粗边框 */
  variant?: 'default' | 'filled' | 'outline'
  /** 表单值变化回调 */
  onChange?: (model: Record<string, any>) => void
  onValidate?: (valid: boolean) => void
}

// 表单组件
export default function Form({
  children,
  model,
  rules = {},
  labelWidth = 80,
  labelPosition = 'top',
  variant = 'default',
  onChange,
  onValidate
}: FormProps) {
  // 内部维护一份 model 副本，避免直接修改 props
  const [formModel, setFormModel] = useState<Record<string, any>>(() => ({ ...model }))
  const [fields, setFields] = useState<Map<string, FormField>>(new Map())

  // 当外部 model 变化时同步内部状态
  useEffect(() => {
    setFormModel(prev => {
      const next = { ...model }
      // 保留已有字段的旧值，避免输入时外部重新渲染导致光标跳动
      fields.forEach((field, name) => {
        if (name in next && name in prev) {
          next[name] = prev[name]
        }
      })
      return next
    })
  }, [model, fields])

  // 注册字段
  const registerField = useCallback((name: string, field: FormField) => {
    setFields(prev => {
      const next = new Map(prev)
      next.set(name, { ...field, name, value: formModel[name] })
      return next
    })
  }, [formModel])

  // 注销字段
  const unregisterField = useCallback((name: string) => {
    setFields(prev => {
      const next = new Map(prev)
      next.delete(name)
      return next
    })
  }, [])

  // 统一更新 model 并通知外部
  const updateModel = useCallback((updater: (prev: Record<string, any>) => Record<string, any>) => {
    setFormModel(prev => {
      const next = updater(prev)
      onChange?.(next)
      return next
    })
  }, [onChange])

  // 设置字段值
  const setFieldValue = useCallback((name: string, value: any) => {
    updateModel(prev => ({ ...prev, [name]: value }))
  }, [updateModel])

  // 获取字段值
  const getFieldValue = useCallback((name: string) => {
    return formModel[name]
  }, [formModel])

  // 验证单个字段（复用通用校验逻辑）
  const validateField = useCallback(async (name: string): Promise<boolean> => {
    const field = fields.get(name)
    if (!field) return true

    const fieldRules = rules[name] || field.rules || []
    const value = formModel[name]

    const error = await runValidateField(value, fieldRules, formModel)

    setFields(prev => {
      const next = new Map(prev)
      const f = next.get(name)
      if (f) next.set(name, { ...f, error: error || undefined })
      return next
    })

    return error === null
  }, [fields, formModel, rules])

  // 验证所有字段
  const validateAll = useCallback(async (): Promise<boolean> => {
    const promises = Array.from(fields.keys()).map(name => validateField(name))
    const results = await Promise.all(promises)
    const valid = results.every(r => r)
    onValidate?.(valid)
    return valid
  }, [fields, validateField, onValidate])

  // 清除验证
  const clearValidate = useCallback((names?: string[]) => {
    setFields(prev => {
      const next = new Map(prev)
      const targetNames = names || Array.from(prev.keys())

      targetNames.forEach(name => {
        const f = next.get(name)
        if (f) next.set(name, { ...f, error: undefined })
      })

      return next
    })
  }, [])

  // 重置表单
  const resetFields = useCallback((names?: string[]) => {
    const targetNames = names || Object.keys(formModel)

    updateModel(prev => {
      const next = { ...prev }
      targetNames.forEach(name => {
        if (name in next) {
          next[name] = ''
        }
      })
      return next
    })

    clearValidate(targetNames)
  }, [formModel, updateModel, clearValidate])

  const contextValue = useMemo(() => ({
    model: formModel,
    rules,
    labelWidth,
    labelPosition,
    variant,
    registerField,
    unregisterField,
    validateField,
    validateAll,
    clearValidate,
    resetFields,
    setFieldValue,
    getFieldValue
  }), [formModel, rules, labelWidth, labelPosition, variant, registerField, unregisterField, validateField, validateAll, clearValidate, resetFields, setFieldValue, getFieldValue])

  return (
    <FormContext.Provider value={contextValue}>
      <div className={`t-form t-form--${variant}`}>{children}</div>
    </FormContext.Provider>
  )
}

// 使用表单上下文的 Hook
export function useForm() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useForm must be used within a Form component')
  }
  return context
}

// 导出 FormItem 组件
export { FormItem } from './form-item'
export { Input } from './input'
