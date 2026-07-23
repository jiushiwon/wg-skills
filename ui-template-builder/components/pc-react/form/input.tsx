import React, { InputHTMLAttributes, useContext, useState, useCallback } from 'react'
import { FormContext } from './form'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string | number
  onChange?: (value: string) => void
  name?: string
  error?: boolean
}

// Input 组件
export function Input({
  value: valueProp,
  onChange: onChangeProp,
  name,
  error,
  className = '',
  ...props
}: InputProps) {
  const form = useContext(FormContext)
  const [focused, setFocused] = useState(false)

  // 如果在表单中，使用表单的值
  const controlledValue = form && name ? form.getFieldValue(name) : valueProp

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (form && name) {
      form.setFieldValue(name, value)
    }

    onChangeProp?.(value)
  }, [form, name, onChangeProp])

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    props.onFocus?.(e)
  }, [props])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)

    // 表单中失去焦点时验证
    if (form && name) {
      form.validateField(name)
    }

    props.onBlur?.(e)
  }, [form, name, props])

  const handleClear = useCallback(() => {
    if (form && name) {
      form.setFieldValue(name, '')
    }
    onChangeProp?.('')
  }, [form, name, onChangeProp])

  const formVariant = form?.variant || 'default'
  const hasError = error || (form && name && (form as any).fields?.get(name)?.error)

  return (
    <div
      className={`t-input t-input--${formVariant} ${focused ? 't-input--focus' : ''} ${hasError ? 't-input--error' : ''} ${props.disabled ? 't-input--disabled' : ''} ${className}`}
    >
      <input
        className="t-input__inner"
        value={controlledValue ?? ''}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {props.clearable && controlledValue && !props.disabled && (
        <span className="t-input__clear" onClick={handleClear}>
          ×
        </span>
      )}
    </div>
  )
}
