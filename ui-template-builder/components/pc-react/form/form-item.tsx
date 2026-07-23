import React, { useEffect, useContext, ReactNode } from 'react'
import { FormContext } from './form'

interface FormItemProps {
  children: ReactNode
  label?: string
  name?: string
  rules?: any[]
}

// 表单项组件
export function FormItem({ children, label, name, rules = [] }: FormItemProps) {
  const form = useContext(FormContext)

  if (!form) {
    throw new Error('FormItem must be used within a Form component')
  }

  // 注册字段
  useEffect(() => {
    if (name) {
      form.registerField(name, {
        name,
        value: form.model[name],
        rules
      })

      return () => {
        form.unregisterField(name)
      }
    }
  }, [name, form])

  // 获取错误信息
  const error = name ? (form as any).fields?.get(name)?.error : undefined

  const labelWidth = form.labelWidth
  const labelPosition = form.labelPosition || 'top'
  const variant = form.variant || 'default'

  const labelStyle = labelPosition === 'left'
    ? { width: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth }
    : {}

  const isRequired = rules.some((r: any) => r.required)

  return (
    <div className={`t-form-item t-form-item--${labelPosition} t-form-item--${variant}`}>
      {label && (
        <label className="t-form-item__label" style={labelStyle}>
          <span className={`t-form-item__label-text ${isRequired ? 't-form-item__label--required' : ''}`}>
            {label}
          </span>
        </label>
      )}
      <div className="t-form-item__content">
        {children}
        {error && (
          <div className="t-form-item__error">{error}</div>
        )}
      </div>
    </div>
  )
}
