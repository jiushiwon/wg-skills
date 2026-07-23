import React, { useState } from 'react'
import './style-3.css'

interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
}

interface FormPageProps {
  title?: string
  fields: FormField[]
  submitText?: string
  onSubmit?: (data: Record<string, any>) => void
}

export default function FormPage({ title = '填写信息', fields, submitText = '提交', onSubmit }: FormPageProps) {
  const [data, setData] = useState<Record<string, any>>({})
  return (
    <div className="form-page-dark">
      <div className="form-page-dark__card">
        <h2 className="form-page-dark__title">{title}</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit?.(data) }}>
          {fields.map(f => (
            <div key={f.name} className="form-page-dark__field">
              <label className="form-page-dark__label">{f.label}</label>
              <input type={f.type} className="form-page-dark__input" placeholder={f.placeholder} onChange={e => setData({...data, [f.name]: e.target.value})} />
            </div>
          ))}
          <div className="form-page-dark__actions">
            <button type="submit" className="form-page-dark__btn">{submitText}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
