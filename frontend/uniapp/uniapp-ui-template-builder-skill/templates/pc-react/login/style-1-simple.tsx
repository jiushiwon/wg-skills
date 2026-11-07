import React, { useState } from 'react'
import './style-1-simple.css'

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
  /** 提交逻辑；抛错即进入错误态并展示重试入口 */
  onSubmit?: (form: Record<string, any>) => void | Promise<void>
}

type Status = 'idle' | 'loading' | 'error'

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
  footerLink = '立即注册',
  onSubmit
}: LoginPageProps) {
  const [form, setForm] = useState<Record<string, any>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorText, setErrorText] = useState('')

  const doSubmit = async () => {
    if (status === 'loading') return
    setStatus('loading')
    setErrorText('')
    try {
      if (onSubmit) {
        await onSubmit(form)
      }
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorText('登录失败，请重试')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSubmit()
  }

  return (
    <div className="login-page style-simple">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon"></span>
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

            {errorText && (
              <div className="login-error">
                <span>{errorText}</span>
                <button type="button" onClick={doSubmit}>重试</button>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={status === 'loading'}>
              {status === 'loading' ? '登录中…' : submitText}
            </button>
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
