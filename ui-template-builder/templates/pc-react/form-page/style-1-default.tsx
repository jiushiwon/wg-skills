import React, { useState } from 'react'
import './style-1.css'

interface FormFieldOption {
  label: string
  value: string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio'
  placeholder?: string
  required?: boolean
  options?: FormFieldOption[]
}

interface FormPageProps {
  title?: string
  fields: FormField[]
  submitText?: string
  cancelText?: string
  onSubmit?: (data: Record<string, any>) => void
  onCancel?: () => void
}

export default function FormPage({
  title = '表单页面',
  fields,
  submitText = '提交',
  cancelText = '取消',
  onSubmit,
  onCancel
}: FormPageProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <div className="form-page">
      <div className="form-page__card">
        <h2 className="form-page__title">{title}</h2>
        <form className="form-page__form" onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name} className="form-page__field">
              <label className="form-page__label">
                {field.label}
                {field.required && <span className="form-page__required">*</span>}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  className="form-page__input"
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                />
              )}

              {field.type === 'email' && (
                <input
                  type="email"
                  className="form-page__input"
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                />
              )}

              {field.type === 'password' && (
                <input
                  type="password"
                  className="form-page__input"
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                />
              )}

              {field.type === 'select' && (
                <select
                  className="form-page__select"
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                >
                  <option value="">{field.placeholder || '请选择'}</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}

              {field.type === 'textarea' && (
                <textarea
                  className="form-page__textarea"
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                />
              )}

              {field.type === 'checkbox' && (
                <label className="form-page__checkbox">
                  <input
                    type="checkbox"
                    checked={formData[field.name] || false}
                    onChange={e => handleChange(field.name, e.target.checked)}
                  />
                  <span>{field.placeholder}</span>
                </label>
              )}

              {field.type === 'radio' && field.options && (
                <div className="form-page__radio-group">
                  {field.options.map(opt => (
                    <label key={opt.value} className="form-page__radio">
                      <input
                        type="radio"
                        name={field.name}
                        value={opt.value}
                        checked={formData[field.name] === opt.value}
                        onChange={e => handleChange(field.name, e.target.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="form-page__actions">
            <button type="submit" className="form-page__btn form-page__btn--primary">{submitText}</button>
            <button type="button" className="form-page__btn" onClick={onCancel}>{cancelText}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
