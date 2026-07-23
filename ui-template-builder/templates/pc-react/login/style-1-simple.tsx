import React, { useState } from 'react'
import './style.css'

interface LoginField {
  name: string
  label: string
  type: string
  placeholder?: string
}

interface LoginPageProps {
  logoText?: string
  title?: string
  subtitle?: string
  fields?: LoginField[]
  submitText?: string
  footerText?: string
  footerLink?: string
}

export default function LoginPage({
  logoText = '应用名称',
  title = '欢迎回来',
  subtitle = '登录您的账号',
  fields = [
    { name: 'email', label: '邮箱', type: 'email', placeholder: '请输入邮箱' },
    { name: 'password', label: '密码', type: 'password', placeholder: '请输入密码' }
  ],
  submitText = '登 录',
  footerText = '还没有账号？',
  footerLink = '立即注册'
}: LoginPageProps) {
  const [form, setForm] = useState<Record<string, any>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('登录:', form)
  }

  return (
    <div className="login-page style-simple">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon">🔷</span>
              <span className="logo-text">{logoText}</span>
            </div>
            <h1 className="login-title">{title}</h1>
            <p className="login-subtitle">{subtitle}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {fields.map(field => (
              <div key={field.name} className="form-item">
                <label className="form-label">{field.label}</label>
                <input
                  type={field.type}
                  className="form-input"
                  placeholder={field.placeholder}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                />
              </div>
            ))}

            <div className="form-extra">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.remember || false}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                />
                <span className="checkbox-text">记住密码</span>
              </label>
              <a href="#" className="forgot-link">忘记密码？</a>
            </div>

            <button type="submit" className="submit-btn">{submitText}</button>
          </form>

          <div className="login-footer">
            <span className="footer-text">
              {footerText}
              <a href="#" className="toggle-link">{footerLink}</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
