import React, { useState } from 'react'
import './style-3.css'

type Status = 'idle' | 'loading' | 'error'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [status, setStatus] = useState<Status>('idle')
  const [errorText, setErrorText] = useState('')

  const doSubmit = async () => {
    if (status === 'loading') return
    setStatus('loading')
    setErrorText('')
    try {
      await Promise.resolve()
      setStatus('idle')
    } catch {
      setStatus('error')
      setErrorText('登录失败，请重试')
    }
  }

  return (
    <div className="login-page style-dark">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-box">
              <span className="logo-icon">◈</span>
            </div>
            <h1 className="login-title">{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
          </div>

          <form className="login-form" onSubmit={(e) => { e.preventDefault(); doSubmit() }}>
            <div className="form-item">
              <input type="text" className="form-input" placeholder="Email / Phone" />
            </div>
            <div className="form-item">
              <input type="password" className="form-input" placeholder="Password" />
            </div>
            {errorText && (
              <div className="login-error">
                <span>{errorText}</span>
                <button type="button" onClick={doSubmit}>Retry</button>
              </div>
            )}
            <button type="submit" className="submit-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Loading…' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="login-footer">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
