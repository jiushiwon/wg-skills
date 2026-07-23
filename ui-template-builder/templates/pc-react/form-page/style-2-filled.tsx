import React, { useState } from 'react'
import './style-2.css'

interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
  required?: boolean
}

interface FormPageProps {
  title?: string
  fields: FormField[]
  submitText?: string
  cancelText?: string
  onSubmit?: (data: Record<string, any>) => void
}

export default function FormPage({ title = '填写表单', fields, submitText = '提交', cancelText = '取消', onSubmit }: FormPageProps) {
  const [data, setData] = useState<Record<string, any>>({})

  return (
    <div className="form-page-filled">
      <div className="form-page-filled__card">
        <h2 className="form-page-filled__title">{title}</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit?.(data) }}>
          {fields.map(f => (
            <div key={f.name} className="form-page-filled__field">
              <label className="form-page-filled__label">{f.label}{f.required && '*'}</label>
              <input
                type={f.type}
                className="form-page-filled__input"
                placeholder={f.placeholder}
                onChange={e => setData({ ...data, [f.name]: e.target.value })}
              />
            </div>
          ))}
          <div className="form-page-filled__actions">
            <button type="submit" className="form-page-filled__btn">{submitText}</button>
            <button type="button" className="form-page-filled__btn form-page-filled__btn--secondary">{cancelText}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
