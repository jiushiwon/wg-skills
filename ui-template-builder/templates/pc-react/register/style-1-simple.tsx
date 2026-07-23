import React, { useState } from 'react'
import './style-1-simple.css'

interface RegisterField {
  name: string
  label: string
  type: string
  placeholder?: string
}

interface RegisterPageProps {
  title?: string
  subtitle?: string
  fields?: RegisterField[]
  submitText?: string
  agreementText?: string
  footerText?: string
  footerLink?: string
}

export default function RegisterPage({
  title = '创建账号',
  subtitle = '填写信息完成注册',
  fields = [
    { name: 'username', label: '用户名', type: 'text', placeholder: '请输入用户名' },
    { name: 'email', label: '邮箱', type: 'email', placeholder: '请输入邮箱' },
    { name: 'password', label: '密码', type: 'password', placeholder: '请设置密码' },
    { name: 'confirmPassword', label: '确认密码', type: 'password', placeholder: '请再次输入密码' }
  ],
  submitText = '注 册',
  agreementText = '我已阅读并同意服务条款',
  footerText = '已有账号？',
  footerLink = '立即登录'
}: RegisterPageProps) {
  const [form, setForm] = useState<Record<string, any>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('注册:', form)
  }

  return (
    <div className="register-page style-simple">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1 className="register-title">{title}</h1>
            <p className="register-subtitle">{subtitle}</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {fields.map(field => (
              <div key={field.name} className="form-item">
                <input
                  type={field.type}
                  className="form-input"
                  placeholder={field.placeholder}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                />
              </div>
            ))}

            <label className="agreement">
              <input
                type="checkbox"
                checked={form.agreement || false}
                onChange={(e) => setForm({ ...form, agreement: e.target.checked })}
              />
              <span className="agreement-text">{agreementText}</span>
            </label>

            <button type="submit" className="submit-btn">{submitText}</button>
          </form>

          <div className="register-footer">
            <span className="footer-text">
              {footerText}
              <a href="#" className="login-link" onClick={(e) => e.preventDefault()}>{footerLink}</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
